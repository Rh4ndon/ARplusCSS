package expo.modules.aravailability

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Session
import com.google.ar.core.exceptions.UnavailableDeviceNotCompatibleException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Safe, non-crashing probe for the local ARCore runtime.
 *
 * `ArCoreApk.checkAvailability()` can report SUPPORTED_INSTALLED on devices whose
 * ARCore build cannot actually start a session - for example a phone with no
 * physical gyroscope (ARCore requires one) or a build with no camera calibration
 * profile. ViroReact ignores that failure, dereferences the invalid native session
 * and crashes with a SIGSEGV.
 *
 * To detect these devices generically we:
 *   1. look for a physical gyroscope (ARCore cannot track motion without one), and
 *   2. create an ARCore `Session` ourselves and immediately close it.
 *
 * Creating a session through ARCore's own Java API is safe: it throws
 * `UnavailableDeviceNotCompatibleException` rather than crashing, unlike Viro's
 * native path. A session is only ever created here - never handed to the renderer.
 */
class ARAvailabilityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ARAvailability")

    /**
     * Returns device identity, gyroscope info and ARCore availability. Never
     * throws for the normal "device not supported" cases; resolve always yields a map.
     */
    AsyncFunction("getStatusAsync") { promise: Promise ->
      val base = deviceInfo()
      val context = appContext.reactContext ?: appContext.currentActivity?.applicationContext

      if (context == null) {
        promise.resolve(
          base + gyroscopeFields(null) + sessionFields("SKIPPED", null) +
            availabilityFields("UNKNOWN_ERROR", false, false, true, true)
        )
        return@AsyncFunction
      }

      val gyro = gyroscopeFields(context)
      val arcore = ArCoreApk.getInstance()

      // Fast path: a synchronous check is definitive once ARCore is installed.
      val immediate = runCatching { arcore.checkAvailability(context) }.getOrNull()
      if (immediate != null && !immediate.isTransient()) {
        if (immediate == ArCoreApk.Availability.SUPPORTED_INSTALLED) {
          // ARCore claims to be installed: prove a session can really be created.
          probeSession(context, base + gyro, promise)
        } else {
          promise.resolve(
            base + gyro + sessionFields("SKIPPED", null) +
              availabilityFields(immediate.name, immediate.isSupported, immediate.isUnsupported, immediate.isUnknown, false)
          )
        }
        return@AsyncFunction
      }

      // Slow path: async check with a timeout guard so JS is never blocked.
      val settled = AtomicBoolean(false)
      val handler = Handler(Looper.getMainLooper())
      handler.postDelayed({
        if (settled.compareAndSet(false, true)) {
          promise.resolve(
            base + gyro + sessionFields("SKIPPED", null) +
              availabilityFields("UNKNOWN_TIMED_OUT", false, false, true, true)
          )
        }
      }, 5000)

      runCatching {
        arcore.checkAvailabilityAsync(context) { availability ->
          if (settled.compareAndSet(false, true)) {
            promise.resolve(
              base + gyro + sessionFields("SKIPPED", null) +
                availabilityFields(
                  availability.name,
                  availability.isSupported,
                  availability.isUnsupported,
                  availability.isUnknown,
                  availability.isTransient,
                )
            )
          }
        }
      }.onFailure { error ->
        if (settled.compareAndSet(false, true)) {
          promise.resolve(
            base + gyro + sessionFields("SKIPPED", null) +
              availabilityFields("UNKNOWN_ERROR", false, false, true, false) +
              mapOf("error" to (error.message ?: error.javaClass.simpleName))
          )
        }
      }
    }

    /** Opens the Play Store flow to install/update Google Play Services for AR. */
    AsyncFunction("requestInstallAsync") { promise: Promise ->
      val activity = appContext.currentActivity
      if (activity == null) {
        promise.reject("E_NO_ACTIVITY", "No foreground activity to start the ARCore install flow.", null)
        return@AsyncFunction
      }
      try {
        val status = ArCoreApk.getInstance().requestInstall(activity, true)
        promise.resolve(status.name)
      } catch (error: Throwable) {
        promise.reject("E_AR_INSTALL", error.message ?: "ARCore install request failed", error)
      }
    }
  }

  /**
   * Creates an ARCore session on the main thread and closes it right away. This
   * is the authoritative test of whether ARCore can actually run here. Any
   * failure other than "device not compatible" is reported but not treated as a
   * veto, so a transient fault never blocks AR on a capable device.
   */
  private fun probeSession(context: Context, base: Map<String, Any>, promise: Promise) {
    val handler = Handler(Looper.getMainLooper())
    handler.post {
      var status = "OK"
      var errorName: String? = null
      try {
        val session = Session(context.applicationContext)
        session.close()
      } catch (error: Throwable) {
        errorName = error.javaClass.simpleName
        status = if (error is UnavailableDeviceNotCompatibleException) "DEVICE_NOT_COMPATIBLE" else "ERROR"
      }
      promise.resolve(
        base + sessionFields(status, errorName) +
          availabilityFields("SUPPORTED_INSTALLED", true, false, false, false)
      )
    }
  }

  private fun deviceInfo(): Map<String, Any> = mapOf(
    "manufacturer" to Build.MANUFACTURER,
    "brand" to Build.BRAND,
    "model" to Build.MODEL,
    "device" to Build.DEVICE,
    "product" to Build.PRODUCT,
    "hardware" to Build.HARDWARE,
    "fingerprint" to Build.FINGERPRINT,
    "sdkInt" to Build.VERSION.SDK_INT,
  )

  /** Reports whether a physical (non-virtual) gyroscope is present. */
  private fun gyroscopeFields(context: Context?): Map<String, Any> {
    if (context == null) {
      return mapOf("hasGyroscope" to false, "gyroscopeSensors" to emptyList<Map<String, String>>())
    }
    val manager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
      ?: return mapOf("hasGyroscope" to true, "gyroscopeSensors" to emptyList<Map<String, String>>())

    val sensors = runCatching { manager.getSensorList(Sensor.TYPE_GYROSCOPE) }.getOrNull() ?: emptyList()
    val descriptors = sensors.map { mapOf("name" to it.name, "vendor" to it.vendor) }
    val hasPhysical = sensors.any { isPhysicalGyroscope(it) }
    return mapOf("hasGyroscope" to hasPhysical, "gyroscopeSensors" to descriptors)
  }

  private fun isPhysicalGyroscope(sensor: Sensor): Boolean {
    val name = sensor.name.lowercase()
    val vendor = sensor.vendor.lowercase()
    val virtualMarkers = listOf("virtual", "pseudo", "fusion", "synthetic", "corrected", "aosp", "android")
    return virtualMarkers.none { name.contains(it) || vendor.contains(it) }
  }

  private fun sessionFields(probe: String, error: String?): Map<String, Any> = mapOf(
    "sessionProbe" to probe,
    "sessionError" to (error ?: ""),
  )

  private fun availabilityFields(
    availability: String,
    supported: Boolean,
    unsupported: Boolean,
    unknown: Boolean,
    transient: Boolean,
  ): Map<String, Any> = mapOf(
    "availability" to availability,
    "supported" to supported,
    "unsupported" to unsupported,
    "unknown" to unknown,
    "transient" to transient,
  )
}
