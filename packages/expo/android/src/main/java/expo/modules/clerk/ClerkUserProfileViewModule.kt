package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.clerk.api.Clerk
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
  private val onProfileEvent by EventDispatcher()

  @Composable
  override fun Content() {
    debugLog(TAG, "setupView - isDismissible: $isDismissible")

    MaterialTheme {
      Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
      ) {
        UserProfileView(
          clerkTheme = Clerk.customTheme,
          onDismiss = {
            debugLog(TAG, "Profile dismissed")
            sendEvent("dismissed")
          }
        )
      }
    }
  }

  private fun sendEvent(type: String) {
    onProfileEvent(mapOf("type" to type))
  }
}

class ClerkUserProfileViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkUserProfileView")

    View(ClerkUserProfileNativeView::class) {
      Events("onProfileEvent")

      Prop("isDismissible") { view: ClerkUserProfileNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      OnViewDidUpdateProps { view: ClerkUserProfileNativeView ->
        view.setupView()
      }
    }
  }
}
