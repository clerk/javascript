package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.clerk.api.Clerk
import com.clerk.ui.userprofile.UserProfileView

/**
 * Activity that hosts the Clerk UserProfileView composable.
 * Presents the native user profile UI and returns the result when dismissed.
 */
class ClerkUserProfileActivity : ComponentActivity() {

  private var dismissed = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)
    val publishableKey = intent.getStringExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY)

    // Initialize Clerk if not already initialized
    if (publishableKey != null && !Clerk.isInitialized.value) {
      println("[ClerkUserProfileActivity] Initializing Clerk with publishable key: ${publishableKey.take(20)}...")
      Clerk.initialize(applicationContext, publishableKey)
    }

    setContent {
      MaterialTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = MaterialTheme.colorScheme.background
        ) {
          UserProfileView(
            clerkTheme = Clerk.customTheme,
            onDismiss = {
              finishWithSuccess()
            }
          )
        }
      }
    }

    // Handle back press
    if (!dismissable) {
      onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          // Do nothing - not dismissable
        }
      })
    }
  }

  override fun onBackPressed() {
    if (intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)) {
      finishWithSuccess()
    }
    // Otherwise ignore back press
  }

  private fun finishWithSuccess() {
    if (dismissed) return
    dismissed = true

    val result = Intent()
    result.putExtra(ClerkExpoModule.RESULT_SESSION_ID, Clerk.session?.id)
    result.putExtra(ClerkExpoModule.RESULT_CANCELLED, false)
    setResult(Activity.RESULT_OK, result)
    finish()
  }
}
