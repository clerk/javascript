import ExpoModulesCore
import UIKit

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  private var currentCustomPages: String = "[]"
  private let customPageState = ClerkUserProfileCustomPageState()
  let onCustomPageEvent = EventDispatcher()

  func setCustomPages(_ customPages: String?) {
    let newCustomPages = customPages ?? "[]"
    guard newCustomPages != currentCustomPages else { return }
    currentCustomPages = newCustomPages
    setNeedsHostedViewUpdate()
  }

  func navigateCustomPage(action: String, routeKey: String?) {
    customPageState.navigate(action: action, routeKey: routeKey)
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

  override func makeHostedController() -> UIViewController? {
    customPageState.setPageEventHandler { [weak self] type, path in
      self?.onCustomPageEvent(["type": type, "path": path])
    }

    return ClerkNativeBridge.shared.makeUserButtonViewController(
      customRows: parseUserProfileCustomPages(currentCustomPages, pageCount: customPageState.views.count),
      customPageState: customPageState
    )
  }
}

public class ClerkUserButtonViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkUserButtonView")

    View(ClerkUserButtonNativeView.self) {
      Events("onCustomPageEvent")

      Prop("customPages") { (view: ClerkUserButtonNativeView, customPages: String?) in
        view.setCustomPages(customPages)
      }

      AsyncFunction("navigateCustomPage") {
        (view: ClerkUserButtonNativeView, action: String, routeKey: String?) in
        view.navigateCustomPage(action: action, routeKey: routeKey)
      }
    }
  }
}
