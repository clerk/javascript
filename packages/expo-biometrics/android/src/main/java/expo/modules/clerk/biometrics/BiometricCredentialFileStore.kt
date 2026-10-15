package expo.modules.clerk.biometrics

import android.system.Os
import android.system.OsConstants
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.RandomAccessFile
import java.nio.channels.FileChannel
import java.nio.channels.FileLock
import java.nio.channels.OverlappingFileLockException
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantLock
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

internal data class BiometricCredentialLocalRecord(
  val id: String,
  val localKeyId: String,
  val userId: String,
  val appIdentifier: String,
  val identifierHintSha256: String?,
  val policy: BiometricCredentialPolicy,
  val createdAt: Long,
  val updatedAt: Long,
)

/** A decoded record and the stored JSON object it came from, including fields this module does not know. */
internal class StoredBiometricCredentialRecord(val record: BiometricCredentialLocalRecord, val json: JSONObject)

/**
 * The contract v2 metadata file shared with clerk-android: plaintext JSON in `noBackupFilesDir/clerk`, changed only by
 * read-modify-writes under an exclusive lock on a sibling lock file and replaced atomically. Everything this module
 * does not understand is kept on rewrite.
 */
internal class BiometricCredentialFileStore(
  private val directory: File,
  private val processGuard: ReentrantLock = PROCESS_GUARD,
  private val lockTimeoutMillis: Long = LOCK_TIMEOUT_MILLIS,
) {
  val dataFile = File(directory, DATA_FILE_NAME)
  val lockFile = File(directory, LOCK_FILE_NAME)
  private val tempFile = File(directory, TEMP_FILE_NAME)

  /** Reads without the lock: the atomic rename means a reader sees either the previous or the next complete file. */
  fun records(): List<StoredBiometricCredentialRecord> {
    val document = readDocument()
    if (!document.writable) return emptyList()
    return document.credentials.mapNotNull { element ->
      val json = element as? JSONObject ?: return@mapNotNull null
      BiometricCredentialRecordJson.decode(json)?.let { StoredBiometricCredentialRecord(it, json) }
    }
  }

  /** Replaces the record with the same `id`, or appends it. Returns the replaced record's key when it differs. */
  fun save(record: BiometricCredentialLocalRecord): String? {
    var replacedLocalKeyId: String? = null
    update { credentials ->
      val index = credentials.indexOfFirst { recordId(it) == record.id }
      val existing = credentials.getOrNull(index) as? JSONObject
      val encoded = BiometricCredentialRecordJson.encode(record, preserving = existing)
      if (index < 0) {
        credentials.add(encoded)
      } else {
        replacedLocalKeyId =
          (existing?.opt(BiometricCredentialRecordJson.LOCAL_KEY_ID) as? String)?.takeIf { it != record.localKeyId }
        credentials[index] = encoded
        for (i in credentials.lastIndex downTo index + 1) {
          if (recordId(credentials[i]) == record.id) credentials.removeAt(i)
        }
      }
      true
    }
    return replacedLocalKeyId
  }

  /** Removes every record, decodable or not, whose `id` is in [ids]. */
  fun delete(ids: Set<String>) {
    if (ids.isEmpty()) return
    update { credentials -> credentials.removeAll { recordId(it) in ids } }
  }

  private fun update(transform: (MutableList<Any?>) -> Boolean) {
    withExclusiveLock {
      val document = readDocument()
      if (!document.writable) {
        throw IOException("The biometric credential store uses an unsupported version.")
      }
      val credentials = document.credentials.toMutableList()
      if (transform(credentials)) {
        writeDocument(document.serialized(credentials))
      }
    }
  }

  // A missing or malformed file is an empty store, as in the Clerk Android SDK. Another version must not be replaced.
  private fun readDocument(): StoreDocument {
    if (!dataFile.exists()) return StoreDocument(JSONObject(), writable = true)
    val text = dataFile.readText(Charsets.UTF_8)
    val root =
      try {
        JSONObject(text)
      } catch (_: JSONException) {
        return StoreDocument(JSONObject(), writable = true)
      }
    val version = root.opt(KEY_VERSION)
    val writable = (version is Int || version is Long) && (version as Number).toLong() == STORE_VERSION.toLong()
    return StoreDocument(root, writable)
  }

  private fun writeDocument(text: String) {
    ensureDirectory()
    FileOutputStream(tempFile).use { output ->
      output.write(text.toByteArray(Charsets.UTF_8))
      output.flush()
      output.fd.sync()
    }
    if (!tempFile.renameTo(dataFile)) {
      tempFile.delete()
      throw IOException("Failed to replace the biometric credential store.")
    }
    syncDirectory()
  }

  private fun syncDirectory() {
    try {
      val fd = Os.open(directory.path, OsConstants.O_RDONLY, 0)
      try {
        Os.fsync(fd)
      } finally {
        Os.close(fd)
      }
    } catch (_: Throwable) {
    }
  }

  private fun ensureDirectory() {
    if (!directory.isDirectory && !directory.mkdirs() && !directory.isDirectory) {
      throw IOException("Failed to create the biometric credential store directory.")
    }
  }

  private fun <T> withExclusiveLock(block: () -> T): T {
    if (!processGuard.tryLock(lockTimeoutMillis, TimeUnit.MILLISECONDS)) {
      throw IOException("Timed out waiting for the biometric credential store lock.")
    }
    try {
      val fileLock = acquireFileLock()
      try {
        return block()
      } finally {
        fileLock.release()
      }
    } finally {
      processGuard.unlock()
    }
  }

  // Another SDK in this process holding the lock surfaces as OverlappingFileLockException, another process as null.
  private fun acquireFileLock(): FileLock {
    val channel = lockChannel()
    val deadline = System.nanoTime() + TimeUnit.MILLISECONDS.toNanos(lockTimeoutMillis)
    var backoffMillis = INITIAL_LOCK_BACKOFF_MILLIS
    while (true) {
      val lock =
        try {
          channel.tryLock()
        } catch (_: OverlappingFileLockException) {
          null
        }
      if (lock != null) return lock
      if (System.nanoTime() >= deadline) {
        throw IOException("Timed out waiting for the biometric credential store lock.")
      }
      Thread.sleep(backoffMillis)
      backoffMillis = (backoffMillis * 2).coerceAtMost(MAX_LOCK_BACKOFF_MILLIS)
    }
  }

  // Closing any descriptor of the lock file can release this process's POSIX lock, so channels are never closed.
  private fun lockChannel(): FileChannel {
    val path = lockFile.absolutePath
    LOCK_CHANNELS[path]?.let { return it }
    synchronized(LOCK_CHANNELS) {
      return LOCK_CHANNELS.getOrPut(path) {
        ensureDirectory()
        RandomAccessFile(lockFile, "rw").channel
      }
    }
  }

  private class StoreDocument(val root: JSONObject, val writable: Boolean) {
    val credentials: List<Any?> = (root.opt(KEY_CREDENTIALS) as? JSONArray).elements()

    /** Known keys first, then unknown top-level keys in their original order. */
    fun serialized(credentials: List<Any?>): String {
      val pending =
        (root.opt(KEY_PENDING_CLEANUP_USER_IDS) as? JSONArray)
          .elements()
          .filterIsInstance<String>()
          .filter { it.isNotBlank() }
          .toSortedSet()
      val output = JSONObject()
      output.put(KEY_VERSION, STORE_VERSION)
      output.put(KEY_CREDENTIALS, JSONArray(credentials))
      output.put(KEY_PENDING_CLEANUP_USER_IDS, JSONArray(pending.toList()))
      for (key in root.keys()) {
        if (key !in TOP_LEVEL_KEYS) output.put(key, root.get(key))
      }
      return output.toString()
    }
  }

  companion object {
    const val DIRECTORY_NAME = "clerk"
    const val DATA_FILE_NAME = "biometric_credentials.v2.json"
    const val TEMP_FILE_NAME = "biometric_credentials.v2.json.tmp"
    const val LOCK_FILE_NAME = "biometric_credentials.lock"
    const val STORE_VERSION = 2

    const val KEY_VERSION = "version"
    const val KEY_CREDENTIALS = "credentials"
    const val KEY_PENDING_CLEANUP_USER_IDS = "pending_cleanup_user_ids"
    private val TOP_LEVEL_KEYS = setOf(KEY_VERSION, KEY_CREDENTIALS, KEY_PENDING_CLEANUP_USER_IDS)

    private const val LOCK_TIMEOUT_MILLIS = 5_000L
    private const val INITIAL_LOCK_BACKOFF_MILLIS = 2L
    private const val MAX_LOCK_BACKOFF_MILLIS = 50L

    private val PROCESS_GUARD = ReentrantLock()
    private val LOCK_CHANNELS = ConcurrentHashMap<String, FileChannel>()

    fun inDirectory(noBackupFilesDir: File) = BiometricCredentialFileStore(File(noBackupFilesDir, DIRECTORY_NAME))

    private fun recordId(element: Any?): String? = (element as? JSONObject)?.opt(BiometricCredentialRecordJson.ID) as? String

    private fun JSONArray?.elements(): List<Any?> = if (this == null) emptyList() else List(length()) { opt(it) }
  }
}

/** Contract v2 JSON encoding of a single credential record. */
internal object BiometricCredentialRecordJson {
  const val ID = "id"
  const val LOCAL_KEY_ID = "local_key_id"
  const val USER_ID = "user_id"
  const val APP_IDENTIFIER = "app_identifier"
  const val IDENTIFIER_HINT_SHA256 = "identifier_hint_sha256"
  const val POLICY = "policy"
  const val CREATED_AT = "created_at"
  const val UPDATED_AT = "updated_at"

  val KNOWN_FIELDS = setOf(ID, LOCAL_KEY_ID, USER_ID, APP_IDENTIFIER, IDENTIFIER_HINT_SHA256, POLICY, CREATED_AT, UPDATED_AT)

  /** Returns `null` for records that are malformed or use a policy this module does not know. */
  fun decode(json: JSONObject): BiometricCredentialLocalRecord? {
    val hint =
      when (val value = json.opt(IDENTIFIER_HINT_SHA256)) {
        null, JSONObject.NULL -> null
        is String -> value
        else -> return null
      }
    return BiometricCredentialLocalRecord(
      id = json.string(ID) ?: return null,
      localKeyId = json.string(LOCAL_KEY_ID) ?: return null,
      userId = json.string(USER_ID) ?: return null,
      appIdentifier = json.string(APP_IDENTIFIER) ?: return null,
      identifierHintSha256 = hint,
      policy = BiometricCredentialPolicy.fromValue(json.string(POLICY)) ?: return null,
      createdAt = json.long(CREATED_AT) ?: return null,
      updatedAt = json.long(UPDATED_AT) ?: return null,
    )
  }

  /** Encodes [record], keeping every field of [preserving] that is not part of the schema. */
  fun encode(record: BiometricCredentialLocalRecord, preserving: JSONObject?): JSONObject {
    val json = JSONObject()
    json.put(ID, record.id)
    json.put(LOCAL_KEY_ID, record.localKeyId)
    json.put(USER_ID, record.userId)
    json.put(APP_IDENTIFIER, record.appIdentifier)
    record.identifierHintSha256?.let { json.put(IDENTIFIER_HINT_SHA256, it) }
    json.put(POLICY, record.policy.value)
    json.put(CREATED_AT, record.createdAt)
    json.put(UPDATED_AT, record.updatedAt)
    if (preserving != null) {
      for (key in preserving.keys()) {
        if (key !in KNOWN_FIELDS) json.put(key, preserving.get(key))
      }
    }
    return json
  }

  private fun JSONObject.string(key: String): String? = opt(key) as? String

  private fun JSONObject.long(key: String): Long? =
    when (val value = opt(key)) {
      is Int -> value.toLong()
      is Long -> value
      else -> null
    }
}
