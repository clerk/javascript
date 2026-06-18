// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, client sync, and native view bridges.
// SwiftUI Clerk views are created by the app target through ClerkNativeBridge because
// the Clerk SDK (SPM) isn't accessible from the CocoaPods-backed React Native pod.

import UIKit
import React

/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissible content leaves the window.
  case dismissed
}

// Global registry for the app-target native bridge (set by the app target at startup)
public var clerkNativeBridge: ClerkNativeBridgeProtocol? {
  didSet {
    if clerkNativeBridge != nil {
      emitClerkNativeBridgeReady()
    }
  }
}

// Protocol that the app target implements to provide Clerk SDK operations and SwiftUI views.
public protocol ClerkNativeBridgeProtocol {
  // Inline rendering — returns UIViewController to preserve SwiftUI lifecycle
  func makeAuthViewController(mode: String, dismissible: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func makeUserProfileViewController(dismissible: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func makeUserButtonViewController() -> UIViewController?

  // SDK operations
  func configure(publishableKey: String, bearerToken: String?) async throws
  func getClientToken() async -> String?
  func syncFromJsClientToken(_ clientToken: String?, sourceId: String?, shouldRefreshClient: Bool) async throws
}

public protocol ClerkNativeBridgeReadyObserver: AnyObject {
  func clerkNativeBridgeDidBecomeReady()
}

private let clerkNativeBridgeReadyObservers = NSHashTable<AnyObject>.weakObjects()

public func addClerkNativeBridgeReadyObserver(_ observer: ClerkNativeBridgeReadyObserver) {
  clerkNativeBridgeReadyObservers.add(observer)
}

public func removeClerkNativeBridgeReadyObserver(_ observer: ClerkNativeBridgeReadyObserver) {
  clerkNativeBridgeReadyObservers.remove(observer)
}

public func emitClerkNativeBridgeReady() {
  let notifyObservers = {
    for observer in clerkNativeBridgeReadyObservers.allObjects {
      (observer as? ClerkNativeBridgeReadyObserver)?.clerkNativeBridgeDidBecomeReady()
    }
  }

  if Thread.isMainThread {
    notifyObservers()
  } else {
    DispatchQueue.main.async(execute: notifyObservers)
  }
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

  private static let nativeClientChangedEvent = "clerkNativeClientChanged"

  override func supportedEvents() -> [String]! {
    return [Self.nativeClientChangedEvent]
  }

  override func startObserving() {
    ClerkExpoModule._hasListeners = true
  }

  override func stopObserving() {
    ClerkExpoModule._hasListeners = false
  }

  /// Emits a native client change event to JS from anywhere in the native layer.
  /// Used by native views to ask ClerkProvider to reload JS client state.
  static func emitClientChanged(_ body: [String: Any]? = nil) {
    let eventBody = body ?? [:]

    guard let instance = sharedInstance else {
      return
    }

    if let bridge = instance.bridge {
      bridge.enqueueJSCall("RCTDeviceEventEmitter", method: "emit", args: [nativeClientChangedEvent, eventBody], completion: nil)
      return
    }

    guard _hasListeners else {
      return
    }

    instance.sendEvent(withName: nativeClientChangedEvent, body: eventBody)
  }

  // MARK: - configure

  @objc func configure(_ publishableKey: String,
                        bearerToken: String?,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
    guard let bridge = clerkNativeBridge else {
      reject("E_NOT_INITIALIZED", "Clerk not initialized. Make sure ClerkNativeBridge is registered.", nil)
      return
    }

    Task {
      do {
        try await bridge.configure(publishableKey: publishableKey, bearerToken: bearerToken)
        resolve(nil)
      } catch {
        reject("E_CONFIGURE_FAILED", error.localizedDescription, error)
      }
    }
  }

  // MARK: - getClientToken

  @objc func getClientToken(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
    guard let bridge = clerkNativeBridge else {
      resolve(nil)
      return
    }

    Task {
      let token = await bridge.getClientToken()
      resolve(token)
    }
  }

  // MARK: - syncFromJsClientToken

  @objc func syncFromJsClientToken(_ clientToken: Any?,
                                   sourceId: Any?,
                                   shouldRefreshClient: Any?,
                                   resolve: @escaping RCTPromiseResolveBlock,
                                   reject: @escaping RCTPromiseRejectBlock) {
    guard let bridge = clerkNativeBridge else {
      resolve(nil)
      return
    }

    let normalizedClientToken = clientToken as? String
    let normalizedSourceId = sourceId as? String
    let defaultShouldRefreshClient = normalizedClientToken?.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ?? true
    let normalizedShouldRefreshClient = (shouldRefreshClient as? Bool) ?? defaultShouldRefreshClient
    Task {
      do {
        try await bridge.syncFromJsClientToken(
          normalizedClientToken,
          sourceId: normalizedSourceId,
          shouldRefreshClient: normalizedShouldRefreshClient
        )
        resolve(nil)
      } catch {
        reject("E_SYNC_FROM_JS_FAILED", error.localizedDescription, error)
      }
    }
  }

}

/// Requests that ClerkProvider reload the JS client from native client state.
public func emitClerkNativeClientChanged(_ body: [String: Any]? = nil) {
  ClerkExpoModule.emitClientChanged(body)
}
