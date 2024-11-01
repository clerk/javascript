import ExpoModulesCore

@available(iOS 15.0, *)
public class ClerkExpoPasskeysModule: Module {
    let credentialManager = AccountManager()
    
    public func definition() -> ModuleDefinition {
        Name("ClerkExpoPasskeys")
        
        AsyncFunction("create") { (challenge: String, rpId:String, userId: String, displayName: String, promise: Promise) in
            self.credentialManager.createPasskey(challengeBase64: challenge, rpId:rpId, displayName:displayName, userIdBase64: userId, promise: promise)
        }
        
        AsyncFunction("get") { (challenge: String, rpId:String, promise: Promise) in
            self.credentialManager.getPasskey(challengeBase64URL: challenge, rpId: rpId, promise: promise)
        }
        
        AsyncFunction("autofill") { (challenge: String, rpId:String, promise: Promise) in
            if #available(iOS 16.0, *) {
                self.credentialManager.beginAutoFillAssistedPasskeySignIn(challengeBase64URL: challenge, rpId: rpId, promise: promise)
            } else {
                // Fallback on earlier versions
            }
         
        }
    }
}
