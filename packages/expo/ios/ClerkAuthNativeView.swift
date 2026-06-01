import React
import UIKit

public class ClerkAuthNativeView: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var currentMode: String = "signInOrUp"
  private var currentDismissable: Bool = false
  private var hasInitialized: Bool = false
  private var didCompleteAuthentication: Bool = false
  private var dismissalEventSent: Bool = false

  @objc var onAuthEvent: RCTBubblingEventBlock?

  @objc var mode: NSString? {
    didSet {
      let newMode = (mode as String?) ?? "signInOrUp"
      guard newMode != currentMode else { return }
      currentMode = newMode
      if hasInitialized { updateView() }
    }
  }

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
    } else if window == nil && hasInitialized && currentDismissable && !didCompleteAuthentication && !dismissalEventSent {
      dismissalEventSent = true
      sendAuthEvent(type: .dismissed)
    }
  }

  private func sendAuthEvent(type: ClerkNativeViewEvent) {
    onAuthEvent?(["type": type.rawValue])
  }

  private func updateView() {
    guard let factory = clerkViewFactory else { return }

    guard let returnedController = factory.createAuthView(
      mode: currentMode,
      dismissable: currentDismissable,
      onEvent: { [weak self] event, data in
        if event.isAuthCompletion {
          self?.didCompleteAuthentication = true
          let sessionId = data["sessionId"] as? String
          ClerkExpoModule.emitAuthStateChange(type: .signedIn, sessionId: sessionId)
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
