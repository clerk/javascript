package expo.modules.clerk

import android.app.Activity
import android.content.Intent
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

// Custom exceptions
class ClerkNotInitializedException : CodedException(
  "CLERK_NOT_INITIALIZED",
  "Clerk not initialized. Make sure ClerkViewFactory is registered.",
  null
)

class ClerkActivityUnavailableException : CodedException(
  "E_ACTIVITY_UNAVAILABLE",
  "Activity is not available",
  null
)

class ClerkAuthCancelledException : CodedException(
  "AUTH_CANCELLED",
  "User cancelled authentication",
  null
)

class ClerkAlreadySignedInException : CodedException(
  "ALREADY_SIGNED_IN",
  "User is already signed in",
  null
)

/**
 * ClerkExpoModule - Native module for Clerk integration on Android.
 *
 * This module provides:
 * - configure(publishableKey) - Initialize Clerk SDK
 * - presentAuth(options) - Launch auth activity
 * - presentUserProfile(options) - Launch user profile activity
 * - getSession() - Get current session data
 * - signOut() - Sign out user
 */
class ClerkExpoModule : Module() {
  private val mainScope = CoroutineScope(Dispatchers.Main)

  companion object {
    const val AUTH_REQUEST_CODE = 9001
    const val USER_PROFILE_REQUEST_CODE = 9002

    const val EXTRA_MODE = "mode"
    const val EXTRA_DISMISSABLE = "dismissable"
    const val EXTRA_PUBLISHABLE_KEY = "publishableKey"
    const val RESULT_SESSION_ID = "sessionId"
    const val RESULT_CANCELLED = "cancelled"

    // Auto-initialize flag
    private var factoryInitialized = false

    fun ensureFactoryInitialized() {
      if (!factoryInitialized) {
        ClerkViewFactory.initialize()
        factoryInitialized = true
      }
    }
  }

  // Store pending promises for activity results
  private var pendingAuthPromise: Promise? = null
  private var pendingProfilePromise: Promise? = null

  override fun definition() = ModuleDefinition {
    Name("ClerkExpo")

    // Auto-initialize factory when module loads
    OnCreate {
      ensureFactoryInitialized()
    }

    // Configure Clerk with publishable key
    AsyncFunction("configure") { publishableKey: String, promise: Promise ->
      val factory = ClerkViewFactoryRegistry.factory
      if (factory == null) {
        promise.reject(ClerkNotInitializedException())
        return@AsyncFunction
      }

      val context = appContext.reactContext
      if (context == null) {
        promise.reject(ClerkActivityUnavailableException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          factory.configure(context, publishableKey)
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject(CodedException("CONFIGURE_ERROR", e.message ?: "Failed to configure Clerk", e))
        }
      }
    }

    // Present sign-in/sign-up modal
    AsyncFunction("presentAuth") { options: Map<String, Any?>, promise: Promise ->
      val factory = ClerkViewFactoryRegistry.factory
      if (factory == null) {
        promise.reject(ClerkNotInitializedException())
        return@AsyncFunction
      }

      val activity = appContext.currentActivity
      if (activity == null) {
        promise.reject(ClerkActivityUnavailableException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          // Always present the auth modal - let the native UI handle signed-in state
          // The JS SDK will check isSignedIn before calling this
          val mode = options["mode"] as? String ?: "signInOrUp"
          val dismissable = options["dismissable"] as? Boolean ?: true

          // Store promise for activity result
          pendingAuthPromise = promise

          val intent = factory.createAuthIntent(activity, mode, dismissable)
          activity.startActivityForResult(intent, AUTH_REQUEST_CODE)
        } catch (e: Exception) {
          pendingAuthPromise = null
          promise.reject(CodedException("AUTH_ERROR", e.message ?: "Failed to present auth", e))
        }
      }
    }

    // Present user profile modal
    AsyncFunction("presentUserProfile") { options: Map<String, Any?>, promise: Promise ->
      val factory = ClerkViewFactoryRegistry.factory
      if (factory == null) {
        promise.reject(ClerkNotInitializedException())
        return@AsyncFunction
      }

      val activity = appContext.currentActivity
      if (activity == null) {
        promise.reject(ClerkActivityUnavailableException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          val dismissable = options["dismissable"] as? Boolean ?: true

          // Store promise for activity result
          pendingProfilePromise = promise

          val intent = factory.createUserProfileIntent(activity, dismissable)
          activity.startActivityForResult(intent, USER_PROFILE_REQUEST_CODE)
        } catch (e: Exception) {
          pendingProfilePromise = null
          promise.reject(CodedException("PROFILE_ERROR", e.message ?: "Failed to present user profile", e))
        }
      }
    }

    // Get current session from native Clerk SDK
    AsyncFunction("getSession") { promise: Promise ->
      val factory = ClerkViewFactoryRegistry.factory
      if (factory == null) {
        promise.resolve(null)
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          val session = factory.getSession()
          promise.resolve(session)
        } catch (e: Exception) {
          promise.resolve(null)
        }
      }
    }

    // Sign out from native Clerk SDK
    AsyncFunction("signOut") { promise: Promise ->
      val factory = ClerkViewFactoryRegistry.factory
      if (factory == null) {
        promise.reject(ClerkNotInitializedException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          factory.signOut()
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject(CodedException("SIGN_OUT_ERROR", e.message ?: "Failed to sign out", e))
        }
      }
    }

    // Handle activity results
    OnActivityResult { _, payload ->
      val (requestCode, resultCode, data) = payload

      when (requestCode) {
        AUTH_REQUEST_CODE -> {
          handleAuthResult(resultCode, data)
        }
        USER_PROFILE_REQUEST_CODE -> {
          handleProfileResult(resultCode, data)
        }
      }
    }
  }

  private fun handleAuthResult(resultCode: Int, data: Intent?) {
    val promise = pendingAuthPromise
    pendingAuthPromise = null

    if (promise == null) return

    mainScope.launch {
      when (resultCode) {
        Activity.RESULT_OK -> {
          // Auth completed successfully, get the session data
          val factory = ClerkViewFactoryRegistry.factory
          val session = factory?.getSession()
          if (session != null) {
            promise.resolve(session)
          } else {
            // Session should exist after successful auth
            promise.resolve(mapOf("success" to true))
          }
        }
        Activity.RESULT_CANCELED -> {
          val wasCancelled = data?.getBooleanExtra(RESULT_CANCELLED, true) ?: true
          if (wasCancelled) {
            promise.reject(ClerkAuthCancelledException())
          } else {
            // Dismissed but might still have session
            val factory = ClerkViewFactoryRegistry.factory
            val session = factory?.getSession()
            if (session != null) {
              promise.resolve(session)
            } else {
              promise.reject(ClerkAuthCancelledException())
            }
          }
        }
        else -> {
          promise.reject(CodedException("AUTH_ERROR", "Unknown result code: $resultCode", null))
        }
      }
    }
  }

  private fun handleProfileResult(resultCode: Int, data: Intent?) {
    val promise = pendingProfilePromise
    pendingProfilePromise = null

    if (promise == null) return

    mainScope.launch {
      // Profile view always resolves successfully when dismissed
      val factory = ClerkViewFactoryRegistry.factory
      val session = factory?.getSession()
      promise.resolve(session ?: mapOf("success" to true))
    }
  }
}
