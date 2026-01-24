package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.clerk.api.signin.SignIn
import com.clerk.api.signin.prepareSecondFactor
import com.clerk.api.signup.SignUp
import com.clerk.api.signup.prepareVerification
import com.clerk.api.network.serialization.onSuccess
import com.clerk.api.network.serialization.onFailure
import com.clerk.api.network.serialization.errorMessage
import com.clerk.ui.auth.AuthView
import kotlinx.coroutines.delay

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

    companion object {
        private const val TAG = "ClerkAuthActivity"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val mode = intent.getStringExtra(ClerkExpoModule.EXTRA_MODE) ?: "signInOrUp"
        val dismissable = intent.getBooleanExtra(ClerkExpoModule.EXTRA_DISMISSABLE, true)

        // Track if we had a session when we started (to detect new sign-in)
        val initialSession = Clerk.session
        Log.d(TAG, "onCreate - initialSession: ${initialSession?.id}, mode: $mode")

        setContent {
            // Observe initialization state
            val isInitialized by Clerk.isInitialized.collectAsStateWithLifecycle()

            // Observe both session and user state for completion
            val session by Clerk.sessionFlow.collectAsStateWithLifecycle()
            val user by Clerk.userFlow.collectAsStateWithLifecycle()

            // Track if the client has been synced (environment is ready)
            // We need to wait for the client to sync before showing AuthView
            var isClientReady by remember { mutableStateOf(false) }

            // Track when auth is complete to hide AuthView before finishing
            // This prevents the "NavDisplay backstack cannot be empty" crash
            var isAuthComplete by remember { mutableStateOf(false) }

            // Wait for SDK to be fully initialized AND client to sync
            // The client sync happens after isInitialized becomes true
            LaunchedEffect(isInitialized) {
                Log.d(TAG, "LaunchedEffect - isInitialized: $isInitialized")
                if (isInitialized) {
                    // Give the client a moment to sync after initialization
                    // The SDK needs time to fetch the environment configuration
                    var attempts = 0
                    while (attempts < 30) { // Wait up to 3 seconds
                        // Check if client exists (environment is loaded)
                        val client = Clerk.client
                        Log.d(TAG, "Waiting for client - attempt $attempts, client: ${client?.id}")
                        if (client != null) {
                            Log.d(TAG, "Client is ready: ${client.id}")
                            // Log detailed client state
                            Log.d(TAG, "Client signIn status: ${client.signIn?.status}")
                            Log.d(TAG, "Client signUp status: ${client.signUp?.status}")
                            Log.d(TAG, "Client sessions count: ${client.sessions?.size ?: 0}")
                            isClientReady = true
                            break
                        }
                        delay(100)
                        attempts++
                    }
                    if (!isClientReady) {
                        Log.w(TAG, "Client did not become ready after 3 seconds, showing AuthView anyway")
                        isClientReady = true
                    }
                }
            }

            // Track last signUp ID to detect when a new signUp is created
            var lastSignUpId by remember { mutableStateOf<String?>(null) }
            // Track if we've already triggered prepareVerification for this signUp
            var preparedSignUpId by remember { mutableStateOf<String?>(null) }

            // Track if we've already triggered prepareSecondFactor for this signIn
            var preparedSecondFactorSignInId by remember { mutableStateOf<String?>(null) }

            // Monitor signUp state changes and manually trigger prepareVerification
            LaunchedEffect(isClientReady) {
                if (isClientReady) {
                    while (true) {
                        delay(500) // Check every 500ms
                        val client = Clerk.client
                        val signUp = client?.signUp

                        if (signUp != null && signUp.id != lastSignUpId) {
                            // New signUp detected
                            lastSignUpId = signUp.id
                            Log.d(TAG, ">>> NEW SIGNUP DETECTED <<<")
                            Log.d(TAG, "SignUp.id: ${signUp.id}")
                            Log.d(TAG, "SignUp.status: ${signUp.status}")
                            Log.d(TAG, "SignUp.emailAddress: ${signUp.emailAddress}")

                            // Log detailed verification info
                            val emailVerification = signUp.verifications?.get("email_address")
                            if (emailVerification != null) {
                                Log.d(TAG, ">>> EMAIL VERIFICATION OBJECT <<<")
                                Log.d(TAG, "  status: ${emailVerification.status}")
                                Log.d(TAG, "  strategy: ${emailVerification.strategy}")
                                Log.d(TAG, "  attempts: ${emailVerification.attempts}")
                                Log.d(TAG, "  expireAt: ${emailVerification.expireAt}")
                                Log.d(TAG, "  error: ${emailVerification.error}")
                            } else {
                                Log.d(TAG, ">>> NO EMAIL VERIFICATION OBJECT <<<")
                            }
                        }

                        // Manually trigger prepareVerification if needed
                        // This is a workaround for clerk-android-ui not calling prepareVerification
                        if (signUp != null &&
                            signUp.id != preparedSignUpId &&
                            signUp.emailAddress != null &&
                            signUp.status == SignUp.Status.MISSING_REQUIREMENTS) {

                            val emailVerification = signUp.verifications?.get("email_address")
                            // Only prepare if email is unverified
                            if (emailVerification?.status?.name == "UNVERIFIED") {
                                Log.d(TAG, ">>> MANUALLY TRIGGERING prepareVerification for email <<<")
                                preparedSignUpId = signUp.id

                                try {
                                    val result = signUp.prepareVerification(
                                        SignUp.PrepareVerificationParams.Strategy.EmailCode()
                                    )
                                    result
                                        .onSuccess {
                                            Log.d(TAG, ">>> prepareVerification SUCCESS - email should be sent! <<<")
                                        }
                                        .onFailure { error ->
                                            Log.e(TAG, ">>> prepareVerification FAILED: ${error.errorMessage} <<<")
                                        }
                                } catch (e: Exception) {
                                    Log.e(TAG, ">>> prepareVerification EXCEPTION: ${e.message} <<<", e)
                                }
                            }
                        }

                        // Manually trigger prepareSecondFactor for MFA if needed
                        // This is a workaround for clerk-android-ui not calling prepareSecondFactor
                        val signIn = client?.signIn
                        if (signIn != null &&
                            signIn.id != preparedSecondFactorSignInId &&
                            signIn.status == SignIn.Status.NEEDS_SECOND_FACTOR) {

                            Log.d(TAG, ">>> SIGN-IN NEEDS SECOND FACTOR (MFA) <<<")
                            Log.d(TAG, "SignIn.id: ${signIn.id}")
                            Log.d(TAG, "SignIn.supportedSecondFactors: ${signIn.supportedSecondFactors?.map { "${it.strategy} (email: ${it.emailAddressId}, phone: ${it.phoneNumberId})" }}")

                            // Mark this signIn as prepared to avoid duplicate calls
                            preparedSecondFactorSignInId = signIn.id

                            try {
                                Log.d(TAG, ">>> MANUALLY TRIGGERING prepareSecondFactor <<<")
                                val result = signIn.prepareSecondFactor()
                                result
                                    .onSuccess { updatedSignIn ->
                                        Log.d(TAG, ">>> prepareSecondFactor SUCCESS - MFA code should be sent! <<<")
                                        Log.d(TAG, "Updated signIn status: ${updatedSignIn.status}")
                                        Log.d(TAG, "Second factor verification: ${updatedSignIn.secondFactorVerification}")
                                    }
                                    .onFailure { error ->
                                        Log.e(TAG, ">>> prepareSecondFactor FAILED: ${error.errorMessage} <<<")
                                        // Reset so we can retry
                                        preparedSecondFactorSignInId = null
                                    }
                            } catch (e: Exception) {
                                Log.e(TAG, ">>> prepareSecondFactor EXCEPTION: ${e.message} <<<", e)
                                // Reset so we can retry
                                preparedSecondFactorSignInId = null
                            }
                        }

                        // Check if auth completed - finish activity immediately
                        val currentSession = Clerk.session
                        if (currentSession != null && !isAuthComplete) {
                            Log.d(TAG, ">>> AUTH COMPLETED - Session detected in polling loop <<<")
                            Log.d(TAG, "Session ID: ${currentSession.id}")
                            isAuthComplete = true

                            // Finish activity with success
                            val resultIntent = Intent().apply {
                                putExtra("sessionId", currentSession.id)
                                putExtra("userId", currentSession.user?.id ?: Clerk.user?.id)
                            }
                            setResult(Activity.RESULT_OK, resultIntent)
                            finish()
                            break
                        }
                    }
                }
            }

            // Periodic logging of auth state for debugging (reduced frequency)
            LaunchedEffect(isClientReady) {
                if (isClientReady) {
                    while (!isAuthComplete) {
                        delay(2000) // Log every 2 seconds
                        val client = Clerk.client
                        val signIn = client?.signIn
                        val signUp = client?.signUp

                        Log.d(TAG, "=== Auth State Debug ===")
                        Log.d(TAG, "Session: ${Clerk.session?.id}")
                        Log.d(TAG, "User: ${Clerk.user?.id}")
                        Log.d(TAG, "isAuthComplete: $isAuthComplete")

                        if (signIn != null) {
                            Log.d(TAG, "SignIn.id: ${signIn.id}")
                            Log.d(TAG, "SignIn.status: ${signIn.status}")
                        }

                        if (signUp != null) {
                            Log.d(TAG, "SignUp.id: ${signUp.id}")
                            Log.d(TAG, "SignUp.status: ${signUp.status}")
                        }
                        Log.d(TAG, "========================")
                    }
                }
            }

            // Backup: Also listen for session via Flow (in case polling misses it)
            LaunchedEffect(session) {
                Log.d(TAG, "LaunchedEffect(session) - session: ${session?.id}, isAuthComplete: $isAuthComplete")

                if (session != null && initialSession == null && !isAuthComplete) {
                    Log.d(TAG, "Auth completed - session created: ${session?.id}")

                    // Mark auth as complete FIRST to hide AuthView
                    // This prevents the "NavDisplay backstack cannot be empty" crash
                    isAuthComplete = true

                    // Small delay to let the UI update before finishing
                    delay(100)

                    // Auth completed - return session info
                    val resultIntent = Intent().apply {
                        putExtra("sessionId", session?.id)
                        putExtra("userId", session?.user?.id ?: user?.id)
                    }
                    setResult(Activity.RESULT_OK, resultIntent)
                    finish()
                }
            }

            // Log user state changes for debugging
            LaunchedEffect(user) {
                Log.d(TAG, "User state changed - user: ${user?.id}, firstName: ${user?.firstName}")
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
                    when {
                        isAuthComplete -> {
                            // Auth completed - show success indicator while finishing
                            // This prevents AuthView from crashing with empty navigation backstack
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Text(
                                        text = "Signed in!",
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                            }
                        }
                        isClientReady -> {
                            // Client is ready, show AuthView
                            AuthView(
                                modifier = Modifier.fillMaxSize(),
                                clerkTheme = null // Use default theme, or pass custom
                            )
                        }
                        else -> {
                            // Show loading while waiting for client to sync
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Text(
                                        text = "Loading...",
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                            }
                        }
                    }
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
