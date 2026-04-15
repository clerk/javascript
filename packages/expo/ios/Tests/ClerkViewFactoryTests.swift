// ClerkViewFactoryTests
//
// Tests for the session-id comparison logic used by
// ClerkAuthWrapperViewController.viewDidDisappear in ClerkViewFactory.swift.
//
// The core of the fix is deciding — when the auth modal disappears — whether
// the disappearance is a *successful sign-in* (a new session exists) or a
// *user cancel* (no session, or the same session as before).
//
// The original code in ClerkViewFactory.swift reads:
//
//   override func viewDidDisappear(_ animated: Bool) {
//     super.viewDidDisappear(animated)
//     if isBeingDismissed {
//       if let session = Clerk.shared.session, session.id != initialSessionId {
//         completeOnce(.success(["sessionId": session.id, "type": "signIn"]))
//       } else {
//         completeOnce(.success(["cancelled": true]))
//       }
//     }
//   }
//
// The UIKit / ClerkKit side of that method is not unit-testable without a
// running app (that part is covered by Maestro flows). What IS testable is
// the comparison that decides success-vs-cancel. We extract that comparison
// into a small pure helper and exercise the four meaningful transitions.

import XCTest

/// Pure-logic mirror of the comparison used in
/// `ClerkAuthWrapperViewController.viewDidDisappear`.
///
/// Returns `true` when the disappearance should be treated as a successful
/// auth (a new, different session is present). Returns `false` when it
/// should be treated as a cancellation.
///
/// The real code is:
///   `if let session = Clerk.shared.session, session.id != initialSessionId { success } else { cancel }`
///
/// This helper encodes the same rule so we can test the four cases below
/// without needing the Clerk SDK or UIKit.
fileprivate func isSuccessfulAuth(initialSessionId: String?, currentSessionId: String?) -> Bool {
    guard let current = currentSessionId else { return false }
    return current != initialSessionId
}

final class ClerkViewFactoryTests: XCTestCase {

    // MARK: - viewDidDisappear session-id logic

    /// Session id went from nil (signed out) to a non-nil value (signed in).
    /// This is the normal "user just completed sign-in" path and MUST be
    /// treated as a success, not a cancel.
    func testSessionIdNilToNonNilIsSuccess() {
        XCTAssertTrue(
            isSuccessfulAuth(initialSessionId: nil, currentSessionId: "sess_new"),
            "nil -> non-nil must be treated as successful auth"
        )
    }

    /// Session id stayed nil. The user opened the modal, dismissed it, and
    /// never signed in. This must be treated as a cancel.
    func testSessionIdNilToNilIsCancel() {
        XCTAssertFalse(
            isSuccessfulAuth(initialSessionId: nil, currentSessionId: nil),
            "nil -> nil must be treated as cancellation"
        )
    }

    /// Session id stayed the same non-nil value. The user was already signed
    /// in, opened the modal (perhaps to view something), and dismissed without
    /// switching accounts. This must be treated as a cancel — firing a
    /// "signInCompleted" event here would double-fire for no real state change.
    func testSessionIdUnchangedIsCancel() {
        XCTAssertFalse(
            isSuccessfulAuth(initialSessionId: "sess_same", currentSessionId: "sess_same"),
            "same session id on both sides must be treated as cancellation"
        )
    }

    /// Session id changed from one non-nil value to another. This is the
    /// regression case that originally motivated the fix (same one the Kotlin
    /// `ClerkAuthExpoViewTest` covers): the view captured a stale session id,
    /// then the user signed into a different account. Inequality (not
    /// nil-vs-non-nil) is what catches this.
    func testSessionIdChangedBetweenTwoNonNilValuesIsSuccess() {
        XCTAssertTrue(
            isSuccessfulAuth(initialSessionId: "sess_stale", currentSessionId: "sess_new"),
            "stale -> new must be treated as successful auth"
        )
    }

    // MARK: - Regression: nil-check vs inequality-check

    /// Explicitly contrasts the old "initialSessionId == nil" check with the
    /// new "currentSessionId != initialSessionId" check, to document why the
    /// fix is correct.
    func testInequalityCheckCatchesCasesNilCheckMisses() {
        let initial: String? = "sess_stale"
        let current: String? = "sess_new"

        // Old (buggy) logic: only treat as success if there was NO previous session.
        let oldLogicDetects = (initial == nil) && (current != nil)
        XCTAssertFalse(oldLogicDetects, "Old nil-only logic misses stale -> new")

        // New (correct) logic: treat as success whenever the id changed to a
        // non-nil value.
        let newLogicDetects = isSuccessfulAuth(initialSessionId: initial, currentSessionId: current)
        XCTAssertTrue(newLogicDetects, "New inequality logic catches stale -> new")
    }
}
