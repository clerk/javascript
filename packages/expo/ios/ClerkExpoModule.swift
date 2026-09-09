import ExpoModulesCore
import Foundation

// MARK: - Module

// Expo owns the module lifetime; all mutable native state is confined to MainActor.
public final class ClerkExpoModule: Module, @unchecked Sendable {
  private static let nativeAuthFlowChangedEvent = "clerkNativeAuthFlowChanged"
  private static let coreMessageEvent = "clerkCoreMessage"

  @MainActor private static weak var sharedInstance: ClerkExpoModule?

  public func definition() -> ModuleDefinition {
    Name("ClerkExpo")

    Events(Self.nativeAuthFlowChangedEvent, Self.coreMessageEvent)

    OnCreate {
      Task { @MainActor in
        Self.sharedInstance = self
        ClerkNativeBridge.setAuthFlowChangedEmitter { body in Self.emitAuthFlowChanged(body) }
      }
    }

    OnDestroy {
      Task { @MainActor in
        guard Self.sharedInstance === self else { return }
        Self.sharedInstance = nil
        ClerkNativeBridge.setAuthFlowChangedEmitter(nil)
        ClerkNativeBridge.shared.detach()
      }
    }

    AsyncFunction("prepareCore") { (publishableKey: String, promise: Promise) in
      Task { @MainActor in
        do {
          promise.resolve(
            try ClerkNativeBridge.shared.prepare(publishableKey: publishableKey) { id, message in
              Self.sharedInstance?.sendEvent(
                Self.coreMessageEvent, ["connectionId": id, "message": message])
            } as Any?)
        } catch {
          let descriptor = ClerkNativeBridge.nativeErrorDescriptor(
            error, fallbackCode: "E_CORE_PREPARE")
          promise.reject(descriptor.code, descriptor.message)
        }
      }
    }
    AsyncFunction("startCore") { (id: String, promise: Promise) in
      Task { @MainActor in
        do {
          try await ClerkNativeBridge.shared.start(id)
          promise.resolve()
        } catch {
          let descriptor = ClerkNativeBridge.nativeErrorDescriptor(
            error, fallbackCode: "E_CORE_START")
          promise.reject(descriptor.code, descriptor.message)
        }
      }
    }
    Function("receiveCoreMessage") { (id: String, message: String) in
      Task { @MainActor in
        do { try ClerkNativeBridge.shared.requireConnection(id).receive(message) } catch {
          ClerkNativeBridge.shared.detach(id)
        }
      }
    }
    Function("detachCore") { (id: String) in
      Task { @MainActor in ClerkNativeBridge.shared.detach(id) }
    }
    AsyncFunction("performCoreCapability") {
      (id: String, requestId: String, capability: String, arguments: String, promise: Promise) in
      Task { @MainActor in
        do {
          promise.resolve(
            try await ClerkNativeBridge.shared.requireConnection(id).perform(
              id: requestId, capability: capability, arguments: arguments))
        } catch {
          let descriptor = ClerkNativeBridge.nativeErrorDescriptor(
            error, fallbackCode: "native_capability_failed")
          promise.reject(descriptor.code, descriptor.message)
        }
      }
    }
    Function("cancelCoreCapabilities") { (id: String, requestIds: [String]) in
      Task { @MainActor in try? ClerkNativeBridge.shared.requireConnection(id).cancel(requestIds) }
    }
    AsyncFunction("getAuthFlowState") { (promise: Promise) in
      self.getAuthFlowState(promise: promise)
    }

  }

  // MARK: - getAuthFlowState

  private func getAuthFlowState(promise: Promise) {
    Task { @MainActor in
      let state = ClerkNativeBridge.shared.getAuthFlowState()
      promise.resolve(state as Any?)
    }
  }

  @MainActor static func emitAuthFlowChanged(_ body: [String: Any]? = nil) {
    let eventBody = body ?? [:]

    guard let instance = sharedInstance else {
      return
    }

    DispatchQueue.main.async { [weak instance] in
      instance?.sendEvent(Self.nativeAuthFlowChangedEvent, eventBody)
    }
  }
}
