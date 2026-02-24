package expo.modules.clerk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.session.fetchToken
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.views.ExpoView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout

private const val TAG = "ClerkExpoModule"

private fun debugLog(tag: String, message: String) {
    if (BuildConfig.DEBUG) {
        Log.d(tag, message)
    }
}

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
        AsyncFunction("configure") { pubKey: String, bearerToken: String?, promise: Promise ->
            coroutineScope.launch {
                try {
                    publishableKey = pubKey

                    // If the JS SDK has a bearer token, write it to the native SDK's
                    // SharedPreferences so both SDKs share the same Clerk API client.
                    // This mirrors the iOS behavior where the token is written to the Keychain.
                    if (!bearerToken.isNullOrEmpty()) {
                        context.getSharedPreferences("clerk_preferences", android.content.Context.MODE_PRIVATE)
                            .edit()
                            .putString("DEVICE_TOKEN", bearerToken)
                            .apply()
                        debugLog(TAG, "configure - wrote JS bearer token to native SharedPreferences")
                    }

                    Clerk.initialize(context, pubKey)

                    // Wait for initialization to complete with timeout
                    try {
                        withTimeout(10_000L) {
                            Clerk.isInitialized.first { it }
                        }
                    } catch (e: TimeoutCancellationException) {
                        val initError = Clerk.initializationError.value
                        val message = if (initError != null) {
                            "Clerk initialization timed out: ${initError.message}"
                        } else {
                            "Clerk initialization timed out after 10 seconds"
                        }
                        promise.reject(CodedException(message))
                        return@launch
                    }

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

            pendingAuthPromise?.reject(CodedException("Auth presentation was superseded"))
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

            pendingProfilePromise?.reject(CodedException("Profile presentation was superseded"))
            pendingProfilePromise = promise

            val intent = Intent(activity, ClerkUserProfileActivity::class.java).apply {
                putExtra(EXTRA_DISMISSABLE, options.dismissable)
                putExtra(EXTRA_PUBLISHABLE_KEY, publishableKey)
            }

            activity.startActivityForResult(intent, CLERK_PROFILE_REQUEST_CODE)
        }

        // Get current session and user data
        AsyncFunction("getSession") { promise: Promise ->
            if (!Clerk.isInitialized.value) {
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            val session = Clerk.session
            val user = Clerk.user

            debugLog(TAG, "getSession - session: ${session?.id}, user: ${user?.id}")

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

            promise.resolve(result)
        }

        // Get the native Clerk client's device token (client JWT)
        // This is stored in SharedPreferences by clerk-android and is the
        // equivalent of the __clerk_client_jwt used by the JS SDK.
        AsyncFunction("getClientToken") { promise: Promise ->
            try {
                val prefs = context.getSharedPreferences("clerk_preferences", android.content.Context.MODE_PRIVATE)
                val deviceToken = prefs.getString("DEVICE_TOKEN", null)
                debugLog(TAG, "getClientToken - deviceToken: ${if (deviceToken != null) "found" else "null"}")
                promise.resolve(deviceToken)
            } catch (e: Exception) {
                debugLog(TAG, "getClientToken failed: ${e.message}")
                promise.resolve(null)
            }
        }

        // Sign out the current user
        AsyncFunction("signOut") { promise: Promise ->
            if (!Clerk.isInitialized.value) {
                promise.reject(ClerkNotInitializedException())
                return@AsyncFunction
            }

            coroutineScope.launch {
                try {
                    Clerk.auth.signOut()
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

        // MARK: - Inline Native Views

        View(ClerkAuthExpoView::class) {
            Events("onAuthEvent")

            Prop("mode") { view: ClerkAuthExpoView, mode: String? ->
                view.mode = mode ?: "signInOrUp"
            }

            Prop("isDismissable") { view: ClerkAuthExpoView, dismissable: Boolean? ->
                view.isDismissable = dismissable ?: true
            }

            OnViewDidUpdateProps { view ->
                view.setupView()
            }
        }

        View(ClerkUserProfileExpoView::class) {
            Events("onProfileEvent")

            Prop("isDismissable") { view: ClerkUserProfileExpoView, dismissable: Boolean? ->
                view.isDismissable = dismissable ?: true
            }

            OnViewDidUpdateProps { view ->
                view.setupView()
            }
        }
    }

    private fun handleAuthResult(resultCode: Int, data: Intent?) {
        debugLog(TAG, "handleAuthResult - resultCode: $resultCode")

        val promise = pendingAuthPromise ?: return
        pendingAuthPromise = null

        if (resultCode == Activity.RESULT_OK) {
            val session = Clerk.session
            val user = Clerk.user

            debugLog(TAG, "handleAuthResult - session: ${session?.id}, user: ${user?.id}")

            val result = mutableMapOf<String, Any?>()

            // Top-level sessionId for JS SDK compatibility (matches iOS response format)
            result["sessionId"] = session?.id

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

            promise.resolve(result)
        } else {
            debugLog(TAG, "handleAuthResult - user cancelled")
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
