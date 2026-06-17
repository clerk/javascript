package expo.modules.clerk

import android.content.Context
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.clerk.api.Clerk
import com.clerk.api.network.model.client.Client
import com.clerk.api.network.model.error.firstMessage
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.ui.ClerkColors
import com.clerk.api.ui.ClerkDesign
import com.clerk.api.ui.ClerkTheme
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import org.json.JSONObject

private const val TAG = "ClerkExpoModule"
private const val NATIVE_CLIENT_CHANGED_EVENT = "clerkNativeClientChanged"

private fun debugLog(tag: String, message: String) {
    if (BuildConfig.DEBUG) {
        Log.d(tag, message)
    }
}

class ClerkExpoModule : Module() {
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    private var clientStateObserverJob: Job? = null
    private var lastObservedClient: Client? = null
    private var jsOriginatedClientSyncDepth = 0
    private var configuredPublishableKey: String? = null

    companion object {
        private var sharedInstance: ClerkExpoModule? = null

        fun emitClientChanged(sourceId: String? = null) {
            val instance = sharedInstance ?: return
            instance.sendEvent(NATIVE_CLIENT_CHANGED_EVENT, instance.clientChangedPayload(sourceId))
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ClerkExpo")

        Events(NATIVE_CLIENT_CHANGED_EVENT)

        OnCreate {
            sharedInstance = this@ClerkExpoModule
        }

        OnDestroy {
            if (sharedInstance === this@ClerkExpoModule) {
                sharedInstance = null
            }
            clientStateObserverJob?.cancel()
            clientStateObserverJob = null
        }

        AsyncFunction("configure") { pubKey: String, bearerToken: String?, promise: Promise ->
            configure(pubKey, bearerToken, promise)
        }

        AsyncFunction("getClientToken") { promise: Promise ->
            getClientToken(promise)
        }

        AsyncFunction("syncFromJsClientToken") { clientToken: String?, sourceId: String?, promise: Promise ->
            syncFromJsClientToken(clientToken, sourceId, promise)
        }
    }

    private val reactContext: Context?
        get() = appContext.reactContext

    private fun startClientStateObserver() {
        if (clientStateObserverJob != null) {
            return
        }

        lastObservedClient = Clerk.clientFlow.value

        clientStateObserverJob = coroutineScope.launch {
            Clerk.clientFlow.collect { client ->
                if (client == lastObservedClient) {
                    return@collect
                }

                lastObservedClient = client
                if (jsOriginatedClientSyncDepth > 0) {
                    return@collect
                }

                emitClientChanged()
            }
        }
    }

    private fun clientChangedPayload(sourceId: String? = null): Map<String, Any?> {
        val result = mutableMapOf<String, Any?>(
            "clientToken" to try {
                Clerk.getDeviceToken()
            } catch (e: Exception) {
                debugLog(TAG, "clientChangedPayload - getDeviceToken failed: ${e.message}")
                null
            }
        )
        if (!sourceId.isNullOrEmpty()) {
            result["sourceId"] = sourceId
        }
        return result
    }

    private fun emitSyncedClientChanged(sourceId: String?) {
        lastObservedClient = Clerk.clientFlow.value
        emitClientChanged(sourceId)
    }

    // MARK: - configure

    private fun configure(pubKey: String, bearerToken: String?, promise: Promise) {
        val context = reactContext ?: run {
            promise.reject("E_INIT_FAILED", "React context is not available", null)
            return
        }

        coroutineScope.launch {
            try {
                if (!Clerk.isInitialized.value) {
                    // First-time initialization — write the bearer token to SharedPreferences
                    // before initializing so the SDK boots with the correct client.
                    if (!bearerToken.isNullOrEmpty()) {
                        context.getSharedPreferences("clerk_preferences", Context.MODE_PRIVATE)
                            .edit()
                            .putString("DEVICE_TOKEN", bearerToken)
                            .apply()
                    }

                    Clerk.initialize(context, pubKey)
                    startClientStateObserver()
                    // clerk-android registers ActivityLifecycleCallbacks during
                    // initialize(), but in React Native MainActivity has already passed
                    // onResume() by the time <ClerkProvider> mounts and we reach this
                    // line, so the callbacks miss the initial activity. Without seeding,
                    // the first Credential Manager call (Google sign-in / passkeys)
                    // fails with MissingActivity until the user backgrounds and
                    // foregrounds the app. currentActivity can be null here on
                    // cold start before React's host-resume sync — AuthView and
                    // UserProfile also call attachActivity() on mount as a backstop.
                    appContext.currentActivity?.let { Clerk.attachActivity(it) }
                    // Must be set AFTER Clerk.initialize() because initialize()
                    // resets customTheme to its `theme` parameter (default null).
                    loadThemeFromAssets(context)

                    // Wait for initialization to complete with timeout
                    try {
                        withTimeout(10_000L) {
                            Clerk.isInitialized.first { it }
                        }
                        // If a bearer token was provided, wait for native client state to hydrate
                        // before resolving the configure call.
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
                        promise.reject("E_TIMEOUT", message, null)
                        return@launch
                    }

                    // Check for initialization errors
                    val error = Clerk.initializationError.value
                    if (error != null) {
                        promise.reject("E_INIT_FAILED", "Failed to initialize Clerk SDK: ${error.message}", null)
                    } else {
                        configuredPublishableKey = pubKey
                        promise.resolve(null)
                    }
                    return@launch
                }

                val activePublishableKey = configuredPublishableKey ?: Clerk.publishableKey
                if (activePublishableKey != null && activePublishableKey != pubKey) {
                    Clerk.switchConfiguration(context, pubKey)
                    startClientStateObserver()
                    appContext.currentActivity?.let { Clerk.attachActivity(it) }
                    loadThemeFromAssets(context)

                    try {
                        withTimeout(10_000L) {
                            Clerk.isInitialized.first { it }
                        }
                    } catch (e: TimeoutCancellationException) {
                        val initError = Clerk.initializationError.value
                        val message = if (initError != null) {
                            "Clerk reconfiguration timed out: ${initError.message}"
                        } else {
                            "Clerk reconfiguration timed out after 10 seconds"
                        }
                        promise.reject("E_TIMEOUT", message, null)
                        return@launch
                    }

                    val error = Clerk.initializationError.value
                    if (error != null) {
                        promise.reject("E_RECONFIGURE_FAILED", "Failed to reconfigure Clerk SDK: ${error.message}", null)
                        return@launch
                    }

                    if (!bearerToken.isNullOrEmpty()) {
                        val result = Clerk.updateDeviceToken(bearerToken)
                        if (result is ClerkResult.Failure) {
                            debugLog(TAG, "configure - updateDeviceToken after reconfigure failed: ${result.error}")
                        }

                        try {
                            withTimeout(5_000L) {
                                Clerk.sessionFlow.first { it != null }
                            }
                        } catch (_: TimeoutCancellationException) {
                            debugLog(TAG, "configure - session did not appear after reconfigure token update")
                        }
                    }

                    configuredPublishableKey = pubKey
                    promise.resolve(null)
                    return@launch
                }

                // Already initialized — use the public SDK API to update
                // the device token and trigger a client/environment refresh.
                startClientStateObserver()
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

    // MARK: - getClientToken

    private fun getClientToken(promise: Promise) {
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

    // MARK: - syncFromJsClientToken

    private fun syncFromJsClientToken(clientToken: String?, sourceId: String?, promise: Promise) {
        if (!Clerk.isInitialized.value) {
            promise.resolve(null)
            return
        }

        coroutineScope.launch {
            try {
                jsOriginatedClientSyncDepth += 1
                if (!clientToken.isNullOrBlank()) {
                    when (val result = Clerk.updateDeviceToken(clientToken)) {
                        is ClerkResult.Failure -> {
                            promise.reject(
                                "E_SYNC_FROM_JS_FAILED",
                                result.error?.firstMessage() ?: result.throwable?.message ?: "Client token sync failed",
                                null
                            )
                            return@launch
                        }
                        is ClerkResult.Success -> {
                            try {
                                withTimeout(5_000L) {
                                    Clerk.sessionFlow.first { it != null }
                                }
                            } catch (_: TimeoutCancellationException) {
                                debugLog(TAG, "syncFromJsClientToken - session did not appear after token update")
                            }
                            emitSyncedClientChanged(sourceId)
                            promise.resolve(null)
                            return@launch
                        }
                    }
                }

                when (val result = Clerk.refreshClient()) {
                    is ClerkResult.Failure -> {
                        promise.reject(
                            "E_SYNC_FROM_JS_FAILED",
                            result.error?.firstMessage() ?: result.throwable?.message ?: "Client refresh failed",
                            null
                        )
                    }
                    is ClerkResult.Success -> {
                        emitSyncedClientChanged(sourceId)
                        promise.resolve(null)
                    }
                }
            } catch (e: Exception) {
                promise.reject("E_SYNC_FROM_JS_FAILED", e.message ?: "Client token sync failed", e)
            } finally {
                jsOriginatedClientSyncDepth = maxOf(0, jsOriginatedClientSyncDepth - 1)
            }
        }
    }

    // MARK: - Theme Loading

    private fun loadThemeFromAssets(context: Context) {
        try {
            val jsonString = context.assets
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
        if (!has(key) || isNull(key)) return null
        val value = optString(key)
        return parseHexColor(value)
    }
}
