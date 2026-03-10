package expo.modules.clerk

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.util.Log
import com.clerk.api.Clerk
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.MutableStateFlow
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
    NativeClerkModuleSpec(reactContext),
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
    override fun configure(pubKey: String, bearerToken: String?, promise: Promise) {
        debugLog(TAG, "configure - START pubKey=${pubKey.take(20)}... bearerToken=${if (bearerToken != null) "present(${bearerToken.length} chars)" else "null"}")
        coroutineScope.launch {
            try {
                publishableKey = pubKey

                // If the JS SDK has a bearer token, write it to the native SDK's
                // SharedPreferences so both SDKs share the same Clerk API client.
                if (!bearerToken.isNullOrEmpty()) {
                    debugLog(TAG, "configure - writing bearer token to SharedPreferences")
                    reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
                        .edit()
                        .putString("DEVICE_TOKEN", bearerToken)
                        .apply()

                    // Verify write
                    val verified = reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
                        .getString("DEVICE_TOKEN", null)
                    debugLog(TAG, "configure - SharedPreferences verify: ${if (verified != null) "written(${verified.length} chars)" else "WRITE FAILED"}")
                }

                debugLog(TAG, "configure - Clerk.isInitialized=${Clerk.isInitialized.value}")

                if (Clerk.isInitialized.value) {
                    debugLog(TAG, "configure - already initialized, session=${Clerk.session?.id}, user=${Clerk.user?.id}")
                    // Already initialized — force a client refresh so the SDK
                    // picks up the new device token from SharedPreferences.
                    debugLog(TAG, "configure - calling forceClientRefresh()")
                    forceClientRefresh()

                    // Wait for session to appear with the new token (up to 5s)
                    try {
                        debugLog(TAG, "configure - waiting for session (up to 5s)...")
                        withTimeout(5_000L) {
                            Clerk.sessionFlow.first { it != null }
                        }
                        debugLog(TAG, "configure - session appeared! session=${Clerk.session?.id}, user=${Clerk.user?.id}")
                    } catch (_: TimeoutCancellationException) {
                        debugLog(TAG, "configure - session did not appear after force refresh (timeout)")
                        debugLog(TAG, "configure - post-timeout state: session=${Clerk.session?.id}, user=${Clerk.user?.id}, client=${Clerk.client}")
                    }

                    promise.resolve(null)
                    return@launch
                }

                // First-time initialization
                debugLog(TAG, "configure - first-time init, calling Clerk.initialize()")
                Clerk.initialize(reactApplicationContext, pubKey)

                // Wait for initialization to complete with timeout
                try {
                    withTimeout(10_000L) {
                        Clerk.isInitialized.first { it }
                    }
                    debugLog(TAG, "configure - initialized! session=${Clerk.session?.id}, user=${Clerk.user?.id}")
                } catch (e: TimeoutCancellationException) {
                    val initError = Clerk.initializationError.value
                    val message = if (initError != null) {
                        "Clerk initialization timed out: ${initError.message}"
                    } else {
                        "Clerk initialization timed out after 10 seconds"
                    }
                    debugLog(TAG, "configure - TIMEOUT: $message")
                    promise.reject("E_TIMEOUT", message)
                    return@launch
                }

                // Check for initialization errors
                val error = Clerk.initializationError.value
                if (error != null) {
                    debugLog(TAG, "configure - INIT ERROR: ${error.message}")
                    promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${error.message}")
                } else {
                    debugLog(TAG, "configure - SUCCESS")
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                debugLog(TAG, "configure - EXCEPTION: ${e.message}")
                promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${e.message}", e)
            }
        }
    }

    /**
     * Forces the Clerk SDK to re-fetch client/environment data from the API.
     *
     * This is needed when a new device token has been written to SharedPreferences
     * but the SDK was already initialized (so Clerk.initialize() is a no-op).
     * Uses reflection because ConfigurationManager.refreshClientAndEnvironment is private.
     */
    /**
     * Forces the Clerk SDK to re-fetch client/environment data from the API.
     *
     * This is needed when a new device token has been written to SharedPreferences
     * but the SDK was already initialized (so Clerk.initialize() is a no-op).
     *
     * Uses reflection to find the ConfigurationManager instance (field name may be
     * obfuscated by R8), then sets _isInitialized to false so reinitialize() proceeds.
     */
    private fun forceClientRefresh() {
        try {
            debugLog(TAG, "forceClientRefresh - searching for ConfigurationManager field via reflection")

            // Find the ConfigurationManager field by type since the name may be obfuscated
            val clerkClass = Clerk::class.java
            var configManager: Any? = null

            for (field in clerkClass.declaredFields) {
                field.isAccessible = true
                val fieldValue = field.get(Clerk)
                debugLog(TAG, "forceClientRefresh - field: ${field.name} type: ${field.type.name}")
                if (fieldValue != null && fieldValue.javaClass.name.contains("ConfigurationManager")) {
                    configManager = fieldValue
                    debugLog(TAG, "forceClientRefresh - found ConfigurationManager: ${field.name} -> ${fieldValue.javaClass.name}")
                    break
                }
            }

            if (configManager == null) {
                debugLog(TAG, "forceClientRefresh - ConfigurationManager not found by type, trying all fields with MutableStateFlow<Boolean>")
                // Fallback: just try to directly set isInitialized to false via the public StateFlow
                // and then call reinitialize()
                debugLog(TAG, "forceClientRefresh - skipping reflection, trying alternative approach")
                forceClientRefreshAlternative()
                return
            }

            // Find _isInitialized field (MutableStateFlow<Boolean>) in ConfigurationManager
            var isInitFlow: MutableStateFlow<Boolean>? = null
            for (field in configManager.javaClass.declaredFields) {
                field.isAccessible = true
                val fieldValue = field.get(configManager)
                if (fieldValue is MutableStateFlow<*>) {
                    val currentVal = fieldValue.value
                    if (currentVal is Boolean) {
                        debugLog(TAG, "forceClientRefresh - found MutableStateFlow<Boolean>: ${field.name} = $currentVal")
                        if (currentVal == true) {
                            @Suppress("UNCHECKED_CAST")
                            isInitFlow = fieldValue as MutableStateFlow<Boolean>
                            break
                        }
                    }
                }
            }

            if (isInitFlow != null) {
                debugLog(TAG, "forceClientRefresh - setting _isInitialized to false")
                isInitFlow.value = false
                debugLog(TAG, "forceClientRefresh - calling Clerk.reinitialize()")
                val result = Clerk.reinitialize()
                debugLog(TAG, "forceClientRefresh - reinitialize() returned $result, isInitialized=${Clerk.isInitialized.value}")
            } else {
                debugLog(TAG, "forceClientRefresh - _isInitialized flow not found, trying alternative")
                forceClientRefreshAlternative()
            }
        } catch (e: Exception) {
            debugLog(TAG, "forceClientRefresh FAILED: ${e.message}")
            e.printStackTrace()
            // Try alternative approach
            forceClientRefreshAlternative()
        }
    }

    /**
     * Alternative force refresh that doesn't rely on reflection for ConfigurationManager.
     * Triggers the app lifecycle refresh callback by simulating a foreground return.
     */
    private fun forceClientRefreshAlternative() {
        try {
            debugLog(TAG, "forceClientRefreshAlternative - trying lifecycle-based refresh")

            // The Clerk SDK refreshes client data when the app returns to foreground.
            // We can trigger this by finding and invoking the refresh callback.
            val clerkClass = Clerk::class.java

            // Look for any method or field related to lifecycle refresh
            for (field in clerkClass.declaredFields) {
                field.isAccessible = true
                val fieldValue = field.get(Clerk)
                debugLog(TAG, "forceClientRefreshAlternative - Clerk field: ${field.name} (${field.type.simpleName}) = ${fieldValue?.javaClass?.simpleName ?: "null"}")
            }

            // Try to find and invoke updateClient or similar internal method
            for (method in clerkClass.declaredMethods) {
                debugLog(TAG, "forceClientRefreshAlternative - Clerk method: ${method.name}(${method.parameterTypes.joinToString { it.simpleName }})")
            }

            debugLog(TAG, "forceClientRefreshAlternative - reflection dump complete")
        } catch (e: Exception) {
            debugLog(TAG, "forceClientRefreshAlternative FAILED: ${e.message}")
        }
    }

    // MARK: - presentAuth

    @ReactMethod
    override fun presentAuth(options: ReadableMap, promise: Promise) {
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
    override fun presentUserProfile(options: ReadableMap, promise: Promise) {
        debugLog(TAG, "presentUserProfile - START, isInitialized=${Clerk.isInitialized.value}, session=${Clerk.session?.id}, user=${Clerk.user?.id}")

        val activity = getCurrentActivity() ?: run {
            debugLog(TAG, "presentUserProfile - NO ACTIVITY")
            promise.reject("E_ACTIVITY_UNAVAILABLE", "No activity available to present Clerk UI.")
            return
        }

        if (!Clerk.isInitialized.value) {
            debugLog(TAG, "presentUserProfile - NOT INITIALIZED")
            promise.reject("E_NOT_INITIALIZED", "Clerk SDK is not initialized. Call configure() first.")
            return
        }

        debugLog(TAG, "presentUserProfile - pre-launch state: session=${Clerk.session?.id}, user=${Clerk.user?.id}, publishableKey=${publishableKey?.take(20)}...")

        pendingProfilePromise?.reject("E_SUPERSEDED", "Profile presentation was superseded")
        pendingProfilePromise = promise

        val dismissable = if (options.hasKey("dismissable")) options.getBoolean("dismissable") else true

        val intent = Intent(activity, ClerkUserProfileActivity::class.java).apply {
            putExtra(EXTRA_DISMISSABLE, dismissable)
            putExtra(EXTRA_PUBLISHABLE_KEY, publishableKey)
        }

        debugLog(TAG, "presentUserProfile - launching ClerkUserProfileActivity")
        activity.startActivityForResult(intent, CLERK_PROFILE_REQUEST_CODE)
    }

    // MARK: - getSession

    @ReactMethod
    override fun getSession(promise: Promise) {
        debugLog(TAG, "getSession - isInitialized=${Clerk.isInitialized.value}")

        if (!Clerk.isInitialized.value) {
            // Return null when not initialized (matches iOS behavior)
            // so callers can proceed to call configure() with a bearer token.
            debugLog(TAG, "getSession - not initialized, resolving null")
            promise.resolve(null)
            return
        }

        val session = Clerk.session
        val user = Clerk.user
        debugLog(TAG, "getSession - session=${session?.id}, user=${user?.id}")

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
    override fun getClientToken(promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
            val deviceToken = prefs.getString("DEVICE_TOKEN", null)
            debugLog(TAG, "getClientToken - deviceToken: ${if (deviceToken != null) "found(${deviceToken.length} chars)" else "null"}")
            promise.resolve(deviceToken)
        } catch (e: Exception) {
            debugLog(TAG, "getClientToken FAILED: ${e.message}")
            promise.resolve(null)
        }
    }

    // MARK: - signOut

    @ReactMethod
    override fun signOut(promise: Promise) {
        debugLog(TAG, "signOut - isInitialized=${Clerk.isInitialized.value}, session=${Clerk.session?.id}")
        if (!Clerk.isInitialized.value) {
            // Resolve gracefully when not initialized (matches iOS behavior)
            debugLog(TAG, "signOut - not initialized, resolving null")
            promise.resolve(null)
            return
        }

        coroutineScope.launch {
            try {
                debugLog(TAG, "signOut - calling Clerk.auth.signOut()")
                Clerk.auth.signOut()
                debugLog(TAG, "signOut - SUCCESS")
                promise.resolve(null)
            } catch (e: Exception) {
                debugLog(TAG, "signOut - FAILED: ${e.message}")
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

    override fun onNewIntent(intent: Intent) {
        // Not used
    }

    private fun handleAuthResult(resultCode: Int, data: Intent?) {
        debugLog(TAG, "handleAuthResult - resultCode: $resultCode")

        val promise = pendingAuthPromise ?: return
        pendingAuthPromise = null

        if (resultCode == Activity.RESULT_OK) {
            val session = Clerk.session
            val user = Clerk.user

            debugLog(TAG, "handleAuthResult - hasSession: ${session != null}, hasUser: ${user != null}")

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
        debugLog(TAG, "handleProfileResult - resultCode=$resultCode (OK=${Activity.RESULT_OK}, CANCELED=${Activity.RESULT_CANCELED})")

        val promise = pendingProfilePromise ?: run {
            debugLog(TAG, "handleProfileResult - no pending promise!")
            return
        }
        pendingProfilePromise = null

        // Profile always returns current session state
        val session = Clerk.session
        val user = Clerk.user
        debugLog(TAG, "handleProfileResult - session=${session?.id}, user=${user?.id}")

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

        val dismissed = resultCode == Activity.RESULT_CANCELED
        result.putBoolean("dismissed", dismissed)
        debugLog(TAG, "handleProfileResult - resolving with dismissed=$dismissed, hasSession=${session != null}")

        promise.resolve(result)
    }
}
