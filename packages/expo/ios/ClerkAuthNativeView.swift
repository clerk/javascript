import React
import UIKit

public class ClerkAuthNativeView: ClerkNativeViewHost {
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var dismissalEventSent: Bool = false

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

  override func didDetachAfterInitialization() {
    if currentDismissible && !dismissalEventSent {
      dismissalEventSent = true
      sendAuthEvent(type: .dismissed)
    }
  }

  private func sendAuthEvent(type: ClerkNativeViewEvent) {
    onAuthEvent?(["type": type.rawValue])
  }

  override func makeHostedController() -> UIViewController? {
    guard let factory = clerkViewFactory else { return nil }

    return factory.createAuthView(
      mode: currentMode,
      dismissible: currentDismissible,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          guard self?.currentDismissible == true else { return }
          self?.dismissalEventSent = true
          self?.sendAuthEvent(type: .dismissed)
        }
      }
    )
  }
}
