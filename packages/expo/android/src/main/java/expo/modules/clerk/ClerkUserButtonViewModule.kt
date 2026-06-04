package expo.modules.clerk

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.clerk.api.Clerk
import com.clerk.ui.userbutton.UserButton
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ClerkUserButtonNativeView(context: Context, appContext: AppContext) : ClerkComposeNativeViewHost(context, appContext) {
  init {
    activity?.let { Clerk.attachActivity(it) }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    setupView()
  }

  @Composable
  override fun Content() {
    Box(
      modifier = Modifier.fillMaxSize(),
      contentAlignment = Alignment.Center,
    ) {
      UserButton(clerkTheme = Clerk.customTheme)
    }
  }
}

class ClerkUserButtonViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkUserButtonView")

    View(ClerkUserButtonNativeView::class) {}
  }
}
