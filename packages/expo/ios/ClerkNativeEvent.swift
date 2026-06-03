/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissible content leaves the window.
  case dismissed
}

/// Requests that ClerkProvider reload the JS client from native client state.
public func emitClerkNativeRefreshClient() {
  ClerkExpoModule.emitRefreshClient()
}
