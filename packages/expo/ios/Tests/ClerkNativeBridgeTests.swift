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
  func testBiometricReverificationContinuesToSecondFactor() async throws {
    var factors: [Session.BiometricVerificationLevel] = []
    let started = SessionVerification(id: "stepup_test", status: .needsFirstFactor, level: .multiFactor)
    let result = try await ClerkNativeBridge.verifyBiometricReverification(started) { factor in
      factors.append(factor)
      return SessionVerification(id: started.id, status: factor == .firstFactor ? .needsSecondFactor : .complete,
                                 level: .multiFactor)
    }
    XCTAssertEqual(factors, [.firstFactor, .secondFactor])
    XCTAssertEqual(result.id, started.id)
    XCTAssertEqual(result.status, .complete)
  }

  @MainActor
  func testBiometricReverificationPromptsOnlyForRequiredFactors() async throws {
    for status in [SessionVerification.Status.needsFirstFactor, .needsSecondFactor, .complete] {
      var factors: [Session.BiometricVerificationLevel] = []
      let started = SessionVerification(id: "stepup_test", status: status, level: .multiFactor)
      let result = try await ClerkNativeBridge.verifyBiometricReverification(started) { factor in
        factors.append(factor)
        return SessionVerification(id: started.id, status: .complete, level: .multiFactor)
      }
      XCTAssertEqual(factors, status == .complete ? [] : [status == .needsFirstFactor ? .firstFactor : .secondFactor])
      XCTAssertEqual(result.status, .complete)
    }
  }

  @MainActor
  func testBiometricReverificationDoesNotRetryAnIncompleteSecondFactor() async throws {
    var factors: [Session.BiometricVerificationLevel] = []
    let started = SessionVerification(status: .needsFirstFactor, level: .multiFactor)
    let result = try await ClerkNativeBridge.verifyBiometricReverification(started) { factor in
      factors.append(factor)
      return SessionVerification(status: .needsSecondFactor, level: .multiFactor)
    }
    XCTAssertEqual(factors, [.firstFactor, .secondFactor])
    XCTAssertEqual(result.status, .needsSecondFactor)
  }

  @MainActor
  func testBiometricReverificationPreservesFactorFailures() async {
    for failingFactor in [Session.BiometricVerificationLevel.firstFactor, .secondFactor] {
      var factors: [Session.BiometricVerificationLevel] = []
      let expected = NSError(domain: "biometric_authentication_canceled", code: 1)
      do {
        _ = try await ClerkNativeBridge.verifyBiometricReverification(
          SessionVerification(status: .needsFirstFactor, level: .multiFactor)
        ) { factor in
          factors.append(factor)
          if factor == failingFactor { throw expected }
          return SessionVerification(status: .needsSecondFactor, level: .multiFactor)
        }
        XCTFail("Expected the factor failure to propagate.")
      } catch {
        XCTAssertEqual(error as NSError, expected)
      }
      XCTAssertEqual(factors, failingFactor == .firstFactor ? [.firstFactor] : [.firstFactor, .secondFactor])
    }
  }

  @MainActor
  func testCancellationBetweenBiometricFactorsStopsContinuation() async {
    var factors: [Session.BiometricVerificationLevel] = []
    let task = Task { @MainActor in
      try await ClerkNativeBridge.verifyBiometricReverification(
        SessionVerification(status: .needsFirstFactor, level: .multiFactor)
      ) { factor in
        factors.append(factor)
        withUnsafeCurrentTask { $0?.cancel() }
        return SessionVerification(status: .needsSecondFactor, level: .multiFactor)
      }
    }
    do {
      _ = try await task.value
      XCTFail("Expected cancellation to stop the second factor.")
    } catch {
      XCTAssertTrue(error is CancellationError)
    }
    XCTAssertEqual(factors, [.firstFactor])
  }

  @MainActor
  func testUnknownBiometricVerificationStatusDoesNotPrompt() async {
    do {
      _ = try await ClerkNativeBridge.verifyBiometricReverification(
        SessionVerification(status: .unknown("future_status"), level: .multiFactor)
      ) { _ in
        XCTFail("An unknown status must not prompt.")
        return SessionVerification(status: .complete, level: .multiFactor)
      }
      XCTFail("Expected an unsupported status error.")
    } catch {
      XCTAssertEqual(ClerkNativeBridge.biometricCredentialErrorDescriptor(error, fallbackCode: "unexpected").code,
                     "E_BIOMETRIC_REVERIFICATION_FAILED")
    }
  }

  func testBiometricReverificationPreservesNativePolicyError() {
    let error = BiometricCredentialError.policyIncompatible
    let result = ClerkNativeBridge.biometricCredentialErrorDescriptor(error, fallbackCode: "unexpected")
    XCTAssertEqual(result.code, "biometric_credential_policy_incompatible")
    XCTAssertEqual(result.message, error.localizedDescription)
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
