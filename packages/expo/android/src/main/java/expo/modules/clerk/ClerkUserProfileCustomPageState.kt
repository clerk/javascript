package expo.modules.clerk

import android.os.Handler
import android.os.Looper

private fun postToMainThread(action: () -> Unit) {
  Handler(Looper.getMainLooper()).post { action() }
}

internal class ClerkUserProfileCustomPageState(
  private val resetCoveredPathsWhenInactive: Boolean = false,
  private val postInactiveReset: ((() -> Unit) -> Unit) = ::postToMainThread,
  private val pageEventHandler: (type: String, path: String) -> Unit,
) {
  private val retainedPaths = mutableListOf<String>()
  private var navigateBackAction: (() -> Unit)? = null
  private var popToRootAction: (() -> Unit)? = null
  private var pushAction: ((String) -> Unit)? = null
  private var hasObservedUserId = false
  private var observedUserId: String? = null
  private var navigationTransitionGeneration = 0

  fun configureNavigation(
    navigateBack: () -> Unit,
    popToRoot: () -> Unit,
    push: (String) -> Unit,
  ) {
    navigateBackAction = navigateBack
    popToRootAction = popToRoot
    pushAction = push
  }

  fun pageDidPresent(path: String) {
    cancelPendingInactiveReset()
    if (path !in retainedPaths) {
      retainedPaths.add(path)
    }
    pageEventHandler("presented", path)
  }

  fun pageDidDismiss(path: String) {
    val pathIndex = retainedPaths.lastIndexOf(path)
    if (pathIndex == -1) return

    // Navigation 3 disposes a destination when another page covers it. Keep that
    // earlier path until it is actually removed from the native back stack.
    if (pathIndex == retainedPaths.lastIndex) {
      retainedPaths.removeAt(pathIndex)
      if (resetCoveredPathsWhenInactive) {
        scheduleInactiveReset()
      }
    }
    pageEventHandler("dismissed", path)
  }

  fun userDidChange(userId: String?) {
    if (!hasObservedUserId) {
      observedUserId = userId
      hasObservedUserId = true
      return
    }

    if (observedUserId == userId) return
    observedUserId = userId
    invalidateNavigation()
  }

  fun reconcileCustomPagePaths(validPaths: Set<String>) {
    if (retainedPaths.all(validPaths::contains)) return
    invalidateNavigation()
  }

  fun navigate(action: String, routeKey: String?) {
    when (action) {
      "back" -> navigateBackAction?.invoke()
      "popToRoot" -> invalidateNavigation()
      "push" -> {
        val path = routeKey ?: return
        val push = pushAction ?: return
        if (path in retainedPaths) return
        retainedPaths.add(path)
        push(path)
      }
    }
  }

  internal fun retainedPathsForTesting(): List<String> = retainedPaths.toList()

  private fun invalidateNavigation() {
    cancelPendingInactiveReset()
    if (retainedPaths.isEmpty()) return

    val dismissedPaths = retainedPaths.asReversed().distinct()
    retainedPaths.clear()
    popToRootAction?.invoke()
    dismissedPaths.forEach { pageEventHandler("dismissed", it) }
  }

  private fun scheduleInactiveReset() {
    val generation = ++navigationTransitionGeneration
    postInactiveReset {
      if (generation == navigationTransitionGeneration) {
        resetInactivePaths()
      }
    }
  }

  private fun cancelPendingInactiveReset() {
    navigationTransitionGeneration += 1
  }

  private fun resetInactivePaths() {
    navigateBackAction = null
    popToRootAction = null
    pushAction = null
    val dismissedPaths = retainedPaths.asReversed().toList()
    retainedPaths.clear()
    dismissedPaths.forEach { pageEventHandler("dismissed", it) }
  }
}
