import React
import UIKit

public class ClerkUserProfileNativeView: ClerkNativeViewHost {
  private var currentDismissible: Bool = true
  private var didSendDismiss = false

  @objc var onProfileEvent: RCTBubblingEventBlock?

  @objc var isDismissible: NSNumber? {
    didSet {
      let newDismissible = isDismissible?.boolValue ?? true
      guard newDismissible != currentDismissible else { return }
      currentDismissible = newDismissible
      setNeedsHostedViewUpdate()
    }
  }

  private func sendProfileEvent(type: ClerkNativeViewEvent) {
    onProfileEvent?(["type": type.rawValue])
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
    guard let bridge = clerkNativeBridge else { return nil }

    return bridge.makeUserProfileViewController(
      dismissible: currentDismissible,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          self?.sendDismissIfNeeded()
        }
      }
    )
  }
}

@objc(ClerkUserProfileViewManager)
class ClerkUserProfileViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkUserProfileNativeView()
  }
}
