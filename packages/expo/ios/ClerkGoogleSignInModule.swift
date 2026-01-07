import ExpoModulesCore
import GoogleSignIn

public class ClerkGoogleSignInModule: Module {
    private var clientId: String?
    private var hostedDomain: String?

    public func definition() -> ModuleDefinition {
        Name("ClerkGoogleSignIn")

        // Configure the module
        Function("configure") { (params: ConfigureParams) in
            self.clientId = params.iosClientId ?? params.webClientId
            self.hostedDomain = params.hostedDomain

            // Set the configuration globally
            // clientID: iOS client ID for OAuth flow
            // serverClientID: Web client ID for token audience (what Clerk backend verifies)
            if let clientId = self.clientId {
                let config = GIDConfiguration(
                    clientID: clientId,
                    serverClientID: params.webClientId
                )
                GIDSignIn.sharedInstance.configuration = config
            }
        }

        // Sign in - attempts sign-in with hint if available
        AsyncFunction("signIn") { (params: SignInParams?, promise: Promise) in
            guard self.clientId != nil else {
                promise.reject(NotConfiguredException())
                return
            }

            DispatchQueue.main.async {
                guard let presentingVC = self.getPresentingViewController() else {
                    promise.reject(GoogleSignInException(message: "No presenting view controller available"))
                    return
                }

                // Build sign-in hint if filtering by authorized accounts
                let hint: String? = params?.filterByAuthorizedAccounts == true
                    ? GIDSignIn.sharedInstance.currentUser?.profile?.email
                    : nil

                GIDSignIn.sharedInstance.signIn(
                    withPresenting: presentingVC,
                    hint: hint,
                    additionalScopes: nil,
                    nonce: params?.nonce
                ) { result, error in
                    self.handleSignInResult(result: result, error: error, promise: promise)
                }
            }
        }

        // Create account - shows account creation UI (same as sign in on iOS)
        AsyncFunction("createAccount") { (params: CreateAccountParams?, promise: Promise) in
            guard self.clientId != nil else {
                promise.reject(NotConfiguredException())
                return
            }

            DispatchQueue.main.async {
                guard let presentingVC = self.getPresentingViewController() else {
                    promise.reject(GoogleSignInException(message: "No presenting view controller available"))
                    return
                }

                GIDSignIn.sharedInstance.signIn(
                    withPresenting: presentingVC,
                    hint: nil,
                    additionalScopes: nil,
                    nonce: params?.nonce
                ) { result, error in
                    self.handleSignInResult(result: result, error: error, promise: promise)
                }
            }
        }

        // Explicit sign-in - uses standard Google Sign-In flow
        AsyncFunction("presentExplicitSignIn") { (params: ExplicitSignInParams?, promise: Promise) in
            guard self.clientId != nil else {
                promise.reject(NotConfiguredException())
                return
            }

            DispatchQueue.main.async {
                guard let presentingVC = self.getPresentingViewController() else {
                    promise.reject(GoogleSignInException(message: "No presenting view controller available"))
                    return
                }

                GIDSignIn.sharedInstance.signIn(
                    withPresenting: presentingVC,
                    hint: nil,
                    additionalScopes: nil,
                    nonce: params?.nonce
                ) { result, error in
                    self.handleSignInResult(result: result, error: error, promise: promise)
                }
            }
        }

        // Sign out - clears credential state
        AsyncFunction("signOut") { (promise: Promise) in
            GIDSignIn.sharedInstance.signOut()
            promise.resolve(nil)
        }
    }

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
                promise.reject(SignInCancelledException())
                return
            }

            promise.reject(GoogleSignInException(message: error.localizedDescription))
            return
        }

        guard let result = result,
              let idToken = result.user.idToken?.tokenString else {
            promise.reject(GoogleSignInException(message: "No ID token received"))
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

// MARK: - Records

struct ConfigureParams: Record {
    @Field
    var webClientId: String = ""

    @Field
    var iosClientId: String?

    @Field
    var hostedDomain: String?

    @Field
    var autoSelectEnabled: Bool?
}

struct SignInParams: Record {
    @Field
    var nonce: String?

    @Field
    var filterByAuthorizedAccounts: Bool?
}

struct CreateAccountParams: Record {
    @Field
    var nonce: String?
}

struct ExplicitSignInParams: Record {
    @Field
    var nonce: String?
}

// MARK: - Exceptions

class SignInCancelledException: Exception {
    override var code: String { "SIGN_IN_CANCELLED" }
    override var reason: String { "User cancelled the sign-in flow" }
}

class NoSavedCredentialException: Exception {
    override var code: String { "NO_SAVED_CREDENTIAL_FOUND" }
    override var reason: String { "No saved credential found" }
}

class NotConfiguredException: Exception {
    override var code: String { "NOT_CONFIGURED" }
    override var reason: String { "Google Sign-In is not configured. Call configure() first." }
}

class GoogleSignInException: Exception {
    private let errorMessage: String

    init(message: String) {
        self.errorMessage = message
        super.init()
    }

    override var code: String { "GOOGLE_SIGN_IN_ERROR" }
    override var reason: String { errorMessage }
}
