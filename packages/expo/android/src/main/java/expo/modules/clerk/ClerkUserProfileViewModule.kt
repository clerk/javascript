@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import com.clerk.api.Clerk
import com.clerk.api.FrameworkIntegrationApi
import com.clerk.ui.R
import com.clerk.ui.navigation.ClerkHostBackActionProvider
import com.clerk.ui.userprofile.UserProfileView
import com.clerk.ui.userprofile.custom.LocalUserProfileCustomNavigator
import com.clerk.ui.userprofile.custom.UserProfileCustomRow
import com.clerk.ui.userprofile.custom.UserProfileCustomRowPlacement
import com.clerk.ui.userprofile.custom.UserProfileRow
import com.clerk.ui.userprofile.custom.UserProfileRowIcon
import com.clerk.ui.userprofile.custom.UserProfileSection
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.viewevent.EventDispatcher
import org.json.JSONArray
import org.json.JSONObject

private const val TAG = "ClerkUserProfileViewModule"

private fun matchParentLayoutParams() =
  FrameLayout.LayoutParams(
    ViewGroup.LayoutParams.MATCH_PARENT,
    ViewGroup.LayoutParams.MATCH_PARENT,
  )

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

internal fun parseUserProfileCustomPages(customPagesJson: String, customPageCount: Int): List<UserProfileCustomRow> {
  val pages = JSONArray(customPagesJson)
  return buildList {
    for (index in 0 until minOf(pages.length(), customPageCount)) {
      val page = pages.getJSONObject(index)
      add(
        UserProfileCustomRow(
          routeKey = page.getString("path"),
          title = page.getString("label"),
          icon = UserProfileRowIcon.Resource(userProfileCustomRowIcon(page.optString("icon"))),
          placement = userProfileCustomRowPlacement(page.optJSONObject("placement")),
        ),
      )
    }
  }
}

private fun userProfileCustomRowIcon(icon: String): Int =
  when (icon) {
    "user" -> R.drawable.ic_user
    "profile" -> R.drawable.ic_profile
    "security" -> R.drawable.ic_security
    "billing" -> R.drawable.ic_credit_card
    "key" -> R.drawable.ic_key
    "lock" -> R.drawable.ic_lock
    "email" -> R.drawable.ic_email
    "phone" -> R.drawable.ic_phone
    "add" -> R.drawable.ic_plus
    "switch" -> R.drawable.ic_switch
    "users" -> R.drawable.ic_users
    "warning" -> R.drawable.ic_warning
    "info" -> R.drawable.ic_information_circle
    "globe" -> R.drawable.ic_globe
    "folder" -> R.drawable.ic_folder
    "book" -> R.drawable.ic_folder
    else -> R.drawable.ic_cog
  }

private fun userProfileCustomRowPlacement(placement: JSONObject?): UserProfileCustomRowPlacement {
  val type = placement?.optString("type")
  return when (type) {
    "sectionStart" -> UserProfileCustomRowPlacement.SectionStart(userProfileSection(placement.optString("section")))
    "before" -> UserProfileCustomRowPlacement.Before(userProfileRow(placement.optString("row")))
    "after" -> UserProfileCustomRowPlacement.After(userProfileRow(placement.optString("row")))
    else -> UserProfileCustomRowPlacement.SectionEnd(userProfileSection(placement?.optString("section")))
  }
}

private fun userProfileSection(section: String?): UserProfileSection =
  if (section == "account") UserProfileSection.Account else UserProfileSection.Profile

private fun userProfileRow(row: String): UserProfileRow =
  when (row) {
    "security" -> UserProfileRow.Security
    "switchAccount" -> UserProfileRow.SwitchAccount
    "addAccount" -> UserProfileRow.AddAccount
    "signOut" -> UserProfileRow.SignOut
    else -> UserProfileRow.ManageAccount
  }

class ClerkUserProfileNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  // clerk-android UserProfileView dismissibility is controlled by its onDismiss callback.
  var isDismissible: Boolean = true
  var hostBackButton: Boolean = false
  var customPagesJson: String = "[]"
  private val customPageViews = mutableListOf<View>()
  private var customNavigator: com.clerk.ui.userprofile.custom.UserProfileCustomNavigator? = null
  private val onProfileEvent by EventDispatcher()
  private val onCustomPageEvent by EventDispatcher()
  private val onHostBack by EventDispatcher()

  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  override fun localViewModelStoreOwner(): ViewModelStoreOwner = viewModelStoreOwner

  override fun onHostDetachedFromWindow() {
    viewModelStoreOwner.viewModelStore.clear()
  }

  @Composable
  override fun Content() {
    debugLog(TAG, "setupView - isDismissible: $isDismissible, hostBackButton: $hostBackButton")

    if (hostBackButton) {
      ClerkHostBackActionProvider(onHostBack = { onHostBack(mapOf()) }) { ProfileView() }
    } else {
      ProfileView()
    }
  }

  @Composable
  private fun ProfileView() {
    UserProfileView(
      clerkTheme = Clerk.customTheme,
      customRows = customRows(),
      customDestination =
        if (customPageViews.isEmpty()) null
        else { routeKey -> CustomPageDestination(routeKey) },
      isDismissible = isDismissible,
      onDismiss = {
        debugLog(TAG, "Profile dismissed")
        sendEvent("dismissed")
      },
    )
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

    LaunchedEffect(routeKey) { sendCustomPageEvent("presented", routeKey) }
    DisposableEffect(routeKey) {
      onDispose { sendCustomPageEvent("dismissed", routeKey) }
    }

    AndroidView(
      modifier = Modifier.fillMaxSize(),
      // Compose derives the interop MeasureSpec from the returned view's layout params.
      // React Native views never self-measure, so without MATCH_PARENT here the holder
      // collapses to zero and the rehosted subtree ends up with no layout bounds.
      factory = { context ->
        (view.parent as? ViewGroup)?.removeView(view)
        FrameLayout(context).apply {
          layoutParams = matchParentLayoutParams()
          addView(view, matchParentLayoutParams())
        }
      },
      update = { holder ->
        if (view.parent !== holder) {
          (view.parent as? ViewGroup)?.removeView(view)
          holder.addView(view, matchParentLayoutParams())
        }
      },
    )
  }

  private fun customRows(): List<UserProfileCustomRow> {
    return runCatching {
        parseUserProfileCustomPages(customPagesJson, customPageViews.size)
      }
      .getOrElse {
        debugLog(TAG, "Ignoring invalid custom rows: ${it.message}")
        emptyList()
      }
  }

  private fun sendEvent(type: String) {
    onProfileEvent(mapOf("type" to type))
  }

  private fun sendCustomPageEvent(type: String, path: String) {
    onCustomPageEvent(mapOf("type" to type, "path" to path))
  }
}

class ClerkUserProfileViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkUserProfileView")

    View(ClerkUserProfileNativeView::class) {
      Events("onProfileEvent", "onCustomPageEvent", "onHostBack")

      GroupView<ClerkUserProfileNativeView> {
        AddChildView<View> { parent, child, index -> parent.addCustomPageView(child, index) }
        GetChildCount { parent -> parent.customPageCount() }
        GetChildViewAt<View> { parent, index -> parent.customPageViewAt(index) }
        RemoveChildView<View> { parent, child -> parent.removeCustomPageView(child) }
        RemoveChildViewAt { parent, index -> parent.customPageViewAt(index)?.let(parent::removeCustomPageView) }
      }

      Prop("isDismissible") { view: ClerkUserProfileNativeView, isDismissible: Boolean ->
        view.isDismissible = isDismissible
      }

      Prop("hostBackButton") { view: ClerkUserProfileNativeView, hostBackButton: Boolean ->
        view.hostBackButton = hostBackButton
      }

      Prop("customPages") { view: ClerkUserProfileNativeView, customPages: String ->
        view.customPagesJson = customPages
      }

      AsyncFunction("navigateCustomPage") {
        view: ClerkUserProfileNativeView,
        action: String,
        routeKey: String? -> view.navigateCustomPage(action, routeKey)
      }

      OnViewDidUpdateProps { view: ClerkUserProfileNativeView ->
        view.setupView()
      }
    }
  }
}
