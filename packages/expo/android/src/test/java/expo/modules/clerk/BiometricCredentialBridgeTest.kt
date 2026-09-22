package expo.modules.clerk

import com.clerk.api.network.model.error.ClerkErrorResponse
import com.clerk.api.network.model.error.Error as ClerkAPIError
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.signin.SignIn
import com.clerk.api.biometriccredential.BiometricCredential
import com.clerk.api.biometriccredential.BiometricCredentialAvailability
import com.clerk.api.biometriccredential.BiometricCredentialKeyManagerException
import com.clerk.api.biometriccredential.BiometricCredentialPolicy
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class BiometricCredentialBridgeTest {
    private fun keyManagerException(
        code: BiometricCredentialKeyManagerException.Code,
        message: String
    ): BiometricCredentialKeyManagerException {
        val constructor = BiometricCredentialKeyManagerException::class.java.getDeclaredConstructor(
            BiometricCredentialKeyManagerException.Code::class.java,
            String::class.java,
            Throwable::class.java
        )
        constructor.isAccessible = true
        return constructor.newInstance(code, message, null)
    }

    @Test
    fun `requires Clerk initialization before biometric-credential operations`() {
        assertEquals(
            BiometricCredentialBridgeError(
                code = "environment_unavailable",
                message = "Biometric credential operations are unavailable until Clerk finishes configuring."
            ),
            biometricCredentialEnvironmentError(isInitialized = false)
        )
        assertNull(biometricCredentialEnvironmentError(isInitialized = true))
    }

    @Test
    fun `reports unavailable biometric credentials before Clerk initialization`() {
        assertEquals(
            mapOf(
                "isAvailable" to false,
                "unavailableReason" to "environment_unavailable"
            ),
            biometricCredentialEnvironmentAvailabilityPayload(isInitialized = false)
        )
        assertNull(biometricCredentialEnvironmentAvailabilityPayload(isInitialized = true))
    }

    @Test
    fun `maps biometric-credential availability to the JavaScript contract`() {
        assertEquals(
            mapOf("isAvailable" to true, "unavailableReason" to null),
            biometricCredentialAvailabilityPayload(BiometricCredentialAvailability.Available)
        )
        assertEquals(
            mapOf(
                "isAvailable" to false,
                "unavailableReason" to "biometric_authentication_unavailable"
            ),
            biometricCredentialAvailabilityPayload(
                BiometricCredentialAvailability.Unavailable(
                    BiometricCredentialAvailability.UnavailableReason.BIOMETRIC_AUTHENTICATION_UNAVAILABLE
                )
            )
        )
    }

    @Test
    fun `maps biometric-credential resources to the JavaScript contract`() {
        val payload = biometricCredentialPayload(
            BiometricCredential(
                id = "td_123",
                platform = BiometricCredential.Platform.ANDROID,
                appIdentifier = "com.example.app",
                name = "Pixel",
                status = BiometricCredential.Status.ACTIVE,
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
            BiometricCredentialPolicy.BIOMETRY_CURRENT_SET,
            biometricCredentialPolicy("biometry_current_set")
        )
        assertEquals(BiometricCredentialPolicy.BIOMETRY_ANY, biometricCredentialPolicy("biometry_any"))
        assertEquals(
            BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE,
            biometricCredentialPolicy("biometry_or_device_passcode")
        )
        assertNull(biometricCredentialPolicy("unsupported"))
    }

    @Test
    fun `maps biometric sign-in results`() {
        assertEquals(
            mapOf(
                "id" to "sia_123",
                "status" to "complete",
                "createdSessionId" to "sess_123"
            ),
            biometricSignInPayload(
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
                        message = "Biometric credential not found.",
                        longMessage = "This device is no longer registered as trusted."
                    )
                )
            )
        )

        assertEquals(
            BiometricCredentialBridgeError(
                code = "trusted_device_not_registered",
                message = "This device is no longer registered as trusted."
            ),
            biometricCredentialBridgeError(
                failure = failure,
                fallbackCode = "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
                fallbackMessage = "Unable to sign in with biometric credential"
            )
        )
    }

    @Test
    fun `normalizes key-manager exceptions from bridge operations`() {
        assertEquals(
            BiometricCredentialBridgeError(
                code = "key_invalidated",
                message = "The biometric credential key was invalidated."
            ),
            biometricCredentialBridgeError(
                throwable = keyManagerException(
                    BiometricCredentialKeyManagerException.Code.KEY_INVALIDATED,
                    "The biometric credential key was invalidated."
                ),
                fallbackCode = "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
                fallbackMessage = "Unable to sign in with biometric credential"
            )
        )
    }

    @Test
    fun `uses fallback details for plain bridge exceptions`() {
        assertEquals(
            BiometricCredentialBridgeError(
                code = "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
                message = "Unable to sign in with biometric credential"
            ),
            biometricCredentialBridgeError(
                throwable = Exception(),
                fallbackCode = "E_TRUSTED_DEVICE_SIGN_IN_FAILED",
                fallbackMessage = "Unable to sign in with biometric credential"
            )
        )
    }

    @Test
    fun `normalizes native key-manager error codes`() {
        assertEquals(
            "biometric_authentication_canceled",
            biometricCredentialKeyManagerErrorCode(
                BiometricCredentialKeyManagerException.Code.BIOMETRIC_AUTHENTICATION_CANCELED
            )
        )
        assertEquals(
            "key_invalidated",
            biometricCredentialKeyManagerErrorCode(BiometricCredentialKeyManagerException.Code.KEY_INVALIDATED)
        )
    }
}
