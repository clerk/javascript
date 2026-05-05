import React
import GoogleSignIn

@objc(ClerkGoogleSignIn)
class ClerkGoogleSignInModule: NSObject, RCTBridgeModule {

  static func moduleName() -> String! {
    return "ClerkGoogleSignIn"
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  private var clientId: String?
  private var hostedDomain: String?

  // MARK: - configure

  @objc func configure(_ params: NSDictionary) {
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

  @objc func signIn(_ params: NSDictionary?,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
    guard self.clientId != nil else {
      reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", nil)
      return
    }

    DispatchQueue.main.async {
      guard let presentingVC = self.getPresentingViewController() else {
        reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available", nil)
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
        nonce: nonce
      ) { result, error in
        self.handleSignInResult(result: result, error: error, resolve: resolve, reject: reject)
      }
    }
  }

  // MARK: - createAccount

  @objc func createAccount(_ params: NSDictionary?,
                             resolve: @escaping RCTPromiseResolveBlock,
                             reject: @escaping RCTPromiseRejectBlock) {
    guard self.clientId != nil else {
      reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", nil)
      return
    }

    DispatchQueue.main.async {
      guard let presentingVC = self.getPresentingViewController() else {
        reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available", nil)
        return
      }

      let nonce = params?["nonce"] as? String

      GIDSignIn.sharedInstance.signIn(
        withPresenting: presentingVC,
        hint: nil,
        additionalScopes: nil,
        nonce: nonce
      ) { result, error in
        self.handleSignInResult(result: result, error: error, resolve: resolve, reject: reject)
      }
    }
  }

  // MARK: - presentExplicitSignIn

  @objc func presentExplicitSignIn(_ params: NSDictionary?,
                                     resolve: @escaping RCTPromiseResolveBlock,
                                     reject: @escaping RCTPromiseRejectBlock) {
    guard self.clientId != nil else {
      reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", nil)
      return
    }

    DispatchQueue.main.async {
      guard let presentingVC = self.getPresentingViewController() else {
        reject("GOOGLE_SIGN_IN_ERROR", "No presenting view controller available", nil)
        return
      }

      let nonce = params?["nonce"] as? String

      GIDSignIn.sharedInstance.signIn(
        withPresenting: presentingVC,
        hint: nil,
        additionalScopes: nil,
        nonce: nonce
      ) { result, error in
        self.handleSignInResult(result: result, error: error, resolve: resolve, reject: reject)
      }
    }
  }

  // MARK: - signOut

  @objc func signOut(_ resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
    GIDSignIn.sharedInstance.signOut()
    resolve(nil)
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

  private func handleSignInResult(result: GIDSignInResult?, error: Error?,
                                   resolve: @escaping RCTPromiseResolveBlock,
                                   reject: @escaping RCTPromiseRejectBlock) {
    if let error = error {
      let nsError = error as NSError

      // Check for user cancellation
      if nsError.domain == kGIDSignInErrorDomain && nsError.code == GIDSignInError.canceled.rawValue {
        reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", error)
        return
      }

      reject("GOOGLE_SIGN_IN_ERROR", error.localizedDescription, error)
      return
    }

    guard let result = result,
          let idToken = result.user.idToken?.tokenString else {
      reject("GOOGLE_SIGN_IN_ERROR", "No ID token received", nil)
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

    resolve(response)
  }
}
