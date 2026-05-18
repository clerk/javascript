package expo.modules.clerk

import android.content.Context
import android.content.res.Configuration
import android.util.Log
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Recomposer
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
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
import com.clerk.ui.organizationswitcher.OrganizationSwitcher
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch

private const val TAG = "ClerkOrgSwitcherView"

class ClerkOrganizationSwitcherNativeView(context: Context) : FrameLayout(context) {
  var hidePersonal: Boolean = false

  private val activity = ClerkAuthNativeView.findActivity(context)

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
    addView(view, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT))
  }

  override fun onDetachedFromWindow() {
    recomposer?.cancel()
    recomposerJob?.cancel()
    super.onDetachedFromWindow()
  }

  fun setupView() {
    Log.d(TAG, "setupView - hidePersonal: $hidePersonal")

    composeView.setContent {
      // Track the last-known active organization id so we only emit the JS event
      // when it actually changes. The native composable's onOrganizationChanged
      // callback is a Unit lambda; we read the new id off the session flow.
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()
      var lastOrgId by remember { mutableStateOf(Clerk.session?.lastActiveOrganizationId) }

      LaunchedEffect(session?.lastActiveOrganizationId) {
        val currentId = session?.lastActiveOrganizationId
        if (currentId != lastOrgId) {
          lastOrgId = currentId
          sendEvent("organizationChanged", mapOf("organizationId" to currentId))
        }
      }

      val content = @androidx.compose.runtime.Composable {
        // React Native apps don't follow Android system dark mode by default,
        // so the surrounding RN UI renders light even when the OS is in
        // dark mode. ClerkMaterialTheme's color picker reads
        // isSystemInDarkTheme() — pin LocalConfiguration's night flag off
        // so it matches what the host app actually displays.
        // TODO: surface a `colorScheme` prop so consumers can opt into
        //       following the host app's Appearance API state instead.
        val baseConfig = LocalConfiguration.current
        val lightConfig = remember(baseConfig) {
          Configuration(baseConfig).apply {
            uiMode = (uiMode and Configuration.UI_MODE_NIGHT_MASK.inv()) or
              Configuration.UI_MODE_NIGHT_NO
          }
        }
        CompositionLocalProvider(LocalConfiguration provides lightConfig) {
          OrganizationSwitcher(
            modifier = Modifier.fillMaxWidth(),
            clerkTheme = Clerk.customTheme,
            // Consumers should compose <UserButton /> from @clerk/expo/native
            // separately when they want one — keeps parity with iOS, which
            // doesn't bundle a UserButton in its OrganizationSwitcher.
            showUserButton = false,
            onOrganizationChanged = {
              // The composable signals completion; we read the new id off
              // the session flow via the LaunchedEffect above to get an
              // actual id payload.
              Log.d(TAG, "Org switch completed")
            },
          )
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

  private fun sendEvent(type: String, data: Map<String, Any?>) {
    val reactContext = context as? ReactContext ?: return
    val eventData = Arguments.createMap().apply {
      putString("type", type)
      val jsonString = try {
        org.json.JSONObject(data).toString()
      } catch (e: Exception) {
        "{}"
      }
      putString("data", jsonString)
    }
    reactContext.getJSModule(RCTEventEmitter::class.java)
      .receiveEvent(id, "onOrganizationEvent", eventData)
  }
}
