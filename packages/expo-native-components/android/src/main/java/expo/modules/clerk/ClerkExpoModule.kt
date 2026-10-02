@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.clerk.api.Clerk
import com.clerk.api.ClerkConfigurationOptions
import com.clerk.api.FrameworkIntegrationApi
import com.clerk.api.network.model.client.Client
import com.clerk.api.network.model.error.ClerkErrorResponse
import com.clerk.api.network.model.error.firstMessage
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.biometriccredential.BiometricCredentialKeyManagerException
import com.clerk.api.session.SessionVerification
import com.clerk.api.session.startVerification
import com.clerk.api.session.verifyWithBiometrics
import com.clerk.api.ui.ClerkColors
import com.clerk.api.ui.ClerkDesign
import com.clerk.api.ui.ClerkTheme
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

private const val TAG = "ClerkExpoModule"
private const val NATIVE_AUTH_FLOW_CHANGED_EVENT = "clerkNativeAuthFlowChanged"
private const val NATIVE_CLIENT_INVALIDATED_EVENT = "clerkNativeClientInvalidated"
private const val HOST_SDK_HEADER = "x-clerk-host-sdk"
private const val HOST_SDK_VERSION_HEADER = "x-clerk-host-sdk-version"
private const val HOST_SDK = "expo"

private fun debugLog(tag: String, message: String) {
    if (BuildConfig.DEBUG) {
        Log.d(tag, message)
    }
}

internal fun biometricReverificationLevel(level: String): SessionVerification.Level? = when (level) {
    "first_factor" -> SessionVerification.Level.FIRST_FACTOR
    "second_factor" -> SessionVerification.Level.SECOND_FACTOR
    "multi_factor" -> SessionVerification.Level.MULTI_FACTOR
    else -> null
}

internal fun biometricReverificationPayload(
    verification: SessionVerification,
    sessionId: String
): Map<String, Any?> = mapOf(
    "id" to verification.id,
    "status" to verification.status.name.lowercase(),
    "level" to verification.level.value,
    "sessionId" to (verification.session?.id ?: sessionId)
)

internal suspend fun verifyBiometricReverification(
    started: SessionVerification,
    verify: suspend (SessionVerification.Level) -> ClerkResult<SessionVerification, ClerkErrorResponse>
): ClerkResult<SessionVerification, ClerkErrorResponse> = when (started.status) {
    SessionVerification.Status.NEEDS_FIRST_FACTOR -> {
        val result = verify(SessionVerification.Level.FIRST_FACTOR)
        if (result is ClerkResult.Success && result.value.status == SessionVerification.Status.NEEDS_SECOND_FACTOR) {
            currentCoroutineContext().ensureActive()
            verify(SessionVerification.Level.SECOND_FACTOR)
        } else {
            result
        }
    }
    SessionVerification.Status.NEEDS_SECOND_FACTOR -> verify(SessionVerification.Level.SECOND_FACTOR)
    SessionVerification.Status.COMPLETE -> ClerkResult.success(started)
    SessionVerification.Status.UNKNOWN -> ClerkResult.unknownFailure(
        IllegalStateException("The server returned an unsupported reverification status.")
    )
}

internal data class BiometricCredentialBridgeError(
    val code: String,
    val message: String
)

internal fun biometricCredentialEnvironmentError(isInitialized: Boolean): BiometricCredentialBridgeError? {
    if (isInitialized) {
        return null
    }

    return BiometricCredentialBridgeError(
        code = "environment_unavailable",
        message = "Biometric credential operations are unavailable until Clerk finishes configuring."
    )
}

internal fun biometricCredentialKeyManagerErrorCode(
    code: BiometricCredentialKeyManagerException.Code
): String = code.name.lowercase()

internal fun biometricCredentialBridgeError(
    throwable: Throwable,
    fallbackCode: String,
    fallbackMessage: String
): BiometricCredentialBridgeError {
    val keyManagerError = throwable as? BiometricCredentialKeyManagerException
    return BiometricCredentialBridgeError(
        code = keyManagerError?.code?.let(::biometricCredentialKeyManagerErrorCode) ?: fallbackCode,
        message = throwable.message ?: fallbackMessage
    )
}

internal fun biometricCredentialBridgeError(
    failure: ClerkResult.Failure<ClerkErrorResponse>,
    fallbackCode: String,
    fallbackMessage: String
): BiometricCredentialBridgeError {
    val apiError = failure.error?.errors?.firstOrNull()
    val throwable = failure.throwable
    val keyManagerError = throwable as? BiometricCredentialKeyManagerException

    return BiometricCredentialBridgeError(
        code = apiError?.code
            ?: keyManagerError?.code?.let(::biometricCredentialKeyManagerErrorCode)
            ?: fallbackCode,
        message = apiError?.longMessage
            ?: apiError?.message
            ?: throwable?.message
            ?: fallbackMessage
    )
}

class ClerkExpoModule : Module() {
    private val coroutineScope = CoroutineScope(Dispatchers.Main)
    private var authFlowStateObserverJob: Job? = null
    private var configuredPublishableKey: String? = null
    private val mainHandler = Handler(Looper.getMainLooper())
    private var clientInvalidationObserverJob: Job? = null
    private val clientInvalidationTracker = ClerkClientInvalidationTracker(
        schedule = { flush -> mainHandler.post(flush) },
        emit = { sendEvent(NATIVE_CLIENT_INVALIDATED_EVENT, emptyMap<String, Any?>()) }
    )

    private data class AuthFlowStateSnapshot(
        val isLoaded: Boolean,
        val isAuthFlowComplete: Boolean
    )

    override fun definition() = ModuleDefinition {
        Name("ClerkExpo")

        Events(NATIVE_AUTH_FLOW_CHANGED_EVENT, NATIVE_CLIENT_INVALIDATED_EVENT)

        OnCreate {
            startAuthFlowStateObserver()
        }

        OnDestroy {
            authFlowStateObserverJob?.cancel()
            authFlowStateObserverJob = null
            clientInvalidationObserverJob?.cancel()
            clientInvalidationObserverJob = null
            mainHandler.removeCallbacksAndMessages(null)
        }

        AsyncFunction("configureNative") { pubKey: String, seedDeviceToken: String?, promise: Promise ->
            configureNative(pubKey, seedDeviceToken, promise)
        }

        AsyncFunction("getDeviceToken") { promise: Promise ->
            getDeviceToken(promise)
        }

        AsyncFunction("setDeviceToken") { token: String?, expected: String?, promise: Promise ->
            setDeviceToken(token, expected, promise)
        }

        AsyncFunction("refreshClient") { promise: Promise ->
            refreshClient(promise)
        }

        AsyncFunction("getAuthFlowState") { promise: Promise ->
            promise.resolve(authFlowStatePayload())
        }

        AsyncFunction("reverifyWithBiometrics") {
                sessionId: String,
                level: String,
                reason: String?,
                promise: Promise ->
            reverifyWithBiometrics(sessionId, level, reason, promise)
        }
    }

    private val reactContext: Context?
        get() = appContext.reactContext

    private fun clerkConfigurationOptions(): ClerkConfigurationOptions {
        val hostSdkVersion = BuildConfig.CLERK_EXPO_VERSION.trim()
        val customHeaders = buildMap {
            put(HOST_SDK_HEADER, HOST_SDK)
            if (hostSdkVersion.isNotEmpty()) {
                put(HOST_SDK_VERSION_HEADER, hostSdkVersion)
            }
        }

        // JS owns client state. The native foreground refresh races SSO completion and mints duplicate clients (#9217).
        return ClerkConfigurationOptions()
            .withForegroundRefreshDisabled()
            .withCustomHeaders(customHeaders)
    }

    private fun startAuthFlowStateObserver() {
        if (authFlowStateObserverJob != null) {
            return
        }

        authFlowStateObserverJob = coroutineScope.launch {
            combine(Clerk.isInitialized, Clerk.isAuthFlowCompleteFlow) { isLoaded, isAuthFlowComplete ->
                AuthFlowStateSnapshot(
                    isLoaded = isLoaded,
                    isAuthFlowComplete = isLoaded && isAuthFlowComplete
                )
            }
                .distinctUntilChanged()
                .collect { state ->
                    sendEvent(NATIVE_AUTH_FLOW_CHANGED_EVENT, authFlowStatePayload(state))
                }
        }
    }

    private fun authFlowStatePayload(
        state: AuthFlowStateSnapshot = AuthFlowStateSnapshot(
            isLoaded = Clerk.isInitialized.value,
            isAuthFlowComplete = Clerk.isInitialized.value && Clerk.isAuthFlowComplete
        )
    ): Map<String, Boolean> {
        return mapOf(
            "isLoaded" to state.isLoaded,
            "isAuthFlowComplete" to state.isAuthFlowComplete
        )
    }

    // MARK: - single-token client sync

    private fun configureNative(pubKey: String, seedDeviceToken: String?, promise: Promise) {
        val context = reactContext ?: run {
            promise.reject("E_CONFIGURE_FAILED", "React context is not available", null)
            return
        }

        coroutineScope.launch {
            try {
                val activePublishableKey = configuredPublishableKey ?: Clerk.publishableKey
                val didConfigure = when {
                    activePublishableKey == null -> {
                        Clerk.initialize(context, pubKey, clerkConfigurationOptions())
                        true
                    }
                    activePublishableKey != pubKey -> {
                        Clerk.switchConfiguration(context, pubKey, clerkConfigurationOptions())
                        true
                    }
                    else -> false
                }
                if (didConfigure) {
                    configuredPublishableKey = pubKey
                    appContext.currentActivity?.let { Clerk.attachActivity(it) }
                    // Must follow initialize(), which resets customTheme.
                    loadThemeFromAssets(context)
                }

                val didAdoptSeed = adoptSeedDeviceTokenIfNeeded(seedDeviceToken)
                startClientInvalidationObserver()
                if (didAdoptSeed) {
                    // An initialization refresh started before the seed was stored is fenced off by the token change.
                    launch {
                        val result = Clerk.refreshClient()
                        if (result is ClerkResult.Failure) {
                            debugLog(TAG, "configureNative - refresh after seed adoption failed: ${result.error}")
                        }
                        clientInvalidationTracker.observe(clientFingerprint())
                    }
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_CONFIGURE_FAILED", "Failed to configure Clerk SDK: ${e.message}", e)
            }
        }
    }

    private suspend fun adoptSeedDeviceTokenIfNeeded(seedDeviceToken: String?): Boolean {
        val seed = seedDeviceToken?.trim()?.takeIf { it.isNotEmpty() } ?: return false
        return withContext(Dispatchers.IO) {
            Clerk.getDeviceToken() == null && Clerk.setDeviceToken(seed, null)
        }
    }

    private fun startClientInvalidationObserver() {
        clientInvalidationTracker.reset(clientFingerprint())
        if (clientInvalidationObserverJob != null) {
            return
        }

        clientInvalidationObserverJob = coroutineScope.launch {
            Clerk.clientFlow.collect { client ->
                clientInvalidationTracker.observe(clientFingerprint(client))
            }
        }
    }

    private fun clientFingerprint(client: Client? = Clerk.clientFlow.value): ClerkClientFingerprint {
        return ClerkClientFingerprint.from(client, currentDeviceToken())
    }

    private fun currentDeviceToken(): String? {
        return try {
            Clerk.getDeviceToken()
        } catch (e: Exception) {
            debugLog(TAG, "getDeviceToken failed: ${e.message}")
            null
        }
    }

    private fun isClerkConfigured(): Boolean = Clerk.publishableKey != null

    private fun getDeviceToken(promise: Promise) {
        if (!isClerkConfigured()) {
            promise.resolve(null)
            return
        }
        try {
            promise.resolve(Clerk.getDeviceToken())
        } catch (e: Exception) {
            promise.reject("E_GET_DEVICE_TOKEN_FAILED", e.message ?: "Unable to read the device token", e)
        }
    }

    private fun setDeviceToken(token: String?, expected: String?, promise: Promise) {
        coroutineScope.launch {
            try {
                val didSet = withContext(Dispatchers.IO) { Clerk.setDeviceToken(token, expected) }
                val fingerprint = clientFingerprint()
                if (didSet) {
                    clientInvalidationTracker.acknowledgeDeviceToken(fingerprint.deviceToken, fingerprint)
                } else {
                    clientInvalidationTracker.observe(fingerprint)
                }
                promise.resolve(didSet)
            } catch (e: Exception) {
                val error = clerkSetDeviceTokenBridgeError(e)
                promise.reject(error.code, error.message, e)
            }
        }
    }

    private fun refreshClient(promise: Promise) {
        if (!isClerkConfigured()) {
            promise.reject(
                "E_NOT_CONFIGURED",
                "Clerk must be configured with configureNative before syncing client state.",
                null
            )
            return
        }

        coroutineScope.launch {
            try {
                val result = Clerk.refreshClient()
                clientInvalidationTracker.observe(clientFingerprint())
                when (result) {
                    is ClerkResult.Success -> promise.resolve(null)
                    is ClerkResult.Failure -> promise.reject(
                        "E_REFRESH_CLIENT_FAILED",
                        result.error?.firstMessage() ?: result.throwable?.message ?: "Client refresh failed",
                        result.throwable
                    )
                }
            } catch (e: Exception) {
                promise.reject("E_REFRESH_CLIENT_FAILED", e.message ?: "Client refresh failed", e)
            }
        }
    }

    // MARK: - biometric reverification

    private fun reverifyWithBiometrics(
        sessionId: String,
        level: String,
        reason: String?,
        promise: Promise
    ) {
        if (!requireBiometricCredentialEnvironment(promise)) return
        val requestedLevel = biometricReverificationLevel(level)
        if (requestedLevel == null) {
            promise.reject("invalid_reverification_level", "Invalid biometric reverification level: $level", null)
            return
        }
        coroutineScope.launch {
            try {
                val session = Clerk.clientFlow.value?.sessions?.firstOrNull { it.id == sessionId }
                if (session == null) {
                    promise.reject(
                        "biometric_reverification_session_unavailable",
                        "The session to reverify is unavailable in the native Clerk client.",
                        null
                    )
                    return@launch
                }
                if (!attachCurrentActivityForBiometricCredential(promise)) return@launch
                val started = when (val result = session.startVerification(requestedLevel)) {
                    is ClerkResult.Success -> result.value
                    is ClerkResult.Failure -> {
                        rejectBiometricCredentialFailure(promise, "E_BIOMETRIC_REVERIFICATION_FAILED",
                            "Unable to start biometric reverification", result)
                        return@launch
                    }
                }
                val result = verifyBiometricReverification(started) { factor ->
                    session.verifyWithBiometrics(promptSubtitle = reason, level = factor)
                }
                when (result) {
                    is ClerkResult.Success -> promise.resolve(biometricReverificationPayload(result.value, sessionId))
                    is ClerkResult.Failure -> rejectBiometricCredentialFailure(
                        promise, "E_BIOMETRIC_REVERIFICATION_FAILED", "Unable to reverify with biometrics", result
                    )
                }
            } catch (e: Exception) {
                rejectBiometricCredentialException(promise, "E_BIOMETRIC_REVERIFICATION_FAILED",
                    "Unable to reverify with biometrics", e)
            }
        }
    }

    private fun requireBiometricCredentialEnvironment(promise: Promise): Boolean {
        val error = biometricCredentialEnvironmentError(Clerk.isInitialized.value) ?: return true
        promise.reject(error.code, error.message, null)
        return false
    }

    private fun attachCurrentActivityForBiometricCredential(promise: Promise): Boolean {
        val activity = appContext.currentActivity
        if (activity == null) {
            promise.reject(
                "environment_unavailable",
                "Biometric authentication requires an active Android activity",
                null
            )
            return false
        }

        Clerk.attachActivity(activity)
        return true
    }

    private fun rejectBiometricCredentialFailure(
        promise: Promise,
        code: String,
        fallbackMessage: String,
        failure: ClerkResult.Failure<ClerkErrorResponse>
    ) {
        val error = biometricCredentialBridgeError(failure, code, fallbackMessage)
        promise.reject(
            error.code,
            error.message,
            failure.throwable
        )
    }

    private fun rejectBiometricCredentialException(
        promise: Promise,
        fallbackCode: String,
        fallbackMessage: String,
        exception: Exception
    ) {
        val error = biometricCredentialBridgeError(exception, fallbackCode, fallbackMessage)
        promise.reject(error.code, error.message, exception)
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
            shadow = json.optStringColor("shadow"),
            secondaryButtonBackground = json.optStringColor("secondaryButtonBackground"),
            secondaryButtonForeground = json.optStringColor("secondaryButtonForeground")
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
