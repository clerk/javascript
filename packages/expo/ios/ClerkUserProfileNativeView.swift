import ExpoModulesCore
import UIKit

public class ClerkUserProfileNativeView: ClerkNativeViewHost {
  private var currentDismissible: Bool = true
  private var currentHostBackButton: Bool = false
  private var currentCustomPages: String = "[]"
  private let customPageState = ClerkUserProfileCustomPageState()
  private var didSendDismiss = false

  let onProfileEvent = EventDispatcher()
  let onCustomPageEvent = EventDispatcher()
  let onHostBack = EventDispatcher()

  func setDismissible(_ isDismissible: Bool?) {
    let newDismissible = isDismissible ?? true
    guard newDismissible != currentDismissible else { return }
    currentDismissible = newDismissible
    setNeedsHostedViewUpdate()
  }

  func setHostBackButton(_ hostBackButton: Bool?) {
    let newHostBackButton = hostBackButton ?? false
    guard newHostBackButton != currentHostBackButton else { return }
    currentHostBackButton = newHostBackButton
    setNeedsHostedViewUpdate()
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

  private func sendProfileEvent(type: ClerkNativeViewEvent) {
    onProfileEvent(["type": type.rawValue])
  }

  private func sendDismissIfNeeded() {
    // SwiftUI dismissals detach the hosted view without calling UIKit dismiss().
    guard currentDismissible, !didSendDismiss else { return }
    didSendDismiss = true
    sendProfileEvent(type: .dismissed)
  }

  override func hostedViewDidAttachToWindow() {
    didSendDismiss = false
  }

  override func hostedViewDidDetachFromWindow() {
    sendDismissIfNeeded()
  }

  override func makeHostedController() -> UIViewController? {
    customPageState.setPageEventHandler { [weak self] type, path in
      self?.onCustomPageEvent(["type": type, "path": path])
    }

    let hostBackAction: (() -> Void)? = currentHostBackButton
      ? { [weak self] in self?.onHostBack([:]) }
      : nil

    return ClerkNativeBridge.shared.makeUserProfileViewController(
      dismissible: currentDismissible,
      customRows: parseUserProfileCustomPages(currentCustomPages, pageCount: customPageState.views.count),
      customPageState: customPageState,
      hostBackAction: hostBackAction,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          self?.sendDismissIfNeeded()
        }
      }
    )
  }
}

public class ClerkUserProfileViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkUserProfileView")

    View(ClerkUserProfileNativeView.self) {
      Events("onProfileEvent", "onCustomPageEvent", "onHostBack")

      Prop("isDismissible") { (view: ClerkUserProfileNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }

      Prop("hostBackButton") { (view: ClerkUserProfileNativeView, hostBackButton: Bool?) in
        view.setHostBackButton(hostBackButton)
      }

      Prop("customPages") { (view: ClerkUserProfileNativeView, customPages: String?) in
        view.setCustomPages(customPages)
      }

      AsyncFunction("navigateCustomPage") {
        (view: ClerkUserProfileNativeView, action: String, routeKey: String?) in
        view.navigateCustomPage(action: action, routeKey: routeKey)
      }
    }
  }
}
