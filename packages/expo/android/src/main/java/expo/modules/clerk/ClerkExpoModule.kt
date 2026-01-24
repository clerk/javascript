package expo.modules.clerk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import com.clerk.api.Clerk
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

private const val TAG = "ClerkExpoModule"

// Parameter records
class PresentAuthOptions : Record {
    @Field
    var mode: String = "signInOrUp"

    @Field
    var dismissable: Boolean = true
}

class PresentProfileOptions : Record {
    @Field
    var dismissable: Boolean = true
}

// Custom exceptions
class ClerkNotInitializedException : CodedException(
    "Clerk SDK is not initialized. Call configure() first."
)

class ClerkActivityUnavailableException : CodedException(
    "No activity available to present Clerk UI."
)

class ClerkAlreadySignedInException : CodedException(
    "User is already signed in"
)

class ClerkInitializationException(cause: Throwable?) : CodedException(
    "Failed to initialize Clerk SDK: ${cause?.message}",
    cause
)

class ClerkExpoModule : Module() {
    companion object {
        const val CLERK_AUTH_REQUEST_CODE = 9001
        const val CLERK_PROFILE_REQUEST_CODE = 9002

        // Intent extras
        const val EXTRA_DISMISSABLE = "dismissable"
        const val EXTRA_PUBLISHABLE_KEY = "publishableKey"
        const val EXTRA_MODE = "mode"

        // Result extras
        const val RESULT_SESSION_ID = "sessionId"
        const val RESULT_CANCELLED = "cancelled"

        // Pending promises for activity results
        private var pendingAuthPromise: Promise? = null
        private var pendingProfilePromise: Promise? = null

        // Store publishable key for passing to activities
        private var publishableKey: String? = null
    }

    private val context: Context
        get() = requireNotNull(appContext.reactContext) { "React context is null" }

    private val currentActivity: Activity?
        get() = appContext.currentActivity

    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun definition() = ModuleDefinition {
        Name("ClerkExpo")

        // Initialize Clerk SDK with publishable key
        AsyncFunction("configure") { pubKey: String, promise: Promise ->
            coroutineScope.launch {
                try {
                    publishableKey = pubKey
                    Clerk.initialize(context, pubKey)

                    // Wait for initialization to complete
                    Clerk.isInitialized.first { it }

                    // Check for initialization errors
                    val error = Clerk.initializationError.value
                    if (error != null) {
                        promise.reject(ClerkInitializationException(error))
                    } else {
                        promise.resolve(null)
                    }
                } catch (e: Exception) {
                    promise.reject(ClerkInitializationException(e))
                }
            }
        }

        // Present auth modal (sign-in, sign-up, or combined)
        AsyncFunction("presentAuth") { options: PresentAuthOptions, promise: Promise ->
            val activity = currentActivity ?: run {
                promise.reject(ClerkActivityUnavailableException())
                return@AsyncFunction
            }

            if (!Clerk.isInitialized.value) {
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            // Check if user is already signed in
            if (Clerk.session != null) {
                promise.reject(ClerkAlreadySignedInException())
                return@AsyncFunction
            }

            pendingAuthPromise = promise

            val intent = Intent(activity, ClerkAuthActivity::class.java).apply {
                putExtra(EXTRA_MODE, options.mode)
                putExtra(EXTRA_DISMISSABLE, options.dismissable)
            }

            activity.startActivityForResult(intent, CLERK_AUTH_REQUEST_CODE)
        }

        // Present user profile modal
        AsyncFunction("presentUserProfile") { options: PresentProfileOptions, promise: Promise ->
            val activity = currentActivity ?: run {
                promise.reject(ClerkActivityUnavailableException())
                return@AsyncFunction
            }

            if (!Clerk.isInitialized.value) {
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            pendingProfilePromise = promise

            val intent = Intent(activity, ClerkUserProfileActivity::class.java).apply {
                putExtra(EXTRA_DISMISSABLE, options.dismissable)
                putExtra(EXTRA_PUBLISHABLE_KEY, publishableKey)
            }

            activity.startActivityForResult(intent, CLERK_PROFILE_REQUEST_CODE)
        }

        // Get current session and user data
        AsyncFunction("getSession") { promise: Promise ->
            Log.d(TAG, "getSession called - isInitialized: ${Clerk.isInitialized.value}")

            if (!Clerk.isInitialized.value) {
                Log.e(TAG, "getSession - Clerk not initialized")
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            val session = Clerk.session
            val user = Clerk.user

            Log.d(TAG, "getSession - session: ${session?.id}")
            Log.d(TAG, "getSession - user: ${user?.id}")
            Log.d(TAG, "getSession - user.firstName: ${user?.firstName}")
            Log.d(TAG, "getSession - user.lastName: ${user?.lastName}")
            Log.d(TAG, "getSession - user.imageUrl: ${user?.imageUrl?.take(50)}")
            Log.d(TAG, "getSession - user.emailAddresses: ${user?.emailAddresses?.map { it.emailAddress }}")

            val result = mutableMapOf<String, Any?>()

            session?.let {
                result["session"] = mapOf(
                    "id" to it.id,
                    "status" to it.status.name,
                    "userId" to it.user?.id,
                    "createdAt" to it.createdAt,
                    "updatedAt" to it.updatedAt,
                    "expireAt" to it.expireAt,
                    "lastActiveAt" to it.lastActiveAt
                )
            }

            user?.let {
                val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }
                val primaryPhone = it.phoneNumbers.find { p -> p.id == it.primaryPhoneNumberId }

                result["user"] = mapOf(
                    "id" to it.id,
                    "firstName" to it.firstName,
                    "lastName" to it.lastName,
                    "imageUrl" to it.imageUrl,
                    "primaryEmailAddress" to primaryEmail?.emailAddress,
                    "primaryPhoneNumber" to primaryPhone?.phoneNumber,
                    "passwordEnabled" to it.passwordEnabled,
                    "totpEnabled" to it.totpEnabled,
                    "createdAt" to it.createdAt,
                    "lastSignInAt" to it.lastSignInAt
                )
            }

            Log.d(TAG, "getSession - returning result: $result")
            promise.resolve(result)
        }

        // Sign out the current user
        AsyncFunction("signOut") { promise: Promise ->
            if (!Clerk.isInitialized.value) {
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            coroutineScope.launch {
                try {
                    Clerk.signOut()
                    promise.resolve(null)
                } catch (e: Exception) {
                    promise.reject(
                        CodedException(e.message ?: "Sign out failed")
                    )
                }
            }
        }

        // Handle activity results
        OnActivityResult { _, payload ->
            val (requestCode, resultCode, data) = payload

            when (requestCode) {
                CLERK_AUTH_REQUEST_CODE -> {
                    handleAuthResult(resultCode, data)
                }
                CLERK_PROFILE_REQUEST_CODE -> {
                    handleProfileResult(resultCode, data)
                }
            }
        }
    }

    private fun handleAuthResult(resultCode: Int, data: Intent?) {
        Log.d(TAG, "handleAuthResult - resultCode: $resultCode")

        val promise = pendingAuthPromise ?: return
        pendingAuthPromise = null

        if (resultCode == Activity.RESULT_OK) {
            val session = Clerk.session
            val user = Clerk.user

            Log.d(TAG, "handleAuthResult - session: ${session?.id}")
            Log.d(TAG, "handleAuthResult - user: ${user?.id}")
            Log.d(TAG, "handleAuthResult - user.firstName: ${user?.firstName}")
            Log.d(TAG, "handleAuthResult - user.lastName: ${user?.lastName}")
            Log.d(TAG, "handleAuthResult - user.imageUrl: ${user?.imageUrl?.take(50)}")

            val result = mutableMapOf<String, Any?>()

            session?.let {
                result["session"] = mapOf(
                    "id" to it.id,
                    "status" to it.status.name,
                    "userId" to it.user?.id
                )
            }

            user?.let {
                val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }

                result["user"] = mapOf(
                    "id" to it.id,
                    "firstName" to it.firstName,
                    "lastName" to it.lastName,
                    "imageUrl" to it.imageUrl,
                    "primaryEmailAddress" to primaryEmail?.emailAddress
                )
            }

            Log.d(TAG, "handleAuthResult - returning: $result")
            promise.resolve(result)
        } else {
            Log.d(TAG, "handleAuthResult - user cancelled")
            // User cancelled or dismissed
            promise.resolve(mapOf("cancelled" to true))
        }
    }

    private fun handleProfileResult(resultCode: Int, data: Intent?) {
        val promise = pendingProfilePromise ?: return
        pendingProfilePromise = null

        // Profile always returns current session state
        val session = Clerk.session
        val user = Clerk.user

        val result = mutableMapOf<String, Any?>()

        session?.let {
            result["session"] = mapOf(
                "id" to it.id,
                "status" to it.status.name,
                "userId" to it.user?.id
            )
        }

        user?.let {
            val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }

            result["user"] = mapOf(
                "id" to it.id,
                "firstName" to it.firstName,
                "lastName" to it.lastName,
                "imageUrl" to it.imageUrl,
                "primaryEmailAddress" to primaryEmail?.emailAddress
            )
        }

        result["dismissed"] = resultCode == Activity.RESULT_CANCELED

        promise.resolve(result)
    }
}
