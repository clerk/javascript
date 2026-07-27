package expo.modules.clerk

import com.clerk.api.network.model.error.ClerkErrorResponse
import com.clerk.api.network.model.error.Error as ClerkAPIError
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.signin.SignIn
import com.clerk.api.trusteddevice.TrustedDevice
import com.clerk.api.trusteddevice.TrustedDeviceAvailability
import com.clerk.api.trusteddevice.TrustedDeviceKeyManagerException
import com.clerk.api.trusteddevice.TrustedDevicePolicy
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class TrustedDeviceBridgeTest {
    @Test
    fun `maps trusted-device availability to the JavaScript contract`() {
        assertEquals(
            mapOf("isAvailable" to true, "unavailableReason" to null),
            trustedDeviceAvailabilityPayload(TrustedDeviceAvailability.Available)
        )
        assertEquals(
            mapOf(
                "isAvailable" to false,
                "unavailableReason" to "biometric_authentication_unavailable"
            ),
            trustedDeviceAvailabilityPayload(
                TrustedDeviceAvailability.Unavailable(
                    TrustedDeviceAvailability.UnavailableReason.BIOMETRIC_AUTHENTICATION_UNAVAILABLE
                )
            )
        )
    }

    @Test
    fun `maps trusted-device resources to the JavaScript contract`() {
        val payload = trustedDevicePayload(
            TrustedDevice(
                id = "td_123",
                platform = TrustedDevice.Platform.ANDROID,
                appIdentifier = "com.example.app",
                name = "Pixel",
                status = TrustedDevice.Status.ACTIVE,
                createdAt = 1_700_000_000_000,
                updatedAt = 1_700_000_100_000,
                lastUsedAt = 1_700_000_200_000
            )
        )

        assertEquals("trusted_device", payload["object"])
        assertEquals("android", payload["platform"])
        assertEquals("active", payload["status"])
        assertEquals("ES256", payload["algorithm"])
        assertEquals(1_700_000_200_000, payload["lastUsedAt"])
        assertNull(payload["revokedAt"])
    }

    @Test
    fun `maps every supported authentication policy`() {
        assertEquals(
            TrustedDevicePolicy.BIOMETRY_CURRENT_SET,
            trustedDevicePolicy("biometry_current_set")
        )
        assertEquals(TrustedDevicePolicy.BIOMETRY_ANY, trustedDevicePolicy("biometry_any"))
        assertEquals(
            TrustedDevicePolicy.BIOMETRY_OR_DEVICE_PASSCODE,
            trustedDevicePolicy("biometry_or_device_passcode")
        )
        assertNull(trustedDevicePolicy("unsupported"))
    }

    @Test
    fun `maps trusted-device sign-in results`() {
        assertEquals(
            mapOf("status" to "complete", "createdSessionId" to "sess_123"),
            trustedDeviceSignInPayload(
                SignIn(
                    id = "sia_123",
                    status = SignIn.Status.COMPLETE,
                    createdSessionId = "sess_123"
                )
            )
        )
    }

    @Test
    fun `preserves Clerk API error codes and detailed messages`() {
        val failure = ClerkResult.apiFailure(
            ClerkErrorResponse(
                errors = listOf(
                    ClerkAPIError(
                        code = "trusted_device_not_registered",
                        message = "Trusted device not found.",
                        longMessage = "This device is no longer registered as trusted."
                    )
                )
            )
        )

        assertEquals(
            TrustedDeviceBridgeError(
                code = "trusted_device_not_registered",
                message = "This device is no longer registered as trusted."
            ),
            trustedDeviceBridgeError(
                failure = failure,
                fallbackCode = "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
                fallbackMessage = "Unable to sign in with trusted device"
            )
        )
    }

    @Test
    fun `normalizes native key-manager error codes`() {
        assertEquals(
            "biometric_authentication_canceled",
            trustedDeviceKeyManagerErrorCode(
                TrustedDeviceKeyManagerException.Code.BIOMETRIC_AUTHENTICATION_CANCELED
            )
        )
        assertEquals(
            "key_invalidated",
            trustedDeviceKeyManagerErrorCode(TrustedDeviceKeyManagerException.Code.KEY_INVALIDATED)
        )
    }
}
