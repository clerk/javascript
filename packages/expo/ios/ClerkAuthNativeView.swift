import ExpoModulesCore
import UIKit

public class ClerkAuthNativeView: ClerkNativeViewHost {
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var didSendDismiss = false

  let onAuthEvent = EventDispatcher()

  func setMode(_ mode: String?) {
    let newMode = mode ?? "signInOrUp"
    guard newMode != currentMode else { return }
    currentMode = newMode
    setNeedsHostedViewUpdate()
  }

  func setDismissible(_ isDismissible: Bool?) {
    let newDismissible = isDismissible ?? true
    guard newDismissible != currentDismissible else { return }
    currentDismissible = newDismissible
    setNeedsHostedViewUpdate()
  }

  private func sendAuthEvent(type: ClerkNativeViewEvent) {
    onAuthEvent(["type": type.rawValue])
  }

  private func sendDismissIfNeeded() {
    // SwiftUI dismissals detach the hosted view without calling UIKit dismiss().
    guard currentDismissible, !didSendDismiss else { return }
    didSendDismiss = true
    sendAuthEvent(type: .dismissed)
  }

  override func hostedViewDidAttachToWindow() {
    didSendDismiss = false
  }

  override func hostedViewDidDetachFromWindow() {
    sendDismissIfNeeded()
  }

  override func makeHostedController() -> UIViewController? {
    return ClerkNativeBridge.shared.makeAuthViewController(
      mode: currentMode,
      dismissible: currentDismissible,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          self?.sendDismissIfNeeded()
        }
      }
    )
  }
}

public class ClerkAuthViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkAuthView")

    View(ClerkAuthNativeView.self) {
      Events("onAuthEvent")

      Prop("mode") { (view: ClerkAuthNativeView, mode: String?) in
        view.setMode(mode)
      }

      Prop("isDismissible") { (view: ClerkAuthNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }
    }
  }
}
