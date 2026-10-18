import ExpoModulesCore
import AVFoundation

public class ArTorchModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ArTorch")

    Constants(["ON": "ON", "OFF": "OFF"])

    AsyncFunction("setStateAsync") { (state: String, promise: Promise) in
      guard state == "ON" || state == "OFF" else {
        promise.reject("E_INVALID_STATE", "Use 'ON' or 'OFF'.", nil)
        return
      }

      guard let device = AVCaptureDevice.default(for: .video),
            device.hasTorch else {
        promise.reject("E_NO_TORCH", "No torch available on this device.", nil)
        return
      }

      do {
        try device.lockForConfiguration()
        device.torchMode = state == "ON" ? .on : .off
        device.unlockForConfiguration()
        promise.resolve("flash")
      } catch {
        promise.reject("E_TORCH_FAILURE", "Failed to set torch: \(error.localizedDescription)", error)
      }
    }
  }
}
