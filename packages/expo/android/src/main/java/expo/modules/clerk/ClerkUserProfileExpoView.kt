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
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ClerkUserProfileViewManagerInterface

private const val TAG = "ClerkUserProfileExpoView"

class ClerkUserProfileNativeView(context: Context) : ClerkComposeNativeViewHost(context) {
  // clerk-android UserProfileView dismissibility is controlled by its onDismiss callback.
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

class ClerkUserProfileViewManager : SimpleViewManager<ClerkUserProfileNativeView>(),
    ClerkUserProfileViewManagerInterface<ClerkUserProfileNativeView> {

  override fun getName(): String = "ClerkUserProfileView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkUserProfileNativeView {
    return ClerkUserProfileNativeView(reactContext)
  }

  @ReactProp(name = "isDismissible")
  override fun setIsDismissible(view: ClerkUserProfileNativeView, isDismissible: Boolean) {
    view.isDismissible = isDismissible
    view.setupView()
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onProfileEvent", MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onProfileEvent")
      ))
      .build() as MutableMap<String, Any>
  }
}
