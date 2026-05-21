// ClerkExpoModuleTests
//
// Tests pure-logic pieces of ClerkExpoModule.swift via the helpers extracted
// into `ClerkPresentationLogic` (in ClerkAuthLogic.swift). Production code
// calls those same helpers, so failures here mean the real
// `ClerkAuthNativeView.presentWhenReady` guard is wrong.
//
// The surface that genuinely can't be unit-tested (RCTEventEmitter, UIWindow,
// UIViewController presentation, transition coordinators) is exercised by
// Maestro flows in the quickstart instead.

import XCTest
@testable import ClerkExpo

final class ClerkExpoModuleTests: XCTestCase {

    // MARK: - presentWhenReady guard
    //
    // The real implementation in ClerkExpoModule.swift now reads:
    //
    //   guard ClerkPresentationLogic.shouldProceedWithPresentation(
    //     isInvalidated: isInvalidated,
    //     hasPresentedAuthVC: presentedAuthVC != nil,
    //     attempts: attempts
    //   ) else { return }
    //
    // Tests below cover the four ways that predicate can resolve.

    func testPresentWhenReadyProceedsOnFirstAttempt() {
        XCTAssertTrue(
            ClerkPresentationLogic.shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: 0),
            "First attempt on a clean view must proceed"
        )
    }

    func testPresentWhenReadyBailsWhenInvalidated() {
        XCTAssertFalse(
            ClerkPresentationLogic.shouldProceedWithPresentation(isInvalidated: true, hasPresentedAuthVC: false, attempts: 0),
            "An invalidated (removed-from-superview) view must bail out"
        )
    }

    func testPresentWhenReadyBailsWhenAlreadyPresented() {
        XCTAssertFalse(
            ClerkPresentationLogic.shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: true, attempts: 0),
            "Must not present twice if an auth VC is already on-screen"
        )
    }

    func testPresentWhenReadyBailsAtAttemptCap() {
        // The cap lives on the production type; the test reads it from there
        // so a future bump doesn't silently break this assertion.
        let cap = ClerkPresentationLogic.maxPresentationAttempts
        XCTAssertFalse(
            ClerkPresentationLogic.shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: cap),
            "Must bail once the attempt cap is reached"
        )
        XCTAssertTrue(
            ClerkPresentationLogic.shouldProceedWithPresentation(isInvalidated: false, hasPresentedAuthVC: false, attempts: cap - 1),
            "One attempt below the cap must still proceed"
        )
    }
}
