import XCTest
import ClerkKit
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
      try await ClerkNativeBridge.shared.reverifyWithBiometrics(
        sessionId: "sess_test", level: "multi_factor", reason: nil
      )
    }
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

  func testBiometricReverificationLevels() throws {
    XCTAssertEqual(try ClerkNativeBridge.biometricReverificationLevel("first_factor"), .firstFactor)
    XCTAssertEqual(try ClerkNativeBridge.biometricReverificationLevel("second_factor"), .secondFactor)
    XCTAssertEqual(try ClerkNativeBridge.biometricReverificationLevel("multi_factor"), .multiFactor)
    XCTAssertThrowsError(try ClerkNativeBridge.biometricReverificationLevel("unknown"))
  }

  func testBiometricReverificationPayloadWithoutEmbeddedSession() {
    let verification = SessionVerification(id: "stepup_test", status: .complete, level: .multiFactor)
    let payload = ClerkNativeBridge.biometricReverificationPayload(verification, sessionId: "sess_test")
    XCTAssertEqual(payload["id"] as? String, "stepup_test")
    XCTAssertEqual(payload["status"] as? String, "complete")
    XCTAssertEqual(payload["level"] as? String, "multi_factor")
    XCTAssertEqual(payload["sessionId"] as? String, "sess_test")
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
