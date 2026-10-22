import Foundation
@_spi(FrameworkIntegration) import ClerkKit

/// The native client state that JS must refetch its own client for when it changes.
struct ClerkClientFingerprint: Equatable {
  struct SessionState: Equatable {
    let id: String
    let status: String
  }

  let clientId: String?
  let lastActiveSessionId: String?
  let sessions: [SessionState]
  let activeUserId: String?
  let activeUserUpdatedAt: Double?
  var deviceToken: String?
}

extension ClerkClientFingerprint {
  init(client: Client?, deviceToken: String?) {
    let activeUser = client?.sessions.first { $0.id == client?.lastActiveSessionId }?.user
    self.init(
      clientId: client?.id,
      lastActiveSessionId: client?.lastActiveSessionId,
      sessions: client?.sessions.map { SessionState(id: $0.id, status: $0.status.rawValue) } ?? [],
      activeUserId: activeUser?.id,
      activeUserUpdatedAt: activeUser?.updatedAt.timeIntervalSince1970,
      deviceToken: deviceToken
    )
  }
}

/// Emits one payload-free invalidation per main-loop turn in which the fingerprint moved away from
/// the last state JS was told about.
@MainActor
final class ClerkClientInvalidationTracker {
  typealias Scheduler = (@escaping @MainActor () -> Void) -> Void

  private let schedule: Scheduler
  private let emit: () -> Void
  private var baseline: ClerkClientFingerprint?
  private var latest: ClerkClientFingerprint?
  private var isFlushScheduled = false

  init(
    schedule: @escaping Scheduler = { work in DispatchQueue.main.async { MainActor.assumeIsolated(work) } },
    emit: @escaping () -> Void
  ) {
    self.schedule = schedule
    self.emit = emit
  }

  /// Sets the state JS already knows about without emitting.
  func reset(to fingerprint: ClerkClientFingerprint?) {
    baseline = fingerprint
    latest = fingerprint
  }

  func observe(_ fingerprint: ClerkClientFingerprint) {
    guard baseline != nil else { return }
    latest = fingerprint
    guard fingerprint != baseline, !isFlushScheduled else { return }
    isFlushScheduled = true
    schedule { [weak self] in self?.flush() }
  }

  /// A token JS wrote itself is not news to JS, so it must not echo back as an invalidation.
  func acknowledgeDeviceToken(_ token: String?, current: ClerkClientFingerprint) {
    baseline?.deviceToken = token
    observe(current)
  }

  private func flush() {
    isFlushScheduled = false
    guard let latest, latest != baseline else { return }
    baseline = latest
    emit()
  }
}

struct ClerkDeviceTokenErrorDescriptor: Equatable {
  let code: String
  let message: String
}

enum ClerkClientSyncError: Error, LocalizedError {
  case notConfigured

  var errorDescription: String? {
    "Clerk must be configured with configureNative before syncing client state."
  }
}

func clerkSetDeviceTokenErrorDescriptor(_ error: Error) -> ClerkDeviceTokenErrorDescriptor {
  switch error {
  case ClerkClientSyncError.notConfigured:
    return .init(code: "E_NOT_CONFIGURED", message: error.localizedDescription)
  case Clerk.DeviceTokenError.emptyToken:
    return .init(code: "E_INVALID_DEVICE_TOKEN", message: error.localizedDescription)
  case is CancellationError:
    return .init(code: "E_CANCELLED", message: "The device token update was cancelled.")
  default:
    return .init(code: "E_SET_DEVICE_TOKEN_FAILED", message: error.localizedDescription)
  }
}
