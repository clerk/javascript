package expo.modules.clerk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import com.clerk.api.Clerk
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
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

class ClerkExpoModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    ActivityEventListener {

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

    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "ClerkExpo"

    // MARK: - configure

    @ReactMethod
    fun configure(pubKey: String, bearerToken: String?, promise: Promise) {
        coroutineScope.launch {
            try {
                publishableKey = pubKey

                // If the JS SDK has a bearer token, write it to the native SDK's
                // SharedPreferences so both SDKs share the same Clerk API client.
                if (!bearerToken.isNullOrEmpty()) {
                    reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
                        .edit()
                        .putString("DEVICE_TOKEN", bearerToken)
                        .apply()
                    debugLog(TAG, "configure - wrote JS bearer token to native SharedPreferences")
                }

                Clerk.initialize(reactApplicationContext, pubKey)

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
                    promise.reject("E_TIMEOUT", message)
                    return@launch
                }

                // Check for initialization errors
                val error = Clerk.initializationError.value
                if (error != null) {
                    promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${error.message}")
                } else {
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${e.message}", e)
            }
        }
    }

    // MARK: - presentAuth

    @ReactMethod
    fun presentAuth(options: ReadableMap, promise: Promise) {
        val activity = getCurrentActivity() ?: run {
            promise.reject("E_ACTIVITY_UNAVAILABLE", "No activity available to present Clerk UI.")
            return
        }

        if (!Clerk.isInitialized.value) {
            promise.reject("E_NOT_INITIALIZED", "Clerk SDK is not initialized. Call configure() first.")
            return
        }

        // Check if user is already signed in
        if (Clerk.session != null) {
            promise.reject("already_signed_in", "User is already signed in")
            return
        }

        pendingAuthPromise?.reject("E_SUPERSEDED", "Auth presentation was superseded")
        pendingAuthPromise = promise

        val mode = if (options.hasKey("mode")) options.getString("mode") ?: "signInOrUp" else "signInOrUp"
        val dismissable = if (options.hasKey("dismissable")) options.getBoolean("dismissable") else true

        val intent = Intent(activity, ClerkAuthActivity::class.java).apply {
            putExtra(EXTRA_MODE, mode)
            putExtra(EXTRA_DISMISSABLE, dismissable)
        }

        activity.startActivityForResult(intent, CLERK_AUTH_REQUEST_CODE)
    }

    // MARK: - presentUserProfile

    @ReactMethod
    fun presentUserProfile(options: ReadableMap, promise: Promise) {
        val activity = getCurrentActivity() ?: run {
            promise.reject("E_ACTIVITY_UNAVAILABLE", "No activity available to present Clerk UI.")
            return
        }

        if (!Clerk.isInitialized.value) {
            promise.reject("E_NOT_INITIALIZED", "Clerk SDK is not initialized. Call configure() first.")
            return
        }

        pendingProfilePromise?.reject("E_SUPERSEDED", "Profile presentation was superseded")
        pendingProfilePromise = promise

        val dismissable = if (options.hasKey("dismissable")) options.getBoolean("dismissable") else true

        val intent = Intent(activity, ClerkUserProfileActivity::class.java).apply {
            putExtra(EXTRA_DISMISSABLE, dismissable)
            putExtra(EXTRA_PUBLISHABLE_KEY, publishableKey)
        }

        activity.startActivityForResult(intent, CLERK_PROFILE_REQUEST_CODE)
    }

    // MARK: - getSession

    @ReactMethod
    fun getSession(promise: Promise) {
        if (!Clerk.isInitialized.value) {
            promise.reject("E_NOT_INITIALIZED", "Clerk SDK is not initialized. Call configure() first.")
            return
        }

        val session = Clerk.session
        val user = Clerk.user

        debugLog(TAG, "getSession - session: ${session?.id}, user: ${user?.id}")

        val result = WritableNativeMap()

        session?.let {
            val sessionMap = WritableNativeMap()
            sessionMap.putString("id", it.id)
            sessionMap.putString("status", it.status.name)
            sessionMap.putString("userId", it.user?.id)
            result.putMap("session", sessionMap)
        }

        user?.let {
            val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }
            val primaryPhone = it.phoneNumbers.find { p -> p.id == it.primaryPhoneNumberId }

            val userMap = WritableNativeMap()
            userMap.putString("id", it.id)
            userMap.putString("firstName", it.firstName)
            userMap.putString("lastName", it.lastName)
            userMap.putString("imageUrl", it.imageUrl)
            userMap.putString("primaryEmailAddress", primaryEmail?.emailAddress)
            userMap.putString("primaryPhoneNumber", primaryPhone?.phoneNumber)
            result.putMap("user", userMap)
        }

        promise.resolve(result)
    }

    // MARK: - getClientToken

    @ReactMethod
    fun getClientToken(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
            val deviceToken = prefs.getString("DEVICE_TOKEN", null)
            debugLog(TAG, "getClientToken - deviceToken: ${if (deviceToken != null) "found" else "null"}")
            promise.resolve(deviceToken)
        } catch (e: Exception) {
            debugLog(TAG, "getClientToken failed: ${e.message}")
            promise.resolve(null)
        }
    }

    // MARK: - signOut

    @ReactMethod
    fun signOut(promise: Promise) {
        if (!Clerk.isInitialized.value) {
            promise.reject("E_NOT_INITIALIZED", "Clerk SDK is not initialized. Call configure() first.")
            return
        }

        coroutineScope.launch {
            try {
                Clerk.auth.signOut()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_SIGN_OUT_FAILED", e.message ?: "Sign out failed", e)
            }
        }
    }

    // MARK: - Activity Result Handling

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        when (requestCode) {
            CLERK_AUTH_REQUEST_CODE -> handleAuthResult(resultCode, data)
            CLERK_PROFILE_REQUEST_CODE -> handleProfileResult(resultCode, data)
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Not used
    }

    private fun handleAuthResult(resultCode: Int, data: Intent?) {
        debugLog(TAG, "handleAuthResult - resultCode: $resultCode")

        val promise = pendingAuthPromise ?: return
        pendingAuthPromise = null

        if (resultCode == Activity.RESULT_OK) {
            val session = Clerk.session
            val user = Clerk.user

            debugLog(TAG, "handleAuthResult - session: ${session?.id}, user: ${user?.id}")

            val result = WritableNativeMap()

            // Top-level sessionId for JS SDK compatibility (matches iOS response format)
            result.putString("sessionId", session?.id)

            session?.let {
                val sessionMap = WritableNativeMap()
                sessionMap.putString("id", it.id)
                sessionMap.putString("status", it.status.name)
                sessionMap.putString("userId", it.user?.id)
                result.putMap("session", sessionMap)
            }

            user?.let {
                val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }

                val userMap = WritableNativeMap()
                userMap.putString("id", it.id)
                userMap.putString("firstName", it.firstName)
                userMap.putString("lastName", it.lastName)
                userMap.putString("imageUrl", it.imageUrl)
                userMap.putString("primaryEmailAddress", primaryEmail?.emailAddress)
                result.putMap("user", userMap)
            }

            promise.resolve(result)
        } else {
            debugLog(TAG, "handleAuthResult - user cancelled")
            val result = WritableNativeMap()
            result.putBoolean("cancelled", true)
            promise.resolve(result)
        }
    }

    private fun handleProfileResult(resultCode: Int, data: Intent?) {
        val promise = pendingProfilePromise ?: return
        pendingProfilePromise = null

        // Profile always returns current session state
        val session = Clerk.session
        val user = Clerk.user

        val result = WritableNativeMap()

        session?.let {
            val sessionMap = WritableNativeMap()
            sessionMap.putString("id", it.id)
            sessionMap.putString("status", it.status.name)
            sessionMap.putString("userId", it.user?.id)
            result.putMap("session", sessionMap)
        }

        user?.let {
            val primaryEmail = it.emailAddresses?.find { e -> e.id == it.primaryEmailAddressId }

            val userMap = WritableNativeMap()
            userMap.putString("id", it.id)
            userMap.putString("firstName", it.firstName)
            userMap.putString("lastName", it.lastName)
            userMap.putString("imageUrl", it.imageUrl)
            userMap.putString("primaryEmailAddress", primaryEmail?.emailAddress)
            result.putMap("user", userMap)
        }

        result.putBoolean("dismissed", resultCode == Activity.RESULT_CANCELED)

        promise.resolve(result)
    }
}
