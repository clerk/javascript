// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function and view presentation methods.
// Views are presented as modal view controllers (not embedded views)
// because the Clerk SDK (SPM) isn't accessible from CocoaPods.

import UIKit
import React

// Global registry for the Clerk view factory (set by app target at startup)
public var clerkViewFactory: ClerkViewFactoryProtocol?

// Protocol that the app target implements to provide Clerk views
public protocol ClerkViewFactoryProtocol {
  // Modal presentation (existing)
  func createAuthViewController(mode: String, dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?
  func createUserProfileViewController(dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?

  // Inline rendering — returns UIViewController to preserve SwiftUI lifecycle
  func createAuthView(mode: String, dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIViewController?
  func createUserProfileView(dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIViewController?

  // SDK operations
  func configure(publishableKey: String, bearerToken: String?) async throws
  func getSession() async -> [String: Any]?
  func signOut() async throws
}

// MARK: - Module

@objc(ClerkExpo)
class ClerkExpoModule: RCTEventEmitter {

  private static var _hasListeners = false

  override init() {
    super.init()
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
  private var currentDismissable: Bool = true
  private var hasInitialized: Bool = false

  @objc var onAuthEvent: RCTBubblingEventBlock?

  @objc var mode: NSString? {
    didSet {
      currentMode = (mode as String?) ?? "signInOrUp"
      if hasInitialized { updateView() }
    }
  }

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

    guard let returnedController = factory.createAuthView(
      mode: currentMode,
      dismissable: currentDismissable,
      onEvent: { [weak self] eventName, data in
        // Convert data dict to JSON string for codegen event
        let jsonData = (try? JSONSerialization.data(withJSONObject: data)) ?? Data()
        let jsonString = String(data: jsonData, encoding: .utf8) ?? "{}"
        self?.onAuthEvent?(["type": eventName, "data": jsonString])
      }
    ) else { return }

    // Attach the returned UIHostingController as a child to preserve SwiftUI lifecycle
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
