package expo.modules.clerk

import android.content.Context
import android.util.Log
import android.widget.FrameLayout
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
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
import com.clerk.api.network.model.client.Client
import com.clerk.ui.userbutton.UserButton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

private const val USER_BUTTON_TAG = "ClerkUserButtonExpoView"

class ClerkUserButtonNativeView(context: Context) : FrameLayout(context) {
  private val activity = ClerkAuthNativeView.findActivity(context).also {
    if (it != null) Clerk.attachActivity(it)
  }

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

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    setupView()
  }

  override fun onDetachedFromWindow() {
    recomposer?.cancel()
    recomposerJob?.cancel()
    super.onDetachedFromWindow()
  }

  private fun setupView() {
    composeView.setContent {
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()
      var hadSession by remember { mutableStateOf(Clerk.session != null) }

      LaunchedEffect(session) {
        if (hadSession && session == null) {
          try {
            Client.getSkippingClientId()
          } catch (e: Exception) {
            Log.w(USER_BUTTON_TAG, "Client refresh after UserButton sign-out failed: ${e.message}")
          }
          ClerkExpoModule.emitAuthStateChange("signedOut", null)
        }
        if (session != null) {
          hadSession = true
        }
      }

      val userButtonContent: @Composable () -> Unit = {
        MaterialTheme {
          Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center,
          ) {
            UserButton(clerkTheme = Clerk.customTheme)
          }
        }
      }

      if (activity != null) {
        // Compose content embedded in React Native needs Activity owners supplied explicitly.
        CompositionLocalProvider(
          LocalViewModelStoreOwner provides activity,
          LocalLifecycleOwner provides activity,
          LocalSavedStateRegistryOwner provides activity,
        ) {
          userButtonContent()
        }
      } else {
        userButtonContent()
      }
    }
  }
}
