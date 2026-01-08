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
import com.clerk.ui.userprofile.UserProfileView

/**
 * Activity that hosts Clerk's UserProfileView Compose component.
 *
 * This activity is launched from ClerkExpoModule to present a full-screen
 * user profile modal where users can manage their account settings.
 *
 * Intent extras:
 * - "dismissable": Boolean - whether back press dismisses (default: true)
 *
 * Result:
 * - RESULT_OK: User dismissed normally (session data available via Clerk.session)
 * - RESULT_CANCELED: Session became null (user signed out from profile)
 */
class ClerkProfileActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val dismissable = intent.getBooleanExtra("dismissable", true)

        setContent {
            // Observe session state
            val session by Clerk.sessionFlow.collectAsStateWithLifecycle()

            // If session becomes null, user signed out - close activity
            LaunchedEffect(session) {
                if (session == null) {
                    setResult(Activity.RESULT_CANCELED)
                    finish()
                }
            }

            // Handle back press
            if (dismissable) {
                BackHandler {
                    val resultIntent = Intent().apply {
                        putExtra("sessionId", session?.id)
                    }
                    setResult(Activity.RESULT_OK, resultIntent)
                    finish()
                }
            } else {
                BackHandler { /* Do nothing */ }
            }

            // Render Clerk's UserProfileView
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    UserProfileView(
                        clerkTheme = null, // Use default theme
                        onDismiss = {
                            val resultIntent = Intent().apply {
                                putExtra("sessionId", session?.id)
                            }
                            setResult(Activity.RESULT_OK, resultIntent)
                            finish()
                        }
                    )
                }
            }
        }
    }

    override fun onBackPressed() {
        val dismissable = intent.getBooleanExtra("dismissable", true)
        if (dismissable) {
            val resultIntent = Intent().apply {
                putExtra("sessionId", Clerk.session?.id)
            }
            setResult(Activity.RESULT_OK, resultIntent)
            super.onBackPressed()
        }
        // If not dismissable, ignore back press
    }
}
