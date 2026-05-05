package expo.modules.clerk

import android.content.Context
import android.content.ContextWrapper
import android.util.Log
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.savedstate.compose.LocalSavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

private const val TAG = "ClerkAuthExpoView"

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

class ClerkAuthNativeView(context: Context) : FrameLayout(context) {
  var mode: String = "signInOrUp"
  var isDismissable: Boolean = true

  private val activity: ComponentActivity? = findActivity(context)

  // Per-view ViewModelStoreOwner so the AuthView's ViewModels (including its
  // navigation state) are scoped to THIS view instance, not the activity.
  // Without this, the AuthView's navigation persists across mount/unmount
  // cycles within the same activity, leaving the user stuck on whatever screen
  // (e.g. "Get help") was last navigated to before sign-out.
  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  private var recomposer: Recomposer? = null
  private var recomposerJob: kotlinx.coroutines.Job? = null

  private val composeView = ComposeView(context).also { view ->
    activity?.let { act ->
      view.setViewTreeLifecycleOwner(act)
      view.setViewTreeViewModelStoreOwner(act)
      view.setViewTreeSavedStateRegistryOwner(act)

      // Create an explicit Recomposer to bypass windowRecomposer resolution.
      // In Compose 1.7+, windowRecomposer looks at rootView which may not have
      // lifecycle owners in React Native Fabric's detached view trees.
      val recomposerContext = AndroidUiDispatcher.Main
      val newRecomposer = Recomposer(recomposerContext)
      recomposer = newRecomposer
      view.setParentCompositionContext(newRecomposer)
      val scope = CoroutineScope(recomposerContext + kotlinx.coroutines.SupervisorJob())
      recomposerJob = scope.coroutineContext[kotlinx.coroutines.Job]
      scope.launch {
        newRecomposer.runRecomposeAndApplyChanges()
      }
    }
    addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  override fun onDetachedFromWindow() {
    recomposer?.cancel()
    recomposerJob?.cancel()
    // Clear our per-view ViewModelStore so any AuthView ViewModels are GC'd.
    viewModelStoreOwner.viewModelStore.clear()
    super.onDetachedFromWindow()
  }

  // Track the initial session to detect new sign-ins. Captured at construction
  // time, but may capture a stale session if the view is mounted before signOut
  // has finished clearing local state — so the LaunchedEffect below uses
  // session id inequality (not null-to-value) to detect new sign-ins.
  private var initialSessionId: String? = Clerk.session?.id
  private var authCompletedSent: Boolean = false

  fun setupView() {
    debugLog(TAG, "setupView - mode: $mode, isDismissable: $isDismissable, activity: $activity")

    composeView.setContent {
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

      // Detect auth completion: any session that's different from the one we
      // started with (captures fresh sign-ins, sign-in-after-sign-out, etc.)
      LaunchedEffect(session) {
        val currentSession = session
        val currentId = currentSession?.id
        if (currentSession != null && currentId != initialSessionId && !authCompletedSent) {
          debugLog(TAG, "Auth completed - new session: $currentId (initial: $initialSessionId)")
          authCompletedSent = true
          sendEvent("signInCompleted", mapOf(
            "sessionId" to currentSession.id,
            "type" to "signIn"
          ))
        }
      }

      // Provide the Activity as ViewModelStoreOwner so Clerk's viewModel() calls work
      val content = @androidx.compose.runtime.Composable {
        MaterialTheme {
          Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
          ) {
            AuthView(
              modifier = Modifier.fillMaxSize(),
              clerkTheme = Clerk.customTheme
            )
          }
        }
      }

      if (activity != null) {
        CompositionLocalProvider(
          // Per-view ViewModelStore so AuthView's navigation state doesn't
          // leak between mounts within the same MainActivity lifetime.
          LocalViewModelStoreOwner provides viewModelStoreOwner,
          LocalLifecycleOwner provides activity,
          LocalSavedStateRegistryOwner provides activity,
        ) {
          content()
        }
      } else {
        Log.e(TAG, "No ComponentActivity found!")
        content()
      }
    }
  }

  private fun sendEvent(type: String, data: Map<String, Any?>) {
    val reactContext = context as? ReactContext ?: return
    val eventData = Arguments.createMap().apply {
      putString("type", type)
      // Serialize data as JSON string for codegen event
      val jsonString = try {
        org.json.JSONObject(data).toString()
      } catch (e: Exception) {
        "{}"
      }
      putString("data", jsonString)
    }
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onAuthEvent", eventData)
  }

  companion object {
    fun findActivity(context: Context): ComponentActivity? {
      var ctx: Context? = context
      while (ctx != null) {
        if (ctx is ComponentActivity) return ctx
        ctx = (ctx as? ContextWrapper)?.baseContext
      }
      return null
    }
  }
}
