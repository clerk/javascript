/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissable content leaves the window.
  case dismissed
  case signedOut
  case signInCompleted
  case signUpCompleted

  var isAuthCompletion: Bool {
    self == .signInCompleted || self == .signUpCompleted
  }
}

/// Auth state changes emitted by the Expo module to ClerkProvider's JS session sync.
enum ClerkNativeAuthStateEvent: String {
  case signedIn
  case signedOut
}
