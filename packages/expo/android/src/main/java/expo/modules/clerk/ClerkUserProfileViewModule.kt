@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.runtime.Composable
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import com.clerk.api.Clerk
import com.clerk.api.FrameworkIntegrationApi
import com.clerk.ui.navigation.ClerkHostBackActionProvider
import com.clerk.ui.userprofile.UserProfileView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher

private const val TAG = "ClerkUserProfileViewModule"

private fun debugLog(tag: String, message: String) {
  if (clerkExpoDebugEnabled()) {
    Log.d(tag, message)
  }
}

class ClerkUserProfileNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  // clerk-android UserProfileView dismissibility is controlled by its onDismiss callback.
  var isDismissible: Boolean = true
  var hostBackButton: Boolean = false
  private val onProfileEvent by EventDispatcher()
  private val onHostBack by EventDispatcher()

  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  override fun localViewModelStoreOwner(): ViewModelStoreOwner = viewModelStoreOwner

  override fun onHostDetachedFromWindow() {
    viewModelStoreOwner.viewModelStore.clear()
  }

  @Composable
  override fun Content() {
    debugLog(TAG, "setupView - isDismissible: $isDismissible, hostBackButton: $hostBackButton")

    if (hostBackButton) {
      ClerkHostBackActionProvider(onHostBack = { onHostBack(mapOf()) }) { ProfileView() }
    } else {
      ProfileView()
    }
  }

  @Composable
  private fun ProfileView() {
    UserProfileView(
      clerkTheme = Clerk.customTheme,
      isDismissible = isDismissible,
      onDismiss = {
        debugLog(TAG, "Profile dismissed")
        sendEvent("dismissed")
      },
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
      Events("onProfileEvent", "onHostBack")

      Prop("isDismissible") { view: ClerkUserProfileNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      Prop("hostBackButton") { view: ClerkUserProfileNativeView, hostBackButton: Boolean ->
        view.hostBackButton = hostBackButton
      }

      OnViewDidUpdateProps { view: ClerkUserProfileNativeView ->
        view.setupView()
      }
    }
  }
}
