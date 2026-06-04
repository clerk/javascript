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

  var clearsHostedViewBackground: Bool {
    false
  }

  private func updateHostedView() {
    guard let controller = makeHostedController() else { return }
    hostingCoordinator.attach(controller, clearBackground: clearsHostedViewBackground)
  }
}

private final class ClerkNativeHostingCoordinator {
  private weak var containerView: UIView?
  private var hostingController: UIViewController?

  init(containerView: UIView) {
    self.containerView = containerView
  }

  func attach(_ controller: UIViewController, clearBackground: Bool = false) {
    detach()

    guard let containerView else { return }

    controller.view.frame = containerView.bounds
    controller.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    if clearBackground {
      controller.view.backgroundColor = .clear
    }

    if let parentVC = findViewController(from: containerView) {
      parentVC.addChild(controller)
      containerView.addSubview(controller.view)
      controller.didMove(toParent: parentVC)
    } else {
      containerView.addSubview(controller.view)
    }

    hostingController = controller
  }

  func detach() {
    guard let controller = hostingController else { return }

    if controller.parent != nil {
      controller.willMove(toParent: nil)
    }
    controller.view.removeFromSuperview()
    if controller.parent != nil {
      controller.removeFromParent()
    }
    hostingController = nil
  }

  func layout() {
    guard let containerView else { return }
    hostingController?.view.frame = containerView.bounds
  }

  private func findViewController(from view: UIView) -> UIViewController? {
    var responder: UIResponder? = view
    while let nextResponder = responder?.next {
      if let vc = nextResponder as? UIViewController {
        return vc
      }
      responder = nextResponder
    }
    return nil
  }
}
