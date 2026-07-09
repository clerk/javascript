import ExpoModulesCore
import UIKit

public class ClerkUserProfileNativeView: ClerkNativeViewHost {
  private var currentDismissible: Bool = true
  private var currentHideHeader: Bool = false
  private var didSendDismiss = false
  private var hostedNavigation: ClerkExpoHostedProfileNavigation?

  let onProfileEvent = EventDispatcher()
  let onNavigationChange = EventDispatcher()

  func setDismissible(_ isDismissible: Bool?) {
    let newDismissible = isDismissible ?? true
    guard newDismissible != currentDismissible else { return }
    currentDismissible = newDismissible
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
    let hosted: ClerkExpoHostedProfileNavigation?
    if currentHideHeader {
      let navigation = ClerkExpoHostedProfileNavigation()
      navigation.onDepthChange = { [weak self] depth in
        self?.onNavigationChange(["depth": depth, "canGoBack": depth > 0])
      }
      hosted = navigation
    } else {
      hosted = nil
    }
    hostedNavigation = hosted

    return ClerkNativeBridge.shared.makeUserProfileViewController(
      dismissible: currentDismissible,
      hostedNavigation: hosted,
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
      Events("onProfileEvent", "onNavigationChange")

      Prop("isDismissible") { (view: ClerkUserProfileNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }

      Prop("hideHeader") { (view: ClerkUserProfileNativeView, hideHeader: Bool?) in
        view.setHideHeader(hideHeader)
      }

      AsyncFunction("goBack") { (view: ClerkUserProfileNativeView) in
        view.goBack()
      }

      AsyncFunction("popToRoot") { (view: ClerkUserProfileNativeView) in
        view.popToRoot()
      }
    }
  }
}
