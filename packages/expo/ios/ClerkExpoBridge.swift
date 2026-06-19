import Foundation
import UIKit

/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissible content leaves the window.
  case dismissed
}

// Protocol that the app target implements to provide Clerk SDK operations and SwiftUI views.
public protocol ClerkNativeBridgeProtocol {
  // Inline rendering - returns UIViewController to preserve SwiftUI lifecycle
  func makeAuthViewController(mode: String, dismissible: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func makeUserProfileViewController(dismissible: Bool, onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void) -> UIViewController?
  func makeUserButtonViewController() -> UIViewController?

  // SDK operations
  func configure(publishableKey: String, bearerToken: String?) async throws
  func getClientToken() async -> String?
  func syncFromJsClientToken(_ clientToken: String?, sourceId: String?, shouldRefreshClient: Bool) async throws
}

// Global registry for the app-target native bridge (set by the app target at startup).
public var clerkNativeBridge: ClerkNativeBridgeProtocol? {
  didSet {
    if clerkNativeBridge != nil {
      emitClerkNativeBridgeReady()
    }
  }
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

private var clerkNativeClientChangedEmitter: (([String: Any]?) -> Void)?

public func setClerkNativeClientChangedEmitter(_ emitter: (([String: Any]?) -> Void)?) {
  clerkNativeClientChangedEmitter = emitter
}

/// Requests that ClerkProvider reload the JS client from native client state.
public func emitClerkNativeClientChanged(_ body: [String: Any]? = nil) {
  clerkNativeClientChangedEmitter?(body)
}
