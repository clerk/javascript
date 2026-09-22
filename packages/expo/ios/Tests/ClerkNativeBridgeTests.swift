import XCTest
@testable import ClerkExpo

final class ClerkNativeBridgeTests: XCTestCase {
  @MainActor
  func testBiometricCredentialAvailabilityIsUnavailableBeforeConfiguration() async throws {
    let availability = try await ClerkNativeBridge.shared.getBiometricCredentialAvailability(
      id: nil,
      identifierHint: nil
    )

    XCTAssertEqual(availability["isAvailable"] as? Bool, false)
    XCTAssertEqual(availability["unavailableReason"] as? String, "environment_unavailable")
  }

  @MainActor
  func testBiometricCredentialOperationsRejectBeforeConfiguration() async {
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.listBiometricCredentials()
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.enrollBiometricCredential(
        deviceName: nil,
        identifierHint: nil,
        reason: nil,
        policy: "biometry_or_device_passcode"
      )
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.revokeBiometricCredential(id: "td_test")
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.signInWithBiometrics(
        id: nil,
        identifierHint: nil,
        reason: nil
      )
    }
  }

  @MainActor
  private func assertEnvironmentUnavailable(
    _ operation: @MainActor () async throws -> Any,
    file: StaticString = #filePath,
    line: UInt = #line
  ) async {
    do {
      _ = try await operation()
      XCTFail("Expected biometric-credential operation to reject before configuration.", file: file, line: line)
    } catch {
      let descriptor = ClerkNativeBridge.biometricCredentialErrorDescriptor(
        error,
        fallbackCode: "unexpected_error"
      )
      XCTAssertEqual(descriptor.code, "environment_unavailable", file: file, line: line)
    }
  }
}
