@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import com.clerk.api.Clerk
import com.clerk.api.ClerkConfigurationOptions
import com.clerk.api.FrameworkIntegrationApi
import java.io.IOException
import kotlinx.coroutines.CancellationException

internal const val HOST_SDK_HEADER = "x-clerk-host-sdk"
internal const val HOST_SDK_VERSION_HEADER = "x-clerk-host-sdk-version"
internal const val HOST_SDK = "expo"

internal fun clerkConfigurationOptions(
    proxyUrl: String?,
    updateRequiredViewEnabled: Boolean,
    hostSignsRequests: Boolean,
    hostSdkVersion: String,
): ClerkConfigurationOptions {
    val customHeaders = buildMap {
        put(HOST_SDK_HEADER, HOST_SDK)
        if (hostSdkVersion.isNotEmpty()) {
            put(HOST_SDK_VERSION_HEADER, hostSdkVersion)
        }
    }

    // JS owns client state. The native foreground refresh races SSO completion and mints duplicate clients (#9217).
    var options = ClerkConfigurationOptions(proxyUrl = proxyUrl).withForegroundRefreshDisabled()
    if (!updateRequiredViewEnabled) {
        options = options.withUpdateRequiredViewDisabled()
    }
    if (hostSignsRequests) {
        options = options.withHostSignsRequests()
    }
    return options.withCustomHeaders(customHeaders)
}

internal data class ClerkDpopBridgeError(val code: String, val message: String)

internal sealed interface ClerkDpopProofResult {
    data class Proof(val value: String?) : ClerkDpopProofResult

    data class Failure(val error: ClerkDpopBridgeError, val cause: Throwable) : ClerkDpopProofResult
}

internal class ClerkDpopBridge(
    private val sign: suspend (method: String, url: String, authorization: String?) -> String? = Clerk::deviceBindingProof,
    private val recordDate: (date: String) -> Unit = Clerk::recordServerDate,
) {
    suspend fun createDpopProof(method: String, url: String, authorization: String?): ClerkDpopProofResult =
        try {
            ClerkDpopProofResult.Proof(sign(method, url, authorization))
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            ClerkDpopProofResult.Failure(dpopBridgeError(e), e)
        }

    fun recordServerDate(date: String) {
        recordDate(date)
    }
}

private fun dpopBridgeError(throwable: Throwable): ClerkDpopBridgeError = when (throwable) {
    is IOException -> ClerkDpopBridgeError(
        "E_DPOP_PROOF_UNAVAILABLE",
        throwable.message ?: "The device key cannot sign this request yet"
    )
    is IllegalArgumentException -> ClerkDpopBridgeError(
        "E_DPOP_INVALID_REQUEST",
        throwable.message ?: "The request cannot be signed"
    )
    else -> ClerkDpopBridgeError(
        "E_DPOP_PROOF_FAILED",
        throwable.message ?: "Unable to sign the request"
    )
}
