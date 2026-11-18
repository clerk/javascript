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
  func testUserIdentityChangeInvalidatesTheEntireUserButtonStack() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.userDidChange(to: "user_1")
    state.pageDidPresent(path: "billing")
    state.navigate(action: "push", routeKey: "preferences")
    state.pageDidDismiss(path: "billing")
    state.pageDidPresent(path: "preferences")
    events.removeAll()

    state.userDidChange(to: "user_2")
    state.userDidChange(to: "user_2")

    XCTAssertEqual(events, ["dismissed:preferences", "dismissed:billing"])
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
      ["presented:billing", "presented:preferences", "dismissed:preferences", "dismissed:billing"]
    )
  }

  @MainActor
  func testRemovingAnEarlierUserButtonPageInvalidatesTheRetainedStack() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.pageDidPresent(path: "billing")
    state.navigate(action: "push", routeKey: "preferences")
    state.pageDidDismiss(path: "billing")
    state.pageDidPresent(path: "preferences")
    events.removeAll()

    state.reconcileCustomPagePaths(["preferences"])

    XCTAssertEqual(events, ["dismissed:preferences", "dismissed:billing"])
  }

  @MainActor
  func testClosingUserButtonProfileDismissesCoveredPages() {
    var pendingResets: [ClerkUserProfileCustomPageState.InactiveResetAction] = []
    let state = ClerkUserProfileCustomPageState { pendingResets.append($0) }
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.pageDidPresent(path: "billing")
    state.navigate(action: "push", routeKey: "preferences")
    state.pageDidDismiss(path: "billing")
    state.pageDidPresent(path: "preferences")
    events.removeAll()

    state.pageDidDismiss(path: "preferences")
    XCTAssertEqual(pendingResets.count, 1)
    pendingResets.removeFirst()()

    XCTAssertEqual(events, ["dismissed:preferences", "dismissed:billing"])
  }

  @MainActor
  func testReturningToCoveredUserButtonPageKeepsItRetained() {
    var pendingResets: [ClerkUserProfileCustomPageState.InactiveResetAction] = []
    let state = ClerkUserProfileCustomPageState { pendingResets.append($0) }
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.pageDidPresent(path: "billing")
    state.navigate(action: "push", routeKey: "preferences")
    state.pageDidDismiss(path: "billing")
    state.pageDidPresent(path: "preferences")
    events.removeAll()

    state.pageDidDismiss(path: "preferences")
    state.pageDidPresent(path: "billing")
    XCTAssertEqual(pendingResets.count, 1)
    pendingResets.removeFirst()()
    state.reconcileCustomPagePaths(["billing"])

    XCTAssertEqual(events, ["dismissed:preferences", "presented:billing"])
  }

  @MainActor
  func testPushingAUserButtonPathAlreadyInTheStackDoesNotCollapseLaterPaths() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.pageDidPresent(path: "billing")
    state.navigate(action: "push", routeKey: "preferences")
    state.pageDidDismiss(path: "billing")
    state.pageDidPresent(path: "preferences")
    events.removeAll()

    state.navigate(action: "push", routeKey: "billing")
    state.reconcileCustomPagePaths(["billing", "preferences"])

    XCTAssertEqual(events, [])
  }

  @MainActor
  func testPoppingMultipleCustomPagesDismissesEachRetainedPage() {
    let state = ClerkUserProfileCustomPageState()
    var events: [String] = []
    state.setPageEventHandler { type, path in
      events.append("\(type):\(path)")
    }
    state.pageDidPresent(path: "billing", navigationDepth: 1)
    state.pageDidPresent(path: "preferences", navigationDepth: 2)

    state.navigationDepthDidChange(0)

    XCTAssertEqual(
      events,
      ["presented:billing", "presented:preferences", "dismissed:preferences", "dismissed:billing"]
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

  func testPushOnlyDestinationsKeepTheirTitleWithoutCreatingRows() {
    let pages = parseUserProfileCustomPages(
      """
      [
        {"path":"billing","label":"Billing","icon":"billing","placement":{"type":"sectionEnd","section":"profile"}},
        {"path":"invoice-details","label":"Invoice details","icon":"settings","placement":{"type":"sectionEnd","section":"profile"},"showAsRow":false}
      ]
      """,
      pageCount: 2
    )

    XCTAssertEqual(pages.filter(\.shouldShowAsRow).map(\.path), ["billing"])
    XCTAssertEqual(userProfileCustomPageLabel(for: "invoice-details", rows: pages), "Invoice details")
  }

  private func makeNavigationPath(_ routes: String...) -> NavigationPath {
    var navigationPath = NavigationPath()
    for route in routes {
      navigationPath.append(route)
    }
    return navigationPath
  }
}
