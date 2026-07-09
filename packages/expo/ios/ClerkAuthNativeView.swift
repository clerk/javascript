import ExpoModulesCore
import UIKit

public class ClerkAuthNativeView: ClerkNativeViewHost {
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var currentLogoMaxHeight: CGFloat?
  private var currentHideHeader: Bool = false
  private var didSendDismiss = false
  private var hostedNavigation: ClerkExpoHostedAuthNavigation?

  let onAuthEvent = EventDispatcher()
  let onNavigationChange = EventDispatcher()

  func setMode(_ mode: String?) {
    let newMode = mode ?? "signInOrUp"
    guard newMode != currentMode else { return }
    currentMode = newMode
    setNeedsHostedViewUpdate()
  }

  func setDismissible(_ isDismissible: Bool?) {
    let newDismissible = isDismissible ?? true
    guard newDismissible != currentDismissible else { return }
    currentDismissible = newDismissible
    setNeedsHostedViewUpdate()
  }

  func setLogoMaxHeight(_ logoMaxHeight: CGFloat?) {
    guard logoMaxHeight != currentLogoMaxHeight else { return }
    currentLogoMaxHeight = logoMaxHeight
    setNeedsHostedViewUpdate()
  }

  func setHideHeader(_ hideHeader: Bool?) {
    let newHideHeader = hideHeader ?? false
    guard newHideHeader != currentHideHeader else { return }
    currentHideHeader = newHideHeader
    setNeedsHostedViewUpdate()
  }

  func goBack() {
    hostedNavigation?.goBack()
  }

  func popToRoot() {
    hostedNavigation?.popToRoot()
  }

  private func sendAuthEvent(type: ClerkNativeViewEvent) {
    onAuthEvent(["type": type.rawValue])
  }

  private func sendDismissIfNeeded() {
    // SwiftUI dismissals detach the hosted view without calling UIKit dismiss().
    guard currentDismissible, !didSendDismiss else { return }
    didSendDismiss = true
    sendAuthEvent(type: .dismissed)
  }

  override func hostedViewDidAttachToWindow() {
    didSendDismiss = false
  }

  override func hostedViewDidDetachFromWindow() {
    sendDismissIfNeeded()
  }

  override func makeHostedController() -> UIViewController? {
    let hosted: ClerkExpoHostedAuthNavigation?
    if currentHideHeader {
      let navigation = ClerkExpoHostedAuthNavigation()
      navigation.onDepthChange = { [weak self] depth in
        self?.onNavigationChange(["depth": depth, "canGoBack": depth > 0])
      }
      hosted = navigation
    } else {
      hosted = nil
    }
    hostedNavigation = hosted

    return ClerkNativeBridge.shared.makeAuthViewController(
      mode: currentMode,
      dismissible: currentDismissible,
      logoMaxHeight: currentLogoMaxHeight,
      hostedNavigation: hosted,
      onEvent: { [weak self] event, _ in
        if event == .dismissed {
          self?.sendDismissIfNeeded()
        }
      }
    )
  }
}

public class ClerkAuthViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkAuthView")

    View(ClerkAuthNativeView.self) {
      Events("onAuthEvent", "onNavigationChange")

      Prop("mode") { (view: ClerkAuthNativeView, mode: String?) in
        view.setMode(mode)
      }

      Prop("isDismissible") { (view: ClerkAuthNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }

      Prop("logoMaxHeight") { (view: ClerkAuthNativeView, logoMaxHeight: CGFloat?) in
        view.setLogoMaxHeight(logoMaxHeight)
      }

      Prop("hideHeader") { (view: ClerkAuthNativeView, hideHeader: Bool?) in
        view.setHideHeader(hideHeader)
      }

      AsyncFunction("goBack") { (view: ClerkAuthNativeView) in
        view.goBack()
      }

      AsyncFunction("popToRoot") { (view: ClerkAuthNativeView) in
        view.popToRoot()
      }
    }
  }
}
