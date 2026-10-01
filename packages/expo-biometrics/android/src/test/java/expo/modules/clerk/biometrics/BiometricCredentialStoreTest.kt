package expo.modules.clerk.biometrics

import expo.modules.clerk.biometrics.BiometricCredentialStorageContractTest.Companion.USER_HINT_SHA256
import expo.modules.clerk.biometrics.BiometricCredentialStorageContractTest.Companion.fixture
import expo.modules.clerk.biometrics.BiometricCredentialStorageContractTest.Companion.parse
import java.io.File
import java.io.IOException
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kotlin.concurrent.thread
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class BiometricCredentialStoreTest {
  @get:Rule val temporaryFolder = TemporaryFolder()

  private val directory by lazy { File(temporaryFolder.root, "clerk") }
  private val dataFile by lazy { File(directory, "biometric_credentials.v2.json") }
  private val fileStore by lazy { BiometricCredentialFileStore(directory) }
  private val deletedKeys = mutableListOf<String>()
  private val undeletableKeys = mutableSetOf<String>()
  private val store by lazy {
    BiometricCredentialStore(fileStore) { localKeyId ->
      if (localKeyId in undeletableKeys) throw IOException("Keystore failure")
      deletedKeys += localKeyId
    }
  }

  @Test
  fun `listRecords maps stored records to the JS shape and passes unknown fields through`() {
    writeFixture()

    assertEquals(
      parse(
        """[
          {"id":"td_current_set","localKeyId":"tdlk_0123456789abcdef0123456789abcdef","userId":"user_1",
            "appIdentifier":"com.example.app","identifierHint":null,"identifierHintSha256":"$USER_HINT_SHA256",
            "policy":"biometry_current_set","createdAt":1735689600000,"updatedAt":1735689600001,
            "future_field":{"nested":[1,2,3]}},
          {"id":"td_any","localKeyId":"tdlk_fedcba9876543210fedcba9876543210","userId":"user_2",
            "appIdentifier":"com.example.app","identifierHint":null,"identifierHintSha256":null,
            "policy":"biometry_any","createdAt":1735689700000,"updatedAt":1735689700000},
          {"id":"td_device_passcode","localKeyId":"tdlk_00000000000000000000000000000000","userId":"user_3",
            "appIdentifier":"com.example.other","identifierHint":null,"identifierHintSha256":null,
            "policy":"biometry_or_device_passcode","createdAt":1735689800000,"updatedAt":1735689800000}
        ]"""
      ),
      parse(store.listRecordsJson()),
    )
  }

  @Test
  fun `listRecords is empty without a file`() {
    assertEquals("[]", store.listRecordsJson())
  }

  @Test
  fun `saveRecord stores only the hash of the identifier hint`() {
    store.save(input(identifierHint = "  User@Example.COM\n"), removeOtherRecordsForApp = false)

    val stored = JSONObject(dataFile.readText()).getJSONArray("credentials").getJSONObject(0)
    assertEquals(USER_HINT_SHA256, stored.getString("identifier_hint_sha256"))
    assertFalse(dataFile.readText().contains("example.com", ignoreCase = true))
    assertEquals(
      setOf("id", "local_key_id", "user_id", "app_identifier", "identifier_hint_sha256", "policy", "created_at", "updated_at"),
      stored.keys().asSequence().toSet(),
    )
    assertEquals(1_735_689_600_001, stored.getLong("created_at"))

    store.save(input(identifierHint = "   "), removeOtherRecordsForApp = false)
    assertFalse(JSONObject(dataFile.readText()).getJSONArray("credentials").getJSONObject(0).has("identifier_hint_sha256"))
  }

  @Test
  fun `saveRecord deletes the key of the record it replaces`() {
    store.save(input(localKeyId = "tdlk_old"), removeOtherRecordsForApp = false)
    store.save(input(localKeyId = "tdlk_new"), removeOtherRecordsForApp = false)

    assertEquals(listOf("tdlk_old"), deletedKeys)
    assertEquals(listOf("tdlk_new"), fileStore.records().map { it.record.localKeyId })
  }

  @Test
  fun `removing other records deletes only the same user's records for the app`() {
    store.save(input(id = "td_same_user", localKeyId = "tdlk_same_user"), removeOtherRecordsForApp = false)
    store.save(input(id = "td_shared_key", localKeyId = "tdlk_new"), removeOtherRecordsForApp = false)
    store.save(input(id = "td_other_user", localKeyId = "tdlk_other_user", userId = "user_2"), removeOtherRecordsForApp = false)
    store.save(input(id = "td_other_app", localKeyId = "tdlk_other_app", appIdentifier = "com.example.other"), removeOtherRecordsForApp = false)
    store.save(input(id = "td_stuck", localKeyId = "tdlk_stuck"), removeOtherRecordsForApp = false)
    undeletableKeys += "tdlk_stuck"

    store.save(input(id = "td_new", localKeyId = "tdlk_new"), removeOtherRecordsForApp = true)

    assertEquals(listOf("tdlk_same_user"), deletedKeys)
    assertEquals(
      listOf("td_other_user", "td_other_app", "td_stuck", "td_new"),
      fileStore.records().map { it.record.id },
    )
  }

  @Test
  fun `a save waits for another save to finish removing records`() {
    val otherSaveDone = CountDownLatch(1)
    var otherSaveFinishedDuringCleanup = true
    val racingStore =
      BiometricCredentialStore(fileStore) { localKeyId ->
        if (localKeyId == "tdlk_old") {
          thread {
            store.save(input(id = "td_second", localKeyId = "tdlk_second"), removeOtherRecordsForApp = true)
            otherSaveDone.countDown()
          }
          otherSaveFinishedDuringCleanup = otherSaveDone.await(300, TimeUnit.MILLISECONDS)
        }
      }
    racingStore.save(input(id = "td_old", localKeyId = "tdlk_old"), removeOtherRecordsForApp = false)

    racingStore.save(input(id = "td_first", localKeyId = "tdlk_first"), removeOtherRecordsForApp = true)

    assertFalse(otherSaveFinishedDuringCleanup)
    assertTrue(otherSaveDone.await(5, TimeUnit.SECONDS))
    assertEquals(listOf("td_second"), fileStore.records().map { it.record.id })
  }

  @Test
  fun `removing other records keeps records this module cannot decode`() {
    writeFixture()

    store.save(input(id = "td_new", localKeyId = "tdlk_new", userId = "user_4"), removeOtherRecordsForApp = true)

    val ids = JSONObject(dataFile.readText()).getJSONArray("credentials").let { array -> List(array.length()) { array.getJSONObject(it).getString("id") } }
    assertEquals(listOf("td_current_set", "td_any", "td_device_passcode", "td_future_policy", "td_incomplete", "td_new"), ids)
    assertTrue(deletedKeys.isEmpty())
  }

  @Test
  fun `deleteRecord deletes the key then the records that reference it`() {
    writeFixture()

    store.deleteRecords("tdlk_fedcba9876543210fedcba9876543210")

    assertEquals(listOf("tdlk_fedcba9876543210fedcba9876543210"), deletedKeys)
    assertEquals(listOf("td_current_set", "td_device_passcode"), fileStore.records().map { it.record.id })
    assertTrue(dataFile.readText().contains("td_future_policy"))
  }

  @Test
  fun `deleteRecord keeps the records when the key cannot be deleted`() {
    writeFixture()
    undeletableKeys += "tdlk_fedcba9876543210fedcba9876543210"

    assertThrows(IOException::class.java) { store.deleteRecords("tdlk_fedcba9876543210fedcba9876543210") }

    assertEquals(parse(fixture()), parse(dataFile.readText()))
  }

  @Test
  fun `record input is validated`() {
    val invalid =
      listOf(
        input(id = ""),
        input(localKeyId = ""),
        input(userId = ""),
        input(appIdentifier = ""),
        input(policy = "face_id"),
        input(createdAt = -1.0),
        input(updatedAt = Double.NaN),
        input(createdAt = 9.0e15),
      )
    for (record in invalid) {
      val error = assertThrows(BiometricsError::class.java) { store.save(record, removeOtherRecordsForApp = false) }
      assertEquals(BiometricsErrorCode.INVALID_ARGUMENT, error.code)
    }
    assertFalse(dataFile.exists())
  }

  @Test
  fun `timestamps are rounded to integer milliseconds`() {
    assertEquals(1_714_000_000_001, input(createdAt = 1_714_000_000_000.5).toLocalRecord().createdAt)
  }

  private fun writeFixture() {
    directory.mkdirs()
    dataFile.writeText(fixture())
  }

  private fun input(
    id: String = "td_1",
    localKeyId: String = "tdlk_1",
    userId: String = "user_1",
    appIdentifier: String = "com.example.app",
    identifierHint: String? = null,
    policy: String = "biometry_current_set",
    createdAt: Double = 1_735_689_600_001.0,
    updatedAt: Double = 1_735_689_600_002.0,
  ) = BiometricCredentialRecordInput(id, localKeyId, userId, appIdentifier, identifierHint, policy, createdAt, updatedAt)
}
