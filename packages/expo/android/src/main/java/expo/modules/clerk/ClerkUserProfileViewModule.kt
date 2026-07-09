package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.snapshotFlow
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import com.clerk.api.Clerk
import com.clerk.ui.navigation.ClerkHostedNavigation
import com.clerk.ui.userprofile.UserProfileView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher

private const val TAG = "ClerkUserProfileViewModule"

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

class ClerkUserProfileNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  // clerk-android UserProfileView dismissibility is controlled by its onDismiss callback.
  var isDismissible: Boolean = true
  var hideHeader: Boolean = false
  private val onProfileEvent by EventDispatcher()
  private val onNavigationChange by EventDispatcher()
  private val hostedNavigation = ClerkHostedNavigation()

  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  override fun localViewModelStoreOwner(): ViewModelStoreOwner = viewModelStoreOwner

  override fun onHostDetachedFromWindow() {
    viewModelStoreOwner.viewModelStore.clear()
  }

  fun goBack() {
    hostedNavigation.pop()
  }

  fun popToRoot() {
    hostedNavigation.popToRoot()
  }

  @Composable
  override fun Content() {
    debugLog(TAG, "setupView - isDismissible: $isDismissible, hideHeader: $hideHeader")

    val hosted = if (hideHeader) hostedNavigation else null
    if (hosted != null) {
      LaunchedEffect(hosted) {
        snapshotFlow { hosted.depth }.collect { depth ->
          onNavigationChange(mapOf("depth" to depth, "canGoBack" to (depth > 0)))
        }
      }
    }

    UserProfileView(
      clerkTheme = Clerk.customTheme,
      isDismissible = isDismissible,
      onDismiss = {
        debugLog(TAG, "Profile dismissed")
        sendEvent("dismissed")
      },
      hostedNavigation = hosted,
    )
  }

  private fun sendEvent(type: String) {
    onProfileEvent(mapOf("type" to type))
  }
}

class ClerkUserProfileViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkUserProfileView")

    View(ClerkUserProfileNativeView::class) {
      Events("onProfileEvent", "onNavigationChange")

      Prop("isDismissible") { view: ClerkUserProfileNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      Prop("hideHeader") { view: ClerkUserProfileNativeView, hideHeader: Boolean ->
        view.hideHeader = hideHeader
      }

      AsyncFunction("goBack") { view: ClerkUserProfileNativeView ->
        view.goBack()
      }

      AsyncFunction("popToRoot") { view: ClerkUserProfileNativeView ->
        view.popToRoot()
      }

      OnViewDidUpdateProps { view: ClerkUserProfileNativeView ->
        view.setupView()
      }
    }
  }
}
