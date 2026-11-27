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
    activeOrganizationId: String? = nil,
    deviceToken: String? = "token_1"
  ) -> ClerkClientFingerprint {
    ClerkClientFingerprint(
      clientId: clientId,
      lastActiveSessionId: sessions.first?.id,
      sessions: sessions,
      activeUserId: sessions.isEmpty ? nil : "user_1",
      activeUserUpdatedAt: sessions.isEmpty ? nil : userUpdatedAt,
      activeOrganizationId: activeOrganizationId,
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
      fingerprint(activeOrganizationId: "org_2"),
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

  func testEmitsWhenTheActiveSessionSwitchesOrganization() {
    let client = Client.mock
    XCTAssertEqual(client.sessions[0].id, client.lastActiveSessionId)
    var switched = client
    switched.sessions[0].lastActiveOrganizationId = "org_2"
    let before = ClerkClientFingerprint(client: client, deviceToken: "token_1")
    let after = ClerkClientFingerprint(client: switched, deviceToken: "token_1")
    XCTAssertNotEqual(before, after)

    let tracker = makeTracker()
    tracker.reset(to: before)
    tracker.observe(after)
    runLoopTurn()
    XCTAssertEqual(emitCount, 1)
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

  func testDpopProofErrorCodes() {
    XCTAssertEqual(clerkDpopProofErrorDescriptor(ClerkClientSyncError.notConfigured).code, "E_NOT_CONFIGURED")
    XCTAssertEqual(clerkDpopProofErrorDescriptor(CancellationError()).code, "E_CANCELLED")
    XCTAssertEqual(clerkDpopProofErrorDescriptor(Clerk.DeviceTokenError.updateRejected).code, "E_DPOP_PROOF_FAILED")
  }

  func testHostSigningOptInReachesTheClerkOptionsOnlyWhenJSAsks() {
    defer { ClerkNativeBridge.setHostSignsRequests(false) }

    XCTAssertFalse(ClerkNativeBridge.makeClerkOptions(proxyUrl: nil).hostSignsRequests)
    ClerkNativeBridge.setHostSignsRequests(true)
    XCTAssertTrue(ClerkNativeBridge.makeClerkOptions(proxyUrl: nil).hostSignsRequests)
  }

  func testCreateDpopProofRejectsBeforeConfiguration() async {
    do {
      _ = try await ClerkNativeBridge.shared.createDpopProof(
        method: "GET", url: "https://clerk.example.com/v1/client", authorization: nil)
      XCTFail("Expected createDpopProof to throw")
    } catch {
      XCTAssertEqual(clerkDpopProofErrorDescriptor(error).code, "E_NOT_CONFIGURED")
    }
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
