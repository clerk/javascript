// ClerkExpoModuleTests
//
// Tests for pure-logic pieces of ClerkExpoModule.swift.
//
// A lot of this module is inherently UIKit / React Native Bridge territory
// (RCTEventEmitter subclassing, DispatchQueue.main dispatch, UIWindowScene
// traversal, UIViewController presentation, transitionCoordinator animation
// hooks). That surface area can't be meaningfully unit-tested — it needs a
// running app with a real React Native bridge and a real view hierarchy.
// Those paths are covered by Maestro flows in the quickstart.
//
// What IS testable without UIKit:
//   1. The event payload shape emitted by `emitAuthStateChange` — a
//      `[String: Any]` dictionary with a "type" string and a "sessionId"
//      that may be String or NSNull (Any).
//   2. The guard predicate used inside `presentWhenReady(_:attempts:)` — a
//      pure boolean that decides when to give up looking for a top view
//      controller.
//
// The tests below exercise shape-compatible mirrors of those two concerns.
// Where a piece of the fix can only be validated end-to-end, there's a
// commented-out block explaining why.

import XCTest

final class ClerkExpoModuleTests: XCTestCase {

    // MARK: - emitAuthStateChange payload shape
    //
    // The real implementation in ClerkExpoModule.swift is:
    //
    //   static func emitAuthStateChange(type: String, sessionId: String?) {
    //     guard _hasListeners, let instance = sharedInstance else { return }
    //     instance.sendEvent(withName: "onAuthStateChange", body: [
    //       "type": type,
    //       "sessionId": sessionId as Any,
    //     ])
    //   }
    //
    // We can't instantiate RCTEventEmitter outside a React Native bridge, but
    // we can verify the body-dictionary layout the JS side will receive.

    /// Mirrors the body-dictionary construction in `emitAuthStateChange`.
    private func makeAuthStateChangeBody(type: String, sessionId: String?) -> [String: Any] {
        return [
            "type": type,
            "sessionId": sessionId as Any,
        ]
    }

    func testAuthStateChangeBodyContainsTypeAndSessionId() {
        let body = makeAuthStateChangeBody(type: "signedIn", sessionId: "sess_123")

        XCTAssertEqual(body["type"] as? String, "signedIn")
        XCTAssertEqual(body["sessionId"] as? String, "sess_123")
        XCTAssertEqual(body.keys.count, 2, "payload should have exactly 'type' and 'sessionId' keys")
    }

    func testAuthStateChangeBodyAllowsNilSessionIdViaAnyCast() {
        // `sessionId as Any` preserves the nil across the Obj-C bridge as
        // NSNull, which is what JS will see as `null`. We verify the optional
        // is preserved (not force-unwrapped or coerced to "").
        let body = makeAuthStateChangeBody(type: "signedOut", sessionId: nil)

        XCTAssertEqual(body["type"] as? String, "signedOut")
        // When sessionId is nil, the value under the key is an Optional<String>.none
        // cast to Any. We should NOT be able to cast it to a non-empty String.
        XCTAssertNil(body["sessionId"] as? String,
                     "nil sessionId must not surface as a non-nil String")
    }

    func testAuthStateChangeSupportsKnownEventTypes() {
        // The two event types the module currently emits, per the comments
        // in ClerkAuthNativeView.sendAuthEvent and ClerkUserProfileNativeView.
        let signedIn = makeAuthStateChangeBody(type: "signedIn", sessionId: "sess_1")
        let signedOut = makeAuthStateChangeBody(type: "signedOut", sessionId: "sess_1")

        XCTAssertEqual(signedIn["type"] as? String, "signedIn")
        XCTAssertEqual(signedOut["type"] as? String, "signedOut")
    }

    // MARK: - presentWhenReady guard
    //
    // The real implementation in ClerkExpoModule.swift is:
    //
    //   private func presentWhenReady(_ authVC: UIViewController, attempts: Int) {
    //     guard !isInvalidated, presentedAuthVC == nil, attempts < 30 else { return }
    //     ...
    //   }
    //
    // The UIViewController / transitionCoordinator portions can't be unit
    // tested, but the guard predicate is pure-data and IS testable: it
    // decides whether to bail out early based on three flags/values.

    /// Mirrors the `guard` predicate at the top of `presentWhenReady`.
    /// Returns `true` when the function should proceed (attempt presentation),
    /// and `false` when it should bail out and return immediately.
    private func shouldProceedWithPresentation(
        isInvalidated: Bool,
        hasPresentedAuthVC: Bool,
        attempts: Int
    ) -> Bool {
        return !isInvalidated && !hasPresentedAuthVC && attempts < 30
    }

    func testPresentWhenReadyProceedsOnFirstAttempt() {
        XCTAssertTrue(
            shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: 0),
            "First attempt on a clean view must proceed"
        )
    }

    func testPresentWhenReadyBailsWhenInvalidated() {
        XCTAssertFalse(
            shouldProceedWithPresentation(isInvalidated: true, hasPresentedAuthVC: false, attempts: 0),
            "An invalidated (removed-from-superview) view must bail out"
        )
    }

    func testPresentWhenReadyBailsWhenAlreadyPresented() {
        XCTAssertFalse(
            shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: true, attempts: 0),
            "Must not present twice if an auth VC is already on-screen"
        )
    }

    func testPresentWhenReadyBailsAtAttemptCap() {
        // 30 is the hard cap in the source; attempts == 30 must bail.
        XCTAssertFalse(
            shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: 30),
            "Must bail once the 30-attempt cap is reached"
        )
        XCTAssertTrue(
            shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: 29),
            "One attempt below the cap must still proceed"
        )
    }

    // MARK: - Not unit-testable (covered by Maestro)
    //
    // The following pieces of `presentWhenReady` and related modal logic
    // require a running UIKit app and cannot be expressed as XCTest cases
    // without spinning up a host application target:
    //
    //   - UIApplication.shared.connectedScenes lookup in `topViewController()`
    //   - `rootVC.transitionCoordinator?.animate(alongsideTransition:...)`
    //     waiting for an in-flight dismissal before presenting
    //   - `DispatchQueue.main.async` re-entry when no coordinator is attached
    //   - `rootVC.present(authVC, animated: false)` actually showing the modal
    //   - `ClerkAuthNativeView.didMoveToWindow` / `removeFromSuperview`
    //     mount/unmount behavior
    //
    // Those are exercised by the Maestro flows in the quickstart (auth modal
    // present/dismiss/re-present under various session transitions). A
    // representative XCTest for those would look roughly like the pseudo-
    // code below — intentionally commented out because it cannot run without
    // a host app:
    //
    // /*
    // func testPresentWhenReadyWaitsForTransitionCoordinator() {
    //     let window = UIWindow()                       // needs UIApplication
    //     let rootVC = UIViewController()
    //     window.rootViewController = rootVC
    //     window.makeKeyAndVisible()                    // needs scene
    //
    //     let presented = UIViewController()
    //     rootVC.present(presented, animated: true)     // needs run loop
    //     // ... assert that a subsequent presentWhenReady call defers
    //     //     until the coordinator's completion fires.
    // }
    // */
}
