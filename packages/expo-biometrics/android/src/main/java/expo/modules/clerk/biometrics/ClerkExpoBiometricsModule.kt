package expo.modules.clerk.biometrics

import android.content.Context
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class ClerkBiometricsException internal constructor(error: BiometricsError) :
  CodedException(error.code.value, error.message, error.cause)

class BiometricCredentialRecordArgument : Record {
  @Field var id: String = ""
  @Field var localKeyId: String = ""
  @Field var userId: String = ""
  @Field var appIdentifier: String = ""
  @Field var identifierHint: String? = null
  @Field var policy: String = ""
  @Field var createdAt: Double = -1.0
  @Field var updatedAt: Double = -1.0
}

class SaveRecordOptionsArgument : Record {
  @Field var removeOtherRecordsForApp: Boolean = false
}

class ClerkExpoBiometricsModule : Module() {
  private val keyManager = BiometricKeyManager()
  private var cachedStore: BiometricCredentialStore? = null

  override fun definition() = ModuleDefinition {
    Name("ClerkExpoBiometrics")

    Function("getAppIdentifier") { -> context().packageName }

    Function("hashIdentifierHint") { hint: String -> BiometricCredentialCoding.hashIdentifierHint(hint) }

    AsyncFunction("getAvailability") { ->
      val availability = keyManager.availability(context())
      mapOf(
        "biometryType" to availability.biometryType,
        "canEvaluateBiometrics" to availability.canEvaluateBiometrics,
        "canEvaluateDeviceOwner" to availability.canEvaluateDeviceOwner,
        "errorCode" to availability.errorCode?.value,
        "secureKeyStorageAvailable" to availability.secureKeyStorageAvailable,
      )
    }

    AsyncFunction("createKey") { policy: String ->
      bridge {
        val parsed =
          BiometricCredentialPolicy.fromValue(policy)
            ?: throw BiometricsError(BiometricsErrorCode.INVALID_ARGUMENT, "Unknown biometric credential policy '$policy'.")
        val key = keyManager.createKey(context(), parsed)
        mapOf("localKeyId" to key.localKeyId, "publicKeyJwk" to key.publicKeyJwk)
      }
    }

    AsyncFunction("sign") { localKeyId: String, clientData: String, reason: String?, promise: Promise ->
      try {
        val activity =
          appContext.currentActivity as? FragmentActivity
            ?: throw BiometricsError(BiometricsErrorCode.SIGNING_FAILED, "Signing requires a foreground FragmentActivity.")
        keyManager.sign(activity, localKeyId, clientData, reason) { result ->
          result.fold(promise::resolve) { error -> promise.reject(codedException(error)) }
        }
      } catch (e: Throwable) {
        promise.reject(codedException(e))
      }
    }

    AsyncFunction("hasKey") { localKeyId: String -> bridge { keyManager.hasKey(localKeyId) } }

    AsyncFunction("deleteKey") { localKeyId: String -> bridge { keyManager.deleteKey(localKeyId) } }

    AsyncFunction("listRecords") { -> storeCall { store().listRecordsJson() } }

    AsyncFunction("saveRecord") { record: BiometricCredentialRecordArgument, options: SaveRecordOptionsArgument ->
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

    AsyncFunction("deleteRecord") { localKeyId: String -> storeCall { store().deleteRecords(localKeyId) } }

    // Uninstalling wipes both noBackupFilesDir and the app's Keystore keys, so no reinstall marker is needed.
    AsyncFunction("ensureInstallationMarker") { -> mapOf("wiped" to false) }
  }

  private fun context(): Context =
    appContext.reactContext?.applicationContext ?: throw CodedException("storage_failed", "The React context is not available.", null)

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
