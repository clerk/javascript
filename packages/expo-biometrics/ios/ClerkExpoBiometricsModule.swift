import ExpoModulesCore
import Foundation

final class ClerkBiometricsException: Exception {
  private let errorCode: String
  private let message: String

  init(_ error: BiometricsError) {
    errorCode = error.code.rawValue
    message = error.message
    super.init()
  }

  override var code: String { errorCode }
  override var reason: String { message }
}

struct BiometricAvailabilityResult: Record {
  @Field var biometryType: String = "none"
  @Field var canEvaluateBiometrics: Bool = false
  @Field var canEvaluateDeviceOwner: Bool = false
  @Field var errorCode: String?
  @Field var secureKeyStorageAvailable: Bool = false
}

struct BiometricCredentialKeyResult: Record {
  @Field var localKeyId: String = ""
  @Field var publicKeyJwk: String = ""
}

struct BiometricCredentialRecordInput: Record {
  @Field var id: String = ""
  @Field var localKeyId: String = ""
  @Field var userId: String = ""
  @Field var appIdentifier: String = ""
  @Field var identifierHint: String?
  @Field var policy: String = ""
  @Field var createdAt: Double = -1
  @Field var updatedAt: Double = -1
}

struct SaveRecordOptions: Record {
  @Field var removeOtherRecordsForApp: Bool = false
}

struct InstallationMarkerResult: Record {
  @Field var wiped: Bool = false
}

public final class ClerkExpoBiometricsModule: Module {
  private let keyManager = BiometricKeyManager()
  private lazy var store = BiometricCredentialStore.live(keyManager: keyManager)

  public func definition() -> ModuleDefinition {
    Name("ClerkExpoBiometrics")

    Function("getAppIdentifier") { () -> String in
      Bundle.main.bundleIdentifier ?? ""
    }

    AsyncFunction("getAvailability") { () -> BiometricAvailabilityResult in
      let availability = self.keyManager.availability()
      let result = BiometricAvailabilityResult()
      result.biometryType = availability.biometryType
      result.canEvaluateBiometrics = availability.canEvaluateBiometrics
      result.canEvaluateDeviceOwner = availability.canEvaluateDeviceOwner
      result.errorCode = availability.errorCode?.rawValue
      result.secureKeyStorageAvailable = availability.secureKeyStorageAvailable
      return result
    }

    AsyncFunction("createKey") { (policy: String) throws -> BiometricCredentialKeyResult in
      try Self.bridge {
        guard let policy = BiometricCredentialPolicy(rawValue: policy) else {
          throw BiometricsError(.invalidArgument, "Unknown biometric credential policy '\(policy)'.")
        }
        let key = try self.keyManager.createKey(policy: policy)
        let result = BiometricCredentialKeyResult()
        result.localKeyId = key.localKeyId
        result.publicKeyJwk = key.publicKeyJWK
        return result
      }
    }

    AsyncFunction("sign") { (localKeyId: String, clientData: String, reason: String?) throws -> String in
      try Self.bridge {
        try self.keyManager.sign(localKeyId: localKeyId, clientData: clientData, reason: reason)
      }
    }

    AsyncFunction("hasKey") { (localKeyId: String) throws -> Bool in
      try Self.bridge { try self.keyManager.hasKey(localKeyId: localKeyId) }
    }

    AsyncFunction("deleteKey") { (localKeyId: String) throws in
      try Self.bridge { try self.keyManager.deleteKey(localKeyId: localKeyId) }
    }

    // Store operations run on the main queue so they cannot interleave with ClerkKit's @MainActor store access.
    AsyncFunction("listRecords") { () throws -> String in
      try Self.bridge { try self.store.listRecordsJSON() }
    }.runOnQueue(.main)

    AsyncFunction("saveRecord") { (input: BiometricCredentialRecordInput, options: SaveRecordOptions) throws in
      try Self.bridge {
        try self.store.save(Self.record(from: input), removeOtherRecordsForApp: options.removeOtherRecordsForApp)
      }
    }.runOnQueue(.main)

    AsyncFunction("deleteRecord") { (localKeyId: String) throws in
      try Self.bridge { try self.store.deleteRecords(localKeyId: localKeyId) }
    }.runOnQueue(.main)

    AsyncFunction("ensureInstallationMarker") { () throws -> InstallationMarkerResult in
      try Self.bridge {
        let result = InstallationMarkerResult()
        result.wiped = try self.store.ensureInstallationMarker()
        return result
      }
    }.runOnQueue(.main)
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
