// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, session sync, and native view bridges.
// SwiftUI Clerk views are created by the app target through ClerkViewFactory because
// the Clerk SDK (SPM) isn't accessible from the CocoaPods-backed React Native pod.

import UIKit
import React

// Global registry for the Clerk view factory (set by app target at startup)
public var clerkViewFactory: ClerkViewFactoryProtocol?

// Protocol that the app target implements to provide Clerk views
public protocol ClerkViewFactoryProtocol {
  // Modal presentation helpers.
  func createAuthViewController(mode: String, dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?
  func createUserProfileViewController(dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?

  // Inline rendering — returns UIViewController to preserve SwiftUI lifecycle
  func createAuthView(mode: String, dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIViewController?
  func createUserProfileView(dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIViewController?

  // SDK operations
  func configure(publishableKey: String, bearerToken: String?) async throws
  func getSession() async -> [String: Any]?
  func getClientToken() -> String?
  func signOut() async throws
}

// MARK: - Module

@objc(ClerkExpo)
class ClerkExpoModule: RCTEventEmitter {

  private static var _hasListeners = false
  private static weak var sharedInstance: ClerkExpoModule?

  override init() {
    super.init()
    ClerkExpoModule.sharedInstance = self
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func supportedEvents() -> [String]! {
    return ["onAuthStateChange"]
  }

  override func startObserving() {
    ClerkExpoModule._hasListeners = true
  }

  override func stopObserving() {
    ClerkExpoModule._hasListeners = false
  }

  /// Emits an onAuthStateChange event to JS from anywhere in the native layer.
  /// Used by inline views (AuthView, UserProfileView) to notify ClerkProvider
  /// of auth state changes in addition to the view-level onAuthEvent callback.
  static func emitAuthStateChange(type: String, sessionId: String?) {
    guard _hasListeners, let instance = sharedInstance else { return }
    instance.sendEvent(withName: "onAuthStateChange", body: [
      "type": type,
      "sessionId": sessionId as Any,
    ])
  }

  /// Returns the topmost presented view controller, avoiding deprecated `keyWindow`.
  private static func topViewController() -> UIViewController? {
    guard let scene = UIApplication.shared.connectedScenes
      .compactMap({ $0 as? UIWindowScene })
      .first(where: { $0.activationState == .foregroundActive }),
      let rootVC = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController
    else { return nil }

    var top = rootVC
    while let presented = top.presentedViewController {
      top = presented
    }
    return top
  }

  // MARK: - configure

  @objc func configure(_ publishableKey: String,
                        bearerToken: String?,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      reject("E_NOT_INITIALIZED", "Clerk not initialized. Make sure ClerkViewFactory is registered.", nil)
      return
    }

    Task {
      do {
        try await factory.configure(publishableKey: publishableKey, bearerToken: bearerToken)
        resolve(nil)
      } catch {
        reject("E_CONFIGURE_FAILED", error.localizedDescription, error)
      }
    }
  }

  // MARK: - presentAuth

  @objc func presentAuth(_ options: NSDictionary,
                          resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      reject("E_NOT_INITIALIZED", "Clerk not initialized", nil)
      return
    }

    let mode = options["mode"] as? String ?? "signInOrUp"
    let dismissable = options["dismissable"] as? Bool ?? true

    DispatchQueue.main.async {
      guard let vc = factory.createAuthViewController(mode: mode, dismissable: dismissable, completion: { result in
        switch result {
        case .success(let data):
          resolve(data)
        case .failure(let error):
          reject("E_AUTH_FAILED", error.localizedDescription, error)
        }
      }) else {
        reject("E_CREATE_FAILED", "Could not create auth view controller", nil)
        return
      }

      if let rootVC = Self.topViewController() {
        rootVC.present(vc, animated: true)
      } else {
        reject("E_NO_ROOT_VC", "No root view controller available to present auth", nil)
      }
    }
  }

  // MARK: - presentUserProfile

  @objc func presentUserProfile(_ options: NSDictionary,
                                  resolve: @escaping RCTPromiseResolveBlock,
                                  reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      reject("E_NOT_INITIALIZED", "Clerk not initialized", nil)
      return
    }

    let dismissable = options["dismissable"] as? Bool ?? true

    DispatchQueue.main.async {
      guard let vc = factory.createUserProfileViewController(dismissable: dismissable, completion: { result in
        switch result {
        case .success(let data):
          resolve(data)
        case .failure(let error):
          reject("E_PROFILE_FAILED", error.localizedDescription, error)
        }
      }) else {
        reject("E_CREATE_FAILED", "Could not create profile view controller", nil)
        return
      }

      if let rootVC = Self.topViewController() {
        rootVC.present(vc, animated: true)
      } else {
        reject("E_NO_ROOT_VC", "No root view controller available to present profile", nil)
      }
    }
  }

  // MARK: - getSession

  @objc func getSession(_ resolve: @escaping RCTPromiseResolveBlock,
                         reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      resolve(nil)
      return
    }

    Task {
      let session = await factory.getSession()
      resolve(session)
    }
  }

  // MARK: - getClientToken

  @objc func getClientToken(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      resolve(nil)
      return
    }

    resolve(factory.getClientToken())
  }

  // MARK: - signOut

  @objc func signOut(_ resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    guard let factory = clerkViewFactory else {
      reject("E_NOT_INITIALIZED", "Clerk not initialized", nil)
      return
    }

    Task {
      do {
        try await factory.signOut()
        resolve(nil)
      } catch {
        reject("E_SIGN_OUT_FAILED", error.localizedDescription, error)
      }
    }
  }
}

// MARK: - Inline View: ClerkAuthNativeView

public class ClerkAuthNativeView: UIView {
  private var hostingController: UIViewController?
  private var currentMode: String = "signInOrUp"
  private var currentDismissable: Bool = false
  private var hasInitialized: Bool = false
  private var didCompleteAuthentication: Bool = false
  private var dismissalEventSent: Bool = false

  @objc var onAuthEvent: RCTBubblingEventBlock?

  @objc var mode: NSString? {
    didSet {
      let newMode = (mode as String?) ?? "signInOrUp"
      guard newMode != currentMode else { return }
      currentMode = newMode
      if hasInitialized { updateView() }
    }
  }

  @objc var isDismissable: NSNumber? {
    didSet {
      let newDismissable = isDismissable?.boolValue ?? false
      guard newDismissable != currentDismissable else { return }
      currentDismissable = newDismissable
      if hasInitialized { updateView() }
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override public func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil && !hasInitialized {
      hasInitialized = true
      updateView()
    } else if window == nil && hasInitialized && currentDismissable && !didCompleteAuthentication && !dismissalEventSent {
      dismissalEventSent = true
      sendAuthEvent(type: "dismissed", data: [:])
    }
  }

  private func sendAuthEvent(type: String, data: [String: Any]) {
    let jsonData = (try? JSONSerialization.data(withJSONObject: data)) ?? Data()
    let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
    onAuthEvent?(["type": type, "data": jsonString])
  }

  private func updateView() {
    detachHostingController()

    guard let factory = clerkViewFactory else { return }

    guard let returnedController = factory.createAuthView(
      mode: currentMode,
      dismissable: currentDismissable,
      onEvent: { [weak self] eventName, data in
        let didCompleteAuthentication = eventName == "signInCompleted" || eventName == "signUpCompleted"

        if didCompleteAuthentication {
          self?.didCompleteAuthentication = true
        }

        self?.sendAuthEvent(type: eventName, data: data)

        if didCompleteAuthentication {
          let sessionId = data["sessionId"] as? String
          ClerkExpoModule.emitAuthStateChange(type: "signedIn", sessionId: sessionId)
        }
      }
    ) else { return }

    attachHostingController(returnedController)
  }

  private func attachHostingController(_ controller: UIViewController) {
    controller.view.frame = bounds
    controller.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

    if let parentVC = findViewController() {
      parentVC.addChild(controller)
      addSubview(controller.view)
      controller.didMove(toParent: parentVC)
    } else {
      addSubview(controller.view)
    }

    hostingController = controller
  }

  private func detachHostingController() {
    guard let controller = hostingController else { return }
    controller.willMove(toParent: nil)
    controller.view.removeFromSuperview()
    controller.removeFromParent()
    hostingController = nil
  }

  private func findViewController() -> UIViewController? {
    var responder: UIResponder? = self
    while let nextResponder = responder?.next {
      if let vc = nextResponder as? UIViewController {
        return vc
      }
      responder = nextResponder
    }
    return nil
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }
}

// MARK: - Inline View: ClerkUserProfileNativeView

public class ClerkUserProfileNativeView: UIView {
  private var hostingController: UIViewController?
  private var currentDismissable: Bool = true
  private var hasInitialized: Bool = false

  @objc var onProfileEvent: RCTBubblingEventBlock?

  @objc var isDismissable: NSNumber? {
    didSet {
      currentDismissable = isDismissable?.boolValue ?? true
      if hasInitialized { updateView() }
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
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
    // Remove old hosting controller
    hostingController?.view.removeFromSuperview()
    hostingController?.removeFromParent()
    hostingController = nil

    guard let factory = clerkViewFactory else { return }

    guard let returnedController = factory.createUserProfileView(
      dismissable: currentDismissable,
      onEvent: { [weak self] eventName, data in
        let jsonData = (try? JSONSerialization.data(withJSONObject: data)) ?? Data()
        let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
        self?.onProfileEvent?(["type": eventName, "data": jsonString])

        // Also emit module-level event for sign-out detection
        if eventName == "signedOut" {
          let sessionId = data["sessionId"] as? String
          ClerkExpoModule.emitAuthStateChange(type: "signedOut", sessionId: sessionId)
        }
      }
    ) else { return }

    if let parentVC = findViewController() {
      parentVC.addChild(returnedController)
      returnedController.view.frame = bounds
      returnedController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(returnedController.view)
      returnedController.didMove(toParent: parentVC)
      hostingController = returnedController
    } else {
      returnedController.view.frame = bounds
      returnedController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(returnedController.view)
      hostingController = returnedController
    }
  }

  private func findViewController() -> UIViewController? {
    var responder: UIResponder? = self
    while let nextResponder = responder?.next {
      if let vc = nextResponder as? UIViewController {
        return vc
      }
      responder = nextResponder
    }
    return nil
  }

  override public func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }
}
