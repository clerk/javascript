// ClerkViewFactoryTests
//
// Exercises the session-id comparison used by
// `ClerkAuthWrapperViewController.viewDidDisappear` in ClerkViewFactory.swift.
//
// The UIKit / ClerkKit side of viewDidDisappear is not unit-testable without
// a host app (Maestro covers it). The success-vs-cancel decision IS testable
// — it's a pure comparison that lives in `ClerkAuthSessionLogic` in the pod
// source files, so both the production call site (ClerkViewFactory.swift)
// and this test target call the same function.

import XCTest
@testable import ClerkExpo

final class ClerkViewFactoryTests: XCTestCase {

    // MARK: - viewDidDisappear session-id logic

    /// Session id went from nil (signed out) to a non-nil value (signed in).
    /// This is the normal "user just completed sign-in" path and MUST be
    /// treated as a success, not a cancel.
    func testSessionIdNilToNonNilIsSuccess() {
        XCTAssertTrue(
            ClerkAuthSessionLogic.isSuccessfulAuth(initialSessionId: nil, currentSessionId: "sess_new"),
            "nil -> non-nil must be treated as successful auth"
        )
    }

    /// Session id stayed nil. The user opened the modal, dismissed it, and
    /// never signed in. This must be treated as a cancel.
    func testSessionIdNilToNilIsCancel() {
        XCTAssertFalse(
            ClerkAuthSessionLogic.isSuccessfulAuth(initialSessionId: nil, currentSessionId: nil),
            "nil -> nil must be treated as cancellation"
        )
    }

    /// Session id stayed the same non-nil value. The user was already signed
    /// in, opened the modal (perhaps to view something), and dismissed without
    /// switching accounts. This must be treated as a cancel — firing a
    /// "signInCompleted" event here would double-fire for no real state change.
    func testSessionIdUnchangedIsCancel() {
        XCTAssertFalse(
            ClerkAuthSessionLogic.isSuccessfulAuth(initialSessionId: "sess_same", currentSessionId: "sess_same"),
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
            ClerkAuthSessionLogic.isSuccessfulAuth(initialSessionId: "sess_stale", currentSessionId: "sess_new"),
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
        let newLogicDetects = ClerkAuthSessionLogic.isSuccessfulAuth(initialSessionId: initial, currentSessionId: current)
        XCTAssertTrue(newLogicDetects, "New inequality logic catches stale -> new")
    }
}
