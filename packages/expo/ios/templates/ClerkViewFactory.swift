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
    print("✅ [ClerkViewFactory] Registered with ClerkExpo module")
  }

  @MainActor
  public func configure(publishableKey: String) async throws {
    print("🔧 [ClerkViewFactory] Configuring Clerk with key: \(publishableKey.prefix(20))...")
    Clerk.shared.configure(publishableKey: publishableKey)
    print("✅ [ClerkViewFactory] Clerk configured, now loading...")

    // CRITICAL: Must call load() after configure() to restore session from keychain
    do {
      try await Clerk.shared.load()
      print("✅ [ClerkViewFactory] Clerk load() completed")
    } catch {
      print("❌ [ClerkViewFactory] Clerk load() failed: \(error)")
    }

    // IMPORTANT: load() is async but session may be populated AFTER it returns
    // The SDK uses Combine/ObservableObject pattern - session is published asynchronously
    // We need to wait for the session to actually be populated
    print("⏳ [ClerkViewFactory] Waiting for session to be populated...")
    for i in 0..<30 {  // Wait up to 3 seconds
      if Clerk.shared.session != nil {
        print("✅ [ClerkViewFactory] Session found after \(i * 100)ms: \(Clerk.shared.session?.id ?? "unknown")")
        return
      }
      try? await Task.sleep(nanoseconds: 100_000_000) // 100ms
    }
    print("⚠️ [ClerkViewFactory] No session found after 3s, session: \(Clerk.shared.session?.id ?? "none")")
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

  @MainActor
  public func getSession() async -> [String: Any]? {
    guard let session = Clerk.shared.session else {
      print("📭 [ClerkViewFactory] No active session")
      return nil
    }
    print("✅ [ClerkViewFactory] Found active session: \(session.id)")

    var result: [String: Any] = [
      "sessionId": session.id,
      "status": String(describing: session.status)
    ]

    // Include user details if available
    // Try to get user from session first, then fallback to Clerk.shared.user
    let user = session.user ?? Clerk.shared.user
    NSLog("🔍 [ClerkViewFactory] Clerk.shared.user: \(Clerk.shared.user?.id ?? "nil")")
    NSLog("🔍 [ClerkViewFactory] session.user: \(session.user?.id ?? "nil")")

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
      NSLog("✅ [ClerkViewFactory] User found: \(user.firstName ?? "N/A") \(user.lastName ?? "")")
    } else {
      NSLog("⚠️ [ClerkViewFactory] No user available - all sources returned nil")
    }

    return result
  }

  public func signOut() async throws {
    print("🔓 [ClerkViewFactory] Signing out...")
    try await Clerk.shared.signOut()
    print("✅ [ClerkViewFactory] Signed out successfully")
  }
}

// MARK: - Auth View Controller Wrapper

class ClerkAuthWrapperViewController: UIHostingController<ClerkAuthWrapperView> {
  private let completion: (Result<[String: Any], Error>) -> Void
  private var authEventTask: Task<Void, Never>?

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

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.authEventEmitter.events {
        guard let self = self else { return }
        switch event {
        case .signInCompleted(let signIn):
          print("✅ [ClerkAuth] Sign-in completed")
          if let sessionId = signIn.createdSessionId {
            self.completion(.success(["sessionId": sessionId, "type": "signIn"]))
            self.dismiss(animated: true)
          }
        case .signUpCompleted(let signUp):
          print("✅ [ClerkAuth] Sign-up completed")
          if let sessionId = signUp.createdSessionId {
            self.completion(.success(["sessionId": sessionId, "type": "signUp"]))
            self.dismiss(animated: true)
          }
        default:
          break
        }
      }
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

  private func subscribeToAuthEvents() {
    authEventTask = Task { @MainActor [weak self] in
      for await event in Clerk.shared.authEventEmitter.events {
        guard let self = self else { return }
        switch event {
        case .signedOut(let session):
          print("✅ [ClerkProfile] Signed out")
          self.completion(.success(["sessionId": session.id]))
          self.dismiss(animated: true)
        default:
          break
        }
      }
    }
  }
}

struct ClerkProfileWrapperView: View {
  let dismissable: Bool

  var body: some View {
    UserProfileView(isDismissable: dismissable)
  }
}

