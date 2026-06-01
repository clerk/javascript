import UIKit

public class ClerkUserButtonNativeView: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var hasInitialized: Bool = false

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
    }
  }

  private func updateView() {
    guard let factory = clerkViewFactory else { return }

    guard let returnedController = factory.createUserButton(
      onEvent: { event, data in
        if event == .signedOut {
          let sessionId = data["sessionId"] as? String
          ClerkExpoModule.emitAuthStateChange(type: .signedOut, sessionId: sessionId)
        }
      }
    ) else { return }

    hostingCoordinator.attach(returnedController, clearBackground: true)
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingCoordinator.layout()
  }
}
