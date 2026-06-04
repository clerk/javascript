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
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter

private const val TAG = "ClerkUserProfileExpoView"

class ClerkUserProfileNativeView(context: Context) : ClerkComposeNativeViewHost(context) {
  var isDismissible: Boolean = true

  @Composable
  override fun Content() {
    Log.d(TAG, "setupView - isDismissible: $isDismissible")

    MaterialTheme {
      Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
      ) {
        UserProfileView(
          clerkTheme = Clerk.customTheme,
          onDismiss = {
            Log.d(TAG, "Profile dismissed")
            sendEvent("dismissed")
          }
        )
      }
    }
  }

  private fun sendEvent(type: String) {
    val reactContext = context as? ReactContext ?: return
    val eventData = Arguments.createMap().apply {
      putString("type", type)
    }
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onProfileEvent", eventData)
  }
}
