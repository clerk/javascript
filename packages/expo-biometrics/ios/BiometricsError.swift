import Foundation
import LocalAuthentication
import Security

struct BiometricsError: Error, Equatable {
  enum Code: String {
    case userCanceled = "user_canceled"
    case systemCanceled = "system_canceled"
    case userFallback = "user_fallback"
    case authenticationFailed = "authentication_failed"
    case biometryNotAvailable = "biometry_not_available"
    case biometryNotEnrolled = "biometry_not_enrolled"
    case biometryLockout = "biometry_lockout"
    case passcodeNotSet = "passcode_not_set"
    case secureKeyStorageUnavailable = "secure_key_storage_unavailable"
    case keyNotFound = "key_not_found"
    case keyInvalidated = "key_invalidated"
    case keyGenerationFailed = "key_generation_failed"
    case signingFailed = "signing_failed"
    case storageFailed = "storage_failed"
    case invalidArgument = "invalid_argument"
  }

  let code: Code
  let message: String

  init(_ code: Code, _ message: String) {
    self.code = code
    self.message = message
  }

  static func localAuthentication(_ error: Error?, fallback: Code) -> BiometricsError {
    guard let error = error as NSError?, error.domain == LAErrorDomain else {
      return BiometricsError(fallback, error?.localizedDescription ?? "Local authentication failed.")
    }
    return BiometricsError(code(forLAErrorCode: error.code) ?? fallback, error.localizedDescription)
  }

  static func security(_ error: Error, fallback: Code) -> BiometricsError {
    let nsError = error as NSError
    let code: Code?
    switch nsError.domain {
    case LAErrorDomain:
      code = Self.code(forLAErrorCode: nsError.code)
    case NSOSStatusErrorDomain:
      code = Self.code(forStatus: OSStatus(truncatingIfNeeded: nsError.code))
    case cryptoTokenKitErrorDomain:
      code = Self.code(forCryptoTokenKitErrorCode: nsError.code)
    default:
      code = nil
    }
    return BiometricsError(code ?? fallback, nsError.localizedDescription)
  }

  static func status(_ status: OSStatus, fallback: Code) -> BiometricsError {
    BiometricsError(code(forStatus: status) ?? fallback, statusMessage(status))
  }

  static func statusMessage(_ status: OSStatus) -> String {
    let description = SecCopyErrorMessageString(status, nil) as String? ?? "Unknown error"
    return "\(description) (OSStatus \(status))"
  }

  static func code(forLAErrorCode rawValue: Int) -> Code? {
    switch LAError.Code(rawValue: rawValue) {
    case .userCancel:
      return .userCanceled
    case .appCancel, .systemCancel:
      return .systemCanceled
    case .userFallback:
      return .userFallback
    case .authenticationFailed:
      return .authenticationFailed
    case .biometryNotAvailable:
      return .biometryNotAvailable
    case .biometryNotEnrolled:
      return .biometryNotEnrolled
    case .biometryLockout:
      return .biometryLockout
    case .passcodeNotSet:
      return .passcodeNotSet
    default:
      return nil
    }
  }

  static func code(forStatus status: OSStatus) -> Code? {
    switch status {
    case errSecUserCanceled:
      return .userCanceled
    case errSecAuthFailed:
      return .authenticationFailed
    case errSecInteractionNotAllowed:
      return .biometryNotAvailable
    case errSecItemNotFound:
      return .keyNotFound
    default:
      return nil
    }
  }

  private static let cryptoTokenKitErrorDomain = "CryptoTokenKit"

  // TKError.Code values; the Secure Enclave reports these when the key is unusable.
  static func code(forCryptoTokenKitErrorCode rawValue: Int) -> Code? {
    switch rawValue {
    case -4:
      return .userCanceled
    case -5:
      return .authenticationFailed
    case -6:
      return .keyInvalidated
    default:
      return nil
    }
  }
}
