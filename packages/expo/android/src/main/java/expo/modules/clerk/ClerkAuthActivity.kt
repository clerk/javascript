package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.lifecycleScope
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthMode
import com.clerk.ui.auth.AuthView
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

/**
 * Activity that hosts the Clerk AuthView composable.
 * Presents the native authentication UI and returns the result to the calling activity.
 */
class ClerkAuthActivity : ComponentActivity() {

  private var initialSessionId: String? = null
  private var dismissed = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val mode = intent.getStringExtra(ClerkExpoModule.EXTRA_MODE) ?: "signInOrUp"
    val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)
    val publishableKey = intent.getStringExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY)

    // Initialize Clerk if not already initialized
    if (publishableKey != null && !Clerk.isInitialized.value) {
      println("[ClerkAuthActivity] Initializing Clerk with publishable key: ${publishableKey.take(20)}...")
      Clerk.initialize(applicationContext, publishableKey)
    }

    // Track initial session to detect when auth completes
    initialSessionId = Clerk.session?.id

    setContent {
      MaterialTheme {
        Surface(
          modifier = Modifier.fillMaxSize(),
          color = MaterialTheme.colorScheme.background
        ) {
          // Wait for Clerk to be initialized
          val isInitialized by Clerk.isInitialized.collectAsState()
          val session by Clerk.sessionFlow.collectAsState()
          var hasCompletedAuth by remember { mutableStateOf(false) }

          // Detect when a new session is created
          LaunchedEffect(session) {
            val currentSession = session
            if (currentSession != null && currentSession.id != initialSessionId && !hasCompletedAuth) {
              hasCompletedAuth = true
              println("[ClerkAuthActivity] Auth completed, session: ${currentSession.id}")
              finishWithSuccess(currentSession.id)
            }
          }

          if (isInitialized) {
            AuthView(
              modifier = Modifier.fillMaxSize(),
              clerkTheme = Clerk.customTheme
            )
          } else {
            // Show loading indicator while Clerk initializes
            Box(
              modifier = Modifier.fillMaxSize(),
              contentAlignment = Alignment.Center
            ) {
              CircularProgressIndicator()
            }
          }
        }
      }
    }

    // Handle back press
    if (!dismissable) {
      // If not dismissable, don't allow back press to cancel
      onBackPressedDispatcher.addCallback(this, object : androidx.activity.OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          // Do nothing - not dismissable
        }
      })
    }
  }

  override fun onBackPressed() {
    if (intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)) {
      finishCancelled()
    }
    // Otherwise ignore back press
  }

  private fun finishWithSuccess(sessionId: String?) {
    if (dismissed) return
    dismissed = true

    val result = Intent()
    result.putExtra(ClerkExpoModule.RESULT_SESSION_ID, sessionId)
    result.putExtra(ClerkExpoModule.RESULT_CANCELLED, false)
    setResult(Activity.RESULT_OK, result)
    finish()
  }

  private fun finishCancelled() {
    if (dismissed) return
    dismissed = true

    val result = Intent()
    result.putExtra(ClerkExpoModule.RESULT_CANCELLED, true)
    setResult(Activity.RESULT_CANCELED, result)
    finish()
  }
}
