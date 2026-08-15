@testable import ClerkExpo
import SwiftUI
import XCTest

final class ClerkUserProfileCustomPageStateTests: XCTestCase {
  @MainActor
  func testNavigationPathCanBeRestoredIntoANewLiveHost() {
    let state = ClerkUserProfileCustomPageState()
    let navigationPath = makeNavigationPath("billing")

    state.navigationPathDidChange(navigationPath)

    XCTAssertEqual(state.navigationPathForRestoration().count, 1)
  }

  @MainActor
  func testKeepingTheSameNavigationDepthDoesNotDismissThePage() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }

    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.navigationDepthDidChange(1)

    XCTAssertEqual(events, ["presented:billing"])
  }

  @MainActor
  func testIncreasingTheNavigationDepthDoesNotDismissThePage() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }

    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.navigationDepthDidChange(2)

    XCTAssertEqual(events, ["presented:billing"])
  }

  @MainActor
  func testDecreasingTheNavigationDepthDismissesThePageOnce() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }

    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.navigationDepthDidChange(0)
    state.navigationDepthDidChange(0)

    XCTAssertEqual(events, ["presented:billing", "dismissed:billing"])
  }

  @MainActor
  func testInitialUserObservationKeepsTheRetainedPath() {
    let state = ClerkUserProfileCustomPageState()
    state.navigationPathDidChange(makeNavigationPath("billing"))

    state.userDidChange(to: "user_1")

    XCTAssertEqual(state.navigationPathForRestoration().count, 1)
  }

  @MainActor
  func testUserIdentityChangeInvalidatesNavigationAndDismissesThePageOnce() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.userDidChange(to: "user_1")
    state.navigationPathDidChange(makeNavigationPath("billing"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)

    state.userDidChange(to: nil)
    state.userDidChange(to: nil)

    XCTAssertEqual(state.navigationPathForRestoration().count, 0)
    XCTAssertEqual(events, ["presented:billing", "dismissed:billing"])
  }

  @MainActor
  func testKeepingTheSameUserPreservesNavigation() {
    let state = ClerkUserProfileCustomPageState()
    state.userDidChange(to: "user_1")
    state.navigationPathDidChange(makeNavigationPath("billing"))

    state.userDidChange(to: "user_1")

    XCTAssertEqual(state.navigationPathForRestoration().count, 1)
  }

  @MainActor
  func testRemovingThePresentedCustomPageInvalidatesNavigation() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.navigationPathDidChange(makeNavigationPath("billing"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)

    state.reconcileCustomPagePaths(["preferences"])

    XCTAssertEqual(state.navigationPathForRestoration().count, 0)
    XCTAssertEqual(events, ["presented:billing", "dismissed:billing"])
  }

  @MainActor
  func testRemovingAnEarlierCustomPageInvalidatesTheRetainedStack() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.navigationPathDidChange(makeNavigationPath("billing", "preferences"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.pageDidPresent(path: "preferences", navigationDepth: 2)

    state.reconcileCustomPagePaths(["preferences"])

    XCTAssertEqual(state.navigationPathForRestoration().count, 0)
    XCTAssertEqual(
      events,
      ["presented:billing", "presented:preferences", "dismissed:preferences"]
    )
  }

  @MainActor
  func testPoppedCustomPagesAreNotIncludedInLaterReconciliation() {
    let state = ClerkUserProfileCustomPageState()
    state.navigationPathDidChange(makeNavigationPath("billing", "preferences"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.pageDidPresent(path: "preferences", navigationDepth: 2)

    state.navigationPathDidChange(makeNavigationPath("billing"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.reconcileCustomPagePaths(["billing"])

    XCTAssertEqual(state.navigationPathForRestoration().count, 1)
  }

  @MainActor
  func testKeepingThePresentedCustomPagePreservesNavigation() {
    let state = ClerkUserProfileCustomPageState()
    state.navigationPathDidChange(makeNavigationPath("billing"))
    state.pageDidPresent(path: "billing", navigationDepth: 1)

    state.reconcileCustomPagePaths(["billing", "preferences"])

    XCTAssertEqual(state.navigationPathForRestoration().count, 1)
  }

  func testCustomPageLabelComesFromTheMatchingRow() {
    let rows = parseUserProfileCustomPages(
      """
      [{"path":"billing","label":"Billing details","icon":"billing","placement":{"type":"sectionEnd","section":"profile"}}]
      """,
      pageCount: 1
    )

    XCTAssertEqual(userProfileCustomPageLabel(for: "billing", rows: rows), "Billing details")
  }

  private func makeNavigationPath(_ routes: String...) -> NavigationPath {
    var navigationPath = NavigationPath()
    for route in routes {
      navigationPath.append(route)
    }
    return navigationPath
  }
}
