package expo.modules.clerk.biometrics

import android.content.Context
import android.os.Build
import android.security.keystore.KeyInfo
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import androidx.annotation.RequiresApi
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import java.security.KeyFactory
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.interfaces.ECPublicKey
import java.util.concurrent.atomic.AtomicBoolean

internal data class BiometricAvailability(
  val biometryType: String,
  val canEvaluateBiometrics: Boolean,
  val canEvaluateDeviceOwner: Boolean,
  val errorCode: BiometricsErrorCode?,
  val secureKeyStorageAvailable: Boolean,
)

internal data class BiometricCredentialKey(val localKeyId: String, val publicKeyJwk: String)

/** Android Keystore keys laid out as clerk-android's `DefaultBiometricCredentialKeyManager` creates them. */
internal class BiometricKeyManager {
  fun availability(context: Context): BiometricAvailability {
    if (!secureKeyStorageAvailable()) {
      return BiometricAvailability("none", false, false, BiometricsErrorCode.BIOMETRY_NOT_AVAILABLE, false)
    }
    val manager = BiometricManager.from(context)
    val strong = manager.canAuthenticate(Authenticators.BIOMETRIC_STRONG)
    val canEvaluateBiometrics = strong == BiometricManager.BIOMETRIC_SUCCESS
    // Keys only accept device credentials on API 30+; before that, device owner authentication cannot sign.
    val canEvaluateDeviceOwner =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        manager.canAuthenticate(Authenticators.BIOMETRIC_STRONG or Authenticators.DEVICE_CREDENTIAL) ==
          BiometricManager.BIOMETRIC_SUCCESS
      } else {
        canEvaluateBiometrics
      }
    return BiometricAvailability(
      biometryType = biometryType(strong),
      canEvaluateBiometrics = canEvaluateBiometrics,
      canEvaluateDeviceOwner = canEvaluateDeviceOwner,
      errorCode = if (canEvaluateBiometrics) null else BiometricsError.forCanAuthenticate(strong).code,
      secureKeyStorageAvailable = true,
    )
  }

  fun createKey(context: Context, policy: BiometricCredentialPolicy): BiometricCredentialKey {
    if (!secureKeyStorageAvailable()) {
      throw BiometricsError(
        BiometricsErrorCode.SECURE_KEY_STORAGE_UNAVAILABLE,
        "Biometric credential keys require Android 9 (API 28) or later.",
      )
    }
    val status = BiometricManager.from(context).canAuthenticate(promptAuthenticators(policy))
    if (status != BiometricManager.BIOMETRIC_SUCCESS) {
      throw BiometricsError.forCanAuthenticate(status)
    }

    val localKeyId = BiometricCredentialCoding.makeLocalKeyId()
    try {
      val generator = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, ANDROID_KEY_STORE)
      generator.initialize(BiometricCredentialCoding.keyGenParameterSpec(localKeyId, policy))
      val publicKey = generator.generateKeyPair().public as ECPublicKey
      return BiometricCredentialKey(
        localKeyId = localKeyId,
        publicKeyJwk = BiometricCredentialCoding.publicKeyJwk(publicKey.w.affineX, publicKey.w.affineY),
      )
    } catch (e: Exception) {
      runCatching { deleteKey(localKeyId) }
      throw BiometricsError(
        BiometricsErrorCode.KEY_GENERATION_FAILED,
        e.message ?: "Unable to create the biometric credential key.",
        e,
      )
    }
  }

  fun hasKey(localKeyId: String): Boolean =
    storageCall { keyStore().containsAlias(BiometricCredentialCoding.keyAlias(localKeyId)) }

  fun deleteKey(localKeyId: String) =
    storageCall {
      val keyStore = keyStore()
      val alias = BiometricCredentialCoding.keyAlias(localKeyId)
      if (keyStore.containsAlias(alias)) keyStore.deleteEntry(alias)
    }

  /** Shows the biometric prompt on [activity] and signs the UTF-8 bytes of [clientData] with the unlocked key. */
  fun sign(
    activity: FragmentActivity,
    localKeyId: String,
    clientData: String,
    reason: String?,
    onResult: (Result<String>) -> Unit,
  ) {
    requireSupportedSdk()
    val privateKey =
      storageCall { keyStore().getKey(BiometricCredentialCoding.keyAlias(localKeyId), null) as? PrivateKey }
        ?: throw BiometricsError(BiometricsErrorCode.KEY_NOT_FOUND, "The biometric credential key was not found.")
    val signature =
      try {
        Signature.getInstance(BiometricCredentialCoding.SIGNATURE_ALGORITHM).apply { initSign(privateKey) }
      } catch (e: KeyPermanentlyInvalidatedException) {
        throw BiometricsError(BiometricsErrorCode.KEY_INVALIDATED, "The biometric credential key was invalidated.", e)
      } catch (e: Exception) {
        throw BiometricsError(BiometricsErrorCode.SIGNING_FAILED, e.message ?: "Unable to initialize signing.", e)
      }
    val allowsDeviceCredential = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && keyAllowsDeviceCredential(privateKey)
    val title = reason?.takeIf { it.isNotBlank() } ?: activity.applicationInfo.loadLabel(activity.packageManager).toString()

    val completed = AtomicBoolean(false)
    val complete = { result: Result<String> -> if (completed.compareAndSet(false, true)) onResult(result) }
    val callback =
      object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
          val unlocked = result.cryptoObject?.signature ?: signature
          complete(
            runCatching {
              unlocked.update(clientData.toByteArray(Charsets.UTF_8))
              BiometricCredentialCoding.base64UrlEncode(BiometricCredentialCoding.rawES256SignatureFromDer(unlocked.sign()))
            }.recoverCatching { e ->
              throw e as? BiometricsError
                ?: BiometricsError(BiometricsErrorCode.SIGNING_FAILED, e.message ?: "Unable to sign the challenge.", e)
            }
          )
        }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
          complete(Result.failure(BiometricsError.forPromptError(errorCode, errString)))
        }
      }

    activity.runOnUiThread {
      try {
        val promptInfo =
          BiometricPrompt.PromptInfo.Builder().setTitle(title).apply {
            if (allowsDeviceCredential) {
              setAllowedAuthenticators(Authenticators.BIOMETRIC_STRONG or Authenticators.DEVICE_CREDENTIAL)
            } else {
              setAllowedAuthenticators(Authenticators.BIOMETRIC_STRONG)
              setNegativeButtonText(activity.getString(android.R.string.cancel))
            }
          }.build()
        BiometricPrompt(activity, ContextCompat.getMainExecutor(activity), callback)
          .authenticate(promptInfo, BiometricPrompt.CryptoObject(signature))
      } catch (e: Exception) {
        complete(
          Result.failure(
            BiometricsError(BiometricsErrorCode.AUTHENTICATION_FAILED, e.message ?: "Unable to show the prompt.", e)
          )
        )
      }
    }
  }

  // The key's own protections decide whether a device credential can unlock it, so keys created for
  // biometry_or_device_passcode on API 28-29 stay biometric-only after an OS upgrade.
  @RequiresApi(Build.VERSION_CODES.R)
  private fun keyAllowsDeviceCredential(key: PrivateKey): Boolean =
    runCatching {
      val info = KeyFactory.getInstance(key.algorithm, ANDROID_KEY_STORE).getKeySpec(key, KeyInfo::class.java)
      info.userAuthenticationType and KeyProperties.AUTH_DEVICE_CREDENTIAL != 0
    }.getOrDefault(false)

  private fun requireSupportedSdk() {
    if (Build.VERSION.SDK_INT < BiometricCredentialCoding.MIN_SDK) {
      throw BiometricsError(BiometricsErrorCode.BIOMETRY_NOT_AVAILABLE, "Biometric credentials require Android 9 (API 28) or later.")
    }
  }

  private fun keyStore(): KeyStore = KeyStore.getInstance(ANDROID_KEY_STORE).apply { load(null) }

  private fun <T> storageCall(body: () -> T): T =
    try {
      body()
    } catch (e: BiometricsError) {
      throw e
    } catch (e: Exception) {
      throw BiometricsError(BiometricsErrorCode.STORAGE_FAILED, e.message ?: "Android Keystore access failed.", e)
    }

  companion object {
    private const val ANDROID_KEY_STORE = "AndroidKeyStore"

    fun secureKeyStorageAvailable(sdkInt: Int = Build.VERSION.SDK_INT): Boolean = sdkInt >= BiometricCredentialCoding.MIN_SDK

    /** Contract v2 section 2: device credentials only for biometry_or_device_passcode, and only on API 30+. */
    fun promptAuthenticators(policy: BiometricCredentialPolicy, sdkInt: Int = Build.VERSION.SDK_INT): Int =
      if (policy == BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE && sdkInt >= Build.VERSION_CODES.R) {
        Authenticators.BIOMETRIC_STRONG or Authenticators.DEVICE_CREDENTIAL
      } else {
        Authenticators.BIOMETRIC_STRONG
      }

    /** Android does not report which biometric is Class 3, so any present strong biometric is `biometric`. */
    fun biometryType(canAuthenticateStrong: Int): String =
      when (canAuthenticateStrong) {
        BiometricManager.BIOMETRIC_SUCCESS,
        BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED,
        BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE,
        BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> "biometric"
        else -> "none"
      }
  }
}
