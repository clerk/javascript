// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, client sync, and native view bridges.
// SwiftUI Clerk views are created by ClerkNativeBridge through the Clerk iOS SPM dependency.

import ExpoModulesCore
import Foundation

// MARK: - Module

public class ClerkExpoModule: Module {
  private static let nativeAuthFlowChangedEvent = "clerkNativeAuthFlowChanged"
  private static let nativeClientInvalidatedEvent = "clerkNativeClientInvalidated"

  private static weak var sharedInstance: ClerkExpoModule?

  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    Events(Self.nativeAuthFlowChangedEvent, Self.nativeClientInvalidatedEvent)

    OnCreate {
      Self.sharedInstance = self
      ClerkNativeBridge.setAuthFlowChangedEmitter { body in
        Self.emitAuthFlowChanged(body)
      }
      ClerkNativeBridge.setClientInvalidatedEmitter {
        Self.emitClientInvalidated()
      }
    }

    OnDestroy {
      if Self.sharedInstance === self {
        Self.sharedInstance = nil
        ClerkNativeBridge.setAuthFlowChangedEmitter(nil)
        ClerkNativeBridge.setClientInvalidatedEmitter(nil)
      }
    }

    AsyncFunction("configureNative") { (publishableKey: String, seedDeviceToken: String?, promise: Promise) in
      Task { @MainActor in
        do {
          try await ClerkNativeBridge.shared.configureNative(
            publishableKey: publishableKey,
            seedDeviceToken: seedDeviceToken
          )
          promise.resolve()
        } catch {
          promise.reject("E_CONFIGURE_FAILED", error.localizedDescription)
        }
      }
    }

    AsyncFunction("getDeviceToken") { (promise: Promise) in
      Task { @MainActor in
        promise.resolve(ClerkNativeBridge.shared.getDeviceToken())
      }
    }

    AsyncFunction("setDeviceToken") { (token: String?, expected: String?, promise: Promise) in
      Task { @MainActor in
        do {
          let didSet = try await ClerkNativeBridge.shared.setDeviceToken(token, expected: expected)
          promise.resolve(didSet)
        } catch {
          let descriptor = clerkSetDeviceTokenErrorDescriptor(error)
          promise.reject(descriptor.code, descriptor.message)
        }
      }
    }

    AsyncFunction("refreshClient") { (promise: Promise) in
      Task { @MainActor in
        do {
          try await ClerkNativeBridge.shared.refreshClient()
          promise.resolve()
        } catch ClerkClientSyncError.notConfigured {
          promise.reject("E_NOT_CONFIGURED", ClerkClientSyncError.notConfigured.localizedDescription)
        } catch {
          promise.reject("E_REFRESH_CLIENT_FAILED", error.localizedDescription)
        }
      }
    }

    AsyncFunction("getAuthFlowState") { (promise: Promise) in
      self.getAuthFlowState(promise: promise)
    }

    AsyncFunction("reverifyWithBiometrics") {
      (sessionId: String, level: String, reason: String?, promise: Promise) in
      Task { @MainActor in
        do {
          let verification = try await ClerkNativeBridge.shared.reverifyWithBiometrics(
            sessionId: sessionId,
            level: level,
            reason: reason
          )
          promise.resolve(verification)
        } catch {
          self.rejectBiometricCredentialError(
            error,
            fallbackCode: "E_BIOMETRIC_REVERIFICATION_FAILED",
            promise: promise
          )
        }
      }
    }
  }

  // MARK: - getAuthFlowState

  private func getAuthFlowState(promise: Promise) {
    Task { @MainActor in
      let state = ClerkNativeBridge.shared.getAuthFlowState()
      promise.resolve(state)
    }
  }

  // MARK: - Biometric reverification

  private func rejectBiometricCredentialError(
    _ error: Error,
    fallbackCode: String,
    promise: Promise
  ) {
    let descriptor = ClerkNativeBridge.biometricCredentialErrorDescriptor(
      error,
      fallbackCode: fallbackCode
    )
    promise.reject(descriptor.code, descriptor.message)
  }

  static func emitClientInvalidated() {
    guard let instance = sharedInstance else {
      return
    }

    DispatchQueue.main.async { [weak instance] in
      instance?.sendEvent(Self.nativeClientInvalidatedEvent, [:])
    }
  }

  static func emitAuthFlowChanged(_ body: [String: Any]? = nil) {
    let eventBody = body ?? [:]

    guard let instance = sharedInstance else {
      return
    }

    DispatchQueue.main.async { [weak instance] in
      instance?.sendEvent(Self.nativeAuthFlowChangedEvent, eventBody)
    }
  }
}
