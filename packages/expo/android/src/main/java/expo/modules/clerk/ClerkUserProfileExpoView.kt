package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
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
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

private const val TAG = "ClerkUserProfileExpoView"

class ClerkUserProfileExpoView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onProfileEvent by EventDispatcher()

  var isDismissable: Boolean = true

  private val activity = ClerkAuthExpoView.findActivity(context)

  private val composeView = ComposeView(context).also { view ->
    activity?.let { act ->
      view.setViewTreeLifecycleOwner(act)
      view.setViewTreeViewModelStoreOwner(act)
      view.setViewTreeSavedStateRegistryOwner(act)

      val recomposerContext = AndroidUiDispatcher.Main
      val recomposer = Recomposer(recomposerContext)
      view.setParentCompositionContext(recomposer)
      CoroutineScope(recomposerContext).launch {
        recomposer.runRecomposeAndApplyChanges()
      }
    }
    addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun setupView() {
    Log.d(TAG, "setupView - isDismissable: $isDismissable")

    composeView.setContent {
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

      var hadSession by remember { mutableStateOf(Clerk.session != null) }

      LaunchedEffect(session) {
        if (hadSession && session == null) {
          Log.d(TAG, "Sign-out detected")
          onProfileEvent(mapOf(
            "type" to "signedOut",
            "data" to emptyMap<String, Any>()
          ))
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
                onProfileEvent(mapOf(
                  "type" to "dismissed",
                  "data" to emptyMap<String, Any>()
                ))
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
}
