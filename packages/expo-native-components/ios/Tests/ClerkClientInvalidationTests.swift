import XCTest
@_spi(FrameworkIntegration) import ClerkKit
@testable import ClerkExpo

@MainActor
final class ClerkClientInvalidationTests: XCTestCase {
  private var scheduled: [@MainActor () -> Void] = []
  private var emitCount = 0

  private func makeTracker() -> ClerkClientInvalidationTracker {
    ClerkClientInvalidationTracker(
      schedule: { [unowned self] work in self.scheduled.append(work) },
      emit: { [unowned self] in self.emitCount += 1 }
    )
  }

  private func runLoopTurn() {
    let work = scheduled
    scheduled.removeAll()
    work.forEach { $0() }
  }

  private func fingerprint(
    clientId: String? = "client_1",
    sessions: [ClerkClientFingerprint.SessionState] = [.init(id: "sess_1", status: "active")],
    userUpdatedAt: Double? = 1,
    deviceToken: String? = "token_1"
  ) -> ClerkClientFingerprint {
    ClerkClientFingerprint(
      clientId: clientId,
      lastActiveSessionId: sessions.first?.id,
      sessions: sessions,
      activeUserId: sessions.isEmpty ? nil : "user_1",
      activeUserUpdatedAt: sessions.isEmpty ? nil : userUpdatedAt,
      deviceToken: deviceToken
    )
  }

  override func setUp() {
    super.setUp()
    scheduled = []
    emitCount = 0
  }

  func testDoesNotEmitBeforeBaselineOrForUnchangedState() {
    let tracker = makeTracker()
    tracker.observe(fingerprint())
    XCTAssertTrue(scheduled.isEmpty)

    tracker.reset(to: fingerprint())
    tracker.observe(fingerprint())
    runLoopTurn()
    XCTAssertEqual(emitCount, 0)
  }

  func testEmitsForEachFingerprintField() {
    let changes = [
      fingerprint(clientId: "client_2"),
      fingerprint(sessions: [.init(id: "sess_1", status: "ended")]),
      fingerprint(sessions: []),
      fingerprint(userUpdatedAt: 2),
      fingerprint(deviceToken: "token_2"),
    ]

    for change in changes {
      let tracker = makeTracker()
      tracker.reset(to: fingerprint())
      emitCount = 0
      tracker.observe(change)
      runLoopTurn()
      XCTAssertEqual(emitCount, 1, "\(change)")
    }
  }

  func testCoalescesChangesWithinOneLoopTurn() {
    let tracker = makeTracker()
    tracker.reset(to: fingerprint())

    tracker.observe(fingerprint(deviceToken: "token_2"))
    tracker.observe(fingerprint(clientId: "client_2", deviceToken: "token_2"))
    tracker.observe(fingerprint(clientId: "client_3", deviceToken: "token_3"))
    XCTAssertEqual(scheduled.count, 1)
    runLoopTurn()
    XCTAssertEqual(emitCount, 1)

    tracker.observe(fingerprint(clientId: "client_3", deviceToken: "token_3"))
    runLoopTurn()
    XCTAssertEqual(emitCount, 1)

    tracker.observe(fingerprint(clientId: "client_4", deviceToken: "token_3"))
    runLoopTurn()
    XCTAssertEqual(emitCount, 2)
  }

  func testChangeRevertedWithinOneLoopTurnDoesNotEmit() {
    let tracker = makeTracker()
    tracker.reset(to: fingerprint())

    tracker.observe(fingerprint(clientId: "client_2"))
    tracker.observe(fingerprint())
    runLoopTurn()
    XCTAssertEqual(emitCount, 0)
  }

  func testAcknowledgedDeviceTokenDoesNotEcho() {
    let tracker = makeTracker()
    tracker.reset(to: fingerprint())

    tracker.acknowledgeDeviceToken("token_2", current: fingerprint(deviceToken: "token_2"))
    runLoopTurn()
    XCTAssertEqual(emitCount, 0)

    tracker.acknowledgeDeviceToken("token_3", current: fingerprint(clientId: "client_2", deviceToken: "token_3"))
    runLoopTurn()
    XCTAssertEqual(emitCount, 1)
  }

  func testSetDeviceTokenErrorCodes() {
    XCTAssertEqual(clerkSetDeviceTokenErrorDescriptor(ClerkClientSyncError.notConfigured).code, "E_NOT_CONFIGURED")
    XCTAssertEqual(clerkSetDeviceTokenErrorDescriptor(Clerk.DeviceTokenError.emptyToken).code, "E_INVALID_DEVICE_TOKEN")
    XCTAssertEqual(clerkSetDeviceTokenErrorDescriptor(CancellationError()).code, "E_CANCELLED")
    XCTAssertEqual(
      clerkSetDeviceTokenErrorDescriptor(Clerk.DeviceTokenError.updateRejected).code,
      "E_SET_DEVICE_TOKEN_FAILED"
    )
  }

  func testSyncFunctionsRejectOrReturnNilBeforeConfiguration() async {
    XCTAssertNil(ClerkNativeBridge.shared.getDeviceToken())
    do {
      _ = try await ClerkNativeBridge.shared.setDeviceToken("token", expected: nil)
      XCTFail("Expected setDeviceToken to throw")
    } catch {
      XCTAssertEqual(clerkSetDeviceTokenErrorDescriptor(error).code, "E_NOT_CONFIGURED")
    }
    do {
      try await ClerkNativeBridge.shared.refreshClient()
      XCTFail("Expected refreshClient to throw")
    } catch {
      XCTAssertTrue(error is ClerkClientSyncError)
    }
  }
}
