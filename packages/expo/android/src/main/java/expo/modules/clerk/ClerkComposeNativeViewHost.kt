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
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

abstract class ClerkComposeNativeViewHost(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  protected val activity: ComponentActivity? = findActivity(context)

  private var recomposer: Recomposer? = null
  private var recomposerJob: Job? = null

  private val composeView = ComposeView(context).also { view ->
    activity?.let { act ->
      view.setViewTreeLifecycleOwner(act)
      view.setViewTreeViewModelStoreOwner(act)
      view.setViewTreeSavedStateRegistryOwner(act)
    }
    addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  init {
    // Fabric measures before window attach; without a parent composition context, ComposeView.onMeasure throws.
    startRecomposer()
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    setupView()
  }

  override fun onDetachedFromWindow() {
    composeView.disposeComposition()
    recomposer?.cancel()
    recomposerJob?.cancel()
    recomposer = null
    recomposerJob = null
    onHostDetachedFromWindow()
    super.onDetachedFromWindow()
  }

  private fun startRecomposer() {
    if (activity == null || recomposerJob?.isActive == true) return

    // Navigation can detach and later reattach the same host, so a reattached ComposeView needs a fresh recomposer.
    val recomposerContext = AndroidUiDispatcher.Main
    val newRecomposer = Recomposer(recomposerContext)
    recomposer = newRecomposer
    composeView.setParentCompositionContext(newRecomposer)
    recomposerJob = CoroutineScope(recomposerContext).launch {
      newRecomposer.runRecomposeAndApplyChanges()
    }
  }

  fun setupView() {
    startRecomposer()
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
