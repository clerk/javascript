import UIKit

public class ClerkNativeViewHost: UIView {
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
      updateHostedView()
    } else if window == nil && hasInitialized {
      didDetachAfterInitialization()
    }
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingCoordinator.layout()
  }

  func setNeedsHostedViewUpdate() {
    guard hasInitialized else { return }
    updateHostedView()
  }

  func makeHostedController() -> UIViewController? {
    nil
  }

  func didDetachAfterInitialization() {}

  var clearsHostedViewBackground: Bool {
    false
  }

  private func updateHostedView() {
    guard let controller = makeHostedController() else { return }
    hostingCoordinator.attach(controller, clearBackground: clearsHostedViewBackground)
  }
}
