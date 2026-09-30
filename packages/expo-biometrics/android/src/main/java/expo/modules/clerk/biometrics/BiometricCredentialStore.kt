package expo.modules.clerk.biometrics

import org.json.JSONArray
import org.json.JSONObject

/** The record shape the JS API uses, before the identifier hint is hashed for storage. */
internal data class BiometricCredentialRecordInput(
  val id: String,
  val localKeyId: String,
  val userId: String,
  val appIdentifier: String,
  val identifierHint: String?,
  val policy: String,
  val createdAt: Double,
  val updatedAt: Double,
) {
  fun toLocalRecord(): BiometricCredentialLocalRecord {
    for ((name, value) in listOf("id" to id, "localKeyId" to localKeyId, "userId" to userId, "appIdentifier" to appIdentifier)) {
      if (value.isEmpty()) {
        throw BiometricsError(BiometricsErrorCode.INVALID_ARGUMENT, "record.$name must be a non-empty string.")
      }
    }
    val policy =
      BiometricCredentialPolicy.fromValue(policy)
        ?: throw BiometricsError(BiometricsErrorCode.INVALID_ARGUMENT, "Unknown biometric credential policy '$policy'.")
    if (!isValidTimestamp(createdAt) || !isValidTimestamp(updatedAt)) {
      throw BiometricsError(
        BiometricsErrorCode.INVALID_ARGUMENT,
        "record.createdAt and record.updatedAt must be milliseconds since the Unix epoch.",
      )
    }
    return BiometricCredentialLocalRecord(
      id = id,
      localKeyId = localKeyId,
      userId = userId,
      appIdentifier = appIdentifier,
      identifierHintSha256 = BiometricCredentialCoding.hashIdentifierHint(identifierHint),
      policy = policy,
      createdAt = Math.round(createdAt),
      updatedAt = Math.round(updatedAt),
    )
  }

  private fun isValidTimestamp(value: Double) = value.isFinite() && value >= 0 && value < 9.0e15
}

/** The store operations exposed to JS, on top of the contract v2 file and the Keystore. */
internal class BiometricCredentialStore(
  private val fileStore: BiometricCredentialFileStore,
  private val deleteKey: (String) -> Unit,
) {
  /** Every decodable record for every app, mapped to the JS field names, with unknown stored fields passed through. */
  fun listRecordsJson(): String = JSONArray(fileStore.records().map(::bridgeJson)).toString()

  fun save(input: BiometricCredentialRecordInput, removeOtherRecordsForApp: Boolean) {
    val record = input.toLocalRecord()
    fileStore.save(record)?.let { runCatching { deleteKey(it) } }
    if (!removeOtherRecordsForApp) return

    // Only the same user's other credentials; other users' are left for reconciliation, as clerk-android does.
    val removable =
      fileStore
        .records()
        .map { it.record }
        .filter { it.appIdentifier == record.appIdentifier && it.userId == record.userId && it.id != record.id }
        .filter { it.localKeyId == record.localKeyId || runCatching { deleteKey(it.localKeyId) }.isSuccess }
        .map { it.id }
    runCatching { fileStore.delete(removable.toSet()) }
  }

  /** Deletes the key, then every record that references it. When the key cannot be deleted the records are kept. */
  fun deleteRecords(localKeyId: String) {
    deleteKey(localKeyId)
    fileStore.delete(fileStore.records().filter { it.record.localKeyId == localKeyId }.map { it.record.id }.toSet())
  }

  companion object {
    fun bridgeJson(stored: StoredBiometricCredentialRecord): JSONObject {
      val json = JSONObject()
      for (key in stored.json.keys()) {
        if (key !in BiometricCredentialRecordJson.KNOWN_FIELDS) json.put(key, stored.json.get(key))
      }
      val record = stored.record
      json.put("id", record.id)
      json.put("localKeyId", record.localKeyId)
      json.put("userId", record.userId)
      json.put("appIdentifier", record.appIdentifier)
      json.put("identifierHint", JSONObject.NULL)
      json.put("identifierHintSha256", record.identifierHintSha256 ?: JSONObject.NULL)
      json.put("policy", record.policy.value)
      json.put("createdAt", record.createdAt)
      json.put("updatedAt", record.updatedAt)
      return json
    }
  }
}
