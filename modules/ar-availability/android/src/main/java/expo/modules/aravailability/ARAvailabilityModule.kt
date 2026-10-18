package expo.modules.aravailability

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.google.ar.core.ArCoreApk
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Safe, non-crashing probe for the local ARCore runtime.
 *
 * `ArCoreApk.checkAvailability()` can report SUPPORTED_INSTALLED on devices whose
 * ARCore build cannot actually start a session - for example a phone with no
 * physical gyroscope (ARCore requires one to fuse motion). ViroReact ignores that
 * failure, dereferences the invalid native session and crashes with a SIGSEGV.
 *
 * Detection here is based on the physical gyroscope only. We deliberately DO NOT
 * create an ARCore `Session` as a probe: `new Session(context)` does not throw a
 * catchable exception on such devices - it hard-crashes with SIGSEGV inside
 * `libarcore_c.so` (`ArSession_createWithFeaturesImplementation`), taking the app
 * down before JS can react. That crash happens even on devices where ARCore
 * otherwise works (real gyro + ARCore installed), so creating a session here is
 * never safe.
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
          base + gyroscopeFields(null) +
            availabilityFields("UNKNOWN_ERROR", false, false, true, true)
        )
        return@AsyncFunction
      }

      val gyro = gyroscopeFields(context)
      val arcore = ArCoreApk.getInstance()

      // Fast path: a synchronous check is definitive once ARCore is installed.
      val immediate = runCatching { arcore.checkAvailability(context) }.getOrNull()
      if (immediate != null && !immediate.isTransient()) {
        promise.resolve(
          base + gyro +
            availabilityFields(immediate.name, immediate.isSupported, immediate.isUnsupported, immediate.isUnknown, false)
        )
        return@AsyncFunction
      }

      // Slow path: async check with a timeout guard so JS is never blocked.
      val settled = AtomicBoolean(false)
      val handler = Handler(Looper.getMainLooper())
      handler.postDelayed({
        if (settled.compareAndSet(false, true)) {
          promise.resolve(
            base + gyro +
              availabilityFields("UNKNOWN_TIMED_OUT", false, false, true, true)
          )
        }
      }, 5000)

      runCatching {
        arcore.checkAvailabilityAsync(context) { availability ->
          if (settled.compareAndSet(false, true)) {
            promise.resolve(
              base + gyro +
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
            base + gyro +
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
