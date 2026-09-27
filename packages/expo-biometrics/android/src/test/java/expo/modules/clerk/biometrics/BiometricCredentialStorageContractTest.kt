package expo.modules.clerk.biometrics

import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager.Authenticators
import java.io.File
import java.io.IOException
import java.io.RandomAccessFile
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.thread
import org.json.JSONArray
import org.json.JSONObject
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Pins clerk-android's biometric credential storage contract v2
 * (`source/api/docs/biometric-credential-storage-contract.md`) with the same literals and fixture as its
 * `BiometricCredentialStorageContractTest`. Update them only together with a contract version bump.
 */
@RunWith(RobolectricTestRunner::class)
class BiometricCredentialStorageContractTest {
  @get:Rule val temporaryFolder = TemporaryFolder()

  private val directory by lazy { File(temporaryFolder.root, DIRECTORY_NAME) }
  private val dataFile by lazy { File(directory, DATA_FILE_NAME) }

  @Test
  fun `store identifiers match the contract`() {
    assertEquals(DIRECTORY_NAME, BiometricCredentialFileStore.DIRECTORY_NAME)
    assertEquals(DATA_FILE_NAME, BiometricCredentialFileStore.DATA_FILE_NAME)
    assertEquals("$DATA_FILE_NAME.tmp", BiometricCredentialFileStore.TEMP_FILE_NAME)
    assertEquals(LOCK_FILE_NAME, BiometricCredentialFileStore.LOCK_FILE_NAME)
    assertEquals(2, BiometricCredentialFileStore.STORE_VERSION)
    assertEquals(KEY_ALIAS_PREFIX + LOCAL_KEY_ID, BiometricCredentialCoding.keyAlias(LOCAL_KEY_ID))

    val store = BiometricCredentialFileStore.inDirectory(temporaryFolder.root)
    assertEquals(dataFile, store.dataFile)
    assertEquals(File(directory, LOCK_FILE_NAME), store.lockFile)
  }

  @Test
  fun `v2 fixture written by clerk-android is readable`() {
    writeFixture()

    assertEquals(fixtureRecords, BiometricCredentialFileStore(directory).records().map { it.record })
  }

  @Test
  fun `records written by this module match the schema`() {
    val store = BiometricCredentialFileStore(directory)

    fixtureRecords.forEach { store.save(it) }

    assertEquals(
      parse(
        """{
          "version":2,
          "credentials":[
            {"id":"td_current_set","local_key_id":"tdlk_0123456789abcdef0123456789abcdef",
              "user_id":"user_1","app_identifier":"com.example.app",
              "identifier_hint_sha256":"$USER_HINT_SHA256",
              "policy":"biometry_current_set","created_at":1735689600000,"updated_at":1735689600001},
            {"id":"td_any","local_key_id":"tdlk_fedcba9876543210fedcba9876543210",
              "user_id":"user_2","app_identifier":"com.example.app",
              "policy":"biometry_any","created_at":1735689700000,"updated_at":1735689700000},
            {"id":"td_device_passcode","local_key_id":"tdlk_00000000000000000000000000000000",
              "user_id":"user_3","app_identifier":"com.example.other",
              "policy":"biometry_or_device_passcode","created_at":1735689800000,"updated_at":1735689800000}
          ],
          "pending_cleanup_user_ids":[]
        }"""
      ),
      parse(dataFile.readText()),
    )
    assertTrue(dataFile.readText().startsWith("""{"version":2,"credentials":["""))
    assertEquals(setOf(DATA_FILE_NAME, LOCK_FILE_NAME), directory.list()!!.toSet())
  }

  @Test
  fun `rewrites preserve unknown fields, unknown policies, undecodable records and top-level keys`() {
    writeFixture()
    val store = BiometricCredentialFileStore(directory)

    store.save(fixtureRecords.first())

    assertEquals(parse(fixture()), parse(dataFile.readText()))

    store.save(fixtureRecords.first().copy(updatedAt = 1_735_689_600_002))
    store.delete(setOf("td_any"))

    val root = JSONObject(dataFile.readText())
    val credentials = root.getJSONArray("credentials")
    assertEquals(
      listOf("td_current_set", "td_device_passcode", "td_future_policy", "td_incomplete"),
      List(credentials.length()) { credentials.getJSONObject(it).getString("id") },
    )
    val current = credentials.getJSONObject(0)
    assertEquals(1_735_689_600_002, current.getLong("updated_at"))
    assertEquals(parse("""{"nested":[1,2,3]}"""), toValue(current.get("future_field")))
    assertEquals("some_future_policy", credentials.getJSONObject(2).getString("policy"))
    assertEquals(parse("""{"id":"td_incomplete","user_id":"user_5"}"""), toValue(credentials.get(3)))
    assertEquals(parse("""["user_6"]"""), toValue(root.get("pending_cleanup_user_ids")))
    assertEquals(parse("""{"written_by":"a newer SDK"}"""), toValue(root.get("future_top_level_key")))
  }

  @Test
  fun `pending cleanup ids are kept, sorted and de-duplicated on rewrite`() {
    directory.mkdirs()
    dataFile.writeText("""{"version":2,"credentials":[],"pending_cleanup_user_ids":["user_b"," ",3,"user_a","user_b"]}""")

    BiometricCredentialFileStore(directory).save(fixtureRecords.first())

    assertEquals(parse("""["user_a","user_b"]"""), toValue(JSONObject(dataFile.readText()).get("pending_cleanup_user_ids")))
  }

  @Test
  fun `a different store version is read as empty and never modified`() {
    for (future in listOf("""{"version":3,"credentials":[]}""", """{"version":"2","credentials":[]}""", """{"credentials":[]}""")) {
      directory.mkdirs()
      dataFile.writeText(future)
      val store = BiometricCredentialFileStore(directory)

      assertTrue(store.records().isEmpty())
      assertThrows(IOException::class.java) { store.save(fixtureRecords.first()) }
      assertThrows(IOException::class.java) { store.delete(setOf("td_any")) }
      assertEquals(future, dataFile.readText())
    }
  }

  @Test
  fun `a malformed file reads as empty and is replaced by the next write`() {
    directory.mkdirs()
    dataFile.writeText("[not json")
    val store = BiometricCredentialFileStore(directory)

    assertTrue(store.records().isEmpty())
    store.save(fixtureRecords.first())

    assertEquals(listOf(fixtureRecords.first()), store.records().map { it.record })
  }

  @Test
  fun `saving replaces the record with the same id and reports its previous key`() {
    val store = BiometricCredentialFileStore(directory)
    store.save(fixtureRecords.first())

    assertNull(store.save(fixtureRecords.first()))
    assertEquals(LOCAL_KEY_ID, store.save(fixtureRecords.first().copy(localKeyId = "tdlk_new")))
    assertEquals(listOf("tdlk_new"), store.records().map { it.record.localKeyId })
  }

  @Test
  fun `concurrent writers in independent store instances do not lose updates`() {
    val stores = List(2) { BiometricCredentialFileStore(directory, processGuard = ReentrantLock()) }
    val writersPerStore = 4
    val recordsPerWriter = 15
    val executor = Executors.newFixedThreadPool(stores.size * writersPerStore)
    val start = CountDownLatch(1)
    try {
      val futures =
        stores.flatMapIndexed { storeIndex, store ->
          List(writersPerStore) { writer ->
            executor.submit {
              start.await()
              repeat(recordsPerWriter) { index ->
                store.save(fixtureRecords.first().copy(id = "td_${storeIndex}_${writer}_$index"))
              }
            }
          }
        }
      start.countDown()
      futures.forEach { it.get(60, TimeUnit.SECONDS) }
    } finally {
      executor.shutdownNow()
    }

    assertEquals(
      stores.size * writersPerStore * recordsPerWriter,
      BiometricCredentialFileStore(directory).records().map { it.record.id }.toSet().size,
    )
    assertFalse(File(directory, "$DATA_FILE_NAME.tmp").exists())
  }

  @Test
  fun `writers wait for a lock held through another channel`() {
    val store = BiometricCredentialFileStore(directory)
    directory.mkdirs()
    RandomAccessFile(File(directory, LOCK_FILE_NAME), "rw").channel.use { channel ->
      val held = channel.lock()
      val writer = thread { store.save(fixtureRecords.first()) }

      writer.join(300)
      assertTrue(writer.isAlive)
      assertFalse(dataFile.exists())

      held.release()
      writer.join(5_000)
      assertFalse(writer.isAlive)
    }

    assertEquals(listOf(fixtureRecords.first()), store.records().map { it.record })
  }

  @Test
  fun `writers give up when the lock is not released in time`() {
    val store = BiometricCredentialFileStore(directory, lockTimeoutMillis = 100)
    directory.mkdirs()
    RandomAccessFile(File(directory, LOCK_FILE_NAME), "rw").channel.use { channel ->
      channel.lock().use { assertThrows(IOException::class.java) { store.save(fixtureRecords.first()) } }
    }
    assertFalse(dataFile.exists())
  }

  @Test
  fun `identifier hints are hashed after trimming and lowercasing`() {
    assertEquals(USER_HINT_SHA256, BiometricCredentialCoding.hashIdentifierHint("  User@Example.COM\n"))
    assertEquals(USER_HINT_SHA256, BiometricCredentialCoding.hashIdentifierHint("user@example.com"))
    assertNull(BiometricCredentialCoding.hashIdentifierHint(" \n\t"))
    assertNull(BiometricCredentialCoding.hashIdentifierHint(""))
    assertNull(BiometricCredentialCoding.hashIdentifierHint(null))
  }

  @Test
  fun `local key ids are tdlk_ followed by 32 lowercase hex characters`() {
    val localKeyId = BiometricCredentialCoding.makeLocalKeyId()

    assertTrue(localKeyId, Regex("tdlk_[0-9a-f]{32}").matches(localKeyId))
  }

  @Test
  @Config(sdk = [30])
  fun `signing key parameters match the contract on Android 11 and later`() {
    val expectations =
      mapOf(
        BiometricCredentialPolicy.BIOMETRY_CURRENT_SET to (KeyProperties.AUTH_BIOMETRIC_STRONG to true),
        BiometricCredentialPolicy.BIOMETRY_ANY to (KeyProperties.AUTH_BIOMETRIC_STRONG to false),
        BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE to
          ((KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL) to false),
      )

    expectations.forEach { (policy, expected) ->
      val spec = BiometricCredentialCoding.keyGenParameterSpec(LOCAL_KEY_ID, policy)

      assertEquals(KEY_ALIAS_PREFIX + LOCAL_KEY_ID, spec.keystoreAlias)
      assertEquals(KeyProperties.PURPOSE_SIGN, spec.purposes)
      assertArrayEquals(arrayOf(KeyProperties.DIGEST_SHA256), spec.digests)
      assertEquals("secp256r1", (spec.algorithmParameterSpec as ECGenParameterSpec).name)
      assertTrue(spec.isUserAuthenticationRequired)
      assertEquals(0, spec.userAuthenticationValidityDurationSeconds)
      assertEquals(expected.first, spec.userAuthenticationType)
      assertEquals(expected.second, spec.isInvalidatedByBiometricEnrollment)
      assertFalse(spec.isStrongBoxBacked)
      assertFalse(spec.isUnlockedDeviceRequired)
      assertNull(spec.attestationChallenge)
    }
  }

  @Test
  @Config(sdk = [28])
  fun `signing key parameters match the contract before Android 11`() {
    BiometricCredentialPolicy.entries.forEach { policy ->
      val spec = BiometricCredentialCoding.keyGenParameterSpec(LOCAL_KEY_ID, policy)

      assertEquals(KEY_ALIAS_PREFIX + LOCAL_KEY_ID, spec.keystoreAlias)
      assertEquals(KeyProperties.PURPOSE_SIGN, spec.purposes)
      assertArrayEquals(arrayOf(KeyProperties.DIGEST_SHA256), spec.digests)
      assertEquals("secp256r1", (spec.algorithmParameterSpec as ECGenParameterSpec).name)
      assertTrue(spec.isUserAuthenticationRequired)
      assertEquals(-1, spec.userAuthenticationValidityDurationSeconds)
      assertEquals(policy == BiometricCredentialPolicy.BIOMETRY_CURRENT_SET, spec.isInvalidatedByBiometricEnrollment)
    }
  }

  @Test
  fun `prompt authenticators allow device credentials only for the passcode policy on Android 11 and later`() {
    val strong = Authenticators.BIOMETRIC_STRONG
    for (policy in BiometricCredentialPolicy.entries) {
      assertEquals(strong, BiometricKeyManager.promptAuthenticators(policy, sdkInt = 29))
    }
    assertEquals(strong, BiometricKeyManager.promptAuthenticators(BiometricCredentialPolicy.BIOMETRY_CURRENT_SET, sdkInt = 30))
    assertEquals(strong, BiometricKeyManager.promptAuthenticators(BiometricCredentialPolicy.BIOMETRY_ANY, sdkInt = 30))
    assertEquals(
      strong or Authenticators.DEVICE_CREDENTIAL,
      BiometricKeyManager.promptAuthenticators(BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE, sdkInt = 30),
    )
  }

  @Test
  fun `policy values match the contract`() {
    assertEquals(
      listOf("biometry_current_set", "biometry_any", "biometry_or_device_passcode"),
      BiometricCredentialPolicy.entries.map { it.value },
    )
  }

  @Test
  fun `public key JWK uses unpadded base64url 32-byte coordinates`() {
    assertEquals(
      """{"kty":"EC","crv":"P-256","x":"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE","y":"AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI","alg":"ES256"}""",
      BiometricCredentialCoding.publicKeyJwk(BigInteger(1, ByteArray(32) { 1 }), BigInteger(1, ByteArray(32) { 2 })),
    )

    val highBit = BigInteger(1, ByteArray(32) { 0xFF.toByte() })
    val jwk = JSONObject(BiometricCredentialCoding.publicKeyJwk(highBit, BigInteger.ONE))
    assertEquals("__________________________________________8", jwk.getString("x"))
    assertEquals("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE", jwk.getString("y"))
  }

  @Test
  fun `DER signatures convert to raw r and s`() {
    val r = byteArrayOf(0x00, 0x80.toByte()) + ByteArray(31) { 0xAA.toByte() }
    val s = ByteArray(31) { 0x11 }
    val der = byteArrayOf(0x30, 0x44, 0x02, r.size.toByte()) + r + byteArrayOf(0x02, s.size.toByte()) + s

    val raw = BiometricCredentialCoding.rawES256SignatureFromDer(der)

    assertEquals(64, raw.size)
    assertEquals(
      "gKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqoAEREREREREREREREREREREREREREREREREREREREREQ",
      BiometricCredentialCoding.base64UrlEncode(raw),
    )
  }

  @Test
  fun `malformed DER signatures are rejected`() {
    val valid = byteArrayOf(0x30, 0x06, 0x02, 0x01, 0x01, 0x02, 0x01, 0x02)
    BiometricCredentialCoding.rawES256SignatureFromDer(valid)

    val malformed =
      listOf(
        byteArrayOf(),
        byteArrayOf(0x31) + valid.copyOfRange(1, valid.size),
        byteArrayOf(0x30, 0x07) + valid.copyOfRange(2, valid.size),
        valid + byteArrayOf(0x00),
        byteArrayOf(0x30, 0x06, 0x02, 0x01, 0x81.toByte(), 0x02, 0x01, 0x02),
        byteArrayOf(0x30, 0x06, 0x02, 0x00, 0x02, 0x02, 0x01, 0x02),
        byteArrayOf(0x30, 0x25, 0x02, 0x21, 0x01) + ByteArray(32) { 1 } + byteArrayOf(0x02, 0x01, 0x02),
      )
    for (bytes in malformed) {
      val error = assertThrows(BiometricsError::class.java) { BiometricCredentialCoding.rawES256SignatureFromDer(bytes) }
      assertEquals(BiometricsErrorCode.SIGNING_FAILED, error.code)
    }
  }

  @Test
  fun `raw signatures verify as IEEE P1363 over the UTF-8 client data`() {
    val keyPair = KeyPairGenerator.getInstance("EC").apply { initialize(ECGenParameterSpec("secp256r1")) }.generateKeyPair()
    val clientData = """{"challenge":"abc","nonce":"é"}"""

    repeat(32) {
      val der =
        Signature.getInstance("SHA256withECDSA").run {
          initSign(keyPair.private)
          update(clientData.toByteArray(Charsets.UTF_8))
          sign()
        }
      val raw = BiometricCredentialCoding.rawES256SignatureFromDer(der)

      assertEquals(64, raw.size)
      val verified =
        Signature.getInstance("SHA256withECDSAinP1363Format").run {
          initVerify(keyPair.public)
          update(clientData.toByteArray(Charsets.UTF_8))
          verify(raw)
        }
      assertTrue(verified)
    }
  }

  private fun writeFixture() {
    directory.mkdirs()
    dataFile.writeText(fixture())
  }

  companion object {
    const val DIRECTORY_NAME = "clerk"
    const val DATA_FILE_NAME = "biometric_credentials.v2.json"
    const val LOCK_FILE_NAME = "biometric_credentials.lock"
    const val KEY_ALIAS_PREFIX = "com.clerk.trusted_device."
    const val LOCAL_KEY_ID = "tdlk_0123456789abcdef0123456789abcdef"
    const val USER_HINT_SHA256 = "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514"

    internal val fixtureRecords =
      listOf(
        BiometricCredentialLocalRecord(
          id = "td_current_set",
          localKeyId = LOCAL_KEY_ID,
          userId = "user_1",
          appIdentifier = "com.example.app",
          identifierHintSha256 = USER_HINT_SHA256,
          policy = BiometricCredentialPolicy.BIOMETRY_CURRENT_SET,
          createdAt = 1_735_689_600_000,
          updatedAt = 1_735_689_600_001,
        ),
        BiometricCredentialLocalRecord(
          id = "td_any",
          localKeyId = "tdlk_fedcba9876543210fedcba9876543210",
          userId = "user_2",
          appIdentifier = "com.example.app",
          identifierHintSha256 = null,
          policy = BiometricCredentialPolicy.BIOMETRY_ANY,
          createdAt = 1_735_689_700_000,
          updatedAt = 1_735_689_700_000,
        ),
        BiometricCredentialLocalRecord(
          id = "td_device_passcode",
          localKeyId = "tdlk_00000000000000000000000000000000",
          userId = "user_3",
          appIdentifier = "com.example.other",
          identifierHintSha256 = null,
          policy = BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE,
          createdAt = 1_735_689_800_000,
          updatedAt = 1_735_689_800_000,
        ),
      )

    fun fixture(): String =
      checkNotNull(BiometricCredentialStorageContractTest::class.java.getResourceAsStream("/biometric-credential-storage/v2/biometric_credentials.v2.json"))
        .use { it.readBytes().toString(Charsets.UTF_8) }

    fun parse(json: String): Any? = toValue(org.json.JSONTokener(json).nextValue())

    /** Converts org.json values to plain collections so equality ignores key order and Int/Long boxing. */
    fun toValue(value: Any?): Any? =
      when (value) {
        is JSONObject -> value.keys().asSequence().associateWith { toValue(value.get(it)) }
        is JSONArray -> List(value.length()) { toValue(value.get(it)) }
        is Int -> value.toLong()
        JSONObject.NULL -> null
        else -> value
      }
  }
}
