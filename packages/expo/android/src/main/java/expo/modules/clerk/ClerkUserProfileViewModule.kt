@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.compose.collectAsStateWithLifecycle
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

private fun debugLog(tag: String, message: String) {
  if (BuildConfig.DEBUG) {
    Log.d(tag, message)
  }
}

internal data class ClerkUserProfileCustomPageConfig(
  val routeKey: String,
  val title: String,
  val icon: Int,
  val placement: UserProfileCustomRowPlacement,
  val showAsRow: Boolean,
) {
  val nativeRow: UserProfileCustomRow
    get() =
      UserProfileCustomRow(
        routeKey = routeKey,
        title = title,
        icon = UserProfileRowIcon.Resource(icon),
        placement = placement,
      )
}

internal fun parseUserProfileCustomPages(
  customPagesJson: String,
  customPageCount: Int,
): List<ClerkUserProfileCustomPageConfig> {
  val pages = JSONArray(customPagesJson)
  return buildList {
    for (index in 0 until minOf(pages.length(), customPageCount)) {
      val page = pages.getJSONObject(index)
      add(
        ClerkUserProfileCustomPageConfig(
          routeKey = page.getString("path"),
          title = page.getString("label"),
          icon = userProfileCustomRowIcon(page.optString("icon")),
          placement = userProfileCustomRowPlacement(page.optJSONObject("placement")),
          showAsRow = page.optBoolean("showAsRow", true),
        ),
      )
    }
  }
}

internal fun userProfileCustomPagePaths(customPagesJson: String): Set<String> {
  val pages = JSONArray(customPagesJson)
  return buildSet {
    for (index in 0 until pages.length()) {
      add(pages.getJSONObject(index).getString("path"))
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

class ClerkUserProfileNativeView(context: Context, appContext: AppContext) :
  ClerkComposeNativeViewHost(context, appContext, retainCompositionOnDetach = true) {
  // clerk-android UserProfileView dismissibility is controlled by its onDismiss callback.
  var isDismissible: Boolean = true
  var hostBackButton: Boolean = false
  private var customPagesJson: String = "[]"
  private val customPageViews = mutableListOf<View>()
  private val onProfileEvent by EventDispatcher()
  private val onCustomPageEvent by EventDispatcher()
  private val onHostBack by EventDispatcher()
  private val customPageState =
    ClerkUserProfileCustomPageState { type, path ->
      onCustomPageEvent(mapOf("type" to type, "path" to path))
    }

  private val viewModelStoreOwner = object : ViewModelStoreOwner {
    private val store = ViewModelStore()
    override val viewModelStore: ViewModelStore = store
  }

  override fun localViewModelStoreOwner(): ViewModelStoreOwner = viewModelStoreOwner

  override fun onHostDestroyed() {
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
    val user by Clerk.userFlow.collectAsStateWithLifecycle()

    LaunchedEffect(user?.id) { customPageState.userDidChange(user?.id) }

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

  fun setCustomPages(customPages: String) {
    if (customPagesJson == customPages) return
    val validPaths = runCatching { userProfileCustomPagePaths(customPages) }.getOrDefault(emptySet())
    customPageState.reconcileCustomPagePaths(validPaths)
    customPagesJson = customPages
  }

  fun navigateCustomPage(action: String, routeKey: String?) {
    customPageState.navigate(action, routeKey)
  }

  @Composable
  private fun CustomPageDestination(routeKey: String) {
    val customNavigator = LocalUserProfileCustomNavigator.current
    val pages = customPages()
    val view = customPageViews.getOrNull(pages.indexOfFirst { it.routeKey == routeKey })

    LaunchedEffect(routeKey, customNavigator, view) {
      customPageState.configureNavigation(
        navigateBack = customNavigator::navigateBack,
        popToRoot = customNavigator::popToRoot,
        push = customNavigator::push,
      )
      if (view == null) {
        customNavigator.popToRoot()
        return@LaunchedEffect
      }
      layoutAndroidViewHandler(view)
      customPageState.pageDidPresent(routeKey)
    }

    if (view == null) return

    DisposableEffect(routeKey) {
      onDispose { customPageState.pageDidDismiss(routeKey) }
    }

    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = {
        (view.parent as? ViewGroup)?.removeView(view)
        view
      },
    )
  }

  private fun customRows(): List<UserProfileCustomRow> {
    return customPages().filter { it.showAsRow }.map { it.nativeRow }
  }

  private fun customPages(): List<ClerkUserProfileCustomPageConfig> {
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
        view.setCustomPages(customPages)
      }

      AsyncFunction("navigateCustomPage") {
        view: ClerkUserProfileNativeView,
        action: String,
        routeKey: String? -> view.navigateCustomPage(action, routeKey)
      }

      OnViewDidUpdateProps { view: ClerkUserProfileNativeView ->
        view.setupView()
      }

      OnViewDestroys { view: ClerkUserProfileNativeView ->
        view.destroyHost()
      }
    }
  }
}
