// ClerkViewFactory - Provides Clerk view controllers to the ClerkExpo module
// This file is injected into the app target by the config plugin.
// It uses `import Clerk` (SPM) which is only accessible from the app target.

import UIKit
import SwiftUI
import Clerk
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
  public func configure(publishableKey: String) async throws {
    Clerk.shared.configure(publishableKey: publishableKey)

    // CRITICAL: Must call load() after configure() to restore session from keychain
    try await Clerk.shared.load()

    // load() is async but session may be populated AFTER it returns.
    // The SDK uses Combine/ObservableObject pattern — session is published asynchronously.
    for _ in 0..<30 {  // Wait up to 3 seconds
      if Clerk.shared.session != nil {
        return
      }
      try? await Task.sleep(nanoseconds: 100_000_000) // 100ms
    }
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

  public func signOut() async throws {
    try await Clerk.shared.signOut()
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

  private func completeOnce(_ result: Result<[String: Any], Error>) {
    guard !completionCalled else { return }
    completionCalled = true
    completion(result)
  }

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.authEventEmitter.events {
        guard let self = self, !self.completionCalled else { return }
        switch event {
        case .signInCompleted(let signIn):
          if let sessionId = signIn.createdSessionId {
            self.completeOnce(.success(["sessionId": sessionId, "type": "signIn"]))
            self.dismiss(animated: true)
          } else {
            self.completeOnce(.failure(NSError(domain: "ClerkExpo", code: 4, userInfo: [NSLocalizedDescriptionKey: "Sign-in completed but no session was created"])))
            self.dismiss(animated: true)
          }
        case .signUpCompleted(let signUp):
          if let sessionId = signUp.createdSessionId {
            self.completeOnce(.success(["sessionId": sessionId, "type": "signUp"]))
            self.dismiss(animated: true)
          } else {
            self.completeOnce(.failure(NSError(domain: "ClerkExpo", code: 4, userInfo: [NSLocalizedDescriptionKey: "Sign-up completed but no session was created"])))
            self.dismiss(animated: true)
          }
        default:
          break
        }
      }
      // Stream ended without a completion event
      guard let self = self else { return }
      self.completeOnce(.failure(NSError(domain: "ClerkExpo", code: 5, userInfo: [NSLocalizedDescriptionKey: "Auth event stream ended unexpectedly"])))
    }
  }
}

struct ClerkAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissable: Bool

  var body: some View {
    AuthView(mode: mode, isDismissable: dismissable)
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

  private func completeOnce(_ result: Result<[String: Any], Error>) {
    guard !completionCalled else { return }
    completionCalled = true
    completion(result)
  }

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.authEventEmitter.events {
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
      self.completeOnce(.failure(NSError(domain: "ClerkExpo", code: 5, userInfo: [NSLocalizedDescriptionKey: "Profile event stream ended unexpectedly"])))
    }
  }
}

struct ClerkProfileWrapperView: View {
  let dismissable: Bool

  var body: some View {
    UserProfileView(isDismissable: dismissable)
  }
}

// MARK: - Inline Auth View Wrapper (for embedded rendering)

struct ClerkInlineAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissable: Bool
  let onEvent: (String, [String: Any]) -> Void

  var body: some View {
    AuthView(mode: mode, isDismissable: dismissable)
      .task {
        for await event in Clerk.shared.authEventEmitter.events {
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
      .task {
        for await event in Clerk.shared.authEventEmitter.events {
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

