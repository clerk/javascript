package expo.modules.clerk

import android.content.Context
import android.content.ContextWrapper
import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Recomposer
import androidx.compose.ui.platform.AndroidUiDispatcher
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.lifecycle.viewmodel.compose.LocalViewModelStoreOwner
import androidx.savedstate.compose.LocalSavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

abstract class ClerkComposeNativeViewHost(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  protected val activity: ComponentActivity? = findActivity(context)

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
    onHostDetachedFromWindow()
    super.onDetachedFromWindow()
  }

  fun setupView() {
    composeView.setContent {
      val viewModelStoreOwner = localViewModelStoreOwner()

      if (activity != null && viewModelStoreOwner != null) {
        CompositionLocalProvider(
          LocalViewModelStoreOwner provides viewModelStoreOwner,
          LocalLifecycleOwner provides activity,
          LocalSavedStateRegistryOwner provides activity,
        ) {
          Content()
        }
      } else {
        Content()
      }
    }
  }

  protected open fun localViewModelStoreOwner(): ViewModelStoreOwner? = activity

  protected open fun onHostDetachedFromWindow() {}

  @Composable
  protected abstract fun Content()

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
