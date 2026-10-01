import CryptoKit
import Foundation

// Mirrors the format pinned by clerk-ios BiometricCredentialStorageContractTests. Any change here must stay
// byte-compatible with ClerkKit, which reads and writes the same keys, Keychain item, and UserDefaults marker.

enum BiometricCredentialPolicy: String, CaseIterable {
  case biometryCurrentSet = "biometry_current_set"
  case biometryAny = "biometry_any"
  case biometryOrDevicePasscode = "biometry_or_device_passcode"
}

enum BiometricCredentialCoding {
  static let applicationTagPrefix = "dev.clerk.trusted_device"
  static let metadataAccount = "trustedDeviceCredentials"
  static let installationMarkerPrefix = "com.clerk.trusted-device-installation-marker"

  static func makeLocalKeyId() -> String {
    "tdlk_" + UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased()
  }

  static func applicationTag(localKeyId: String) -> Data {
    Data("\(applicationTagPrefix).\(localKeyId)".utf8)
  }

  static func metadataService(infoDictionaryService: String?, bundleIdentifier: String?) -> String {
    if let infoDictionaryService, !infoDictionaryService.isEmpty {
      return infoDictionaryService
    }
    return bundleIdentifier ?? ""
  }

  static func installationMarkerKey(service: String?, accessGroup: String?, appIdentifier: String?) -> String {
    [
      installationMarkerPrefix,
      encodeInstallationMarkerComponent(service),
      encodeInstallationMarkerComponent(accessGroup),
      encodeInstallationMarkerComponent(appIdentifier),
    ].joined(separator: ".")
  }

  private static func encodeInstallationMarkerComponent(_ value: String?) -> String {
    guard let value else { return "n" }
    return "s\(value.utf8.count):\(value)"
  }

  /// Lowercase hex SHA-256 of the normalized hint, as clerk-android's storage contract v2 stores it; `nil` when it is empty.
  static func identifierHintSHA256(_ identifierHint: String?) -> String? {
    guard let normalized = BiometricCredentialRecord.normalizedIdentifierHint(identifierHint) else { return nil }
    return SHA256.hash(data: Data(normalized.utf8)).map { String(format: "%02x", $0) }.joined()
  }

  static func base64URLEncodedString<D: DataProtocol>(_ data: D) -> String {
    Data(data)
      .base64EncodedString()
      .replacingOccurrences(of: "+", with: "-")
      .replacingOccurrences(of: "/", with: "_")
      .replacingOccurrences(of: "=", with: "")
  }

  static func publicKeyJWK(fromX963Representation representation: Data) throws -> String {
    let bytes = [UInt8](representation)
    guard bytes.count == 65, bytes[0] == 0x04 else {
      throw BiometricsError(.keyGenerationFailed, "The public key is not an uncompressed P-256 point.")
    }
    let x = base64URLEncodedString(bytes[1 ..< 33])
    let y = base64URLEncodedString(bytes[33 ..< 65])
    return #"{"kty":"EC","crv":"P-256","x":"\#(x)","y":"\#(y)","alg":"ES256"}"#
  }

  static func rawES256Signature(fromDEREncoded signature: Data) throws -> Data {
    let bytes = [UInt8](signature)
    var offset = 0

    guard try readDERByte(bytes, offset: &offset) == 0x30 else {
      throw invalidSignature()
    }
    let sequenceLength = try readDERLength(bytes, offset: &offset)
    guard sequenceLength == bytes.count - offset else {
      throw invalidSignature()
    }

    let r = try readDERInteger(bytes, offset: &offset)
    let s = try readDERInteger(bytes, offset: &offset)
    guard offset == bytes.count else {
      throw invalidSignature()
    }

    var raw = try paddedES256Component(r)
    raw.append(try paddedES256Component(s))
    return raw
  }

  private static func readDERByte(_ bytes: [UInt8], offset: inout Int) throws -> UInt8 {
    guard offset < bytes.count else { throw invalidSignature() }
    let byte = bytes[offset]
    offset += 1
    return byte
  }

  private static func readDERLength(_ bytes: [UInt8], offset: inout Int) throws -> Int {
    let first = try readDERByte(bytes, offset: &offset)
    if first & 0x80 == 0 {
      return Int(first)
    }
    let byteCount = Int(first & 0x7F)
    guard byteCount > 0, byteCount <= MemoryLayout<Int>.size, byteCount <= bytes.count - offset else {
      throw invalidSignature()
    }
    var length = 0
    for _ in 0 ..< byteCount {
      length = (length << 8) | Int(try readDERByte(bytes, offset: &offset))
    }
    return length
  }

  private static func readDERInteger(_ bytes: [UInt8], offset: inout Int) throws -> [UInt8] {
    guard try readDERByte(bytes, offset: &offset) == 0x02 else { throw invalidSignature() }
    let length = try readDERLength(bytes, offset: &offset)
    guard length > 0, length <= bytes.count - offset else { throw invalidSignature() }
    let value = Array(bytes[offset ..< offset + length])
    offset += length
    return value
  }

  private static func paddedES256Component(_ bytes: [UInt8]) throws -> Data {
    guard let first = bytes.first, first & 0x80 == 0 else { throw invalidSignature() }
    var component = bytes
    while component.first == 0x00, component.count > 32 {
      component.removeFirst()
    }
    guard !component.isEmpty, component.count <= 32 else { throw invalidSignature() }
    var padded = Data(repeating: 0x00, count: 32 - component.count)
    padded.append(contentsOf: component)
    return padded
  }

  private static func invalidSignature() -> BiometricsError {
    BiometricsError(.signingFailed, "Security returned an invalid ES256 signature.")
  }
}

/// A record in the metadata Keychain item.
struct BiometricCredentialRecord: Equatable {
  enum Field {
    static let id = "id"
    static let localKeyId = "localKeyId"
    static let userId = "userId"
    static let appIdentifier = "appIdentifier"
    static let identifierHint = "identifierHint"
    static let identifierHintSha256 = "identifierHintSha256"
    static let policy = "policy"
    static let createdAt = "createdAt"
    static let updatedAt = "updatedAt"
  }

  let id: String
  let localKeyId: String
  let userId: String
  let appIdentifier: String
  let identifierHint: String?
  let policy: BiometricCredentialPolicy
  /// Milliseconds since the Unix epoch.
  let createdAt: Double
  /// Milliseconds since the Unix epoch.
  let updatedAt: Double

  init(
    id: String,
    localKeyId: String,
    userId: String,
    appIdentifier: String,
    identifierHint: String?,
    policy: BiometricCredentialPolicy,
    createdAt: Double,
    updatedAt: Double
  ) {
    self.id = id
    self.localKeyId = localKeyId
    self.userId = userId
    self.appIdentifier = appIdentifier
    self.identifierHint = Self.normalizedIdentifierHint(identifierHint)
    self.policy = policy
    self.createdAt = createdAt
    self.updatedAt = updatedAt
  }

  /// Decodes a stored record, returning `nil` for records ClerkKit treats as malformed.
  init?(jsonObject object: [String: Any]) {
    guard
      let id = object[Field.id] as? String,
      let localKeyId = object[Field.localKeyId] as? String,
      let userId = object[Field.userId] as? String,
      let appIdentifier = object[Field.appIdentifier] as? String,
      let policyValue = object[Field.policy] as? String,
      let policy = BiometricCredentialPolicy(rawValue: policyValue),
      let createdAt = Self.number(object[Field.createdAt]),
      let updatedAt = Self.number(object[Field.updatedAt])
    else {
      return nil
    }

    let identifierHint: String?
    switch object[Field.identifierHint] {
    case .none, is NSNull:
      identifierHint = nil
    case let value as String:
      identifierHint = value
    default:
      return nil
    }

    self.init(
      id: id,
      localKeyId: localKeyId,
      userId: userId,
      appIdentifier: appIdentifier,
      identifierHint: identifierHint,
      policy: policy,
      createdAt: createdAt,
      updatedAt: updatedAt
    )
  }

  /// The object written to the Keychain: integer milliseconds, `identifierHint` omitted when absent.
  var jsonObject: [String: Any] {
    var object: [String: Any] = [
      Field.id: id,
      Field.localKeyId: localKeyId,
      Field.userId: userId,
      Field.appIdentifier: appIdentifier,
      Field.policy: policy.rawValue,
      Field.createdAt: Int64(createdAt.rounded()),
      Field.updatedAt: Int64(updatedAt.rounded()),
    ]
    if let identifierHint {
      object[Field.identifierHint] = identifierHint
    }
    return object
  }

  static func normalizedIdentifierHint(_ identifierHint: String?) -> String? {
    guard let identifierHint else { return nil }
    let normalized = identifierHint.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    return normalized.isEmpty ? nil : normalized
  }

  static func isValidTimestamp(_ value: Double) -> Bool {
    value.isFinite && value >= 0 && value < 9.0e15
  }

  private static func number(_ value: Any?) -> Double? {
    guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() else {
      return nil
    }
    return number.doubleValue
  }
}

enum BiometricCredentialRecordList {
  /// Parses the metadata item. A missing item is an empty list; a top-level value that is not an array of objects is an error.
  static func decode(_ data: Data?) throws -> [[String: Any]] {
    guard let data else { return [] }
    let object: Any
    do {
      object = try JSONSerialization.jsonObject(with: data)
    } catch {
      throw BiometricsError(.storageFailed, "Biometric credential metadata is not valid JSON.")
    }
    guard let records = object as? [[String: Any]] else {
      throw BiometricsError(.storageFailed, "Biometric credential metadata is not an array.")
    }
    return records
  }

  /// Serializes the list, or returns `nil` when it is empty so the caller deletes the item instead of writing `[]`.
  static func encode(_ records: [[String: Any]]) throws -> Data? {
    guard !records.isEmpty else { return nil }
    do {
      return try JSONSerialization.data(withJSONObject: records)
    } catch {
      throw BiometricsError(.storageFailed, "Biometric credential metadata could not be encoded.")
    }
  }

  /// Well-formed records with their stored fields passed through, `identifierHint` normalized as ClerkKit reads it, and
  /// its `identifierHintSha256`.
  static func listable(_ records: [[String: Any]]) -> [[String: Any]] {
    records.compactMap { object in
      guard let record = BiometricCredentialRecord(jsonObject: object) else { return nil }
      var listed = object
      if let identifierHint = record.identifierHint {
        listed[BiometricCredentialRecord.Field.identifierHint] = identifierHint
      } else {
        listed.removeValue(forKey: BiometricCredentialRecord.Field.identifierHint)
      }
      listed[BiometricCredentialRecord.Field.identifierHintSha256] =
        BiometricCredentialCoding.identifierHintSHA256(record.identifierHint) ?? NSNull()
      return listed
    }
  }

  struct SaveResult {
    let records: [[String: Any]]
    /// Keys of records with the same `id` that pointed at a different key.
    let replacedLocalKeyIds: [String]
  }

  /// Replaces any record with the same `id`, drops malformed records for the same app, and keeps everything else untouched.
  static func saving(_ record: BiometricCredentialRecord, into records: [[String: Any]]) -> SaveResult {
    var kept: [[String: Any]] = []
    var replacedLocalKeyIds: [String] = []

    for object in records {
      if object[BiometricCredentialRecord.Field.id] as? String == record.id {
        if let localKeyId = object[BiometricCredentialRecord.Field.localKeyId] as? String,
           localKeyId != record.localKeyId
        {
          replacedLocalKeyIds.append(localKeyId)
        }
        continue
      }
      guard object[BiometricCredentialRecord.Field.appIdentifier] as? String == record.appIdentifier else {
        kept.append(object)
        continue
      }
      if BiometricCredentialRecord(jsonObject: object) != nil {
        kept.append(object)
      }
    }

    kept.append(record.jsonObject)
    return SaveResult(records: kept, replacedLocalKeyIds: replacedLocalKeyIds)
  }
}
