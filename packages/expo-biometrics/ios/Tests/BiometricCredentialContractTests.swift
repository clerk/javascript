import CryptoKit
import Foundation
import Security
import XCTest
@testable import ClerkExpoBiometrics

/// Mirrors clerk-ios `BiometricCredentialStorageContractTests` (contract version 1) with the same vectors and fixture.
final class BiometricCredentialContractTests: XCTestCase {
  private let fixtureLocalKeyId = "tdlk_0123456789abcdef0123456789abcdef"

  // MARK: - Secure Enclave key

  func testPrivateKeyQueryUsesContractApplicationTagWithoutAccessGroup() {
    let query = BiometricKeyManager.privateKeyQuery(localKeyId: fixtureLocalKeyId)

    XCTAssertEqual(query[kSecClass as String] as? String, kSecClassKey as String)
    XCTAssertEqual(query[kSecAttrKeyClass as String] as? String, kSecAttrKeyClassPrivate as String)
    XCTAssertEqual(query[kSecAttrKeyType as String] as? String, kSecAttrKeyTypeECSECPrimeRandom as String)
    XCTAssertEqual(
      query[kSecAttrApplicationTag as String] as? Data,
      Data("dev.clerk.trusted_device.tdlk_0123456789abcdef0123456789abcdef".utf8)
    )
    XCTAssertNil(query[kSecAttrAccessGroup as String])
    XCTAssertNil(query[kSecAttrLabel as String])
    XCTAssertNil(query[kSecAttrApplicationLabel as String])
    XCTAssertEqual(query.count, 4)
  }

  func testPrivateKeyAttributesMatchContract() throws {
    let attributes = BiometricKeyManager.privateKeyAttributes(
      localKeyId: fixtureLocalKeyId,
      accessControl: try BiometricKeyManager.accessControl(policy: .biometryCurrentSet)
    )

    XCTAssertEqual(attributes[kSecAttrKeyType as String] as? String, kSecAttrKeyTypeECSECPrimeRandom as String)
    XCTAssertEqual(attributes[kSecAttrKeySizeInBits as String] as? Int, 256)
    XCTAssertEqual(attributes[kSecAttrTokenID as String] as? String, kSecAttrTokenIDSecureEnclave as String)
    XCTAssertNil(attributes[kSecAttrAccessGroup as String])
    XCTAssertEqual(attributes.count, 4)

    let privateKeyAttributes = try XCTUnwrap(attributes[kSecPrivateKeyAttrs as String] as? [String: Any])
    XCTAssertEqual(privateKeyAttributes[kSecAttrIsPermanent as String] as? Bool, true)
    XCTAssertEqual(
      privateKeyAttributes[kSecAttrApplicationTag as String] as? Data,
      Data("dev.clerk.trusted_device.tdlk_0123456789abcdef0123456789abcdef".utf8)
    )
    XCTAssertNotNil(privateKeyAttributes[kSecAttrAccessControl as String])
    XCTAssertNil(privateKeyAttributes[kSecAttrAccessGroup as String])
    XCTAssertEqual(privateKeyAttributes.count, 3)
  }

  func testPolicyRawValuesAndAccessControlFlagsMatchContract() throws {
    XCTAssertEqual(BiometricCredentialPolicy.biometryCurrentSet.rawValue, "biometry_current_set")
    XCTAssertEqual(BiometricCredentialPolicy.biometryAny.rawValue, "biometry_any")
    XCTAssertEqual(BiometricCredentialPolicy.biometryOrDevicePasscode.rawValue, "biometry_or_device_passcode")

    XCTAssertEqual(BiometricKeyManager.accessControlFlags(for: .biometryCurrentSet), [.privateKeyUsage, .biometryCurrentSet])
    XCTAssertEqual(BiometricKeyManager.accessControlFlags(for: .biometryAny), [.privateKeyUsage, .biometryAny])
    XCTAssertEqual(BiometricKeyManager.accessControlFlags(for: .biometryOrDevicePasscode), [.privateKeyUsage, .userPresence])

    for policy in BiometricCredentialPolicy.allCases {
      XCTAssertNoThrow(try BiometricKeyManager.accessControl(policy: policy))
    }
  }

  func testLocalKeyIdFormat() {
    let localKeyId = BiometricCredentialCoding.makeLocalKeyId()

    XCTAssertTrue(localKeyId.hasPrefix("tdlk_"))
    let suffix = localKeyId.dropFirst("tdlk_".count)
    XCTAssertEqual(suffix.count, 32)
    XCTAssertTrue(suffix.allSatisfy { "0123456789abcdef".contains($0) })
    XCTAssertNotEqual(localKeyId, BiometricCredentialCoding.makeLocalKeyId())
  }

  // MARK: - Signing and public key

  func testPublicKeyJWKMatchesContractFormat() throws {
    var representation = Data([0x04])
    representation.append(Data(repeating: 0x01, count: 32))
    representation.append(Data(repeating: 0x02, count: 32))

    XCTAssertEqual(
      try BiometricCredentialCoding.publicKeyJWK(fromX963Representation: representation),
      #"{"kty":"EC","crv":"P-256","x":"AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE","y":"AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgI","alg":"ES256"}"#
    )
  }

  func testPublicKeyJWKRejectsCompressedOrShortKeys() {
    XCTAssertThrowsError(try BiometricCredentialCoding.publicKeyJWK(fromX963Representation: Data([0x02] + Array(repeating: 1, count: 32))))
    XCTAssertThrowsError(try BiometricCredentialCoding.publicKeyJWK(fromX963Representation: Data([0x05] + Array(repeating: 1, count: 64))))
  }

  func testSignatureIsRawRAndSEncodedAsUnpaddedBase64URL() throws {
    let rComponent: [UInt8] = [0x00, 0x80] + Array(repeating: 0xAA, count: 31)
    let sComponent: [UInt8] = Array(repeating: 0x11, count: 31)
    let der = Data([0x30, 0x44, 0x02, UInt8(rComponent.count)] + rComponent + [0x02, UInt8(sComponent.count)] + sComponent)

    let raw = try BiometricCredentialCoding.rawES256Signature(fromDEREncoded: der)

    XCTAssertEqual(raw.count, 64)
    XCTAssertEqual(
      BiometricCredentialCoding.base64URLEncodedString(raw),
      "gKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqoAEREREREREREREREREREREREREREREREREREREREREQ"
    )
  }

  func testRawSignatureRejectsMalformedDER() {
    let valid: [UInt8] = [0x30, 0x06, 0x02, 0x01, 0x01, 0x02, 0x01, 0x02]
    XCTAssertNoThrow(try BiometricCredentialCoding.rawES256Signature(fromDEREncoded: Data(valid)))

    let malformed: [[UInt8]] = [
      [],
      [0x31] + valid.dropFirst(),
      [0x30, 0x07] + valid.dropFirst(2),
      valid + [0x00],
      [0x30, 0x06, 0x02, 0x01, 0x81, 0x02, 0x01, 0x02],
      [0x30, 0x06, 0x02, 0x00, 0x02, 0x02, 0x01, 0x02],
      [0x30, 0x25, 0x02, 0x21, 0x01] + Array(repeating: 0x01, count: 32) + [0x02, 0x01, 0x02],
    ]
    for bytes in malformed {
      XCTAssertThrowsError(try BiometricCredentialCoding.rawES256Signature(fromDEREncoded: Data(bytes)), "\(bytes)") { error in
        XCTAssertEqual((error as? BiometricsError)?.code, .signingFailed)
      }
    }
  }

  func testSecuritySignatureConvertsToVerifiableRawSignature() throws {
    var error: Unmanaged<CFError>?
    let attributes: [String: Any] = [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
    ]
    let privateKey = try XCTUnwrap(SecKeyCreateRandomKey(attributes as CFDictionary, &error))
    let publicKey = try XCTUnwrap(SecKeyCopyPublicKey(privateKey))
    let publicKeyData = try XCTUnwrap(SecKeyCopyExternalRepresentation(publicKey, &error) as Data?)
    let clientData = #"{"challenge":"abc","nonce":"é"}"#

    for _ in 0 ..< 32 {
      let der = try XCTUnwrap(SecKeyCreateSignature(
        privateKey,
        .ecdsaSignatureMessageX962SHA256,
        Data(clientData.utf8) as CFData,
        &error
      ) as Data?)
      let raw = try BiometricCredentialCoding.rawES256Signature(fromDEREncoded: der)

      XCTAssertEqual(raw.count, 64)
      let signature = try P256.Signing.ECDSASignature(rawRepresentation: raw)
      let verifyingKey = try P256.Signing.PublicKey(x963Representation: publicKeyData)
      XCTAssertTrue(verifyingKey.isValidSignature(signature, for: Data(clientData.utf8)))
    }

    let jwk = try BiometricCredentialCoding.publicKeyJWK(fromX963Representation: publicKeyData)
    let decoded = try XCTUnwrap(JSONSerialization.jsonObject(with: Data(jwk.utf8)) as? [String: String])
    XCTAssertEqual(decoded["x"], BiometricCredentialCoding.base64URLEncodedString(publicKeyData[1 ..< 33]))
    XCTAssertEqual(decoded["y"], BiometricCredentialCoding.base64URLEncodedString(publicKeyData[33 ..< 65]))
    XCTAssertFalse(jwk.contains("="))
  }

  // MARK: - Metadata Keychain item

  func testMetadataItemQueryMatchesContract() {
    let query = KeychainMetadataStorage(service: "com.clerk.example").baseQuery()

    XCTAssertEqual(query[kSecClass as String] as? String, kSecClassGenericPassword as String)
    XCTAssertEqual(query[kSecAttrService as String] as? String, "com.clerk.example")
    XCTAssertEqual(query[kSecAttrAccount as String] as? String, "trustedDeviceCredentials")
    XCTAssertNil(query[kSecAttrAccessGroup as String])
    XCTAssertEqual(query.count, 3)
  }

  func testMetadataServicePrefersNonEmptyClerkKeychainService() {
    XCTAssertEqual(BiometricCredentialCoding.metadataService(infoDictionaryService: "com.example.shared", bundleIdentifier: "com.example.app"), "com.example.shared")
    XCTAssertEqual(BiometricCredentialCoding.metadataService(infoDictionaryService: "", bundleIdentifier: "com.example.app"), "com.example.app")
    XCTAssertEqual(BiometricCredentialCoding.metadataService(infoDictionaryService: nil, bundleIdentifier: "com.example.app"), "com.example.app")
    XCTAssertEqual(BiometricCredentialCoding.metadataService(infoDictionaryService: nil, bundleIdentifier: nil), "")
  }

  func testV1FixtureDecodesToExpectedRecords() throws {
    let records = try BiometricCredentialRecordList.decode(Self.fixtureData())

    XCTAssertEqual(records.compactMap(BiometricCredentialRecord.init(jsonObject:)), Self.fixtureRecords)
  }

  func testExpectedRecordsEncodeToV1Fixture() throws {
    var records: [[String: Any]] = []
    for record in Self.fixtureRecords {
      records = BiometricCredentialRecordList.saving(record, into: records).records
    }

    let stored = try XCTUnwrap(BiometricCredentialRecordList.encode(records))
    let storedJSON = try JSONSerialization.jsonObject(with: stored) as? NSArray
    let fixtureJSON = try JSONSerialization.jsonObject(with: Self.fixtureData()) as? NSArray
    XCTAssertNotNil(storedJSON)
    XCTAssertEqual(storedJSON, fixtureJSON)
  }

  func testRecordFieldNamesAndIntegerMilliseconds() throws {
    let data = try XCTUnwrap(BiometricCredentialRecordList.encode(Self.fixtureRecords.prefix(2).map(\.jsonObject)))
    let records = try XCTUnwrap(JSONSerialization.jsonObject(with: data) as? [[String: Any]])

    XCTAssertEqual(Set(records[0].keys), ["id", "localKeyId", "userId", "appIdentifier", "identifierHint", "policy", "createdAt", "updatedAt"])
    XCTAssertEqual(Set(records[1].keys), ["id", "localKeyId", "userId", "appIdentifier", "policy", "createdAt", "updatedAt"])
    XCTAssertEqual((records[0]["createdAt"] as? NSNumber)?.int64Value, 1_714_000_000_500)
    XCTAssertTrue(String(decoding: data, as: UTF8.self).contains(#""createdAt":1714000000500"#))
  }

  func testReadersIgnoreUnknownFieldsAndNormalizeIdentifierHints() throws {
    let json = """
    [{"id":"tdc_future","localKeyId":"tdlk_future","userId":"user_1","appIdentifier":"com.clerk.example",\
    "identifierHint":"  User@Example.COM ","policy":"biometry_any","createdAt":1714000000000.25,\
    "updatedAt":1714000000000,"futureField":{"nested":true}}]
    """
    let listed = BiometricCredentialRecordList.listable(try BiometricCredentialRecordList.decode(Data(json.utf8)))

    XCTAssertEqual(listed.count, 1)
    XCTAssertEqual(listed[0]["identifierHint"] as? String, "user@example.com")
    XCTAssertEqual(listed[0]["futureField"] as? [String: Bool], ["nested": true])
    XCTAssertEqual((listed[0]["createdAt"] as? NSNumber)?.doubleValue, 1_714_000_000_000.25)
  }

  func testInstallationMarkerKeyMatchesContractFormat() {
    XCTAssertEqual(
      BiometricCredentialCoding.installationMarkerKey(service: "com.clerk.example", accessGroup: nil, appIdentifier: "com.clerk.example"),
      "com.clerk.trusted-device-installation-marker.s17:com.clerk.example.n.s17:com.clerk.example"
    )
    XCTAssertEqual(
      BiometricCredentialCoding.installationMarkerKey(service: "com.clerk.é", accessGroup: "TEAMID.com.clerk.shared", appIdentifier: "com.clerk.example"),
      "com.clerk.trusted-device-installation-marker.s12:com.clerk.é.s23:TEAMID.com.clerk.shared.s17:com.clerk.example"
    )
    XCTAssertEqual(
      BiometricCredentialCoding.installationMarkerKey(service: "com.clerk.example", accessGroup: "", appIdentifier: "com.clerk.example"),
      "com.clerk.trusted-device-installation-marker.s17:com.clerk.example.s0:.s17:com.clerk.example"
    )
  }

  static let fixtureRecords: [BiometricCredentialRecord] = [
    BiometricCredentialRecord(
      id: "tdc_contract_current_set",
      localKeyId: "tdlk_0123456789abcdef0123456789abcdef",
      userId: "user_contract_1",
      appIdentifier: "com.clerk.example",
      identifierHint: "user@example.com",
      policy: .biometryCurrentSet,
      createdAt: 1_714_000_000_500,
      updatedAt: 1_714_000_001_500
    ),
    BiometricCredentialRecord(
      id: "tdc_contract_any",
      localKeyId: "tdlk_fedcba9876543210fedcba9876543210",
      userId: "user_contract_2",
      appIdentifier: "com.clerk.example",
      identifierHint: nil,
      policy: .biometryAny,
      createdAt: 1_714_000_002_000,
      updatedAt: 1_714_000_003_000
    ),
    BiometricCredentialRecord(
      id: "tdc_contract_passcode",
      localKeyId: "tdlk_00000000000000000000000000000000",
      userId: "user_contract_1",
      appIdentifier: "com.clerk.other",
      identifierHint: "+15555550100",
      policy: .biometryOrDevicePasscode,
      createdAt: 1_714_000_004_000,
      updatedAt: 1_714_000_004_000
    ),
  ]

  static func fixtureData() throws -> Data {
    let url = try XCTUnwrap(
      Bundle(for: BiometricCredentialContractTests.self).url(forResource: "BiometricCredentialStorageContractV1", withExtension: "json")
    )
    return try Data(contentsOf: url)
  }
}
