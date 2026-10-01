package expo.modules.clerk.biometrics

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import androidx.fragment.app.FragmentActivity
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
class BiometricKeyManagerTest {
  @Test
  fun `secure key storage requires Android 9`() {
    assertFalse(BiometricKeyManager.secureKeyStorageAvailable(sdkInt = 27))
    assertTrue(BiometricKeyManager.secureKeyStorageAvailable(sdkInt = 28))
    assertTrue(BiometricKeyManager.secureKeyStorageAvailable(sdkInt = 36))
  }

  @Test
  @Config(sdk = [27])
  fun `availability reports no secure key storage before Android 9`() {
    val availability = BiometricKeyManager().availability(RuntimeEnvironment.getApplication())

    assertFalse(availability.secureKeyStorageAvailable)
    assertFalse(availability.canEvaluateBiometrics)
    assertEquals(BiometricsErrorCode.BIOMETRY_NOT_AVAILABLE, availability.errorCode)
  }

  @Test
  @Config(sdk = [28])
  fun `availability reports secure key storage on Android 9 and later`() {
    assertTrue(BiometricKeyManager().availability(RuntimeEnvironment.getApplication()).secureKeyStorageAvailable)
  }

  @Test
  @Config(sdk = [27])
  fun `createKey rejects with secure_key_storage_unavailable before Android 9`() {
    for (policy in BiometricCredentialPolicy.entries) {
      val error =
        assertThrows(BiometricsError::class.java) {
          BiometricKeyManager().createKey(RuntimeEnvironment.getApplication(), policy)
        }
      assertEquals(BiometricsErrorCode.SECURE_KEY_STORAGE_UNAVAILABLE, error.code)
    }
  }

  @Test
  @Config(sdk = [27])
  fun `sign rejects with secure_key_storage_unavailable before Android 9`() {
    val activity = Robolectric.buildActivity(FragmentActivity::class.java).setup().get()
    val error =
      assertThrows(BiometricsError::class.java) {
        BiometricKeyManager().sign(activity, "tdlk_0", "client-data", null) {}
      }
    assertEquals(BiometricsErrorCode.SECURE_KEY_STORAGE_UNAVAILABLE, error.code)
  }

  @Test
  fun `the prompt is only shown before state is saved`() {
    val controller = Robolectric.buildActivity(FragmentActivity::class.java).setup()
    assertTrue(BiometricKeyManager.canShowPrompt(controller.get()))

    controller.pause().stop()
    assertFalse(BiometricKeyManager.canShowPrompt(controller.get()))

    controller.start().resume()
    assertTrue(BiometricKeyManager.canShowPrompt(controller.get()))

    controller.pause().stop().destroy()
    assertFalse(BiometricKeyManager.canShowPrompt(controller.get()))
  }
}
