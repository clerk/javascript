import ExpoModulesCore
import UIKit

public class ClerkUserProfileNativeView: ClerkNativeViewHost {
  private var currentDismissible: Bool = true
  private var currentHostBackButton: Bool = false
  private var didSendDismiss = false

  let onProfileEvent = EventDispatcher()
  let onHostBack = EventDispatcher()

  func setDismissible(_ isDismissible: Bool?) {
    let newDismissible = isDismissible ?? true
    guard newDismissible != currentDismissible else { return }
    currentDismissible = newDismissible
    setNeedsHostedViewUpdate()
  }

  func setHostBackButton(_ hostBackButton: Bool?) {
    let newHostBackButton = hostBackButton ?? false
    guard newHostBackButton != currentHostBackButton else { return }
    currentHostBackButton = newHostBackButton
    setNeedsHostedViewUpdate()
  }

  private func sendProfileEvent(type: ClerkNativeViewEvent) {
    onProfileEvent(["type": type.rawValue])
  }

  private func sendDismissIfNeeded() {
    // SwiftUI dismissals detach the hosted view without calling UIKit dismiss().
    guard currentDismissible, !didSendDismiss else { return }
    didSendDismiss = true
    sendProfileEvent(type: .dismissed)
  }

  override func hostedViewDidAttachToWindow() {
    didSendDismiss = false
  }

  override func hostedViewDidDetachFromWindow() {
    sendDismissIfNeeded()
  }

  override func makeHostedController() -> UIViewController? {
    let hostBackAction: (() -> Void)? = currentHostBackButton
      ? { [weak self] in self?.onHostBack([:]) }
      : nil

    return ClerkNativeBridge.shared.makeUserProfileViewController(
      dismissible: currentDismissible,
      hostBackAction: hostBackAction,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          self?.sendDismissIfNeeded()
        }
      }
    )
  }
}

public class ClerkUserProfileViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkUserProfileView")

    View(ClerkUserProfileNativeView.self) {
      Events("onProfileEvent", "onHostBack")

      Prop("isDismissible") { (view: ClerkUserProfileNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }

      Prop("hostBackButton") { (view: ClerkUserProfileNativeView, hostBackButton: Bool?) in
        view.setHostBackButton(hostBackButton)
      }
    }
  }
}
