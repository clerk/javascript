package expo.modules.clerk

import android.content.Context
import android.content.ContextWrapper
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
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
import com.clerk.ui.auth.AuthView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

private const val TAG = "ClerkAuthExpoView"

class ClerkAuthExpoView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onAuthEvent by EventDispatcher()

  var mode: String = "signInOrUp"
  var isDismissable: Boolean = true

  private val activity: ComponentActivity? = findActivity(context)

  private val composeView = ComposeView(context).also { view ->
    // Set view tree owners on the ComposeView so the windowRecomposer can be resolved
    // before the view is measured. React Native's view hierarchy doesn't set these up.
    activity?.let {
      view.setViewTreeLifecycleOwner(it)
      view.setViewTreeViewModelStoreOwner(it)
      view.setViewTreeSavedStateRegistryOwner(it)
    }
    addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  // Track the initial session to detect new sign-ins
  private var initialSessionId: String? = Clerk.session?.id

  fun setupView() {
    Log.d(TAG, "setupView - mode: $mode, isDismissable: $isDismissable, activity: $activity")

    composeView.setContent {
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

      // Detect auth completion: session appeared when there wasn't one
      LaunchedEffect(session) {
        val currentSession = session
        if (currentSession != null && initialSessionId == null) {
          Log.d(TAG, "Auth completed - session: ${currentSession.id}")
          onAuthEvent(mapOf(
            "type" to "signInCompleted",
            "data" to mapOf(
              "sessionId" to currentSession.id,
              "type" to "signIn"
            )
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
              clerkTheme = null
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
        Log.e(TAG, "No ComponentActivity found!")
        content()
      }
    }
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
