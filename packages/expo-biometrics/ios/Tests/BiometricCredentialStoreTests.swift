import Foundation
import Security
import XCTest
@testable import ClerkExpoBiometrics

final class BiometricCredentialStoreTests: XCTestCase {
  private final class InMemoryStorage: BiometricCredentialMetadataStorage {
    var data: Data?
    var writes = 0
    var deletes = 0

    func read() throws -> Data? { data }
    func write(_ data: Data) throws {
      writes += 1
      self.data = data
    }

    func delete() throws {
      deletes += 1
      data = nil
    }

    func records() throws -> [[String: Any]] {
      try BiometricCredentialRecordList.decode(data)
    }

    func ids() throws -> [String?] {
      try records().map { $0["id"] as? String }
    }
  }

  private var storage: InMemoryStorage!
  private var userDefaults: UserDefaults!
  private var suiteName: String!
  private var deletedKeys: [String] = []
  private var failingKeys: Set<String> = []

  override func setUp() {
    super.setUp()
    storage = InMemoryStorage()
    suiteName = "ClerkExpoBiometricsTests.\(UUID().uuidString)"
    userDefaults = UserDefaults(suiteName: suiteName)
    deletedKeys = []
    failingKeys = []
  }

  override func tearDown() {
    userDefaults.removePersistentDomain(forName: suiteName)
    super.tearDown()
  }

  private func makeStore(appIdentifier: String? = "com.clerk.example") -> BiometricCredentialStore {
    BiometricCredentialStore(
      storage: storage,
      deleteKey: { [unowned self] localKeyId in
        if failingKeys.contains(localKeyId) {
          throw BiometricsError(.storageFailed, "delete failed")
        }
        deletedKeys.append(localKeyId)
      },
      userDefaults: userDefaults,
      service: "com.clerk.example",
      appIdentifier: appIdentifier
    )
  }

  private let markerKey = "com.clerk.trusted-device-installation-marker.s17:com.clerk.example.n.s17:com.clerk.example"

  private func setMarker() {
    userDefaults.set(true, forKey: markerKey)
  }

  private func record(
    id: String,
    localKeyId: String? = nil,
    userId: String = "user_1",
    appIdentifier: String = "com.clerk.example",
    identifierHint: String? = nil
  ) -> BiometricCredentialRecord {
    BiometricCredentialRecord(
      id: id,
      localKeyId: localKeyId ?? "tdlk_\(id)",
      userId: userId,
      appIdentifier: appIdentifier,
      identifierHint: identifierHint,
      policy: .biometryCurrentSet,
      createdAt: 1_714_000_000_000,
      updatedAt: 1_714_000_000_000
    )
  }

  // MARK: - Reinstall marker

  func testMissingMarkerWipesOnlyThisAppsRecordsAndKeysThenSetsMarker() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()
    let store = makeStore()

    XCTAssertEqual(store.installationMarkerKey, markerKey)
    XCTAssertTrue(try store.ensureInstallationMarker())

    XCTAssertEqual(deletedKeys, ["tdlk_0123456789abcdef0123456789abcdef", "tdlk_fedcba9876543210fedcba9876543210"])
    XCTAssertEqual(try storage.ids(), ["tdc_contract_passcode"])
    XCTAssertEqual(userDefaults.object(forKey: markerKey) as? Bool, true)
    XCTAssertEqual(UserDefaults.standard.object(forKey: markerKey) as? Bool, nil)
  }

  func testMarkerIsIdempotent() throws {
    let store = makeStore()

    XCTAssertTrue(try store.ensureInstallationMarker())
    storage.data = try BiometricCredentialContractTests.fixtureData()
    XCTAssertFalse(try store.ensureInstallationMarker())

    XCTAssertEqual(deletedKeys, [])
    XCTAssertEqual(try storage.records().count, 3)
  }

  func testMarkerIsNotSetWhenAKeyCannotBeDeleted() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()
    failingKeys = ["tdlk_fedcba9876543210fedcba9876543210"]
    let store = makeStore()

    XCTAssertThrowsError(try store.ensureInstallationMarker())

    XCTAssertEqual(try storage.ids(), ["tdc_contract_any", "tdc_contract_passcode"])
    XCTAssertNil(userDefaults.object(forKey: markerKey))

    failingKeys = []
    XCTAssertTrue(try store.ensureInstallationMarker())
    XCTAssertEqual(try storage.ids(), ["tdc_contract_passcode"])
  }

  func testMarkerWipesMalformedRecordsForThisApp() throws {
    storage.data = Data(#"[{"appIdentifier":"com.clerk.example","localKeyId":"tdlk_bad"},{"appIdentifier":"com.clerk.example"}]"#.utf8)

    XCTAssertTrue(try makeStore().ensureInstallationMarker())

    XCTAssertEqual(deletedKeys, ["tdlk_bad"])
    XCTAssertNil(storage.data)
    XCTAssertEqual(storage.deletes, 1)
  }

  func testMarkerIsNotSetWhenMetadataIsNotAnArray() {
    storage.data = Data(#"{"id":"tdc_1"}"#.utf8)

    XCTAssertThrowsError(try makeStore().ensureInstallationMarker()) { error in
      XCTAssertEqual((error as? BiometricsError)?.code, .storageFailed)
    }
    XCTAssertNil(userDefaults.object(forKey: markerKey))
  }

  func testMissingAppIdentifierSkipsTheMarker() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()

    XCTAssertFalse(try makeStore(appIdentifier: nil).ensureInstallationMarker())
    XCTAssertEqual(try storage.records().count, 3)
  }

  func testStoreOperationsApplyTheMarkerFirst() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()
    let store = makeStore()

    let listed = try JSONSerialization.jsonObject(with: Data(store.listRecordsJSON().utf8)) as? [[String: Any]]

    XCTAssertEqual(listed?.map { $0["id"] as? String }, ["tdc_contract_passcode"])
    XCTAssertEqual(userDefaults.object(forKey: markerKey) as? Bool, true)
  }

  // MARK: - List

  func testListReturnsWellFormedRecordsForEveryAppWithUnknownFields() throws {
    setMarker()
    storage.data = Data("""
    [{"id":"tdc_1","localKeyId":"tdlk_1","userId":"user_1","appIdentifier":"com.clerk.example","identifierHint":" A@B.co ",\
    "policy":"biometry_any","createdAt":1714000000000,"updatedAt":1714000000001,"futureField":[1,true,null]},\
    {"id":"tdc_2","localKeyId":"tdlk_2","userId":"user_2","appIdentifier":"com.clerk.other","identifierHint":"  ",\
    "policy":"biometry_current_set","createdAt":1714000000000,"updatedAt":1714000000000},\
    {"id":"tdc_bad_policy","localKeyId":"tdlk_3","userId":"user_1","appIdentifier":"com.clerk.example",\
    "policy":"face","createdAt":1,"updatedAt":1},\
    {"id":"tdc_bool_date","localKeyId":"tdlk_4","userId":"user_1","appIdentifier":"com.clerk.example",\
    "policy":"biometry_any","createdAt":true,"updatedAt":1},\
    {"id":"tdc_missing","userId":"user_1","appIdentifier":"com.clerk.example","policy":"biometry_any","createdAt":1,"updatedAt":1},\
    {"id":"tdc_hint_number","localKeyId":"tdlk_5","userId":"user_1","appIdentifier":"com.clerk.example",\
    "identifierHint":5,"policy":"biometry_any","createdAt":1,"updatedAt":1},\
    {"id":"tdc_null_hint","localKeyId":"tdlk_6","userId":"user_1","appIdentifier":"com.clerk.example",\
    "identifierHint":null,"policy":"biometry_or_device_passcode","createdAt":1,"updatedAt":1}]
    """.utf8)

    let json = try makeStore().listRecordsJSON()
    let listed = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(json.utf8)) as? [[String: Any]])

    XCTAssertEqual(listed.map { $0["id"] as? String }, ["tdc_1", "tdc_2", "tdc_null_hint"])
    XCTAssertEqual(listed[0]["identifierHint"] as? String, "a@b.co")
    XCTAssertNil(listed[1]["identifierHint"])
    XCTAssertNil(listed[2]["identifierHint"])
    XCTAssertEqual(listed[0]["identifierHintSha256"] as? String, "80305c9bb1bb2480e03894350e0a8a366dcbdeb302e69e0817aa0743abd77054")
    XCTAssertTrue(listed[1]["identifierHintSha256"] is NSNull)
    XCTAssertTrue(listed[2]["identifierHintSha256"] is NSNull)
    XCTAssertTrue(json.contains(#""futureField":[1,true,null]"#))
    XCTAssertTrue(json.contains(#""updatedAt":1714000000001"#))
  }

  func testListIsEmptyWithoutAnItem() throws {
    setMarker()
    XCTAssertEqual(try makeStore().listRecordsJSON(), "[]")
  }

  // MARK: - Save

  func testSaveAddsRecordAndPreservesOtherAppsAndUnknownFields() throws {
    setMarker()
    storage.data = Data("""
    [{"id":"tdc_other","localKeyId":"tdlk_other","userId":"user_1","appIdentifier":"com.clerk.other",\
    "policy":"biometry_any","createdAt":1714000000000,"updatedAt":1714000000000,"futureField":"kept"},\
    {"id":"tdc_same","localKeyId":"tdlk_same","userId":"user_2","appIdentifier":"com.clerk.example",\
    "policy":"biometry_any","createdAt":1714000000000,"updatedAt":1714000000000,"futureField":"also kept"}]
    """.utf8)

    try makeStore().save(record(id: "tdc_new", identifierHint: " New@Example.com"), removeOtherRecordsForApp: false)

    let records = try storage.records()
    XCTAssertEqual(records.map { $0["id"] as? String }, ["tdc_other", "tdc_same", "tdc_new"])
    XCTAssertEqual(records[0]["futureField"] as? String, "kept")
    XCTAssertEqual(records[1]["futureField"] as? String, "also kept")
    XCTAssertEqual(records[2]["identifierHint"] as? String, "new@example.com")
    XCTAssertEqual(deletedKeys, [])
  }

  func testSaveReplacesSameIdAndDeletesItsOldKey() throws {
    setMarker()
    let store = makeStore()
    try store.save(record(id: "tdc_1", localKeyId: "tdlk_old"), removeOtherRecordsForApp: false)

    try store.save(record(id: "tdc_1", localKeyId: "tdlk_new"), removeOtherRecordsForApp: false)

    let records = try storage.records()
    XCTAssertEqual(records.count, 1)
    XCTAssertEqual(records[0]["localKeyId"] as? String, "tdlk_new")
    XCTAssertEqual(deletedKeys, ["tdlk_old"])
  }

  func testSaveDropsMalformedRecordsForTheSameAppOnly() throws {
    setMarker()
    storage.data = Data("""
    [{"id":"tdc_bad","appIdentifier":"com.clerk.example"},{"id":"tdc_bad_other","appIdentifier":"com.clerk.other"}]
    """.utf8)

    try makeStore().save(record(id: "tdc_1"), removeOtherRecordsForApp: false)

    XCTAssertEqual(try storage.ids(), ["tdc_bad_other", "tdc_1"])
    XCTAssertEqual(deletedKeys, [])
  }

  func testSaveRemovingOtherRecordsDeletesThisAppsOtherRecordsAndKeys() throws {
    setMarker()
    let store = makeStore()
    try store.save(record(id: "tdc_a", userId: "user_1"), removeOtherRecordsForApp: false)
    try store.save(record(id: "tdc_b", userId: "user_2"), removeOtherRecordsForApp: false)
    try store.save(record(id: "tdc_other_app", appIdentifier: "com.clerk.other"), removeOtherRecordsForApp: false)
    failingKeys = ["tdlk_tdc_b"]

    try store.save(record(id: "tdc_new"), removeOtherRecordsForApp: true)

    XCTAssertEqual(deletedKeys, ["tdlk_tdc_a"])
    XCTAssertEqual(try storage.ids(), ["tdc_b", "tdc_other_app", "tdc_new"])
  }

  func testSaveAppliesTheMarkerBeforeWriting() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()

    try makeStore().save(record(id: "tdc_new"), removeOtherRecordsForApp: false)

    XCTAssertEqual(try storage.ids(), ["tdc_contract_passcode", "tdc_new"])
    XCTAssertEqual(userDefaults.object(forKey: markerKey) as? Bool, true)
  }

  func testSaveFailsWithoutWritingWhenTheMarkerCannotBeSet() throws {
    storage.data = try BiometricCredentialContractTests.fixtureData()
    failingKeys = ["tdlk_0123456789abcdef0123456789abcdef"]

    XCTAssertThrowsError(try makeStore().save(record(id: "tdc_new"), removeOtherRecordsForApp: false))

    XCTAssertFalse(try storage.ids().contains("tdc_new"))
  }

  // MARK: - Delete

  func testDeleteRecordsDeletesKeyThenRecordsAndDropsTheItemWhenEmpty() throws {
    setMarker()
    let store = makeStore()
    try store.save(record(id: "tdc_1", localKeyId: "tdlk_1"), removeOtherRecordsForApp: false)

    try store.deleteRecords(localKeyId: "tdlk_1")

    XCTAssertEqual(deletedKeys, ["tdlk_1"])
    XCTAssertNil(storage.data)
    XCTAssertEqual(storage.deletes, 1)
  }

  func testDeleteRecordsKeepsRecordsWhenTheKeyCannotBeDeleted() throws {
    setMarker()
    let store = makeStore()
    try store.save(record(id: "tdc_1", localKeyId: "tdlk_1"), removeOtherRecordsForApp: false)
    failingKeys = ["tdlk_1"]

    XCTAssertThrowsError(try store.deleteRecords(localKeyId: "tdlk_1"))

    XCTAssertEqual(try storage.ids(), ["tdc_1"])
  }

  func testDeleteRecordsPreservesUnknownFieldsOnOtherRecords() throws {
    setMarker()
    storage.data = Data("""
    [{"id":"tdc_1","localKeyId":"tdlk_1","futureField":"kept"},{"id":"tdc_2","localKeyId":"tdlk_2"}]
    """.utf8)

    try makeStore().deleteRecords(localKeyId: "tdlk_2")

    let records = try storage.records()
    XCTAssertEqual(records.count, 1)
    XCTAssertEqual(records[0]["futureField"] as? String, "kept")
  }
}
