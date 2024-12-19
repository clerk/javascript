import AuthenticationServices
import Foundation
import os

import ExpoModulesCore

@available(iOS 15.0, *)
struct AuthorizationResponse {
    var registration: ASAuthorizationPlatformPublicKeyCredentialRegistration?
    var assertion: ASAuthorizationPlatformPublicKeyCredentialAssertion?
}

@available(iOS 15.0, *)
class AccountManager: NSObject, ASAuthorizationControllerPresentationContextProviding, ASAuthorizationControllerDelegate {
    private var authCallback: ((AuthorizationResponse?,ASAuthorizationError.Code?) -> Void)?
    var authController: ASAuthorizationController?
    
    func createPasskey(challengeBase64: String, rpId: String, displayName: String, userIdBase64: String,  promise: Promise) {
        let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
        
        let challenge = dataFromBase64URL(base64urlString: challengeBase64)!
        let userId = dataFromBase64URL(base64urlString: userIdBase64)!
        
        let registrationRequest = publicKeyCredentialProvider.createCredentialRegistrationRequest(challenge: challenge,
                                                                                                  name: displayName, userID: userId)
        
        let authController = ASAuthorizationController(authorizationRequests: [ registrationRequest ] )
        authController.delegate = self
        authController.presentationContextProvider = self
        authController.performRequests()
        
        self.authCallback = { result,error in
            if (error != nil) {
                promise.reject(String(error!.rawValue), handleAuthorizationError(error!).rawValue)
                return
            }
            
            if let response = result?.registration {
                let authResult: NSDictionary = [
                    "id": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "rawId": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "type": "public-key",
                    "response": [
                        "attestationObject": base64URLFromBase64(base64String: response.rawAttestationObject!.base64EncodedString()),
                        "clientDataJSON": base64URLFromBase64(base64String: response.rawClientDataJSON.base64EncodedString())
                    ]
                ]
                promise.resolve(authResult);
            } else {
                promise.reject(Errors.notHandled.rawValue, "Not valid registration result");
            }
        }
    }
    
    
    func getPasskey(challengeBase64URL: String, rpId: String,  promise: Promise) {
        let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)
        
        let challenge = dataFromBase64URL(base64urlString: challengeBase64URL)!
        let assertionRequest = publicKeyCredentialProvider.createCredentialAssertionRequest(challenge: challenge)
        
        
        let authController = ASAuthorizationController(authorizationRequests: [ assertionRequest ] )
        authController.delegate = self
        authController.presentationContextProvider = self
        authController.performRequests()
        
        self.authCallback = { result,error in
            if (error != nil) {
                promise.reject(String(error!.rawValue), handleAuthorizationError(error!).rawValue);
                return
            }
            
            if let response = result?.assertion {
                let authResult: NSDictionary = [
                    "id": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "rawId": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "type":"public-key",
                    "response": [
                        "authenticatorData":base64URLFromBase64(base64String: response.rawAuthenticatorData.base64EncodedString()),
                        "clientDataJSON": base64URLFromBase64(base64String: response.rawClientDataJSON.base64EncodedString()),
                        "signature": base64URLFromBase64(base64String: response.signature.base64EncodedString()),
                        "userHandle": base64URLFromBase64(base64String: response.userID.base64EncodedString()),
                    ]                ]
                promise.resolve(authResult);
            } else {
                promise.reject("Response is invalid", "Could not retrieve passkey");
            }
        }
        
    }
    
    @available(iOS 16.0, *)
    func beginAutoFillAssistedPasskeySignIn(challengeBase64URL: String, rpId: String,  promise: Promise) {
        let publicKeyCredentialProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: rpId)

        let challenge = dataFromBase64URL(base64urlString: challengeBase64URL)!
        let assertionRequest = publicKeyCredentialProvider.createCredentialAssertionRequest(challenge: challenge)

        let authController = ASAuthorizationController(authorizationRequests: [ assertionRequest ] )
       
        authController.delegate = self
        authController.presentationContextProvider = self
        authController.performAutoFillAssistedRequests()
        
        self.authCallback = { result,error in
            if (error != nil) {
                promise.reject(String(error!.rawValue), handleAuthorizationError(error!).rawValue);
                return
            }
            
            if let response = result?.assertion {
                let authResult: NSDictionary = [
                    "id": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "rawId": base64URLFromBase64(base64String: response.credentialID.base64EncodedString()),
                    "type":"public-key",
                    "response": [
                        "authenticatorData":base64URLFromBase64(base64String: response.rawAuthenticatorData.base64EncodedString()),
                        "clientDataJSON": base64URLFromBase64(base64String: response.rawClientDataJSON.base64EncodedString()),
                        "signature": base64URLFromBase64(base64String: response.signature.base64EncodedString()),
                        "userHandle": base64URLFromBase64(base64String: response.userID.base64EncodedString()),
                    ]                ]
                promise.resolve(authResult);
            } else {
                promise.reject("Response is invalid", "Could not retrieve passkey");
            }
        }
    }
  
  
  @available(iOS 16.0, *)
  func cancelAutoFillAssistedPasskeySignIn() {
    if authController != nil {
      self.authController?.cancel()
        self.authController = nil
    }
  }
    
    

    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        let logger = Logger()
        switch authorization.credential {
        case let credentialRegistration as ASAuthorizationPlatformPublicKeyCredentialRegistration:
            self.authCallback!(AuthorizationResponse(registration: credentialRegistration),nil)
            logger.log("A new passkey was registered: \(credentialRegistration)")
        case let credentialAssertion as ASAuthorizationPlatformPublicKeyCredentialAssertion:
            self.authCallback!(AuthorizationResponse(assertion: credentialAssertion),nil)
            logger.log("A passkey was used to sign in: \(credentialAssertion)")
        default:
            self.authCallback!(AuthorizationResponse(registration: nil), ASAuthorizationError.unknown)
        }
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        let logger = Logger()
        guard let authorizationError = error as? ASAuthorizationError else {
            self.authCallback!(AuthorizationResponse(registration: nil), ASAuthorizationError.unknown)
            logger.error("Unexpected authorization error: \(error.localizedDescription)")
            return
        }
        
        if authorizationError.code == .canceled {
            // Either the system doesn't find any credentials and the request ends silently, or the user cancels the request.
            // This is a good time to show a traditional login form, or ask the user to create an account.
            self.authCallback!(AuthorizationResponse(registration: nil),ASAuthorizationError.canceled)
            logger.log("Request canceled.")
            
        } else {
            // Another ASAuthorization error.
            // Note: The userInfo dictionary contains useful information.
            self.authCallback!(AuthorizationResponse(registration: nil),ASAuthorizationError.unknown)
            logger.error("Error: \((error as NSError).userInfo)")
        }
    }
    
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return UIApplication.shared.keyWindow!;
    }
}

