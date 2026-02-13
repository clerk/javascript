package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.clerk.ui.userprofile.UserProfileView

/**
 * Activity that hosts the Clerk UserProfileView composable.
 * Presents the native user profile UI and returns the result when dismissed.
 */
class ClerkUserProfileActivity : ComponentActivity() {

  companion object {
    private const val TAG = "ClerkUserProfileActivity"

    private fun debugLog(tag: String, message: String) {
      if (BuildConfig.DEBUG) {
        Log.d(tag, message)
      }
    }
  }

  private var dismissed = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)
    val publishableKey = intent.getStringExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY)

    debugLog(TAG, "onCreate - isInitialized: ${Clerk.isInitialized.value}")
    debugLog(TAG, "onCreate - session: ${Clerk.session?.id}, user: ${Clerk.user?.id}")

    // Initialize Clerk if not already initialized
    if (publishableKey != null && !Clerk.isInitialized.value) {
      debugLog(TAG, "Initializing Clerk...")
      Clerk.initialize(applicationContext, publishableKey)
    }

    setContent {
      // Observe user state changes
      val user by Clerk.userFlow.collectAsStateWithLifecycle()
      val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

      // Track if we had a session when the profile opened (to detect sign-out)
      var hadSession by remember { mutableStateOf(Clerk.session != null) }

      // Log when user/session state changes
      LaunchedEffect(user, session) {
        debugLog(TAG, "State changed - session: ${session?.id}, user: ${user?.id}")
      }

      // Detect sign-out: if we had a session and now it's null, user signed out
      LaunchedEffect(session) {
        if (hadSession && session == null) {
          debugLog(TAG, "Sign-out detected - session became null, dismissing activity")
          finishWithSuccess()
        }
        // Update hadSession if we get a session (handles edge cases)
        if (session != null) {
          hadSession = true
        }
      }

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

    // Handle back press via onBackPressedDispatcher (replaces deprecated onBackPressed)
    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (dismissable) {
          finishWithSuccess()
        }
        // Otherwise ignore back press
      }
    })
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
