package expo.modules.artorch

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Log
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/* Result codes returned to JS */
private const val RESULT_FLASH = "flash"        // CameraManager.setTorchMode succeeded
private const val RESULT_SCREEN = "screen"      // Used screen brightness fallback
private const val RESULT_UNAVAILABLE = "unavailable"

class ArTorchModule : Module() {
  private var previousBrightness = -1f
  private var active = false

  override fun definition() = ModuleDefinition {
    Name("ArTorch")
    Constants("ON" to "ON", "OFF" to "OFF")

    AsyncFunction("setStateAsync") { state: String, promise: expo.modules.kotlin.Promise ->
      if (state != "ON" && state != "OFF") {
        promise.reject("E_INVALID_STATE", "Use 'ON' or 'OFF'.", null)
        return@AsyncFunction
      }

      try {
        val result = setTorch(state == "ON")
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("E_TORCH_FAILURE", e.message ?: "Torch unavailable", e)
      }
    }
  }

  /**
   * Returns the mode used ("flash" or "screen") or throws.
   */
  private fun setTorch(enabled: Boolean): String {
    if (enabled == active) return if (active) RESULT_FLASH else RESULT_SCREEN
    active = enabled

    // --- Strategy 1: CameraManager.setTorchMode ---
    if (enabled) {
      val ctx = appContext.reactContext ?: throw Exception("No context")
      val manager = ctx.getSystemService(Context.CAMERA_SERVICE) as CameraManager
      for (cameraId in manager.cameraIdList) {
        try {
          val chars = manager.getCameraCharacteristics(cameraId)
          if (chars.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) != true) continue
          for (attempt in 0..3) {
            try {
              manager.setTorchMode(cameraId, true)
              Log.i("ArTorch", "Flash ON via camera $cameraId")
              return RESULT_FLASH
            } catch (e: CameraAccessException) {
              if (e.reason != CameraAccessException.CAMERA_IN_USE) throw e
              if (attempt < 3) Thread.sleep(80)
            }
          }
        } catch (_: CameraAccessException) {}
      }

      // Flash blocked by ARCore → fall through to screen brightness
      Log.w("ArTorch", "CAMERA_IN_USE — falling back to screen brightness")
    } else {
      // Turn off flash if it was on (best-effort)
      turnOffFlashIfNeeded()
    }

    // --- Strategy 2: Window screen brightness (always works, no permissions needed) ---
    val activity = appContext.currentActivity
    if (activity != null) {
      val layout = activity.window.attributes
      if (enabled) {
        previousBrightness = layout.screenBrightness
        if (previousBrightness < 0f) previousBrightness = 0.5f // system default
        layout.screenBrightness = WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_FULL
      } else {
        if (previousBrightness >= 0f) {
          layout.screenBrightness = previousBrightness
          previousBrightness = -1f
        } else {
          layout.screenBrightness = WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE
        }
      }
      activity.window.attributes = layout

      if (!enabled) return RESULT_SCREEN
      Log.i("ArTorch", "Screen brightness -> FULL")
      return RESULT_SCREEN
    }

    throw Exception("No activity available")
  }

  private fun turnOffFlashIfNeeded() {
    try {
      val ctx = appContext.reactContext ?: return
      val manager = ctx.getSystemService(Context.CAMERA_SERVICE) as CameraManager
      for (id in manager.cameraIdList) {
        try { manager.setTorchMode(id, false) } catch (_: Exception) {}
      }
    } catch (_: Exception) {}
  }
}
