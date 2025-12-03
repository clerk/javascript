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

  public func configure(publishableKey: String) async throws {
    print("🔧 [ClerkViewFactory] Configuring Clerk with key: \(publishableKey.prefix(20))...")
    await Clerk.shared.configure(publishableKey: publishableKey)
    print("✅ [ClerkViewFactory] Clerk configured successfully")
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

