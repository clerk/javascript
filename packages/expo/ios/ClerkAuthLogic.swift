// Pure-logic helpers extracted from ClerkAuthNativeView / ClerkAuthWrapperViewController.
//
// The view code in ClerkExpoModule.swift and ClerkViewFactory.swift can't be
// unit-tested directly without a running React Native bridge + UIKit host app,
// and ClerkViewFactory.swift in particular imports ClerkKit (SPM-only in the
// app target) so it's deliberately excluded from the pod source files. The
// small predicates below — which decide success-vs-cancel and when to bail
// out of the modal-presentation retry loop — are pure data and live here so
// the production call sites and the XCTest target both call the same code.

import Foundation

// Symbols are `public` so ClerkViewFactory.swift (compiled into the *app
// target* by the config plugin, not into the pod module) can call them via
// `import ClerkExpo`.

/// Decides whether the disappearance of the auth modal should be reported as
/// a successful sign-in or a user cancellation.
///
/// The rule is: a new, non-nil session id that differs from the one we
/// captured before presentation = success; anything else = cancel.
public enum ClerkAuthSessionLogic {
  public static func isSuccessfulAuth(initialSessionId: String?, currentSessionId: String?) -> Bool {
    guard let currentSessionId else { return false }
    return currentSessionId != initialSessionId
  }
}

/// Decides whether the modal-presentation retry loop in
/// `ClerkAuthNativeView.presentWhenReady` should attempt another present or
/// bail out. Three conditions must hold to proceed: the view must still be
/// mounted, no auth VC is already up, and we haven't blown past the attempt
/// cap.
public enum ClerkPresentationLogic {
  public static let maxPresentationAttempts = 30

  public static func shouldProceedWithPresentation(
    isInvalidated: Bool,
    hasPresentedAuthVC: Bool,
    attempts: Int
  ) -> Bool {
    return !isInvalidated && !hasPresentedAuthVC && attempts < maxPresentationAttempts
  }
}
