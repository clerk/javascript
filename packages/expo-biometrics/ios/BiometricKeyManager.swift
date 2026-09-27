import Foundation
import LocalAuthentication
import Security

struct BiometricAvailability: Equatable {
  let biometryType: String
  let canEvaluateBiometrics: Bool
  let canEvaluateDeviceOwner: Bool
  let errorCode: BiometricsError.Code?
}

struct BiometricCredentialKey: Equatable {
  let localKeyId: String
  let publicKeyJWK: String
}

/// Secure Enclave keys laid out as ClerkKit's `BiometricCredentialKeyManager` creates them.
final class BiometricKeyManager {
  func availability() -> BiometricAvailability {
    let context = LAContext()
    var biometricsError: NSError?
    let canEvaluateBiometrics = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &biometricsError)
    // biometryType is only populated after canEvaluatePolicy has run.
    let biometryType = Self.biometryTypeName(context.biometryType)
    var deviceOwnerError: NSError?
    let canEvaluateDeviceOwner = context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &deviceOwnerError)

    return BiometricAvailability(
      biometryType: biometryType,
      canEvaluateBiometrics: canEvaluateBiometrics,
      canEvaluateDeviceOwner: canEvaluateDeviceOwner,
      errorCode: canEvaluateBiometrics
        ? nil
        : BiometricsError.localAuthentication(biometricsError, fallback: .biometryNotAvailable).code
    )
  }

  func createKey(policy: BiometricCredentialPolicy) throws -> BiometricCredentialKey {
    let context = LAContext()
    var laError: NSError?
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &laError) else {
      throw BiometricsError.localAuthentication(laError, fallback: .biometryNotAvailable)
    }

    let localKeyId = BiometricCredentialCoding.makeLocalKeyId()
    let attributes = Self.privateKeyAttributes(localKeyId: localKeyId, accessControl: try Self.accessControl(policy: policy))

    var error: Unmanaged<CFError>?
    guard let privateKey = SecKeyCreateRandomKey(attributes as CFDictionary, &error) else {
      throw Self.cfError(error, fallback: .keyGenerationFailed)
    }

    do {
      return BiometricCredentialKey(localKeyId: localKeyId, publicKeyJWK: try Self.publicKeyJWK(for: privateKey))
    } catch {
      try? deleteKey(localKeyId: localKeyId)
      throw error
    }
  }

  func sign(localKeyId: String, clientData: String, reason: String?) throws -> String {
    let privateKey = try privateKey(localKeyId: localKeyId, reason: reason)
    let algorithm = SecKeyAlgorithm.ecdsaSignatureMessageX962SHA256
    guard SecKeyIsAlgorithmSupported(privateKey, .sign, algorithm) else {
      throw BiometricsError(.signingFailed, "The key does not support ES256 signing.")
    }

    var error: Unmanaged<CFError>?
    guard let signature = SecKeyCreateSignature(privateKey, algorithm, Data(clientData.utf8) as CFData, &error) as Data? else {
      throw Self.cfError(error, fallback: .signingFailed)
    }

    return BiometricCredentialCoding.base64URLEncodedString(
      try BiometricCredentialCoding.rawES256Signature(fromDEREncoded: signature)
    )
  }

  func hasKey(localKeyId: String) throws -> Bool {
    var query = Self.privateKeyQuery(localKeyId: localKeyId)
    query[kSecMatchLimit as String] = kSecMatchLimitOne

    let status = SecItemCopyMatching(query as CFDictionary, nil)
    switch status {
    case errSecSuccess:
      return true
    case errSecItemNotFound:
      return false
    default:
      throw BiometricsError(.storageFailed, BiometricsError.statusMessage(status))
    }
  }

  func deleteKey(localKeyId: String) throws {
    let status = SecItemDelete(Self.privateKeyQuery(localKeyId: localKeyId) as CFDictionary)
    switch status {
    case errSecSuccess, errSecItemNotFound:
      return
    default:
      throw BiometricsError(.storageFailed, BiometricsError.statusMessage(status))
    }
  }

  private func privateKey(localKeyId: String, reason: String?) throws -> SecKey {
    let context = LAContext()
    if let reason {
      context.localizedReason = reason
    }

    var query = Self.privateKeyQuery(localKeyId: localKeyId)
    query[kSecReturnRef as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    query[kSecUseAuthenticationContext as String] = context

    var result: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &result)
    switch status {
    case errSecSuccess:
      guard let result, CFGetTypeID(result) == SecKeyGetTypeID() else {
        throw BiometricsError(.keyNotFound, "The biometric credential key was not found.")
      }
      return result as! SecKey
    case errSecItemNotFound:
      throw BiometricsError(.keyNotFound, "The biometric credential key was not found.")
    default:
      throw BiometricsError.status(status, fallback: .signingFailed)
    }
  }

  static func accessControlFlags(for policy: BiometricCredentialPolicy) -> SecAccessControlCreateFlags {
    switch policy {
    case .biometryCurrentSet:
      return [.privateKeyUsage, .biometryCurrentSet]
    case .biometryAny:
      return [.privateKeyUsage, .biometryAny]
    case .biometryOrDevicePasscode:
      return [.privateKeyUsage, .userPresence]
    }
  }

  static func accessControl(policy: BiometricCredentialPolicy) throws -> SecAccessControl {
    var error: Unmanaged<CFError>?
    guard let accessControl = SecAccessControlCreateWithFlags(
      kCFAllocatorDefault,
      kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
      accessControlFlags(for: policy),
      &error
    ) else {
      throw cfError(error, fallback: .keyGenerationFailed)
    }
    return accessControl
  }

  static func privateKeyAttributes(localKeyId: String, accessControl: SecAccessControl) -> [String: Any] {
    [
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrKeySizeInBits as String: 256,
      kSecAttrTokenID as String: kSecAttrTokenIDSecureEnclave,
      kSecPrivateKeyAttrs as String: [
        kSecAttrIsPermanent as String: true,
        kSecAttrApplicationTag as String: BiometricCredentialCoding.applicationTag(localKeyId: localKeyId),
        kSecAttrAccessControl as String: accessControl,
      ] as [String: Any],
    ]
  }

  static func privateKeyQuery(localKeyId: String) -> [String: Any] {
    [
      kSecClass as String: kSecClassKey,
      kSecAttrKeyClass as String: kSecAttrKeyClassPrivate,
      kSecAttrKeyType as String: kSecAttrKeyTypeECSECPrimeRandom,
      kSecAttrApplicationTag as String: BiometricCredentialCoding.applicationTag(localKeyId: localKeyId),
    ]
  }

  static func biometryTypeName(_ type: LABiometryType) -> String {
    switch type {
    case .faceID:
      return "faceID"
    case .touchID:
      return "touchID"
    default:
      if #available(iOS 17.0, *), type == .opticID {
        return "opticID"
      }
      return "none"
    }
  }

  private static func publicKeyJWK(for privateKey: SecKey) throws -> String {
    guard let publicKey = SecKeyCopyPublicKey(privateKey) else {
      throw BiometricsError(.keyGenerationFailed, "Unable to copy the public key.")
    }
    var error: Unmanaged<CFError>?
    guard let representation = SecKeyCopyExternalRepresentation(publicKey, &error) as Data? else {
      throw cfError(error, fallback: .keyGenerationFailed)
    }
    return try BiometricCredentialCoding.publicKeyJWK(fromX963Representation: representation)
  }

  private static func cfError(_ error: Unmanaged<CFError>?, fallback: BiometricsError.Code) -> BiometricsError {
    guard let error else {
      return BiometricsError(fallback, "Unknown Security framework error.")
    }
    return BiometricsError.security(error.takeRetainedValue() as Error, fallback: fallback)
  }
}
