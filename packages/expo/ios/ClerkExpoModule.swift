// ClerkExpoModule - Native module for Clerk integration
// This module connects native views and platform capabilities to the Expo JS runtime.
// SwiftUI Clerk views are created by ClerkNativeBridge through the Clerk iOS SPM dependency.

import ExpoModulesCore
import Foundation
@_spi(ClerkExpo) import ClerkKit

// MARK: - Module

public class ClerkExpoModule: Module {
  private static let nativeAuthFlowChangedEvent = "clerkNativeAuthFlowChanged"

  @MainActor private lazy var externalRuntime = ClerkExternalRuntime()

  private static weak var sharedInstance: ClerkExpoModule?

  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    Events(Self.nativeAuthFlowChangedEvent, "clerkRuntimeOperation")

    OnCreate {
      Self.sharedInstance = self
      ClerkNativeBridge.setAuthFlowChangedEmitter { body in
        Self.emitAuthFlowChanged(body)
      }
    }

    OnDestroy {
      Task { @MainActor in await self.externalRuntime.dispose() }
      if Self.sharedInstance === self {
        Self.sharedInstance = nil
        ClerkNativeBridge.setAuthFlowChangedEmitter(nil)
      }
    }

    AsyncFunction("configureExternalRuntime") { (publishableKey: String, runtimeID: String, state: String, promise: Promise) in
      Task { @MainActor in
        do {
          try await self.externalRuntime.configure(publishableKey: publishableKey, runtimeID: runtimeID, state: state) { [weak self] body in
            self?.sendEvent("clerkRuntimeOperation", body)
          }
          promise.resolve()
        } catch { promise.reject("E_RUNTIME_CONFIGURE", error.localizedDescription) }
      }
    }

    AsyncFunction("publishRuntimeState") { (runtimeID: String, state: String, promise: Promise) in
      Task { @MainActor in
        do {
          try await Clerk.publishExternalRuntimeState(runtimeID: runtimeID, state: Data(state.utf8))
          promise.resolve()
        } catch { promise.reject("E_RUNTIME_STATE", error.localizedDescription) }
      }
    }

    AsyncFunction("completeRuntimeOperation") { (runtimeID: String, requestID: String, response: String, promise: Promise) in
      Task { @MainActor in
        self.externalRuntime.complete(runtimeID: runtimeID, requestID: requestID, response: response)
        promise.resolve()
      }
    }

    AsyncFunction("detachRuntime") { (runtimeID: String, promise: Promise) in
      Task { @MainActor in
        await self.externalRuntime.detach(runtimeID)
        promise.resolve()
      }
    }

    AsyncFunction("performRuntimeCapability") { (runtimeID: String, action: String, payload: String, promise: Promise) in
      Task { @MainActor in
        do {
          let result = try await Clerk.performExternalRuntimeCapability(runtimeID: runtimeID, action: action, payload: Data(payload.utf8))
          promise.resolve(String(decoding: result, as: UTF8.self))
        } catch {
          let descriptor = ClerkNativeBridge.biometricCredentialErrorDescriptor(error, fallbackCode: "native_capability_failed")
          let envelope: [String: Any] = ["error": ["code": descriptor.code, "message": descriptor.message]]
          if let data = try? JSONSerialization.data(withJSONObject: envelope) {
            promise.resolve(String(decoding: data, as: UTF8.self))
          } else { promise.reject("E_RUNTIME_CAPABILITY", error.localizedDescription) }
        }
      }
    }

    AsyncFunction("getAuthFlowState") { (promise: Promise) in
      self.getAuthFlowState(promise: promise)
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



  // MARK: - getAuthFlowState

  private func getAuthFlowState(promise: Promise) {
    Task { @MainActor in
      let state = ClerkNativeBridge.shared.getAuthFlowState()
      promise.resolve(state)
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
