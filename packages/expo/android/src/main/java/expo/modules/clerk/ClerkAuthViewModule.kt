package expo.modules.clerk

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import com.clerk.api.Clerk
import com.clerk.api.ui.ClerkDesign
import com.clerk.api.ui.ClerkTheme
import com.clerk.ui.auth.AuthMode
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
  var logoMaxHeight: Float? = null
  var mode: String? = null
  var logoView: View? = null
    private set

  private var logoWidth = 0
  private var logoHeight = 0
  private val logoLayoutListener =
    View.OnLayoutChangeListener { view, left, top, right, bottom, _, _, _, _ ->
      val width = right - left
      val height = bottom - top
      if (view === logoView && (width != logoWidth || height != logoHeight)) {
        logoWidth = width
        logoHeight = height
        setupView()
      }
    }

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
    debugLog(TAG, "setupView - mode: $mode, isDismissible: $isDismissible, activity: $activity")

    AuthView(
      modifier = Modifier.fillMaxSize(),
      clerkTheme = authTheme(),
      logo = logoView?.let { view ->
        { ReactLogoView(view = view, width = logoWidth, height = logoHeight) }
      },
      mode = authMode(mode),
      isDismissible = isDismissible,
      onDismiss = ::sendDismissEvent,
      onAuthComplete = {
        sendDismissEvent()
      },
    )
  }

  fun setLogoView(view: View) {
    if (logoView === view) return
    logoView?.removeOnLayoutChangeListener(logoLayoutListener)
    logoView = view
    logoWidth = view.width
    logoHeight = view.height
    view.addOnLayoutChangeListener(logoLayoutListener)
    setupView()
  }

  fun removeLogoView(view: View) {
    if (logoView !== view) return
    view.removeOnLayoutChangeListener(logoLayoutListener)
    logoView = null
    logoWidth = 0
    logoHeight = 0
    setupView()
  }

  private fun authTheme(): ClerkTheme? {
    val maxHeight = logoMaxHeight ?: return Clerk.customTheme
    val theme = Clerk.customTheme ?: ClerkTheme()
    val design = theme.design ?: ClerkDesign()
    return theme.copy(design = design.copy(logoMaxHeight = maxHeight.dp))
  }

  private fun sendEvent(type: String) {
    onAuthEvent(mapOf("type" to type))
  }

  private fun sendDismissEvent() {
    if (dismissalEventSent) return
    dismissalEventSent = true
    sendEvent("dismissed")
  }

  private fun authMode(mode: String?): AuthMode = when (mode) {
    "signIn" -> AuthMode.SignIn
    "signUp" -> AuthMode.SignUp
    else -> AuthMode.SignInOrUp
  }
}

@Composable
private fun ReactLogoView(view: View, width: Int, height: Int) {
  val density = LocalDensity.current
  val modifier =
    if (width > 0 && height > 0) {
      with(density) { Modifier.size(width.toDp(), height.toDp()) }
    } else {
      Modifier.wrapContentSize()
    }

  AndroidView(
    modifier = modifier,
    factory = {
      (view.parent as? ViewGroup)?.removeView(view)
      view
    },
  )
}

class ClerkAuthViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkAuthView")

    View(ClerkAuthNativeView::class) {
      Events("onAuthEvent")

      GroupView<ClerkAuthNativeView> {
        AddChildView<View> { parent, child, _ ->
          parent.setLogoView(child)
        }
        GetChildCount { parent ->
          if (parent.logoView == null) 0 else 1
        }
        GetChildViewAt<View> { parent, index ->
          if (index == 0) parent.logoView else null
        }
        RemoveChildView<View> { parent, child ->
          parent.removeLogoView(child)
        }
        RemoveChildViewAt { parent, index ->
          if (index == 0) {
            parent.logoView?.let(parent::removeLogoView)
          }
        }
      }

      Prop("mode") { view: ClerkAuthNativeView, mode: String? ->
        view.mode = mode
      }

      Prop("isDismissible") { view: ClerkAuthNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      Prop("logoMaxHeight") { view: ClerkAuthNativeView, logoMaxHeight: Float? ->
        view.logoMaxHeight = logoMaxHeight
      }

      OnViewDidUpdateProps { view: ClerkAuthNativeView ->
        view.setupView()
      }

    }
  }
}
