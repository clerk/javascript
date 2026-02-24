package expo.modules.clerk

import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.savedstate.compose.LocalSavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import com.clerk.api.Clerk
import com.clerk.ui.userprofile.UserProfileView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

private const val TAG = "ClerkUserProfileExpoView"

class ClerkUserProfileNativeView(context: Context) : FrameLayout(context) {
  var isDismissable: Boolean = true

  private val activity = ClerkAuthNativeView.findActivity(context)

  private var recomposer: Recomposer? = null
  private var recomposerJob: kotlinx.coroutines.Job? = null

  private val composeView = ComposeView(context).also { view ->
    activity?.let { act ->
      view.setViewTreeLifecycleOwner(act)
      view.setViewTreeViewModelStoreOwner(act)
      view.setViewTreeSavedStateRegistryOwner(act)

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
    super.onDetachedFromWindow()
  }

  fun setupView() {
    Log.d(TAG, "setupView - isDismissable: $isDismissable")

    composeView.setContent {
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

      var hadSession by remember { mutableStateOf(Clerk.session != null) }

      LaunchedEffect(session) {
        if (hadSession && session == null) {
          Log.d(TAG, "Sign-out detected")
          sendEvent("signedOut", emptyMap())
        }
        if (session != null) {
          hadSession = true
        }
      }

      val content = @androidx.compose.runtime.Composable {
        MaterialTheme {
          Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
          ) {
            UserProfileView(
              clerkTheme = Clerk.customTheme,
              onDismiss = {
                Log.d(TAG, "Profile dismissed")
                sendEvent("dismissed", emptyMap())
              }
            )
          }
        }
      }

      if (activity != null) {
        CompositionLocalProvider(
          LocalViewModelStoreOwner provides activity,
          LocalLifecycleOwner provides activity,
          LocalSavedStateRegistryOwner provides activity,
        ) {
          content()
        }
      } else {
        content()
      }
    }
  }

  private fun sendEvent(type: String, data: Map<String, Any?>) {
    val reactContext = context as? ReactContext ?: return
    val eventData = Arguments.createMap().apply {
      putString("type", type)
      val jsonString = try {
        org.json.JSONObject(data).toString()
      } catch (e: Exception) {
        "{}"
      }
      putString("data", jsonString)
    }
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onProfileEvent", eventData)
  }
}
