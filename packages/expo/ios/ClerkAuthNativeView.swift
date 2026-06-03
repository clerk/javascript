import React
import UIKit

public class ClerkAuthNativeView: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var hasInitialized: Bool = false
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

  @objc var isDismissible: NSNumber? {
    didSet {
      let newDismissible = isDismissible?.boolValue ?? true
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
    } else if window == nil && hasInitialized && currentDismissible && !dismissalEventSent {
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
      dismissible: currentDismissible,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          guard self?.currentDismissible == true else { return }
          self?.dismissalEventSent = true
          self?.sendAuthEvent(type: .dismissed)
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
