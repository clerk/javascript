import ExpoModulesCore
import Foundation

final class ClerkBiometricsException: Exception {
  private let errorCode: String
  private let errorMessage: String

  init(_ error: BiometricsError) {
    errorCode = error.code.rawValue
    errorMessage = error.message
    super.init()
  }

  override var code: String { errorCode }
  override var reason: String { errorMessage }
}

@Record
struct BiometricAvailabilityResult {
  var biometryType: String = "none"
  var canEvaluateBiometrics: Bool = false
  var canEvaluateDeviceOwner: Bool = false
  var errorCode: String?
  var secureKeyStorageAvailable: Bool = false
}

@Record
struct BiometricCredentialKeyResult {
  var localKeyId: String = ""
  var publicKeyJwk: String = ""
}

@Record
struct BiometricCredentialRecordInput {
  var id: String = ""
  var localKeyId: String = ""
  var userId: String = ""
  var appIdentifier: String = ""
  var identifierHint: String?
  var policy: String = ""
  var createdAt: Double = -1
  var updatedAt: Double = -1
}

@Record
struct SaveRecordOptions {
  var removeOtherRecordsForApp: Bool = false
}

@Record
struct InstallationMarkerResult {
  var wiped: Bool = false
}

@ExpoModule("ClerkExpoBiometrics")
public final class ClerkExpoBiometricsModule: Module {
  private let keyManager = BiometricKeyManager()
  private lazy var store = BiometricCredentialStore.live(keyManager: keyManager)

  @JS
  func getAppIdentifier() -> String {
    Bundle.main.bundleIdentifier ?? ""
  }

  @JS
  func hashIdentifierHint(hint: String) -> String? {
    BiometricCredentialCoding.identifierHintSHA256(hint)
  }

  @JS(.concurrent)
  func getAvailability() async -> BiometricAvailabilityResult {
    let availability = keyManager.availability()
    return BiometricAvailabilityResult(
      biometryType: availability.biometryType,
      canEvaluateBiometrics: availability.canEvaluateBiometrics,
      canEvaluateDeviceOwner: availability.canEvaluateDeviceOwner,
      errorCode: availability.errorCode?.rawValue,
      secureKeyStorageAvailable: availability.secureKeyStorageAvailable
    )
  }

  @JS(.concurrent)
  func createKey(policy: String) async throws -> BiometricCredentialKeyResult {
    try Self.bridge {
      guard let policy = BiometricCredentialPolicy(rawValue: policy) else {
        throw BiometricsError(.invalidArgument, "Unknown biometric credential policy '\(policy)'.")
      }
      let key = try keyManager.createKey(policy: policy)
      return BiometricCredentialKeyResult(localKeyId: key.localKeyId, publicKeyJwk: key.publicKeyJWK)
    }
  }

  @JS(.concurrent)
  func sign(localKeyId: String, clientData: String, reason: String?) async throws -> String {
    try Self.bridge {
      try keyManager.sign(localKeyId: localKeyId, clientData: clientData, reason: reason)
    }
  }

  @JS(.concurrent)
  func hasKey(localKeyId: String) async throws -> Bool {
    try Self.bridge { try keyManager.hasKey(localKeyId: localKeyId) }
  }

  @JS(.concurrent)
  func deleteKey(localKeyId: String) async throws {
    try Self.bridge { try keyManager.deleteKey(localKeyId: localKeyId) }
  }

  // Store operations run on the main actor so they cannot interleave with ClerkKit's @MainActor store access.
  @JS
  @MainActor
  func listRecords() async throws -> String {
    try Self.bridge { try store.listRecordsJSON() }
  }

  @JS
  @MainActor
  func saveRecord(input: BiometricCredentialRecordInput, options: SaveRecordOptions) async throws {
    try Self.bridge {
      try store.save(Self.record(from: input), removeOtherRecordsForApp: options.removeOtherRecordsForApp)
    }
  }

  @JS
  @MainActor
  func deleteRecord(localKeyId: String) async throws {
    try Self.bridge { try store.deleteRecords(localKeyId: localKeyId) }
  }

  @JS
  @MainActor
  func ensureInstallationMarker() async throws -> InstallationMarkerResult {
    try Self.bridge { InstallationMarkerResult(wiped: try store.ensureInstallationMarker()) }
  }

  static func record(from input: BiometricCredentialRecordInput) throws -> BiometricCredentialRecord {
    for (name, value) in [
      ("id", input.id),
      ("localKeyId", input.localKeyId),
      ("userId", input.userId),
      ("appIdentifier", input.appIdentifier),
    ] where value.isEmpty {
      throw BiometricsError(.invalidArgument, "record.\(name) must be a non-empty string.")
    }
    guard let policy = BiometricCredentialPolicy(rawValue: input.policy) else {
      throw BiometricsError(.invalidArgument, "Unknown biometric credential policy '\(input.policy)'.")
    }
    guard
      BiometricCredentialRecord.isValidTimestamp(input.createdAt),
      BiometricCredentialRecord.isValidTimestamp(input.updatedAt)
    else {
      throw BiometricsError(.invalidArgument, "record.createdAt and record.updatedAt must be milliseconds since the Unix epoch.")
    }
    return BiometricCredentialRecord(
      id: input.id,
      localKeyId: input.localKeyId,
      userId: input.userId,
      appIdentifier: input.appIdentifier,
      identifierHint: input.identifierHint,
      policy: policy,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt
    )
  }

  private static func bridge<T>(_ body: () throws -> T) throws -> T {
    do {
      return try body()
    } catch let error as BiometricsError {
      throw ClerkBiometricsException(error)
    }
  }
}
