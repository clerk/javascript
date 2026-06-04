package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ClerkAuthViewManagerInterface

private const val TAG = "ClerkAuthExpoView"

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

class ClerkAuthNativeView(context: Context) : ClerkComposeNativeViewHost(context) {
  var isDismissible: Boolean = true

  init {
    // At cold start, ClerkExpoModule.configure() may run before React's
    // host-resume sync, so this view's construction is a reliable second hook.
    activity?.let { Clerk.attachActivity(it) }
  }

  // Per-view ViewModelStoreOwner so the AuthView's ViewModels (including its
  // navigation state) are scoped to THIS view instance, not the activity.
  // Without this, the AuthView's navigation persists across mount/unmount
  // cycles within the same activity, leaving the user stuck on whatever screen
  // (e.g. "Get help") was last navigated to before sign-out.
  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  private var dismissalEventSent: Boolean = false

  override fun localViewModelStoreOwner(): ViewModelStoreOwner = viewModelStoreOwner

  override fun onHostDetachedFromWindow() {
    // Clear our per-view ViewModelStore so any AuthView ViewModels are GC'd.
    viewModelStoreOwner.viewModelStore.clear()
  }

  @Composable
  override fun Content() {
    debugLog(TAG, "setupView - isDismissible: $isDismissible, activity: $activity")

    MaterialTheme {
      Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
      ) {
        AuthView(
          modifier = Modifier.fillMaxSize(),
          clerkTheme = Clerk.customTheme,
          onAuthComplete = {
            if (isDismissible) {
              sendDismissEvent()
            }
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
      .receiveEvent(id, "onAuthEvent", eventData)
  }

  private fun sendDismissEvent() {
    if (dismissalEventSent) return
    dismissalEventSent = true
    sendEvent("dismissed")
  }
}

class ClerkAuthViewManager : SimpleViewManager<ClerkAuthNativeView>(),
    ClerkAuthViewManagerInterface<ClerkAuthNativeView> {

  override fun getName(): String = "ClerkAuthView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkAuthNativeView {
    return ClerkAuthNativeView(reactContext)
  }

  @ReactProp(name = "mode")
  override fun setMode(view: ClerkAuthNativeView, mode: String?) {
    // clerk-android AuthView does not currently expose a public mode parameter.
    // Keep this generated prop setter as an intentional no-op for cross-platform API parity.
  }

  @ReactProp(name = "isDismissible")
  override fun setIsDismissible(view: ClerkAuthNativeView, isDismissible: Boolean) {
    view.isDismissible = isDismissible
    view.setupView()
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onAuthEvent", MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onAuthEvent")
      ))
      .build() as MutableMap<String, Any>
  }
}
