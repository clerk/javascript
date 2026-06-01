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
  // Inline rendering — returns UIViewController to preserve SwiftUI lifecycle
  func createAuthView(mode: String, dismissable: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func createUserProfileView(dismissable: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func createUserButton(onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?

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
  /// Used by native views to notify ClerkProvider of auth state changes.
  static func emitAuthStateChange(type: ClerkNativeAuthStateEvent, sessionId: String?) {
    guard _hasListeners, let instance = sharedInstance else { return }
    instance.sendEvent(withName: "onAuthStateChange", body: [
      "type": type.rawValue,
      "sessionId": sessionId as Any,
    ])
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
