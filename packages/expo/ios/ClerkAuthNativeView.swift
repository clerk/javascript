import React
import UIKit
import ClerkExpoBridge

public class ClerkAuthNativeView: ClerkNativeViewHost {
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var didSendDismiss = false

  @objc var onAuthEvent: RCTBubblingEventBlock?

  @objc var mode: NSString? {
    didSet {
      let newMode = (mode as String?) ?? "signInOrUp"
      guard newMode != currentMode else { return }
      currentMode = newMode
      setNeedsHostedViewUpdate()
    }
  }

  @objc var isDismissible: NSNumber? {
    didSet {
      let newDismissible = isDismissible?.boolValue ?? true
      guard newDismissible != currentDismissible else { return }
      currentDismissible = newDismissible
      setNeedsHostedViewUpdate()
    }
  }

  private func sendAuthEvent(type: ClerkNativeViewEvent) {
    onAuthEvent?(["type": type.rawValue])
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
    guard let bridge = clerkNativeBridge else { return nil }

    return bridge.makeAuthViewController(
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

@objc(ClerkAuthViewManager)
class ClerkAuthViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkAuthNativeView()
  }
}
