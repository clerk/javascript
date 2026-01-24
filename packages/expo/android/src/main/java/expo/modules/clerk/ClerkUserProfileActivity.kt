package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
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
  }

  private var dismissed = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)
    val publishableKey = intent.getStringExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY)

    // Log current state
    Log.d(TAG, "onCreate - isInitialized: ${Clerk.isInitialized.value}")
    Log.d(TAG, "onCreate - session: ${Clerk.session?.id}")
    Log.d(TAG, "onCreate - user: ${Clerk.user?.id}")
    Log.d(TAG, "onCreate - user.firstName: ${Clerk.user?.firstName}")
    Log.d(TAG, "onCreate - user.lastName: ${Clerk.user?.lastName}")
    Log.d(TAG, "onCreate - user.imageUrl: ${Clerk.user?.imageUrl?.take(50)}")
    Log.d(TAG, "onCreate - user.emailAddresses: ${Clerk.user?.emailAddresses?.map { it.emailAddress }}")

    // Initialize Clerk if not already initialized
    if (publishableKey != null && !Clerk.isInitialized.value) {
      Log.d(TAG, "Initializing Clerk with publishable key: ${publishableKey.take(20)}...")
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
        Log.d(TAG, "State changed - session: ${session?.id}, user: ${user?.id}")
        Log.d(TAG, "State changed - user.firstName: ${user?.firstName}, user.lastName: ${user?.lastName}")
        Log.d(TAG, "State changed - user.imageUrl: ${user?.imageUrl?.take(50)}")
      }

      // Detect sign-out: if we had a session and now it's null, user signed out
      LaunchedEffect(session) {
        if (hadSession && session == null) {
          Log.d(TAG, "Sign-out detected - session became null, dismissing activity")
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
