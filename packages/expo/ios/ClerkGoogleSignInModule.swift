import ExpoModulesCore
import GoogleSignIn

public class ClerkGoogleSignInModule: Module {
  private var clientId: String?
  private var hostedDomain: String?

  public func definition() -> ModuleDefinition {
    Name("ClerkGoogleSignIn")

    Function("configure") { (params: [String: Any?]) in
      self.configure(params)
    }

    AsyncFunction("signIn") { (params: [String: Any?]?, promise: Promise) in
      self.signIn(params, promise: promise)
    }.runOnQueue(.main)

    AsyncFunction("createAccount") { (params: [String: Any?]?, promise: Promise) in
      self.createAccount(params, promise: promise)
    }.runOnQueue(.main)

    AsyncFunction("presentExplicitSignIn") { (params: [String: Any?]?, promise: Promise) in
      self.presentExplicitSignIn(params, promise: promise)
    }.runOnQueue(.main)

    AsyncFunction("signOut") { (promise: Promise) in
      self.signOut(promise: promise)
    }.runOnQueue(.main)
  }

  // MARK: - configure

  private func configure(_ params: [String: Any?]) {
    let webClientId = params["webClientId"] as? String ?? ""
    let iosClientId = params["iosClientId"] as? String
    self.clientId = iosClientId ?? webClientId
    self.hostedDomain = params["hostedDomain"] as? String

    if let clientId = self.clientId {
      let config = GIDConfiguration(
        clientID: clientId,
        serverClientID: webClientId
      )
      GIDSignIn.sharedInstance.configuration = config
    }
  }

  // MARK: - signIn

  private func signIn(_ params: [String: Any?]?, promise: Promise) {
    guard self.clientId != nil else {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    guard let presentingVC = self.getPresentingViewController() else {
      promise.reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available")
      return
    }

    let filterByAuthorized = params?["filterByAuthorizedAccounts"] as? Bool ?? false
    let hint: String? = filterByAuthorized
      ? GIDSignIn.sharedInstance.currentUser?.profile?.email
      : nil
    let nonce = params?["nonce"] as? String

    GIDSignIn.sharedInstance.signIn(
      withPresenting: presentingVC,
      hint: hint,
      additionalScopes: nil,
      nonce: nonce,
      completion: { result, error in
        self.handleSignInResult(result: result, error: error, promise: promise)
      }
    )
  }

  // MARK: - createAccount

  private func createAccount(_ params: [String: Any?]?, promise: Promise) {
    guard self.clientId != nil else {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    guard let presentingVC = self.getPresentingViewController() else {
      promise.reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available")
      return
    }

    let nonce = params?["nonce"] as? String

    GIDSignIn.sharedInstance.signIn(
      withPresenting: presentingVC,
      hint: nil,
      additionalScopes: nil,
      nonce: nonce,
      completion: { result, error in
        self.handleSignInResult(result: result, error: error, promise: promise)
      }
    )
  }

  // MARK: - presentExplicitSignIn

  private func presentExplicitSignIn(_ params: [String: Any?]?, promise: Promise) {
    guard self.clientId != nil else {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    guard let presentingVC = self.getPresentingViewController() else {
      promise.reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available")
      return
    }

    let nonce = params?["nonce"] as? String

    GIDSignIn.sharedInstance.signIn(
      withPresenting: presentingVC,
      hint: nil,
      additionalScopes: nil,
      nonce: nonce,
      completion: { result, error in
        self.handleSignInResult(result: result, error: error, promise: promise)
      }
    )
  }

  // MARK: - signOut

  private func signOut(promise: Promise) {
    GIDSignIn.sharedInstance.signOut()
    promise.resolve()
  }

  // MARK: - Helpers

  private func getPresentingViewController() -> UIViewController? {
    guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let window = scene.windows.first,
          let rootVC = window.rootViewController else {
      return nil
    }

    var topVC = rootVC
    while let presentedVC = topVC.presentedViewController {
      topVC = presentedVC
    }
    return topVC
  }

  private func handleSignInResult(result: GIDSignInResult?, error: Error?, promise: Promise) {
    if let error = error {
      let nsError = error as NSError

      // Check for user cancellation
      if nsError.domain == kGIDSignInErrorDomain && nsError.code == GIDSignInError.canceled.rawValue {
        promise.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow")
        return
      }

      promise.reject("GOOGLE_SIGN_IN_ERROR", error.localizedDescription)
      return
    }

    guard let result = result,
          let idToken = result.user.idToken?.tokenString else {
      promise.reject("GOOGLE_SIGN_IN_ERROR", "No ID token received")
      return
    }

    let user = result.user
    let profile = user.profile

    let response: [String: Any] = [
      "type": "success",
      "data": [
        "idToken": idToken,
        "user": [
          "id": user.userID ?? "",
          "email": profile?.email ?? "",
          "name": profile?.name ?? "",
          "givenName": profile?.givenName ?? "",
          "familyName": profile?.familyName ?? "",
          "photo": profile?.imageURL(withDimension: 200)?.absoluteString ?? NSNull()
        ] as [String: Any]
      ] as [String: Any]
    ]

    promise.resolve(response)
  }
}
