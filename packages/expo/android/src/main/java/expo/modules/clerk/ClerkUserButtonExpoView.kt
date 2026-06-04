package expo.modules.clerk

import android.content.Context
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import com.clerk.api.Clerk
import com.clerk.ui.userbutton.UserButton

class ClerkUserButtonNativeView(context: Context) : ClerkComposeNativeViewHost(context) {
  init {
    activity?.let { Clerk.attachActivity(it) }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    setupView()
  }

  @Composable
  override fun Content() {
    MaterialTheme {
      Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
      ) {
        UserButton(clerkTheme = Clerk.customTheme)
      }
    }
  }
}
