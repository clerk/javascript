// ClerkViewFactory - Provides Clerk view controllers to the ClerkExpo module
// This file is injected into the app target by the config plugin.
// It uses `import ClerkKit` (SPM) which is only accessible from the app target.

import UIKit
import SwiftUI
import Security
import ClerkKit
import ClerkKitUI
import ClerkExpo  // Import the pod to access ClerkViewFactoryProtocol

// MARK: - View Factory Implementation

public class ClerkViewFactory: ClerkViewFactoryProtocol {
  public static let shared = ClerkViewFactory()

  private init() {}

  // Register this factory with the ClerkExpo module
  public static func register() {
    clerkViewFactory = shared
  }

  @MainActor
  public func configure(publishableKey: String, bearerToken: String? = nil) async throws {
    // Sync JS SDK's client token to native keychain so both SDKs share the same client.
    // This handles the case where the user signed in via JS SDK but the native SDK
    // has no device token (e.g., after app reinstall or first launch).
    if let token = bearerToken, !token.isEmpty {
      Self.writeNativeDeviceTokenIfNeeded(token)
    } else {
      Self.syncJSTokenToNativeKeychainIfNeeded()
    }

    Clerk.configure(publishableKey: publishableKey)

    // Wait for Clerk to finish loading (cached data + API refresh).
    // The static configure() fires off async refreshes; poll until loaded.
    for _ in 0..<30 {  // Wait up to 3 seconds
      if Clerk.shared.isLoaded && Clerk.shared.session != nil {
        return
      }
      try? await Task.sleep(nanoseconds: 100_000_000) // 100ms
    }
  }

  /// Copies the JS SDK's client JWT from expo-secure-store to the native SDK's
  /// keychain entry, but only if the native SDK doesn't already have a device token.
  /// Both expo-secure-store and the native Clerk SDK use the iOS Keychain with the
  /// bundle identifier as the service name, making cross-SDK token sharing possible.
  private static func syncJSTokenToNativeKeychainIfNeeded() {
    guard let service = Bundle.main.bundleIdentifier, !service.isEmpty else { return }

    let jsTokenKey = "__clerk_client_jwt"
    let nativeTokenKey = "clerkDeviceToken"

    // Check if native SDK already has a device token — don't overwrite
    let checkQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: nativeTokenKey,
      kSecReturnData as String: false,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    if SecItemCopyMatching(checkQuery as CFDictionary, nil) == errSecSuccess {
      return  // Native token exists, don't overwrite
    }

    // Read JS SDK's client JWT from keychain (stored by expo-secure-store)
    var result: CFTypeRef?
    let readQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: jsTokenKey,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    guard SecItemCopyMatching(readQuery as CFDictionary, &result) == errSecSuccess,
          let data = result as? Data,
          let jsToken = String(data: data, encoding: .utf8),
          !jsToken.isEmpty else {
      return  // No JS token available
    }

    // Write JS token as native device token
    guard let tokenData = jsToken.data(using: .utf8) else { return }
    let writeQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: nativeTokenKey,
      kSecValueData as String: tokenData,
      kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    ]
    SecItemAdd(writeQuery as CFDictionary, nil)
  }

  /// Writes the provided bearer token as the native SDK's device token,
  /// but only if the native SDK doesn't already have one.
  private static func writeNativeDeviceTokenIfNeeded(_ token: String) {
    guard let service = Bundle.main.bundleIdentifier, !service.isEmpty else { return }

    let nativeTokenKey = "clerkDeviceToken"

    // Check if native SDK already has a device token — don't overwrite
    let checkQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: nativeTokenKey,
      kSecReturnData as String: false,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    if SecItemCopyMatching(checkQuery as CFDictionary, nil) == errSecSuccess {
      return
    }

    // Write the provided token as native device token
    guard let tokenData = token.data(using: .utf8) else { return }
    let writeQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: nativeTokenKey,
      kSecValueData as String: tokenData,
      kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
    ]
    SecItemAdd(writeQuery as CFDictionary, nil)
  }

  public func createAuthViewController(
    mode: String,
    dismissable: Bool,
    completion: @escaping (Result<[String: Any], Error>) -> Void
  ) -> UIViewController? {
    let authMode: AuthView.Mode
    switch mode {
    case "signIn":
      authMode = .signIn
    case "signUp":
      authMode = .signUp
    default:
      authMode = .signInOrUp
    }

    let wrapper = ClerkAuthWrapperViewController(
      mode: authMode,
      dismissable: dismissable,
      completion: completion
    )
    return wrapper
  }

  public func createUserProfileViewController(
    dismissable: Bool,
    completion: @escaping (Result<[String: Any], Error>) -> Void
  ) -> UIViewController? {
    let wrapper = ClerkProfileWrapperViewController(
      dismissable: dismissable,
      completion: completion
    )
    return wrapper
  }

  // MARK: - Inline View Creation

  public func createAuthView(
    mode: String,
    dismissable: Bool,
    onEvent: @escaping (String, [String: Any]) -> Void
  ) -> UIViewController? {
    let authMode: AuthView.Mode
    switch mode {
    case "signIn":
      authMode = .signIn
    case "signUp":
      authMode = .signUp
    default:
      authMode = .signInOrUp
    }

    let hostingController = UIHostingController(
      rootView: ClerkInlineAuthWrapperView(
        mode: authMode,
        dismissable: dismissable,
        onEvent: onEvent
      )
    )
    hostingController.view.backgroundColor = .clear
    return hostingController
  }

  public func createUserProfileView(
    dismissable: Bool,
    onEvent: @escaping (String, [String: Any]) -> Void
  ) -> UIViewController? {
    let hostingController = UIHostingController(
      rootView: ClerkInlineProfileWrapperView(
        dismissable: dismissable,
        onEvent: onEvent
      )
    )
    hostingController.view.backgroundColor = .clear
    return hostingController
  }

  @MainActor
  public func getSession() async -> [String: Any]? {
    guard let session = Clerk.shared.session else {
      return nil
    }

    var result: [String: Any] = [
      "sessionId": session.id,
      "status": String(describing: session.status)
    ]

    // Include user details if available
    let user = session.user ?? Clerk.shared.user

    if let user = user {
      var userDict: [String: Any] = [
        "id": user.id,
        "imageUrl": user.imageUrl
      ]
      if let firstName = user.firstName {
        userDict["firstName"] = firstName
      }
      if let lastName = user.lastName {
        userDict["lastName"] = lastName
      }
      if let primaryEmail = user.emailAddresses.first(where: { $0.id == user.primaryEmailAddressId }) {
        userDict["primaryEmailAddress"] = primaryEmail.emailAddress
      } else if let firstEmail = user.emailAddresses.first {
        userDict["primaryEmailAddress"] = firstEmail.emailAddress
      }
      result["user"] = userDict
    }

    return result
  }

  @MainActor
  public func signOut() async throws {
    guard let sessionId = Clerk.shared.session?.id else { return }
    try await Clerk.shared.auth.signOut(sessionId: sessionId)
  }
}

// MARK: - Auth View Controller Wrapper

class ClerkAuthWrapperViewController: UIHostingController<ClerkAuthWrapperView> {
  private let completion: (Result<[String: Any], Error>) -> Void
  private var authEventTask: Task<Void, Never>?
  private var completionCalled = false

  init(mode: AuthView.Mode, dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) {
    self.completion = completion
    let view = ClerkAuthWrapperView(mode: mode, dismissable: dismissable)
    super.init(rootView: view)
    self.modalPresentationStyle = .fullScreen
    subscribeToAuthEvents()
  }

  @MainActor required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  deinit {
    authEventTask?.cancel()
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    if isBeingDismissed {
      completeOnce(.failure(NSError(domain: "ClerkAuth", code: 3, userInfo: [NSLocalizedDescriptionKey: "Auth modal was dismissed"])))
    }
  }

  private func completeOnce(_ result: Result<[String: Any], Error>) {
    guard !completionCalled else { return }
    completionCalled = true
    completion(result)
  }

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.auth.events {
        guard let self = self, !self.completionCalled else { return }
        switch event {
        case .signInCompleted(let signIn):
          if let sessionId = signIn.createdSessionId {
            self.completeOnce(.success(["sessionId": sessionId, "type": "signIn"]))
            self.dismiss(animated: true)
          } else {
            self.completeOnce(.failure(NSError(domain: "ClerkAuth", code: 1, userInfo: [NSLocalizedDescriptionKey: "Sign-in completed but no session ID was created"])))
            self.dismiss(animated: true)
          }
        case .signUpCompleted(let signUp):
          if let sessionId = signUp.createdSessionId {
            self.completeOnce(.success(["sessionId": sessionId, "type": "signUp"]))
            self.dismiss(animated: true)
          } else {
            self.completeOnce(.failure(NSError(domain: "ClerkAuth", code: 1, userInfo: [NSLocalizedDescriptionKey: "Sign-up completed but no session ID was created"])))
            self.dismiss(animated: true)
          }
        default:
          break
        }
      }
      // Stream ended without an auth completion event
      guard let self = self else { return }
      self.completeOnce(.failure(NSError(domain: "ClerkAuth", code: 2, userInfo: [NSLocalizedDescriptionKey: "Auth event stream ended unexpectedly"])))
    }
  }
}

struct ClerkAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissable: Bool

  var body: some View {
    AuthView(mode: mode, isDismissable: dismissable)
      .environment(Clerk.shared)
  }
}

// MARK: - Profile View Controller Wrapper

class ClerkProfileWrapperViewController: UIHostingController<ClerkProfileWrapperView> {
  private let completion: (Result<[String: Any], Error>) -> Void
  private var authEventTask: Task<Void, Never>?
  private var completionCalled = false

  init(dismissable: Bool, completion: @escaping (Result<[String: Any], Error>) -> Void) {
    self.completion = completion
    let view = ClerkProfileWrapperView(dismissable: dismissable)
    super.init(rootView: view)
    self.modalPresentationStyle = .fullScreen
    subscribeToAuthEvents()
  }

  @MainActor required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  deinit {
    authEventTask?.cancel()
  }

  override func viewDidDisappear(_ animated: Bool) {
    super.viewDidDisappear(animated)
    if isBeingDismissed {
      completeOnce(.failure(NSError(domain: "ClerkProfile", code: 3, userInfo: [NSLocalizedDescriptionKey: "Profile modal was dismissed"])))
    }
  }

  private func completeOnce(_ result: Result<[String: Any], Error>) {
    guard !completionCalled else { return }
    completionCalled = true
    completion(result)
  }

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.auth.events {
        guard let self = self, !self.completionCalled else { return }
        switch event {
        case .signedOut(let session):
          self.completeOnce(.success(["sessionId": session.id]))
          self.dismiss(animated: true)
        default:
          break
        }
      }
      // Stream ended without a sign-out event
      guard let self = self else { return }
      self.completeOnce(.failure(NSError(domain: "ClerkProfile", code: 2, userInfo: [NSLocalizedDescriptionKey: "Profile event stream ended unexpectedly"])))
    }
  }
}

struct ClerkProfileWrapperView: View {
  let dismissable: Bool

  var body: some View {
    UserProfileView(isDismissable: dismissable)
      .environment(Clerk.shared)
  }
}

// MARK: - Inline Auth View Wrapper (for embedded rendering)

struct ClerkInlineAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissable: Bool
  let onEvent: (String, [String: Any]) -> Void

  var body: some View {
    AuthView(mode: mode, isDismissable: dismissable)
      .environment(Clerk.shared)
      .task {
        for await event in Clerk.shared.auth.events {
          switch event {
          case .signInCompleted(let signIn):
            if let sessionId = signIn.createdSessionId {
              onEvent("signInCompleted", ["sessionId": sessionId, "type": "signIn"])
            }
          case .signUpCompleted(let signUp):
            if let sessionId = signUp.createdSessionId {
              onEvent("signUpCompleted", ["sessionId": sessionId, "type": "signUp"])
            }
          default:
            break
          }
        }
      }
  }
}

// MARK: - Inline Profile View Wrapper (for embedded rendering)

struct ClerkInlineProfileWrapperView: View {
  let dismissable: Bool
  let onEvent: (String, [String: Any]) -> Void

  var body: some View {
    UserProfileView(isDismissable: dismissable)
      .environment(Clerk.shared)
      .task {
        for await event in Clerk.shared.auth.events {
          switch event {
          case .signedOut(let session):
            onEvent("signedOut", ["sessionId": session.id])
          default:
            break
          }
        }
      }
  }
}

