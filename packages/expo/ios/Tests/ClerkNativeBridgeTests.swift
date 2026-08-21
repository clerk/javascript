import XCTest
@testable import ClerkExpo

final class ClerkNativeBridgeTests: XCTestCase {
  @MainActor
  func testTrustedDeviceAvailabilityIsUnavailableBeforeConfiguration() async throws {
    let availability = try await ClerkNativeBridge.shared.getTrustedDeviceAvailability(
      id: nil,
      identifierHint: nil
    )

    XCTAssertEqual(availability["isAvailable"] as? Bool, false)
    XCTAssertEqual(availability["unavailableReason"] as? String, "environment_unavailable")
  }

  @MainActor
  func testTrustedDeviceOperationsRejectBeforeConfiguration() async {
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.listTrustedDevices()
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.enrollTrustedDevice(
        deviceName: nil,
        identifierHint: nil,
        reason: nil,
        policy: "biometry_or_device_passcode"
      )
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.revokeTrustedDevice(id: "td_test")
    }
    await assertEnvironmentUnavailable {
      try await ClerkNativeBridge.shared.signInWithTrustedDevice(
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
      XCTFail("Expected trusted-device operation to reject before configuration.", file: file, line: line)
    } catch {
      let descriptor = ClerkNativeBridge.trustedDeviceErrorDescriptor(
        error,
        fallbackCode: "unexpected_error"
      )
      XCTAssertEqual(descriptor.code, "environment_unavailable", file: file, line: line)
    }
  }
}
