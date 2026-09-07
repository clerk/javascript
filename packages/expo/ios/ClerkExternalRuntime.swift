import Foundation
@_spi(ClerkExpo) import ClerkKit

@MainActor
final class ClerkExternalRuntime {
  private var runtimeID: String?
  private var pending: [String: CheckedContinuation<Data, Error>] = [:]
  private var deadlines: [String: Task<Void, Never>] = [:]
  private var emit: (([String: String]) -> Void)?

  func configure(publishableKey: String, runtimeID: String, state: String, emit: @escaping ([String: String]) -> Void) async throws {
    if let previous = self.runtimeID { await detach(previous) }
    self.runtimeID = runtimeID
    self.emit = emit
    do {
      try await ClerkNativeBridge.shared.configureExternalRuntime(
        publishableKey: publishableKey, runtimeID: runtimeID, state: Data(state.utf8)
      ) { [weak self] invocation in
        guard let self else { throw CancellationError() }
        return try await self.invoke(runtimeID: runtimeID, invocation: invocation)
      }
    } catch {
      await detach(runtimeID)
      throw error
    }
  }

  private func invoke(runtimeID: String, invocation: Data) async throws -> Data {
    guard self.runtimeID == runtimeID, let emit else { throw CancellationError() }
    let requestID = UUID().uuidString
    return try await withTaskCancellationHandler {
      try Task.checkCancellation()
      return try await withCheckedThrowingContinuation { continuation in
        pending[requestID] = continuation
        deadlines[requestID] = Task { @MainActor [weak self] in
          do { try await Task.sleep(for: .seconds(120)) } catch { return }
          self?.finish(requestID, result: .failure(NSError(domain: "ClerkExpo", code: 1, userInfo: [NSLocalizedDescriptionKey: "The JavaScript runtime did not complete the native operation."])))
        }
        emit(["runtimeId": runtimeID, "requestId": requestID, "invocation": String(decoding: invocation, as: UTF8.self)])
      }
    } onCancel: {
      Task { @MainActor [weak self] in self?.finish(requestID, result: .failure(CancellationError())) }
    }
  }

  func complete(runtimeID: String, requestID: String, response: String) {
    guard self.runtimeID == runtimeID else { return }
    finish(requestID, result: .success(Data(response.utf8)))
  }

  private func finish(_ requestID: String, result: Result<Data, Error>) {
    deadlines.removeValue(forKey: requestID)?.cancel()
    pending.removeValue(forKey: requestID)?.resume(with: result)
  }

  func detach(_ runtimeID: String) async {
    guard self.runtimeID == runtimeID else { return }
    self.runtimeID = nil
    emit = nil
    for requestID in Array(pending.keys) { finish(requestID, result: .failure(CancellationError())) }
    await Clerk.detachExternalRuntime(runtimeID: runtimeID)
  }

  func dispose() async {
    if let runtimeID { await detach(runtimeID) }
  }
}
