import Foundation
import LocalAuthentication
import Security
import XCTest
@testable import ClerkExpoBiometrics

/// Skips tests that need the real Keychain when the test bundle runs without a host app.
func skipUnlessKeychainIsAvailable() throws {
  let query: [String: Any] = [
    kSecClass as String: kSecClassGenericPassword,
    kSecAttrService as String: "ClerkExpoBiometricsTests.probe",
  ]
  let status = SecItemCopyMatching(query as CFDictionary, nil)
  try XCTSkipIf(status == errSecMissingEntitlement, "The Keychain is only available to tests running in a host app.")
}

final class KeychainMetadataStorageTests: XCTestCase {
  private var storage: KeychainMetadataStorage!

  override func setUpWithError() throws {
    try super.setUpWithError()
    try skipUnlessKeychainIsAvailable()
    storage = KeychainMetadataStorage(service: "ClerkExpoBiometricsTests.\(UUID().uuidString)")
  }

  override func tearDownWithError() throws {
    try storage?.delete()
    try super.tearDownWithError()
  }

  func testWriteAddsThenUpdatesTheGenericPasswordItem() throws {
    XCTAssertNil(try storage.read())

    try storage.write(Data("[1]".utf8))
    try storage.write(Data("[2]".utf8))

    XCTAssertEqual(try storage.read(), Data("[2]".utf8))

    var query = storage.baseQuery()
    query[kSecReturnAttributes as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitAll
    var result: CFTypeRef?
    XCTAssertEqual(SecItemCopyMatching(query as CFDictionary, &result), errSecSuccess)
    let items = try XCTUnwrap(result as? [[String: Any]])
    XCTAssertEqual(items.count, 1)
    XCTAssertEqual(items[0][kSecAttrAccessible as String] as? String, kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly as String)
    XCTAssertEqual(items[0][kSecAttrAccount as String] as? String, "trustedDeviceCredentials")
  }

  func testDeleteIsIdempotent() throws {
    try storage.write(Data("[]".utf8))
    try storage.delete()
    try storage.delete()

    XCTAssertNil(try storage.read())
  }
}

final class BiometricKeyManagerTests: XCTestCase {
  func testMissingKeyIsReportedWithoutPrompting() throws {
    try skipUnlessKeychainIsAvailable()
    let keyManager = BiometricKeyManager()
    let localKeyId = BiometricCredentialCoding.makeLocalKeyId()

    XCTAssertFalse(try keyManager.hasKey(localKeyId: localKeyId))
    XCTAssertNoThrow(try keyManager.deleteKey(localKeyId: localKeyId))
    XCTAssertThrowsError(try keyManager.sign(localKeyId: localKeyId, clientData: "data", reason: "Sign in")) { error in
      XCTAssertEqual((error as? BiometricsError)?.code, .keyNotFound)
    }
  }

  func testAvailabilityReportsAKnownBiometryType() {
    let availability = BiometricKeyManager().availability()

    XCTAssertTrue(["faceID", "touchID", "opticID", "none"].contains(availability.biometryType))
    XCTAssertEqual(availability.errorCode == nil, availability.canEvaluateBiometrics)
  }

  func testErrorMapping() {
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.userCancel.rawValue), .userCanceled)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.systemCancel.rawValue), .systemCanceled)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.appCancel.rawValue), .systemCanceled)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.userFallback.rawValue), .userFallback)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.authenticationFailed.rawValue), .authenticationFailed)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.biometryNotAvailable.rawValue), .biometryNotAvailable)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.biometryNotEnrolled.rawValue), .biometryNotEnrolled)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.biometryLockout.rawValue), .biometryLockout)
    XCTAssertEqual(BiometricsError.code(forLAErrorCode: LAError.Code.passcodeNotSet.rawValue), .passcodeNotSet)

    XCTAssertEqual(BiometricsError.code(forStatus: errSecUserCanceled), .userCanceled)
    XCTAssertEqual(BiometricsError.code(forStatus: errSecAuthFailed), .authenticationFailed)
    XCTAssertEqual(BiometricsError.code(forStatus: errSecInteractionNotAllowed), .biometryNotAvailable)
    XCTAssertEqual(BiometricsError.code(forStatus: errSecItemNotFound), .keyNotFound)
    XCTAssertNil(BiometricsError.code(forStatus: errSecParam))

    let laError = NSError(domain: LAErrorDomain, code: LAError.Code.biometryLockout.rawValue)
    XCTAssertEqual(BiometricsError.security(laError, fallback: .signingFailed).code, .biometryLockout)
    XCTAssertEqual(BiometricsError.localAuthentication(laError, fallback: .biometryNotAvailable).code, .biometryLockout)
    XCTAssertEqual(BiometricsError.localAuthentication(nil, fallback: .biometryNotAvailable).code, .biometryNotAvailable)
    let statusError = NSError(domain: NSOSStatusErrorDomain, code: Int(errSecUserCanceled))
    XCTAssertEqual(BiometricsError.security(statusError, fallback: .signingFailed).code, .userCanceled)
    let tokenError = NSError(domain: "CryptoTokenKit", code: -6)
    XCTAssertEqual(BiometricsError.security(tokenError, fallback: .signingFailed).code, .keyInvalidated)
    let unknownError = NSError(domain: "Other", code: 1)
    XCTAssertEqual(BiometricsError.security(unknownError, fallback: .signingFailed).code, .signingFailed)
  }

  // Record fields are reference-backed, so each case builds a fresh input.
  private func makeInput(_ configure: (BiometricCredentialRecordInput) -> Void = { _ in }) -> BiometricCredentialRecordInput {
    let input = BiometricCredentialRecordInput()
    input.id = "tdc_1"
    input.localKeyId = "tdlk_1"
    input.userId = "user_1"
    input.appIdentifier = "com.clerk.example"
    input.identifierHint = "  Hint "
    input.policy = "biometry_any"
    input.createdAt = 1_714_000_000_000.4
    input.updatedAt = 1_714_000_000_001
    configure(input)
    return input
  }

  func testRecordInputValidation() throws {
    let record = try ClerkExpoBiometricsModule.record(from: makeInput())
    XCTAssertEqual(record.identifierHint, "hint")
    XCTAssertEqual(record.policy, .biometryAny)
    XCTAssertEqual(record.jsonObject["createdAt"] as? Int64, 1_714_000_000_000)
    XCTAssertEqual(record.jsonObject["updatedAt"] as? Int64, 1_714_000_000_001)

    let invalidInputs: [(String, (BiometricCredentialRecordInput) -> Void)] = [
      ("policy", { $0.policy = "face_id" }),
      ("id", { $0.id = "" }),
      ("localKeyId", { $0.localKeyId = "" }),
      ("userId", { $0.userId = "" }),
      ("appIdentifier", { $0.appIdentifier = "" }),
      ("nan createdAt", { $0.createdAt = .nan }),
      ("negative createdAt", { $0.createdAt = -1 }),
      ("infinite updatedAt", { $0.updatedAt = .infinity }),
    ]
    for (name, configure) in invalidInputs {
      XCTAssertThrowsError(try ClerkExpoBiometricsModule.record(from: makeInput(configure)), name) { error in
        XCTAssertEqual((error as? BiometricsError)?.code, .invalidArgument, name)
      }
    }
  }
}
