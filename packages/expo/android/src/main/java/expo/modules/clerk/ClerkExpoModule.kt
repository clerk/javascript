package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.clerk.api.Clerk
import com.clerk.api.network.model.error.firstMessage
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.ui.ClerkColors
import com.clerk.api.ui.ClerkDesign
import com.clerk.api.ui.ClerkTheme
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.json.JSONObject

private const val TAG = "ClerkExpoModule"

private fun debugLog(tag: String, message: String) {
    if (BuildConfig.DEBUG) {
        Log.d(tag, message)
    }
}

class ClerkExpoModule(reactContext: ReactApplicationContext) :
    NativeClerkModuleSpec(reactContext) {

    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    companion object {
        private var sharedReactContext: ReactApplicationContext? = null
        private var listenerCount = 0

        fun emitAuthStateChange(type: String, sessionId: String?) {
            if (listenerCount <= 0) {
                return
            }

            val event = Arguments.createMap().apply {
                putString("type", type)
                putString("sessionId", sessionId)
            }

            sharedReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("onAuthStateChange", event)
        }
    }

    init {
        sharedReactContext = reactContext
    }

    override fun getName(): String = "ClerkExpo"

    @ReactMethod
    override fun addListener(eventName: String) {
        listenerCount += 1
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        listenerCount = maxOf(0, listenerCount - count.toInt())
    }

    // MARK: - configure

    @ReactMethod
    override fun configure(pubKey: String, bearerToken: String?, promise: Promise) {
        coroutineScope.launch {
            try {
                if (!Clerk.isInitialized.value) {
                    // First-time initialization — write the bearer token to SharedPreferences
                    // before initializing so the SDK boots with the correct client.
                    if (!bearerToken.isNullOrEmpty()) {
                        reactApplicationContext.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
                            .edit()
                            .putString("DEVICE_TOKEN", bearerToken)
                            .apply()
                    }

                    Clerk.initialize(reactApplicationContext, pubKey)
                    // clerk-android registers ActivityLifecycleCallbacks during
                    // initialize(), but in React Native MainActivity has already passed
                    // onResume() by the time <ClerkProvider> mounts and we reach this
                    // line, so the callbacks miss the initial activity. Without seeding,
                    // the first Credential Manager call (Google sign-in / passkeys)
                    // fails with MissingActivity until the user backgrounds and
                    // foregrounds the app. getCurrentActivity() can be null here on
                    // cold start before React's host-resume sync — AuthView and
                    // UserProfile also call attachActivity() on mount as a backstop.
                    getCurrentActivity()?.let { Clerk.attachActivity(it) }
                    // Must be set AFTER Clerk.initialize() because initialize()
                    // resets customTheme to its `theme` parameter (default null).
                    loadThemeFromAssets()

                    // Wait for initialization to complete with timeout
                    try {
                        withTimeout(10_000L) {
                            Clerk.isInitialized.first { it }
                        }
                        // If a bearer token was provided, wait for the session to hydrate
                        // so callers that immediately call getSession() see the session.
                        if (!bearerToken.isNullOrEmpty()) {
                            withTimeout(5_000L) {
                                Clerk.sessionFlow.first { it != null }
                            }
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
                    return@launch
                }

                // Already initialized — use the public SDK API to update
                // the device token and trigger a client/environment refresh.
                if (!bearerToken.isNullOrEmpty()) {
                    val result = Clerk.updateDeviceToken(bearerToken)
                    if (result is ClerkResult.Failure) {
                        debugLog(TAG, "configure - updateDeviceToken failed: ${result.error}")
                    }

                    // Wait for session to appear with the new token (up to 5s)
                    try {
                        withTimeout(5_000L) {
                            Clerk.sessionFlow.first { it != null }
                        }
                    } catch (_: TimeoutCancellationException) {
                        debugLog(TAG, "configure - session did not appear after token update")
                    }
                }

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${e.message}", e)
            }
        }
    }

    // MARK: - getSession

    @ReactMethod
    override fun getSession(promise: Promise) {
        if (!Clerk.isInitialized.value) {
            // Return null when not initialized (matches iOS behavior)
            // so callers can proceed to call configure() with a bearer token.
            promise.resolve(null)
            return
        }

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
            // Use the SDK's public API which handles encrypted storage transparently.
            // Direct SharedPreferences reads break on clerk-android >= 1.0.11 where
            // DEVICE_TOKEN is encrypted via StorageCipher.
            val deviceToken = Clerk.getDeviceToken()
            promise.resolve(deviceToken)
        } catch (e: Exception) {
            debugLog(TAG, "getClientToken failed: ${e.message}")
            promise.resolve(null)
        }
    }

    // MARK: - refreshClient

    @ReactMethod
    override fun refreshClient(promise: Promise) {
        if (!Clerk.isInitialized.value) {
            promise.resolve(null)
            return
        }

        coroutineScope.launch {
            try {
                val deviceToken = Clerk.getDeviceToken()
                if (deviceToken.isNullOrBlank()) {
                    promise.resolve(null)
                    return@launch
                }

                when (val result = Clerk.updateDeviceToken(deviceToken)) {
                    is ClerkResult.Failure -> promise.reject(
                        "E_REFRESH_CLIENT_FAILED",
                        result.error?.firstMessage() ?: result.throwable?.message ?: "Client refresh failed"
                    )
                    is ClerkResult.Success -> promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.reject("E_REFRESH_CLIENT_FAILED", e.message ?: "Client refresh failed", e)
            }
        }
    }

    // MARK: - Theme Loading

    private fun loadThemeFromAssets() {
        try {
            val jsonString = reactApplicationContext.assets
                .open("clerk_theme.json")
                .bufferedReader()
                .use { it.readText() }
            val json = JSONObject(jsonString)
            Clerk.customTheme = parseClerkTheme(json)
        } catch (e: java.io.FileNotFoundException) {
            // No theme file provided — use defaults
        } catch (e: Exception) {
            debugLog(TAG, "Failed to load clerk_theme.json: ${e.message}")
        }
    }

    private fun parseClerkTheme(json: JSONObject): ClerkTheme {
        val colors = json.optJSONObject("colors")?.let { parseColors(it) }
        val darkColors = json.optJSONObject("darkColors")?.let { parseColors(it) }
        val design = json.optJSONObject("design")?.let { parseDesign(it) }
        return ClerkTheme(
            colors = colors,
            darkColors = darkColors,
            design = design
        )
    }

    private fun parseColors(json: JSONObject): ClerkColors {
        return ClerkColors(
            primary = json.optStringColor("primary"),
            background = json.optStringColor("background"),
            input = json.optStringColor("input"),
            danger = json.optStringColor("danger"),
            success = json.optStringColor("success"),
            warning = json.optStringColor("warning"),
            foreground = json.optStringColor("foreground"),
            mutedForeground = json.optStringColor("mutedForeground"),
            primaryForeground = json.optStringColor("primaryForeground"),
            inputForeground = json.optStringColor("inputForeground"),
            neutral = json.optStringColor("neutral"),
            border = json.optStringColor("border"),
            ring = json.optStringColor("ring"),
            muted = json.optStringColor("muted"),
            shadow = json.optStringColor("shadow")
        )
    }

    private fun parseDesign(json: JSONObject): ClerkDesign {
        return if (json.has("borderRadius")) {
            ClerkDesign(borderRadius = json.getDouble("borderRadius").toFloat().dp)
        } else {
            ClerkDesign()
        }
    }

    private fun parseHexColor(hex: String): Color? {
        val cleaned = hex.removePrefix("#")
        return try {
            when (cleaned.length) {
                6 -> Color(android.graphics.Color.parseColor("#FF$cleaned"))
                // Theme JSON uses RRGGBBAA; Android parseColor expects AARRGGBB
                8 -> {
                    val rrggbb = cleaned.substring(0, 6)
                    val aa = cleaned.substring(6, 8)
                    Color(android.graphics.Color.parseColor("#$aa$rrggbb"))
                }
                else -> null
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun JSONObject.optStringColor(key: String): Color? {
        val value = optString(key, null) ?: return null
        return parseHexColor(value)
    }
}
