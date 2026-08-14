import ExpoModulesCore
import UIKit

public class ClerkNativeViewHost: ExpoView {
  private lazy var hostingCoordinator = ClerkNativeHostingCoordinator(containerView: self)
  private var hasInitialized: Bool = false
  private var configuredObserver: NSObjectProtocol?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
  }

  @available(*, unavailable)
  public required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  deinit {
    removeConfiguredObserver()
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()

    guard window != nil else {
      if hasInitialized {
        hostedViewDidDetachFromWindow()
      }
      removeConfiguredObserver()
      hostingCoordinator.detach()
      hasInitialized = false
      return
    }

    guard !hasInitialized else { return }
    hasInitialized = true
    addConfiguredObserver()
    hostedViewDidAttachToWindow()
    updateHostedView()
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

  // Subclasses can observe attach/detach without making this host know about their RN event props.
  func hostedViewDidAttachToWindow() {}

  func hostedViewDidDetachFromWindow() {}

  private func addConfiguredObserver() {
    guard configuredObserver == nil else { return }

    configuredObserver = NotificationCenter.default.addObserver(
      forName: .clerkNativeSDKDidConfigure,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.setNeedsHostedViewUpdate()
    }
  }

  private func removeConfiguredObserver() {
    guard let configuredObserver else { return }
    NotificationCenter.default.removeObserver(configuredObserver)
    self.configuredObserver = nil
  }

  private func updateHostedView() {
    guard let controller = makeHostedController() else { return }
    hostingCoordinator.attach(controller)
  }
}

public class ClerkUserProfileCustomPageHost: ClerkNativeViewHost {
  private var currentCustomPages: String = "[]"
  let customPageState = ClerkUserProfileCustomPageState()
  let onCustomPageEvent = EventDispatcher()

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    customPageState.setPageEventHandler { [weak self] type, path in
      self?.onCustomPageEvent(["type": type, "path": path])
    }
  }

  func setCustomPages(_ customPages: String?) {
    let newCustomPages = customPages ?? "[]"
    guard newCustomPages != currentCustomPages else { return }
    currentCustomPages = newCustomPages
    setNeedsHostedViewUpdate()
  }

  func navigateCustomPage(action: String, routeKey: String?) {
    customPageState.navigate(action: action, routeKey: routeKey)
  }

  func customRows() -> [ClerkUserProfileCustomRowConfig] {
    parseUserProfileCustomPages(currentCustomPages, pageCount: customPageState.views.count)
  }

#if RCT_NEW_ARCH_ENABLED
  override public func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    customPageState.insertView(childComponentView, at: index)
    setNeedsHostedViewUpdate()
  }

  override public func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    customPageState.removeView(childComponentView)
    setNeedsHostedViewUpdate()
  }
#else
  override public func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)
    customPageState.insertView(subview, at: atIndex)
    setNeedsHostedViewUpdate()
  }

  override public func removeReactSubview(_ subview: UIView!) {
    customPageState.removeView(subview)
    super.removeReactSubview(subview)
    setNeedsHostedViewUpdate()
  }

  override public func didUpdateReactSubviews() {}
#endif
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
