import React
import UIKit

public class ClerkUserProfileNativeView: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var currentDismissable: Bool = false
  private var hasInitialized: Bool = false
  private var didSignOut = false
  private var dismissalEventSent = false

  @objc var onProfileEvent: RCTBubblingEventBlock?

  @objc var isDismissable: NSNumber? {
    didSet {
      let newDismissable = isDismissable?.boolValue ?? false
      guard newDismissable != currentDismissable else { return }
      currentDismissable = newDismissable
      if hasInitialized { updateView() }
    }
  }

  override public init(frame: CGRect) {
    super.init(frame: frame)
  }

  public required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil && !hasInitialized {
      hasInitialized = true
      updateView()
    } else if window == nil && hasInitialized && currentDismissable && !didSignOut && !dismissalEventSent {
      dismissalEventSent = true
      sendProfileEvent(type: .dismissed)
    }
  }

  private func sendProfileEvent(type: ClerkNativeViewEvent) {
    onProfileEvent?(["type": type.rawValue])
  }

  private func updateView() {
    guard let factory = clerkViewFactory else { return }

    guard let returnedController = factory.createUserProfileView(
      dismissable: currentDismissable,
      onEvent: { [weak self] event, data in
        if event == .signedOut {
          self?.didSignOut = true
          let sessionId = data["sessionId"] as? String
          ClerkExpoModule.emitAuthStateChange(type: .signedOut, sessionId: sessionId)
        }
      }
    ) else { return }

    hostingCoordinator.attach(returnedController)
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingCoordinator.layout()
  }
}
