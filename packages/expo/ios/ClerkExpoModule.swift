// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, client sync, and native view bridges.
// SwiftUI Clerk views are created by ClerkNativeBridge through the Clerk iOS SPM dependency.

import UIKit
import React

// MARK: - Module

@objc(ClerkExpo)
class ClerkExpoModule: RCTEventEmitter {

  private static var _hasListeners = false
  private static weak var sharedInstance: ClerkExpoModule?

  override init() {
    super.init()
    ClerkExpoModule.sharedInstance = self
    ClerkNativeBridge.setClientChangedEmitter { body in
      Self.emitClientChanged(body)
    }
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
    Task {
      do {
        try await ClerkNativeBridge.shared.configure(publishableKey: publishableKey, bearerToken: bearerToken)
        resolve(nil)
      } catch {
        reject("E_CONFIGURE_FAILED", error.localizedDescription, error)
      }
    }
  }

  // MARK: - getClientToken

  @objc func getClientToken(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
    Task {
      let token = await ClerkNativeBridge.shared.getClientToken()
      resolve(token)
    }
  }

  // MARK: - syncClientStateFromJs

  @objc func syncClientStateFromJs(_ deviceToken: Any?,
                                   sourceId: Any?,
                                   didChangeClient: Bool,
                                   didChangeDeviceToken: Bool,
                                   resolve: @escaping RCTPromiseResolveBlock,
                                   reject: @escaping RCTPromiseRejectBlock) {
    let normalizedDeviceToken = deviceToken as? String
    let normalizedSourceId = sourceId as? String
    Task {
      do {
        try await ClerkNativeBridge.shared.syncClientStateFromJs(
          deviceToken: normalizedDeviceToken,
          sourceId: normalizedSourceId,
          didChangeClient: didChangeClient,
          didChangeDeviceToken: didChangeDeviceToken
        )
        resolve(nil)
      } catch {
        reject("E_SYNC_FROM_JS_FAILED", error.localizedDescription, error)
      }
    }
  }

}
