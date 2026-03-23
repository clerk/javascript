package expo.modules.clerk

import android.content.Context
import android.content.Intent

/**
 * Interface for providing Clerk views and SDK operations.
 * This mirrors the iOS ClerkViewFactoryProtocol pattern.
 */
interface ClerkViewFactoryInterface {
  /**
   * Configure the Clerk SDK with the publishable key.
   */
  suspend fun configure(context: Context, publishableKey: String)

  /**
   * Create an Intent to launch the authentication activity.
   * @param mode The auth mode: "signIn", "signUp", or "signInOrUp"
   * @param dismissable Whether the user can dismiss the modal
   */
  fun createAuthIntent(context: Context, mode: String, dismissable: Boolean): Intent

  /**
   * Create an Intent to launch the user profile activity.
   * @param dismissable Whether the user can dismiss the modal
   */
  fun createUserProfileIntent(context: Context, dismissable: Boolean): Intent

  /**
   * Get the current session data as a Map for JS.
   * Returns null if no session is active.
   */
  suspend fun getSession(): Map<String, Any?>?

  /**
   * Sign out the current user.
   */
  suspend fun signOut()

  /**
   * Check if the SDK is initialized.
   */
  fun isInitialized(): Boolean
}

/**
 * Global registry for the Clerk view factory.
 * Set by the app target at startup (similar to iOS pattern).
 */
object ClerkViewFactoryRegistry {
  var factory: ClerkViewFactoryInterface? = null
}
