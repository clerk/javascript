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
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher

private const val TAG = "ClerkAuthViewModule"

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

class ClerkAuthNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  var isDismissible: Boolean = true
  var mode: String? = null

  private val onAuthEvent by EventDispatcher()

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
          onDismiss = ::sendDismissEvent,
          onAuthComplete = {
            sendDismissEvent()
          },
        )
      }
    }
  }

  private fun sendEvent(type: String) {
    onAuthEvent(mapOf("type" to type))
  }

  private fun sendDismissEvent() {
    if (dismissalEventSent) return
    dismissalEventSent = true
    sendEvent("dismissed")
  }
}

class ClerkAuthViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkAuthView")

    View(ClerkAuthNativeView::class) {
      Events("onAuthEvent")

      Prop("mode") { view: ClerkAuthNativeView, mode: String? ->
        // clerk-android AuthView does not currently expose a public mode parameter.
        // Keep this prop as an intentional no-op for cross-platform API parity.
        view.mode = mode
      }

      Prop("isDismissible") { view: ClerkAuthNativeView, isDismissible: Boolean ->
        // clerk-android does not expose the iOS-parity isDismissible API yet.
        // Accept the prop for cross-platform RN API shape, and pass it through
        // once the native SDK owns this behavior.
        view.isDismissible = isDismissible
      }

      OnViewDidUpdateProps { view: ClerkAuthNativeView ->
        view.setupView()
      }

    }
  }
}
