package expo.modules.clerk

import android.content.Context
import android.content.Intent
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import kotlinx.coroutines.flow.first

/**
 * Implementation of ClerkViewFactoryInterface.
 * Provides Clerk SDK operations and creates intents for auth/profile activities.
 */
class ClerkViewFactory : ClerkViewFactoryInterface {

  // Store the publishable key for later use
  private var storedPublishableKey: String? = null
  private var storedContext: Context? = null

  override suspend fun configure(context: Context, publishableKey: String) {
    println("[ClerkViewFactory] Configuring Clerk with publishable key: ${publishableKey.take(20)}...")

    // Store for later use
    storedPublishableKey = publishableKey
    storedContext = context.applicationContext

    // Initialize Clerk if not already initialized
    if (!Clerk.isInitialized.value) {
      Clerk.initialize(context.applicationContext, publishableKey)

      // Wait for initialization to complete
      Clerk.isInitialized.first { it }
      println("[ClerkViewFactory] Clerk initialized successfully")
    } else {
      println("[ClerkViewFactory] Clerk already initialized")
    }
  }

  override fun createAuthIntent(context: Context, mode: String, dismissable: Boolean): Intent {
    return Intent(context, ClerkAuthActivity::class.java).apply {
      putExtra(ClerkExpoModule.EXTRA_MODE, mode)
      putExtra(ClerkExpoModule.EXTRA_DISMISSABLE, dismissable)
      storedPublishableKey?.let { putExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY, it) }
    }
  }

  override fun createUserProfileIntent(context: Context, dismissable: Boolean): Intent {
    return Intent(context, ClerkUserProfileActivity::class.java).apply {
      putExtra(ClerkExpoModule.EXTRA_DISMISSABLE, dismissable)
      storedPublishableKey?.let { putExtra(ClerkExpoModule.EXTRA_PUBLISHABLE_KEY, it) }
    }
  }

  override suspend fun getSession(): Map<String, Any?>? {
    val session = Clerk.session ?: return null
    val user = Clerk.user ?: return null

    return mapOf(
      "sessionId" to session.id,
      "userId" to user.id,
      "user" to mapOf(
        "id" to user.id,
        "firstName" to user.firstName,
        "lastName" to user.lastName,
        "fullName" to "${user.firstName ?: ""} ${user.lastName ?: ""}".trim().ifEmpty { null },
        "username" to user.username,
        "imageUrl" to user.imageUrl,
        "primaryEmailAddress" to user.primaryEmailAddress?.emailAddress,
        "primaryPhoneNumber" to user.primaryPhoneNumber?.phoneNumber,
        "createdAt" to user.createdAt,
        "updatedAt" to user.updatedAt,
      )
    )
  }

  override suspend fun signOut() {
    val result = Clerk.signOut()
    when (result) {
      is ClerkResult.Success -> {
        println("[ClerkViewFactory] Sign out successful")
      }
      is ClerkResult.Failure -> {
        println("[ClerkViewFactory] Sign out failed: ${result.error}")
        throw Exception("Sign out failed: ${result.error}")
      }
    }
  }

  override fun isInitialized(): Boolean {
    return Clerk.isInitialized.value
  }

  companion object {
    /**
     * Initialize the ClerkViewFactory and register it globally.
     * Call this from your Application.onCreate() or MainActivity.onCreate()
     */
    fun initialize() {
      ClerkViewFactoryRegistry.factory = ClerkViewFactory()
      println("[ClerkViewFactory] Factory registered")
    }
  }
}
