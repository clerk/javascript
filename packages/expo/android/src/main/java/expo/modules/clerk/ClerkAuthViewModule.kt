package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.SheetValue
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
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
  var presentation: String = "inline"

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
    // Reset so a detached-then-reattached view can emit dismissed again.
    dismissalEventSent = false
  }

  @Composable
  @OptIn(ExperimentalMaterial3Api::class)
  override fun Content() {
    debugLog(
      TAG,
      "setupView - mode: $mode, presentation: $presentation, isDismissible: $isDismissible, activity: $activity",
    )

    if (presentation != "bottomSheet") {
      ClerkAuthView()
      return
    }

    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = false)
    ModalBottomSheet(
      onDismissRequest = ::sendDismissEvent,
      sheetState = sheetState,
      containerColor = clerkBackgroundColor(),
      dragHandle = { SheetDragHandle() },
    ) {
      BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val density = LocalDensity.current
        val sheetOffsetPx =
          runCatching { sheetState.requireOffset() }
            .getOrDefault(with(density) { maxHeight.toPx() })
        val sheetOffset = with(density) { sheetOffsetPx.toDp() }
        val authHeight = (maxHeight - sheetOffset).coerceAtLeast(0.dp)

        if (sheetState.currentValue != SheetValue.Hidden) {
          Box(modifier = Modifier.fillMaxWidth().height(authHeight)) {
            ClerkAuthView(showDismissAction = false)
          }
        }
      }
    }
  }

  @Composable
  private fun ClerkAuthView(showDismissAction: Boolean = isDismissible) {
    AuthView(
      modifier = Modifier.fillMaxSize(),
      clerkTheme = authTheme(),
      mode = authMode(mode),
      isDismissible = showDismissAction,
      onDismiss = ::sendDismissEvent,
      onAuthComplete = {
        sendDismissEvent()
      },
    )
  }

  @Composable
  @OptIn(ExperimentalMaterial3Api::class)
  private fun SheetDragHandle() {
    Box(modifier = Modifier.fillMaxWidth().height(48.dp)) {
      BottomSheetDefaults.DragHandle(modifier = Modifier.align(Alignment.Center))
      if (isDismissible) {
        IconButton(
          onClick = ::sendDismissEvent,
          modifier =
            Modifier.align(Alignment.CenterEnd)
              .padding(end = 12.dp)
              .semantics { contentDescription = "Close" },
        ) {
          val color = clerkForegroundColor()
          Canvas(modifier = Modifier.size(24.dp)) {
            val inset = 4.dp.toPx()
            val strokeWidth = 2.dp.toPx()
            drawLine(
              color = color,
              start = Offset(inset, inset),
              end = Offset(size.width - inset, size.height - inset),
              strokeWidth = strokeWidth,
              cap = StrokeCap.Round,
            )
            drawLine(
              color = color,
              start = Offset(size.width - inset, inset),
              end = Offset(inset, size.height - inset),
              strokeWidth = strokeWidth,
              cap = StrokeCap.Round,
            )
          }
        }
      }
    }
  }

  @Composable
  private fun clerkBackgroundColor(): Color {
    val isDarkMode = isSystemInDarkTheme()
    val customTheme = Clerk.customTheme
    val modeColors = if (isDarkMode) customTheme?.darkColors else customTheme?.lightColors

    return modeColors?.background
      ?: customTheme?.colors?.background
      ?: if (isDarkMode) Color(0xFF131316) else Color.White
  }

  @Composable
  private fun clerkForegroundColor(): Color {
    val isDarkMode = isSystemInDarkTheme()
    val customTheme = Clerk.customTheme
    val modeColors = if (isDarkMode) customTheme?.darkColors else customTheme?.lightColors

    return modeColors?.foreground
      ?: customTheme?.colors?.foreground
      ?: if (isDarkMode) Color.White else Color.Black
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

class ClerkAuthViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkAuthView")

    View(ClerkAuthNativeView::class) {
      Events("onAuthEvent")

      Prop("mode") { view: ClerkAuthNativeView, mode: String? ->
        view.mode = mode
      }

      Prop("isDismissible") { view: ClerkAuthNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      Prop("logoMaxHeight") { view: ClerkAuthNativeView, logoMaxHeight: Float? ->
        view.logoMaxHeight = logoMaxHeight
      }

      Prop("presentation") { view: ClerkAuthNativeView, presentation: String? ->
        view.presentation = presentation ?: "inline"
      }

      OnViewDidUpdateProps { view: ClerkAuthNativeView ->
        view.setupView()
      }

    }
  }
}
