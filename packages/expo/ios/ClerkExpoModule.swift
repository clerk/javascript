// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function and view presentation methods.
// Views are presented as modal view controllers (not embedded Expo views)
// because the Clerk SDK (SPM) isn't accessible from CocoaPods.

import ExpoModulesCore
import UIKit

// Global registry for the Clerk view factory (set by app target at startup)
public var clerkViewFactory: ClerkViewFactoryProtocol?

// Protocol that the app target implements to provide Clerk views
public protocol ClerkViewFactoryProtocol {
  // Modal presentation (existing)
  func createAuthViewController(mode: String, dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?
  func createUserProfileViewController(dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?

  // Inline rendering (new)
  func createAuthView(mode: String, dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIView?
  func createUserProfileView(dismissable: Bool, onEvent: @escaping (String, [String: Any]) -> Void) -> UIView?

  // SDK operations
  func configure(publishableKey: String) async throws
  func getSession() async -> [String: Any]?
  func signOut() async throws
}

// MARK: - Inline ExpoView for AuthView

public class ClerkAuthExpoView: ExpoView {
  private var hostingController: UIViewController?
  var currentMode: String = "signInOrUp"
  var currentDismissable: Bool = true
  private var hasInitialized: Bool = false

  let onAuthEvent = EventDispatcher()

  func updateView() {
    hasInitialized = true
    // Remove old hosting controller
    hostingController?.view.removeFromSuperview()
    hostingController?.removeFromParent()
    hostingController = nil

    guard let factory = clerkViewFactory else { return }

    let view = factory.createAuthView(
      mode: currentMode,
      dismissable: currentDismissable,
      onEvent: { [weak self] eventName, data in
        self?.onAuthEvent([
          "type": eventName,
          "data": data
        ])
      }
    )

    guard let view = view else { return }

    // Find the parent view controller to add the hosting controller
    if let parentVC = findViewController() {
      let hostingVC = UIViewController()
      hostingVC.view = view
      parentVC.addChild(hostingVC)
      view.frame = bounds
      view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(view)
      hostingVC.didMove(toParent: parentVC)
      hostingController = hostingVC
    } else {
      view.frame = bounds
      view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(view)
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

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }
}

// MARK: - Inline ExpoView for UserProfileView

public class ClerkUserProfileExpoView: ExpoView {
  private var hostingController: UIViewController?
  var currentDismissable: Bool = true
  private var hasInitialized: Bool = false

  let onProfileEvent = EventDispatcher()

  func updateView() {
    hasInitialized = true
    // Remove old hosting controller
    hostingController?.view.removeFromSuperview()
    hostingController?.removeFromParent()
    hostingController = nil

    guard let factory = clerkViewFactory else { return }

    let view = factory.createUserProfileView(
      dismissable: currentDismissable,
      onEvent: { [weak self] eventName, data in
        self?.onProfileEvent([
          "type": eventName,
          "data": data
        ])
      }
    )

    guard let view = view else { return }

    if let parentVC = findViewController() {
      let hostingVC = UIViewController()
      hostingVC.view = view
      parentVC.addChild(hostingVC)
      view.frame = bounds
      view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(view)
      hostingVC.didMove(toParent: parentVC)
      hostingController = hostingVC
    } else {
      view.frame = bounds
      view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(view)
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

  public override func layoutSubviews() {
    super.layoutSubviews()
    hostingController?.view.frame = bounds
  }
}

// MARK: - Module Definition

public class ClerkExpoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    // Configure Clerk with publishable key
    AsyncFunction("configure") { (publishableKey: String) in
      guard let factory = clerkViewFactory else {
        throw NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Clerk not initialized. Make sure ClerkViewFactory is registered."])
      }
      try await factory.configure(publishableKey: publishableKey)
    }

    // Present sign-in/sign-up modal
    AsyncFunction("presentAuth") { (options: [String: Any]) -> [String: Any] in
      guard let factory = clerkViewFactory else {
        throw NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Clerk not initialized"])
      }

      // Always present the auth modal - let the native UI handle signed-in state
      // The JS SDK will check isSignedIn before calling this
      let mode = options["mode"] as? String ?? "signInOrUp"
      let dismissable = options["dismissable"] as? Bool ?? true

      return try await withCheckedThrowingContinuation { continuation in
        DispatchQueue.main.async {
          guard let vc = factory.createAuthViewController(mode: mode, dismissable: dismissable, completion: { result in
            switch result {
            case .success(let data):
              continuation.resume(returning: data)
            case .failure(let error):
              continuation.resume(throwing: error)
            }
          }) else {
            continuation.resume(throwing: NSError(domain: "ClerkExpo", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create auth view controller"]))
            return
          }

          if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
            rootVC.present(vc, animated: true)
          }
        }
      }
    }

    // Present user profile modal
    AsyncFunction("presentUserProfile") { (options: [String: Any]) -> [String: Any] in
      guard let factory = clerkViewFactory else {
        throw NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Clerk not initialized"])
      }

      let dismissable = options["dismissable"] as? Bool ?? true

      return try await withCheckedThrowingContinuation { continuation in
        DispatchQueue.main.async {
          guard let vc = factory.createUserProfileViewController(dismissable: dismissable, completion: { result in
            switch result {
            case .success(let data):
              continuation.resume(returning: data)
            case .failure(let error):
              continuation.resume(throwing: error)
            }
          }) else {
            continuation.resume(throwing: NSError(domain: "ClerkExpo", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create profile view controller"]))
            return
          }

          if let rootVC = UIApplication.shared.keyWindow?.rootViewController {
            rootVC.present(vc, animated: true)
          }
        }
      }
    }

    // Get current session from native Clerk SDK
    AsyncFunction("getSession") { () -> [String: Any]? in
      guard let factory = clerkViewFactory else {
        return nil
      }
      return await factory.getSession()
    }

    // Get the native Clerk client's bearer token from the iOS keychain
    // This allows the JS SDK to use the same client as the native SDK
    AsyncFunction("getClientToken") { () -> String? in
      let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: Bundle.main.bundleIdentifier ?? "",
        kSecAttrAccount as String: "clerkDeviceToken",
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne
      ]

      var result: AnyObject?
      let status = SecItemCopyMatching(query as CFDictionary, &result)

      if status == errSecSuccess, let data = result as? Data {
        return String(data: data, encoding: .utf8)
      }
      return nil
    }

    // Sign out from native Clerk SDK
    AsyncFunction("signOut") { () in
      guard let factory = clerkViewFactory else {
        throw NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Clerk not initialized"])
      }
      try await factory.signOut()
    }

    // MARK: - Inline Native Views

    View(ClerkAuthExpoView.self) {
      Events("onAuthEvent")

      Prop("mode") { (view: ClerkAuthExpoView, mode: String?) in
        view.currentMode = mode ?? "signInOrUp"
      }

      Prop("isDismissable") { (view: ClerkAuthExpoView, dismissable: Bool?) in
        view.currentDismissable = dismissable ?? true
      }

      OnViewDidUpdateProps { view in
        view.updateView()
      }
    }

    View(ClerkUserProfileExpoView.self) {
      Events("onProfileEvent")

      Prop("isDismissable") { (view: ClerkUserProfileExpoView, dismissable: Bool?) in
        view.currentDismissable = dismissable ?? true
      }

      OnViewDidUpdateProps { view in
        view.updateView()
      }
    }
  }
}
