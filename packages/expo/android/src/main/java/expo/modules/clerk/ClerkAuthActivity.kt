package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.clerk.ui.auth.AuthView

/**
 * Activity that hosts Clerk's AuthView Compose component.
 *
 * This activity is launched from ClerkExpoModule to present a full-screen
 * authentication modal (sign-in, sign-up, or combined flow).
 *
 * Intent extras:
 * - "mode": String - "signIn", "signUp", or "signInOrUp" (default)
 * - "dismissable": Boolean - whether back press dismisses (default: true)
 *
 * Result:
 * - RESULT_OK: Auth completed successfully (session is available via Clerk.session)
 * - RESULT_CANCELED: User dismissed the modal
 */
class ClerkAuthActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val mode = intent.getStringExtra(ClerkExpoModule.EXTRA_MODE) ?: "signInOrUp"
        val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)

        // Track if we had a session when we started (to detect new sign-in)
        val initialSession = Clerk.session

        setContent {
            // Observe session state for completion
            val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

            // When session becomes non-null (and wasn't already), auth is complete
            LaunchedEffect(session) {
                if (session != null && initialSession == null) {
                    // Auth completed - user signed in
                    val resultIntent = Intent().apply {
                        putExtra("sessionId", session?.id)
                        putExtra("userId", session?.user?.id)
                    }
                    setResult(Activity.RESULT_OK, resultIntent)
                    finish()
                }
            }

            // Handle back press
            if (dismissable) {
                BackHandler {
                    setResult(Activity.RESULT_CANCELED)
                    finish()
                }
            } else {
                // Block back press when not dismissable
                BackHandler { /* Do nothing */ }
            }

            // Render Clerk's AuthView in a Material3 surface
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AuthView(
                        modifier = Modifier.fillMaxSize(),
                        clerkTheme = null // Use default theme, or pass custom
                    )
                }
            }
        }
    }

    override fun onBackPressed() {
        val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)
        if (dismissable) {
            setResult(Activity.RESULT_CANCELED)
            super.onBackPressed()
        }
        // If not dismissable, ignore back press
    }
}
