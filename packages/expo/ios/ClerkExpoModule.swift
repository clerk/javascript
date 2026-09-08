// ClerkExpoModule - Native module for Clerk integration
// This module provides the configure function, client sync, and native view bridges.
// SwiftUI Clerk views are created by ClerkNativeBridge through the Clerk iOS SPM dependency.

import ExpoModulesCore
import Foundation

// MARK: - Module

public class ClerkExpoModule: Module {
  private static let nativeAuthFlowChangedEvent = "clerkNativeAuthFlowChanged"
  private static let nativeClientChangedEvent = "clerkNativeClientChanged"

  private static weak var sharedInstance: ClerkExpoModule?

  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    Events(Self.nativeAuthFlowChangedEvent, Self.nativeClientChangedEvent)

    OnCreate {
      Self.sharedInstance = self
      ClerkNativeBridge.setAuthFlowChangedEmitter { body in
        Self.emitAuthFlowChanged(body)
      }
      ClerkNativeBridge.setClientChangedEmitter { body in
        Self.emitClientChanged(body)
      }
    }

    OnDestroy {
      if Self.sharedInstance === self {
        Self.sharedInstance = nil
        ClerkNativeBridge.setAuthFlowChangedEmitter(nil)
        ClerkNativeBridge.setClientChangedEmitter(nil)
      }
    }

    AsyncFunction("configure") { (publishableKey: String, bearerToken: String?, promise: Promise) in
      self.configure(publishableKey, bearerToken: bearerToken, promise: promise)
    }

    AsyncFunction("getClientToken") { (promise: Promise) in
      self.getClientToken(promise: promise)
    }

    AsyncFunction("getAuthFlowState") { (promise: Promise) in
      self.getAuthFlowState(promise: promise)
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

    AsyncFunction("getTrustedDeviceAvailability") {
      (id: String?, identifierHint: String?, promise: Promise) in
      self.getBiometricCredentialAvailability(id: id, identifierHint: identifierHint, promise: promise)
    }

    AsyncFunction("listTrustedDevices") { (promise: Promise) in
      self.listBiometricCredentials(promise: promise)
    }

    AsyncFunction("enrollTrustedDevice") {
      (deviceName: String?,
       identifierHint: String?,
       reason: String?,
       policy: String,
       promise: Promise) in
      self.enrollBiometricCredential(
        deviceName: deviceName,
        identifierHint: identifierHint,
        reason: reason,
        policy: policy,
        promise: promise
      )
    }

    AsyncFunction("revokeTrustedDevice") { (id: String, promise: Promise) in
      self.revokeBiometricCredential(id: id, promise: promise)
    }

    AsyncFunction("signInWithTrustedDevice") {
      (id: String?, identifierHint: String?, reason: String?, promise: Promise) in
      self.signInWithBiometrics(
        id: id,
        identifierHint: identifierHint,
        reason: reason,
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

  // MARK: - getAuthFlowState

  private func getAuthFlowState(promise: Promise) {
    Task { @MainActor in
      let state = ClerkNativeBridge.shared.getAuthFlowState()
      promise.resolve(state)
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

  // MARK: - Biometric credentials

  private func getBiometricCredentialAvailability(id: String?, identifierHint: String?, promise: Promise) {
    Task { @MainActor in
      do {
        let availability = try await ClerkNativeBridge.shared.getBiometricCredentialAvailability(
          id: id,
          identifierHint: identifierHint
        )
        promise.resolve(availability)
      } catch {
        rejectBiometricCredentialError(
          error,
          fallbackCode: "E_TRUSTED_DEVICE_AVAILABILITY_FAILED",
          promise: promise
        )
      }
    }
  }

  private func listBiometricCredentials(promise: Promise) {
    Task { @MainActor in
      do {
        let biometricCredentials = try await ClerkNativeBridge.shared.listBiometricCredentials()
        promise.resolve(biometricCredentials)
      } catch {
        rejectBiometricCredentialError(
          error,
          fallbackCode: "E_TRUSTED_DEVICE_LIST_FAILED",
          promise: promise
        )
      }
    }
  }

  private func enrollBiometricCredential(
    deviceName: String?,
    identifierHint: String?,
    reason: String?,
    policy: String,
    promise: Promise
  ) {
    Task { @MainActor in
      do {
        let biometricCredential = try await ClerkNativeBridge.shared.enrollBiometricCredential(
          deviceName: deviceName,
          identifierHint: identifierHint,
          reason: reason,
          policy: policy
        )
        promise.resolve(biometricCredential)
      } catch {
        rejectBiometricCredentialError(
          error,
          fallbackCode: "E_TRUSTED_DEVICE_ENROLLMENT_FAILED",
          promise: promise
        )
      }
    }
  }

  private func revokeBiometricCredential(id: String, promise: Promise) {
    Task { @MainActor in
      do {
        let biometricCredential = try await ClerkNativeBridge.shared.revokeBiometricCredential(id: id)
        promise.resolve(biometricCredential)
      } catch {
        rejectBiometricCredentialError(
          error,
          fallbackCode: "E_TRUSTED_DEVICE_REVOCATION_FAILED",
          promise: promise
        )
      }
    }
  }

  private func signInWithBiometrics(
    id: String?,
    identifierHint: String?,
    reason: String?,
    promise: Promise
  ) {
    Task { @MainActor in
      do {
        let signIn = try await ClerkNativeBridge.shared.signInWithBiometrics(
          id: id,
          identifierHint: identifierHint,
          reason: reason
        )
        promise.resolve(signIn)
      } catch {
        rejectBiometricCredentialError(
          error,
          fallbackCode: "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
          promise: promise
        )
      }
    }
  }

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
