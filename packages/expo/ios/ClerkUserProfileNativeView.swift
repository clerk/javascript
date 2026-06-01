import React
import UIKit

public class ClerkUserProfileNativeView: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var currentDismissible: Bool = false
  private var hasInitialized: Bool = false
  private var didSignOut = false
  private var dismissalEventSent = false

  @objc var onProfileEvent: RCTBubblingEventBlock?

  @objc var isDismissible: NSNumber? {
    didSet {
      let newDismissible = isDismissible?.boolValue ?? false
      guard newDismissible != currentDismissible else { return }
      currentDismissible = newDismissible
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
    } else if window == nil && hasInitialized && currentDismissible && !didSignOut && !dismissalEventSent {
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
      dismissible: currentDismissible,
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
