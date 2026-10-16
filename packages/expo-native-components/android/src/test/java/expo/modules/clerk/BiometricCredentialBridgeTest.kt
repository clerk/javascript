package expo.modules.clerk

import com.clerk.api.network.model.error.ClerkErrorResponse
import com.clerk.api.network.model.error.Error as ClerkAPIError
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.signin.SignIn
import com.clerk.api.biometriccredential.BiometricCredential
import com.clerk.api.biometriccredential.BiometricCredentialAvailability
import com.clerk.api.biometriccredential.BiometricCredentialKeyManagerException
import com.clerk.api.biometriccredential.BiometricCredentialPolicy
import com.clerk.api.session.SessionVerification
import kotlinx.coroutines.cancel
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

class BiometricCredentialBridgeTest {
    @Test
    fun `continues the same attempt when the first factor requires a second factor`() = runBlocking {
        val factors = mutableListOf<SessionVerification.Level>()
        val started = SessionVerification(id = "stepup_test", status = SessionVerification.Status.NEEDS_FIRST_FACTOR,
            level = SessionVerification.Level.MULTI_FACTOR)
        val result = verifyBiometricReverification(started) { factor ->
            factors.add(factor)
            ClerkResult.success(started.copy(status = if (factor == SessionVerification.Level.FIRST_FACTOR)
                SessionVerification.Status.NEEDS_SECOND_FACTOR else SessionVerification.Status.COMPLETE))
        }
        assertEquals(listOf(SessionVerification.Level.FIRST_FACTOR, SessionVerification.Level.SECOND_FACTOR), factors)
        assertTrue(result is ClerkResult.Success)
        assertEquals(started.id, (result as ClerkResult.Success).value.id)
        assertEquals(SessionVerification.Status.COMPLETE, result.value.status)
    }

    @Test
    fun `prompts only for the factors still required`() = runBlocking {
        for (status in listOf(SessionVerification.Status.NEEDS_FIRST_FACTOR,
            SessionVerification.Status.NEEDS_SECOND_FACTOR, SessionVerification.Status.COMPLETE)) {
            val factors = mutableListOf<SessionVerification.Level>()
            val started = SessionVerification(status = status, level = SessionVerification.Level.MULTI_FACTOR)
            val result = verifyBiometricReverification(started) { factor ->
                factors.add(factor)
                ClerkResult.success(started.copy(status = SessionVerification.Status.COMPLETE))
            }
            val expected = when (status) {
                SessionVerification.Status.NEEDS_FIRST_FACTOR -> listOf(SessionVerification.Level.FIRST_FACTOR)
                SessionVerification.Status.NEEDS_SECOND_FACTOR -> listOf(SessionVerification.Level.SECOND_FACTOR)
                else -> emptyList()
            }
            assertEquals(expected, factors)
            assertEquals(SessionVerification.Status.COMPLETE, (result as ClerkResult.Success).value.status)
        }
    }

    @Test
    fun `does not retry an incomplete second factor`() = runBlocking {
        val factors = mutableListOf<SessionVerification.Level>()
        val started = SessionVerification(status = SessionVerification.Status.NEEDS_FIRST_FACTOR,
            level = SessionVerification.Level.MULTI_FACTOR)
        val result = verifyBiometricReverification(started) { factor ->
            factors.add(factor)
            ClerkResult.success(started.copy(status = SessionVerification.Status.NEEDS_SECOND_FACTOR))
        }
        assertEquals(listOf(SessionVerification.Level.FIRST_FACTOR, SessionVerification.Level.SECOND_FACTOR), factors)
        assertEquals(SessionVerification.Status.NEEDS_SECOND_FACTOR, (result as ClerkResult.Success).value.status)
    }

    @Test
    fun `preserves first and second factor failures`() = runBlocking {
        for (failingFactor in listOf(SessionVerification.Level.FIRST_FACTOR, SessionVerification.Level.SECOND_FACTOR)) {
            val factors = mutableListOf<SessionVerification.Level>()
            val failure = ClerkResult.apiFailure(ClerkErrorResponse(errors = listOf(
                ClerkAPIError(code = "biometric_authentication_canceled", message = "Canceled")
            )))
            val started = SessionVerification(status = SessionVerification.Status.NEEDS_FIRST_FACTOR,
                level = SessionVerification.Level.MULTI_FACTOR)
            val result = verifyBiometricReverification(started) { factor ->
                factors.add(factor)
                if (factor == failingFactor) failure else
                    ClerkResult.success(started.copy(status = SessionVerification.Status.NEEDS_SECOND_FACTOR))
            }
            assertSame(failure, result)
            assertEquals(if (failingFactor == SessionVerification.Level.FIRST_FACTOR)
                listOf(SessionVerification.Level.FIRST_FACTOR) else
                listOf(SessionVerification.Level.FIRST_FACTOR, SessionVerification.Level.SECOND_FACTOR), factors)
        }
    }

    @Test
    fun `cancellation between factors stops continuation`() = runBlocking {
        val factors = mutableListOf<SessionVerification.Level>()
        val job = launch {
            verifyBiometricReverification(SessionVerification(status = SessionVerification.Status.NEEDS_FIRST_FACTOR,
                level = SessionVerification.Level.MULTI_FACTOR)) { factor ->
                factors.add(factor)
                currentCoroutineContext().cancel()
                ClerkResult.success(SessionVerification(status = SessionVerification.Status.NEEDS_SECOND_FACTOR,
                    level = SessionVerification.Level.MULTI_FACTOR))
            }
        }
        job.join()
        assertTrue(job.isCancelled)
        assertEquals(listOf(SessionVerification.Level.FIRST_FACTOR), factors)
    }

    @Test
    fun `unknown verification status does not prompt`() = runBlocking {
        val result = verifyBiometricReverification(SessionVerification(status = SessionVerification.Status.UNKNOWN,
            level = SessionVerification.Level.MULTI_FACTOR)) {
            throw AssertionError("Unknown verification status must not prompt")
        }
        assertTrue(result is ClerkResult.Failure)
    }

    @Test
    fun `maps biometric reverification requirements`() {
        assertEquals(SessionVerification.Level.FIRST_FACTOR, biometricReverificationLevel("first_factor"))
        assertEquals(SessionVerification.Level.SECOND_FACTOR, biometricReverificationLevel("second_factor"))
        assertEquals(SessionVerification.Level.MULTI_FACTOR, biometricReverificationLevel("multi_factor"))
        assertNull(biometricReverificationLevel("unknown"))
    }

    @Test
    fun `maps reverification results without creating a session`() {
        val result = SessionVerification(
            id = "stepup_test",
            status = SessionVerification.Status.COMPLETE,
            level = SessionVerification.Level.MULTI_FACTOR
        )
        assertEquals(mapOf(
            "id" to "stepup_test",
            "status" to "complete",
            "level" to "multi_factor",
            "sessionId" to "sess_test"
        ), biometricReverificationPayload(result, "sess_test"))
    }

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
