package expo.modules.clerk

import android.content.Context
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.clerk.api.Clerk
import com.clerk.ui.userprofile.custom.LocalUserProfileCustomNavigator
import com.clerk.ui.userprofile.custom.UserProfileCustomNavigator
import com.clerk.ui.userprofile.custom.UserProfileCustomRow
import com.clerk.ui.userbutton.UserButton
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher

class ClerkUserButtonNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  var customPagesJson: String = "[]"
  private val customPageViews = mutableListOf<View>()
  private var customNavigator: UserProfileCustomNavigator? = null
  private val onCustomPageEvent by EventDispatcher()

  init {
    activity?.let { Clerk.attachActivity(it) }
  }

  @Composable
  override fun Content() {
    Box(
      modifier = Modifier.fillMaxSize(),
      contentAlignment = Alignment.Center,
    ) {
      UserButton(
        clerkTheme = Clerk.customTheme,
        customRows = customRows(),
        customDestination =
          if (customPageViews.isEmpty()) null
          else { routeKey -> CustomPageDestination(routeKey) },
      )
    }
  }

  fun addCustomPageView(view: View, index: Int) {
    (view.parent as? ViewGroup)?.removeView(view)
    customPageViews.add(index.coerceIn(0, customPageViews.size), view)
    setupView()
  }

  fun removeCustomPageView(view: View) {
    customPageViews.remove(view)
    (view.parent as? ViewGroup)?.removeView(view)
    setupView()
  }

  fun customPageViewAt(index: Int): View? = customPageViews.getOrNull(index)

  fun customPageCount(): Int = customPageViews.size

  fun navigateCustomPage(action: String, routeKey: String?) {
    when (action) {
      "back" -> customNavigator?.navigateBack()
      "popToRoot" -> customNavigator?.popToRoot()
      "push" -> routeKey?.let { customNavigator?.push(it) }
    }
  }

  @Composable
  private fun CustomPageDestination(routeKey: String) {
    customNavigator = LocalUserProfileCustomNavigator.current
    val rows = customRows()
    val view = customPageViews.getOrNull(rows.indexOfFirst { it.routeKey == routeKey }) ?: return

    LaunchedEffect(routeKey) {
      layoutAndroidViewHandler(view)
      sendCustomPageEvent("presented", routeKey)
    }
    DisposableEffect(routeKey) {
      onDispose { sendCustomPageEvent("dismissed", routeKey) }
    }

    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = {
        (view.parent as? ViewGroup)?.removeView(view)
        view
      },
    )
  }

  private fun customRows(): List<UserProfileCustomRow> =
    runCatching { parseUserProfileCustomPages(customPagesJson, customPageViews.size) }.getOrDefault(emptyList())

  private fun sendCustomPageEvent(type: String, path: String) {
    onCustomPageEvent(mapOf("type" to type, "path" to path))
  }
}

class ClerkUserButtonViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkUserButtonView")

    View(ClerkUserButtonNativeView::class) {
      Events("onCustomPageEvent")

      GroupView<ClerkUserButtonNativeView> {
        AddChildView<View> { parent, child, index -> parent.addCustomPageView(child, index) }
        GetChildCount { parent -> parent.customPageCount() }
        GetChildViewAt<View> { parent, index -> parent.customPageViewAt(index) }
        RemoveChildView<View> { parent, child -> parent.removeCustomPageView(child) }
        RemoveChildViewAt { parent, index -> parent.customPageViewAt(index)?.let(parent::removeCustomPageView) }
      }

      Prop("customPages") { view: ClerkUserButtonNativeView, customPages: String ->
        view.customPagesJson = customPages
      }

      AsyncFunction("navigateCustomPage") {
        view: ClerkUserButtonNativeView,
        action: String,
        routeKey: String? -> view.navigateCustomPage(action, routeKey)
      }

      OnViewDidUpdateProps { view: ClerkUserButtonNativeView ->
        view.setupView()
      }
    }
  }
}
