package expo.modules.clerk.biometrics

import android.content.Context
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.exception.CodedException
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.Record
import io.github.expo.modules.v2.react.androidContextOrNull
import io.github.expo.modules.v2.react.currentActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext

class ClerkBiometricsException internal constructor(error: BiometricsError) :
  CodedException(error.code.value, error.message, error.cause)

@Record
data class BiometricCredentialRecordArgument(
  val id: String = "",
  val localKeyId: String = "",
  val userId: String = "",
  val appIdentifier: String = "",
  val identifierHint: String? = null,
  val policy: String = "",
  val createdAt: Double = -1.0,
  val updatedAt: Double = -1.0,
)

@Record
data class SaveRecordOptionsArgument(val removeOtherRecordsForApp: Boolean = false)

@Record
data class BiometricAvailabilityResult(
  val biometryType: String,
  val canEvaluateBiometrics: Boolean,
  val canEvaluateDeviceOwner: Boolean,
  val errorCode: String?,
  val secureKeyStorageAvailable: Boolean,
)

@Record
data class BiometricCredentialKeyResult(val localKeyId: String, val publicKeyJwk: String)

@Record
data class InstallationMarkerResult(val wiped: Boolean)

@ExpoModule("ClerkExpoBiometrics")
class ClerkExpoBiometricsModule : Module() {
  private val keyManager = BiometricKeyManager()
  private var cachedStore: BiometricCredentialStore? = null

  @JS
  fun getAppIdentifier(): String = context().packageName

  @JS
  fun hashIdentifierHint(hint: String): String? = BiometricCredentialCoding.hashIdentifierHint(hint)

  @JS
  suspend fun getAvailability(): BiometricAvailabilityResult =
    withContext(Dispatchers.IO) {
      val availability = keyManager.availability(context())
      BiometricAvailabilityResult(
        biometryType = availability.biometryType,
        canEvaluateBiometrics = availability.canEvaluateBiometrics,
        canEvaluateDeviceOwner = availability.canEvaluateDeviceOwner,
        errorCode = availability.errorCode?.value,
        secureKeyStorageAvailable = availability.secureKeyStorageAvailable,
      )
    }

  @JS
  suspend fun createKey(policy: String): BiometricCredentialKeyResult =
    withContext(Dispatchers.IO) {
      bridge {
        val parsed =
          BiometricCredentialPolicy.fromValue(policy)
            ?: throw BiometricsError(BiometricsErrorCode.INVALID_ARGUMENT, "Unknown biometric credential policy '$policy'.")
        val key = keyManager.createKey(context(), parsed)
        BiometricCredentialKeyResult(localKeyId = key.localKeyId, publicKeyJwk = key.publicKeyJwk)
      }
    }

  @JS
  suspend fun sign(localKeyId: String, clientData: String, reason: String?): String =
    try {
      val activity =
        currentActivity as? FragmentActivity
          ?: throw BiometricsError(BiometricsErrorCode.SIGNING_FAILED, "Signing requires a foreground FragmentActivity.")
      withContext(Dispatchers.IO) {
        suspendCancellableCoroutine { continuation ->
          keyManager.sign(activity, localKeyId, clientData, reason, continuation::resumeWith)
        }
      }
    } catch (e: Throwable) {
      throw codedException(e)
    }

  @JS
  suspend fun hasKey(localKeyId: String): Boolean = withContext(Dispatchers.IO) { bridge { keyManager.hasKey(localKeyId) } }

  @JS
  suspend fun deleteKey(localKeyId: String): Unit =
    withContext(Dispatchers.IO) { bridge { keyManager.deleteKey(localKeyId) } }

  @JS
  suspend fun listRecords(): String = withContext(Dispatchers.IO) { storeCall { store().listRecordsJson() } }

  @JS
  suspend fun saveRecord(record: BiometricCredentialRecordArgument, options: SaveRecordOptionsArgument): Unit =
    withContext(Dispatchers.IO) {
      storeCall {
        val input =
          BiometricCredentialRecordInput(
            id = record.id,
            localKeyId = record.localKeyId,
            userId = record.userId,
            appIdentifier = record.appIdentifier,
            identifierHint = record.identifierHint,
            policy = record.policy,
            createdAt = record.createdAt,
            updatedAt = record.updatedAt,
          )
        store().save(input, options.removeOtherRecordsForApp)
      }
    }

  @JS
  suspend fun deleteRecord(localKeyId: String): Unit =
    withContext(Dispatchers.IO) { storeCall { store().deleteRecords(localKeyId) } }

  // Uninstalling wipes both noBackupFilesDir and the app's Keystore keys, so no reinstall marker is needed.
  @JS
  suspend fun ensureInstallationMarker(): InstallationMarkerResult = InstallationMarkerResult(wiped = false)

  private fun context(): Context =
    androidContextOrNull?.applicationContext ?: throw CodedException("storage_failed", "The React context is not available.", null)

  @Synchronized
  private fun store(): BiometricCredentialStore =
    cachedStore
      ?: BiometricCredentialStore(
        BiometricCredentialFileStore.inDirectory(context().noBackupFilesDir),
        keyManager::deleteKey,
      ).also { cachedStore = it }

  private fun <T> bridge(body: () -> T): T =
    try {
      body()
    } catch (e: BiometricsError) {
      throw ClerkBiometricsException(e)
    }

  private fun <T> storeCall(body: () -> T): T =
    try {
      body()
    } catch (e: CodedException) {
      throw e
    } catch (e: BiometricsError) {
      throw ClerkBiometricsException(e)
    } catch (e: Exception) {
      throw CodedException("storage_failed", e.message ?: "The biometric credential store failed.", e)
    }

  private fun codedException(error: Throwable): CodedException =
    when (error) {
      is CodedException -> error
      is BiometricsError -> ClerkBiometricsException(error)
      else -> CodedException("unknown", error.message ?: "Biometric signing failed.", error)
    }
}
