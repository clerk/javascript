import ExpoModulesCore
import UIKit

public class ClerkAuthNativeView: ClerkNativeViewHost {
  private var currentMode: String = "signInOrUp"
  private var currentDismissible: Bool = true
  private var currentLogoMaxHeight: CGFloat?
  private var logoView: UIView?
  private var logoSize: CGSize = .zero
  private var logoBoundsObservation: NSKeyValueObservation?
  private var didSendDismiss = false

  let onAuthEvent = EventDispatcher()

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

  override public func layoutSubviews() {
    super.layoutSubviews()
    guard let logoView else { return }
    let newSize = logoView.bounds.size
    guard newSize != logoSize else { return }
    logoSize = newSize
    setNeedsHostedViewUpdate()
  }

#if RCT_NEW_ARCH_ENABLED
  override public func mountChildComponentView(_ childComponentView: UIView, index: Int) {
    setLogoView(childComponentView)
  }

  override public func unmountChildComponentView(_ childComponentView: UIView, index: Int) {
    removeLogoView(childComponentView)
  }
#else
  override public func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)
    setLogoView(subview)
  }

  override public func removeReactSubview(_ subview: UIView!) {
    removeLogoView(subview)
    super.removeReactSubview(subview)
  }
#endif

  private func setLogoView(_ view: UIView) {
    guard logoView !== view else { return }
    logoBoundsObservation = nil
    logoView = view
    logoSize = view.bounds.size
    logoBoundsObservation = view.observe(\.bounds, options: [.new]) { [weak self, weak view] _, change in
      guard let self, let view, let bounds = change.newValue else { return }
      DispatchQueue.main.async { [weak self, weak view] in
        guard let self, let view, self.logoView === view, self.logoSize != bounds.size else { return }
        self.logoSize = bounds.size
        self.setNeedsHostedViewUpdate()
      }
    }
    setNeedsHostedViewUpdate()
  }

  private func removeLogoView(_ view: UIView) {
    guard logoView === view else { return }
    logoBoundsObservation = nil
    view.removeFromSuperview()
    logoView = nil
    logoSize = .zero
    setNeedsHostedViewUpdate()
  }

  override func makeHostedController() -> UIViewController? {
    return ClerkNativeBridge.shared.makeAuthViewController(
      mode: currentMode,
      dismissible: currentDismissible,
      logoView: logoView,
      logoSize: logoSize,
      logoMaxHeight: currentLogoMaxHeight,
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
      Events("onAuthEvent")

      Prop("mode") { (view: ClerkAuthNativeView, mode: String?) in
        view.setMode(mode)
      }

      Prop("isDismissible") { (view: ClerkAuthNativeView, isDismissible: Bool?) in
        view.setDismissible(isDismissible)
      }

      Prop("logoMaxHeight") { (view: ClerkAuthNativeView, logoMaxHeight: CGFloat?) in
        view.setLogoMaxHeight(logoMaxHeight)
      }
    }
  }
}
