import React
import UIKit

public class ClerkUserProfileNativeView: ClerkNativeViewHost {
  private var currentDismissible: Bool = true
  private var dismissalEventSent = false

  @objc var onProfileEvent: RCTBubblingEventBlock?

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
      sendProfileEvent(type: .dismissed)
    }
  }

  private func sendProfileEvent(type: ClerkNativeViewEvent) {
    onProfileEvent?(["type": type.rawValue])
  }

  override func makeHostedController() -> UIViewController? {
    guard let factory = clerkViewFactory else { return nil }

    return factory.createUserProfileView(
      dismissible: currentDismissible,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          guard self?.currentDismissible == true else { return }
          self?.dismissalEventSent = true
          self?.sendProfileEvent(type: .dismissed)
        }
      }
    )
  }
}
