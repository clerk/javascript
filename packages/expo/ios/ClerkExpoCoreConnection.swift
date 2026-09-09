import ClerkKit
import Foundation
import UIKit

@MainActor final class ExpoCoreTransport: CoreTransport {
  var receive: (@MainActor (JSONValue) -> Void)?
  private var emit: ((String) -> Void)?
  init(emit: @escaping (String) -> Void) { self.emit = emit }
  func send(_ message: JSONValue) throws {
    guard let emit else { throw CoreError(code: "native_host_unavailable") }
    let data = try JSONEncoder().encode(message)
    guard data.count <= 16 * 1024 * 1024 else { throw CoreError(code: "message_too_large") }
    emit(String(decoding: data, as: UTF8.self))
  }
  func close() {
    emit = nil
    receive = nil
  }
}

private actor NoExpoClientStorage: CredentialStorage {
  func read() throws -> String? { throw CoreError(code: "client_owned_by_expo") }
  func write(_: String) throws { throw CoreError(code: "client_owned_by_expo") }
  func remove() throws { throw CoreError(code: "client_owned_by_expo") }
}

/// A native resource projection. This path never constructs JavaScriptCore or calls Clerk.connect.
@MainActor final class ClerkExpoCoreConnection {
  let id = UUID().uuidString
  let configuration: ClerkConfiguration
  let capabilities: AppleCapabilities
  let transport: ExpoCoreTransport
  let runtime: CoreRuntime
  private let authentication: AppleAuthentication
  private var requests: [String: Task<JSONValue, any Error>] = [:]
  private var closed = false

  init(publishableKey: String, emit: @escaping (String, String) -> Void) throws {
    guard
      let callback = Bundle.main.object(forInfoDictionaryKey: "ClerkNativeCallbackURL") as? String,
      let url = URL(string: callback)
    else { throw CoreError(code: "missing_native_callback_configuration") }
    configuration = try ClerkConfiguration(publishableKey: publishableKey, callbackURL: url)
    authentication = AppleAuthentication {
      UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        .flatMap(\.windows).first(where: \.isKeyWindow) ?? UIWindow()
    }
    let config = configuration
    let authStorage = KeychainCredentialStorage(
      publishableKey: publishableKey, frontendAPI: config.frontendAPI, purpose: .magicLink)
    let biometrics = AppleBiometricCapabilities(
      publishableKey: publishableKey,
      credentials: KeychainCredentialStorage(
        publishableKey: publishableKey, frontendAPI: config.frontendAPI,
        purpose: .biometricCredentials),
      cleanup: KeychainCredentialStorage(
        publishableKey: publishableKey, frontendAPI: config.frontendAPI, purpose: .biometricCleanup)
    )
    capabilities = try AppleCapabilities(
      publishableKey: publishableKey, frontendAPI: config.frontendAPI,
      storage: NoExpoClientStorage(),
      browser: authentication.openBrowser, passkeys: authentication.credential,
      appleIdentity: authentication.appleIdentity, authStorage: authStorage, biometrics: biometrics
    )
    let connectionId = id
    transport = ExpoCoreTransport { message in emit(connectionId, message) }
    runtime = CoreRuntime(transport: transport)
  }

  var descriptor: [String: Any] {
    [
      "connectionId": id, "platform": "ios",
      "callbackUrl": configuration.callbackURL.absoluteString,
      "capabilities": capabilities.supported.filter {
        !["http", "storage", "timer", "random"].contains($0)
      },
    ]
  }

  func start() async throws -> Clerk {
    guard !closed else { throw CoreError(code: "native_host_unavailable") }
    let timeout = Task { @MainActor [weak self] in
      try await Task.sleep(for: .seconds(15))
      self?.close()
    }
    defer { timeout.cancel() }
    try await runtime.initialize(
      publishableKey: configuration.publishableKey, callbackURL: configuration.callbackURL,
      platform: "ios", capabilities: [])
    guard !closed, let clerk = try runtime.root("clerk", as: Clerk.self) else {
      throw CoreError(code: "native_host_unavailable")
    }
    return clerk
  }

  func receive(_ message: String) throws {
    guard !closed, message.utf8.count <= 16 * 1024 * 1024 else {
      throw CoreError(code: "native_host_unavailable")
    }
    transport.receive?(try JSONDecoder().decode(JSONValue.self, from: Data(message.utf8)))
  }

  func perform(id: String, capability: String, arguments: String) async throws -> String {
    guard !closed, requests[id] == nil, arguments.utf8.count <= 16 * 1024 * 1024,
      ["browser", "appleIdentity", "crypto.sha256"].contains(capability)
        || capability.hasPrefix("passkeys.") || capability.hasPrefix("authStorage.")
        || capability.hasPrefix("biometrics.")
    else { throw CoreError(code: "capability_unavailable") }
    let value = try JSONDecoder().decode(JSONValue.self, from: Data(arguments.utf8))
    let task = Task { @MainActor in try await capabilities.perform(capability, arguments: value) }
    requests[id] = task
    defer { requests.removeValue(forKey: id) }
    let result = try await task.value
    try Task.checkCancellation()
    guard !closed else { throw CoreError(code: "native_host_unavailable") }
    return String(decoding: try JSONEncoder().encode(result), as: UTF8.self)
  }

  func cancel(_ ids: [String]) {
    for id in ids { requests.removeValue(forKey: id)?.cancel() }
  }

  func close() {
    guard !closed else { return }
    closed = true
    for request in requests.values { request.cancel() }
    requests.removeAll()
    runtime.close()
  }
}
