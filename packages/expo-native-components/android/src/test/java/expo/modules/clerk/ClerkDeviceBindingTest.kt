@file:OptIn(FrameworkIntegrationApi::class)

package expo.modules.clerk

import com.clerk.api.FrameworkIntegrationApi
import java.io.IOException
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

class ClerkDeviceBindingTest {
    @Test
    fun `options carry the host signing opt-in only when JS asks for it`() {
        val signing = clerkConfigurationOptions(null, updateRequiredViewEnabled = true, hostSignsRequests = true, hostSdkVersion = "4.3.0")
        val unsigned = clerkConfigurationOptions(null, updateRequiredViewEnabled = true, hostSignsRequests = false, hostSdkVersion = "4.3.0")

        assertTrue(signing.hostSignsRequests)
        assertFalse(unsigned.hostSignsRequests)
    }

    @Test
    fun `options always name Expo as the host and keep the other settings`() {
        val options = clerkConfigurationOptions(
            proxyUrl = "https://example.com/__clerk",
            updateRequiredViewEnabled = false,
            hostSignsRequests = true,
            hostSdkVersion = "4.3.0",
        )

        assertEquals(mapOf(HOST_SDK_HEADER to HOST_SDK, HOST_SDK_VERSION_HEADER to "4.3.0"), options.customHeaders)
        assertEquals("https://example.com/__clerk", options.proxyUrl)
        assertFalse(options.updateRequiredViewEnabled)
        assertFalse(options.autoRefreshOnForeground)
    }

    @Test
    fun `a proof from the native SDK reaches JS with the request it was asked for`() = runBlocking {
        val calls = mutableListOf<Triple<String, String, String?>>()
        val bridge = ClerkDpopBridge(sign = { method, url, authorization ->
            calls += Triple(method, url, authorization)
            "proof"
        })

        val result = bridge.createDpopProof("POST", "https://clerk.example.com/v1/client", "token")

        assertEquals(ClerkDpopProofResult.Proof("proof"), result)
        assertEquals(listOf(Triple("POST", "https://clerk.example.com/v1/client", "token")), calls)
    }

    @Test
    fun `a request the native SDK sends unsigned resolves to null`() = runBlocking {
        val bridge = ClerkDpopBridge(sign = { _, _, _ -> null })

        assertEquals(ClerkDpopProofResult.Proof(null), bridge.createDpopProof("GET", "https://clerk.example.com/v1/client", null))
    }

    @Test
    fun `a bound token the key cannot sign for rejects`() = runBlocking {
        val failure = IOException("A device-bound request needs a DPoP proof: KEY_NOT_READY")
        val bridge = ClerkDpopBridge(sign = { _, _, _ -> throw failure })

        val result = bridge.createDpopProof("GET", "https://clerk.example.com/v1/client", "token")

        assertTrue(result is ClerkDpopProofResult.Failure)
        result as ClerkDpopProofResult.Failure
        assertEquals("E_DPOP_PROOF_UNAVAILABLE", result.error.code)
        assertSame(failure, result.cause)
    }

    @Test
    fun `a URL the native SDK cannot sign rejects as an invalid request`() = runBlocking {
        val bridge = ClerkDpopBridge(sign = { _, _, _ -> throw IllegalArgumentException("not http") })

        val result = bridge.createDpopProof("GET", "not a url", null) as ClerkDpopProofResult.Failure

        assertEquals("E_DPOP_INVALID_REQUEST", result.error.code)
    }

    @Test
    fun `a server date reaches the native clock`() {
        val dates = mutableListOf<String>()
        val bridge = ClerkDpopBridge(sign = { _, _, _ -> null }, recordDate = { dates += it })

        bridge.recordServerDate("Wed, 18 Nov 2026 12:00:00 GMT")

        assertEquals(listOf("Wed, 18 Nov 2026 12:00:00 GMT"), dates)
    }
}
