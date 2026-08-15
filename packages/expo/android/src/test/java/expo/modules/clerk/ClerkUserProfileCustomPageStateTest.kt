package expo.modules.clerk

import org.junit.Assert.assertEquals
import org.junit.Test

class ClerkUserProfileCustomPageStateTest {
  @Test
  fun coveredPageRemainsRetainedUntilItIsActuallyPopped() {
    val events = mutableListOf<String>()
    val pushedPaths = mutableListOf<String>()
    val state = state(events, push = pushedPaths::add)

    state.pageDidPresent("billing")
    state.navigate("push", "invoice-details")
    state.pageDidDismiss("billing")
    state.pageDidPresent("invoice-details")

    assertEquals(listOf("billing", "invoice-details"), state.retainedPathsForTesting())
    assertEquals(listOf("invoice-details"), pushedPaths)
    assertEquals(
      listOf("presented:billing", "dismissed:billing", "presented:invoice-details"),
      events,
    )

    state.pageDidDismiss("invoice-details")
    state.pageDidPresent("billing")

    assertEquals(listOf("billing"), state.retainedPathsForTesting())
  }

  @Test
  fun popToRootDismissesEveryRetainedPageDeepestFirst() {
    val events = mutableListOf<String>()
    var popToRootCount = 0
    val state = state(events, popToRoot = { popToRootCount += 1 })
    state.pageDidPresent("billing")
    state.navigate("push", "invoice-details")
    state.pageDidDismiss("billing")
    state.pageDidPresent("invoice-details")
    events.clear()

    state.navigate("popToRoot", null)

    assertEquals(emptyList<String>(), state.retainedPathsForTesting())
    assertEquals(1, popToRootCount)
    assertEquals(listOf("dismissed:invoice-details", "dismissed:billing"), events)
  }

  @Test
  fun removingAnEarlierRouteInvalidatesTheWholeStack() {
    val events = mutableListOf<String>()
    var popToRootCount = 0
    val state = state(events, popToRoot = { popToRootCount += 1 })
    state.pageDidPresent("billing")
    state.navigate("push", "invoice-details")
    state.pageDidDismiss("billing")
    state.pageDidPresent("invoice-details")
    events.clear()

    state.reconcileCustomPagePaths(setOf("invoice-details"))

    assertEquals(emptyList<String>(), state.retainedPathsForTesting())
    assertEquals(1, popToRootCount)
    assertEquals(listOf("dismissed:invoice-details", "dismissed:billing"), events)
  }

  @Test
  fun changingUsersInvalidatesRetainedNavigationOnce() {
    val events = mutableListOf<String>()
    var popToRootCount = 0
    val state = state(events, popToRoot = { popToRootCount += 1 })
    state.userDidChange("user_1")
    state.pageDidPresent("billing")
    events.clear()

    state.userDidChange(null)
    state.userDidChange(null)

    assertEquals(emptyList<String>(), state.retainedPathsForTesting())
    assertEquals(1, popToRootCount)
    assertEquals(listOf("dismissed:billing"), events)
  }

  private fun state(
    events: MutableList<String>,
    popToRoot: () -> Unit = {},
    push: (String) -> Unit = {},
  ): ClerkUserProfileCustomPageState {
    return ClerkUserProfileCustomPageState { type, path -> events.add("$type:$path") }.also {
      it.configureNavigation(navigateBack = {}, popToRoot = popToRoot, push = push)
    }
  }
}
