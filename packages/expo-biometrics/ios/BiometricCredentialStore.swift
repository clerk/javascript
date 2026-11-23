import Foundation
import Security

protocol BiometricCredentialMetadataStorage {
  func read() throws -> Data?
  func write(_ data: Data) throws
  func delete() throws
}

/// The generic-password item ClerkKit's `SystemKeychain` uses for biometric credential metadata, with no access group.
struct KeychainMetadataStorage: BiometricCredentialMetadataStorage {
  let service: String
  var account: String = BiometricCredentialCoding.metadataAccount

  func read() throws -> Data? {
    var query = baseQuery()
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne

    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    switch status {
    case errSecSuccess:
      return result as? Data
    case errSecItemNotFound:
      return nil
    default:
      throw BiometricsError(.storageFailed, BiometricsError.statusMessage(status))
    }
  }

  func write(_ data: Data) throws {
    var addQuery = baseQuery()
    addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    addQuery[kSecValueData as String] = data

    let status = SecItemAdd(addQuery as CFDictionary, nil)
    switch status {
    case errSecSuccess:
      return
    case errSecDuplicateItem:
      let attributes: [String: Any] = [
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
      ]
      let updateStatus = SecItemUpdate(baseQuery() as CFDictionary, attributes as CFDictionary)
      guard updateStatus == errSecSuccess else {
        throw BiometricsError(.storageFailed, BiometricsError.statusMessage(updateStatus))
      }
    default:
      throw BiometricsError(.storageFailed, BiometricsError.statusMessage(status))
    }
  }

  func delete() throws {
    let status = SecItemDelete(baseQuery() as CFDictionary)
    switch status {
    case errSecSuccess, errSecItemNotFound:
      return
    default:
      throw BiometricsError(.storageFailed, BiometricsError.statusMessage(status))
    }
  }

  func baseQuery() -> [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]
  }
}

/// Read-modify-write operations on the shared metadata item. Every operation runs under one lock and first applies the
/// reinstall marker, so records written here are never wiped by ClerkKit's first configuration in this installation.
final class BiometricCredentialStore {
  private let storage: BiometricCredentialMetadataStorage
  private let deleteKey: (String) throws -> Void
  private let userDefaults: UserDefaults
  private let service: String
  private let appIdentifier: String?
  private let lock = NSRecursiveLock()

  init(
    storage: BiometricCredentialMetadataStorage,
    deleteKey: @escaping (String) throws -> Void,
    userDefaults: UserDefaults,
    service: String,
    appIdentifier: String?
  ) {
    self.storage = storage
    self.deleteKey = deleteKey
    self.userDefaults = userDefaults
    self.service = service
    self.appIdentifier = appIdentifier
  }

  static func live(keyManager: BiometricKeyManager, bundle: Bundle = .main) -> BiometricCredentialStore {
    let service = BiometricCredentialCoding.metadataService(
      infoDictionaryService: bundle.object(forInfoDictionaryKey: "ClerkKeychainService") as? String,
      bundleIdentifier: bundle.bundleIdentifier
    )
    return BiometricCredentialStore(
      storage: KeychainMetadataStorage(service: service),
      deleteKey: { try keyManager.deleteKey(localKeyId: $0) },
      userDefaults: .standard,
      service: service,
      appIdentifier: bundle.bundleIdentifier
    )
  }

  var installationMarkerKey: String {
    BiometricCredentialCoding.installationMarkerKey(service: service, accessGroup: nil, appIdentifier: appIdentifier)
  }

  /// Returns `true` when the marker was missing and this app's records and keys from a previous installation were deleted.
  @discardableResult
  func ensureInstallationMarker() throws -> Bool {
    lock.lock()
    defer { lock.unlock() }

    guard appIdentifier != nil else { return false }
    let markerKey = installationMarkerKey
    if userDefaults.object(forKey: markerKey) as? Bool == true {
      return false
    }

    let records = try readRecords()
    var remaining: [[String: Any]] = []
    var keyDeletionError: Error?
    for record in records {
      guard record[BiometricCredentialRecord.Field.appIdentifier] as? String == appIdentifier else {
        remaining.append(record)
        continue
      }
      if let localKeyId = record[BiometricCredentialRecord.Field.localKeyId] as? String {
        do {
          try deleteKey(localKeyId)
        } catch {
          keyDeletionError = keyDeletionError ?? error
          remaining.append(record)
          continue
        }
      }
    }

    if remaining.count != records.count {
      try persist(remaining)
    }
    if let keyDeletionError {
      throw keyDeletionError
    }

    userDefaults.set(true, forKey: markerKey)
    return true
  }

  /// JSON array of every well-formed record, for every app identifier.
  func listRecordsJSON() throws -> String {
    lock.lock()
    defer { lock.unlock() }

    try ensureInstallationMarker()
    let data = try JSONSerialization.data(withJSONObject: BiometricCredentialRecordList.listable(readRecords()))
    return String(decoding: data, as: UTF8.self)
  }

  func save(_ record: BiometricCredentialRecord, removeOtherRecordsForApp: Bool) throws {
    lock.lock()
    defer { lock.unlock() }

    try ensureInstallationMarker()
    let result = BiometricCredentialRecordList.saving(record, into: try readRecords())
    try persist(result.records)

    for localKeyId in result.replacedLocalKeyIds where localKeyId != record.localKeyId {
      try? deleteKey(localKeyId)
    }

    guard removeOtherRecordsForApp else { return }

    var remaining: [[String: Any]] = []
    for object in result.records {
      let isOtherRecordForApp = object[BiometricCredentialRecord.Field.appIdentifier] as? String == record.appIdentifier
        && object[BiometricCredentialRecord.Field.id] as? String != record.id
      guard isOtherRecordForApp else {
        remaining.append(object)
        continue
      }
      if let localKeyId = object[BiometricCredentialRecord.Field.localKeyId] as? String, localKeyId != record.localKeyId {
        do {
          try deleteKey(localKeyId)
        } catch {
          remaining.append(object)
          continue
        }
      }
    }
    if remaining.count != result.records.count {
      try? persist(remaining)
    }
  }

  /// Deletes the key, then every record that references it. When the key cannot be deleted the records are kept.
  func deleteRecords(localKeyId: String) throws {
    lock.lock()
    defer { lock.unlock() }

    try ensureInstallationMarker()
    try deleteKey(localKeyId)

    let records = try readRecords()
    let remaining = records.filter { $0[BiometricCredentialRecord.Field.localKeyId] as? String != localKeyId }
    if remaining.count != records.count {
      try persist(remaining)
    }
  }

  private func readRecords() throws -> [[String: Any]] {
    try BiometricCredentialRecordList.decode(storage.read())
  }

  private func persist(_ records: [[String: Any]]) throws {
    if let data = try BiometricCredentialRecordList.encode(records) {
      try storage.write(data)
    } else {
      try storage.delete()
    }
  }
}
