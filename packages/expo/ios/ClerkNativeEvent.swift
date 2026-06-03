/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissible content leaves the window.
  case dismissed
}

/// Auth state changes emitted by native views to ClerkProvider's JS session sync.
public enum ClerkNativeAuthStateEvent: String {
  case signedIn
  case signedOut
}

public func emitClerkNativeAuthStateChange(type: ClerkNativeAuthStateEvent, sessionId: String?) {
  ClerkExpoModule.emitAuthStateChange(type: type, sessionId: sessionId)
}
