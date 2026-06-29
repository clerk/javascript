// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, client sync, and native view bridges.
// SwiftUI Clerk views are created by ClerkNativeBridge through the Clerk iOS SPM dependency.

import ExpoModulesCore
import Foundation

// MARK: - Module

public class ClerkExpoModule: Module {
  private static let nativeClientChangedEvent = "clerkNativeClientChanged"

  private static weak var sharedInstance: ClerkExpoModule?

  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    Events(Self.nativeClientChangedEvent)

    OnCreate {
      Self.sharedInstance = self
      ClerkNativeBridge.setClientChangedEmitter { body in
        Self.emitClientChanged(body)
      }
    }

    OnDestroy {
      if Self.sharedInstance === self {
        Self.sharedInstance = nil
        ClerkNativeBridge.setClientChangedEmitter(nil)
      }
    }

    AsyncFunction("configure") { (publishableKey: String, bearerToken: String?, promise: Promise) in
      self.configure(publishableKey, bearerToken: bearerToken, promise: promise)
    }

    AsyncFunction("getClientToken") { (promise: Promise) in
      self.getClientToken(promise: promise)
    }

    AsyncFunction("syncClientStateFromJs") {
      (deviceToken: String?,
       sourceId: String?,
       didChangeClient: Bool,
       didChangeDeviceToken: Bool,
       promise: Promise) in
      self.syncClientStateFromJs(
        deviceToken,
        sourceId: sourceId,
        didChangeClient: didChangeClient,
        didChangeDeviceToken: didChangeDeviceToken,
        promise: promise
      )
    }
  }

  // MARK: - configure

  private func configure(_ publishableKey: String, bearerToken: String?, promise: Promise) {
    Task {
      do {
        try await ClerkNativeBridge.shared.configure(publishableKey: publishableKey, bearerToken: bearerToken)
        promise.resolve()
      } catch {
        promise.reject("E_CONFIGURE_FAILED", error.localizedDescription)
      }
    }
  }

  // MARK: - getClientToken

  private func getClientToken(promise: Promise) {
    Task {
      let token = await ClerkNativeBridge.shared.getClientToken()
      promise.resolve(token)
    }
  }

  // MARK: - syncClientStateFromJs

  private func syncClientStateFromJs(_ deviceToken: String?,
                                     sourceId: String?,
                                     didChangeClient: Bool,
                                     didChangeDeviceToken: Bool,
                                     promise: Promise) {
    Task {
      do {
        try await ClerkNativeBridge.shared.syncClientStateFromJs(
          deviceToken: deviceToken,
          sourceId: sourceId,
          didChangeClient: didChangeClient,
          didChangeDeviceToken: didChangeDeviceToken
        )
        promise.resolve()
      } catch {
        promise.reject("E_SYNC_FROM_JS_FAILED", error.localizedDescription)
      }
    }
  }

  /// Emits a native client change event to JS from anywhere in the native layer.
  /// Used by native views to ask ClerkProvider to reload JS client state.
  static func emitClientChanged(_ body: [String: Any]? = nil) {
    let eventBody = body ?? [:]

    guard let instance = sharedInstance else {
      return
    }

    DispatchQueue.main.async { [weak instance] in
      instance?.sendEvent(Self.nativeClientChangedEvent, eventBody)
    }
  }
}
