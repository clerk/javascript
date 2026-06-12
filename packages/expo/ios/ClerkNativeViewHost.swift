import UIKit

public class ClerkNativeViewHost: UIView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var hasInitialized: Bool = false
  private var pendingHostedViewRetry: DispatchWorkItem?
  private var hostedViewRetryCount = 0

  private static let maxHostedViewRetryCount = 50
  private static let hostedViewRetryDelay: TimeInterval = 0.1

  override public init(frame: CGRect) {
    super.init(frame: frame)
  }

  public required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()

    guard window != nil else {
      if hasInitialized {
        hostedViewDidDetachFromWindow()
      }
      hostingCoordinator.detach()
      hasInitialized = false
      return
    }

    guard !hasInitialized else { return }
    hasInitialized = true
    hostedViewDidAttachToWindow()
    updateHostedView()
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingCoordinator.layout()
  }

  func setNeedsHostedViewUpdate() {
    guard hasInitialized else { return }
    hostedViewRetryCount = 0
    updateHostedView()
  }

  func makeHostedController() -> UIViewController? {
    nil
  }

  // Subclasses can observe attach/detach without making this host know about their RN event props.
  func hostedViewDidAttachToWindow() {}

  func hostedViewDidDetachFromWindow() {}

  private func updateHostedView() {
    guard let controller = makeHostedController() else {
      scheduleHostedViewRetry()
      return
    }

    pendingHostedViewRetry?.cancel()
    pendingHostedViewRetry = nil
    hostedViewRetryCount = 0
    hostingCoordinator.attach(controller)
  }

  private func scheduleHostedViewRetry() {
    guard pendingHostedViewRetry == nil else { return }
    guard hostedViewRetryCount < Self.maxHostedViewRetryCount else { return }

    hostedViewRetryCount += 1
    let workItem = DispatchWorkItem { [weak self] in
      guard let self, self.hasInitialized else { return }
      self.pendingHostedViewRetry = nil
      self.updateHostedView()
    }

    pendingHostedViewRetry = workItem
    DispatchQueue.main.asyncAfter(deadline: .now() + Self.hostedViewRetryDelay, execute: workItem)
  }
}

private final class ClerkNativeHostingCoordinator {
  private weak var containerView: UIView?
  private var hostingController: UIViewController?

  init(containerView: UIView) {
    self.containerView = containerView
  }

  func attach(_ controller: UIViewController) {
    detach()

    guard let containerView else { return }

    controller.view.frame = containerView.bounds
    controller.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

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
