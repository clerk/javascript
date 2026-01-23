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
  func createAuthViewController(mode: String, dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?
  func createUserProfileViewController(dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) -> UIViewController?
  func configure(publishableKey: String) async throws
  func getSession() async -> [String: Any]?
  func signOut() async throws
}

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

    // Sign out from native Clerk SDK
    AsyncFunction("signOut") { () in
      guard let factory = clerkViewFactory else {
        throw NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "Clerk not initialized"])
      }
      try await factory.signOut()
    }
  }
}
