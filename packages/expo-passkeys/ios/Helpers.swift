import Foundation
import AuthenticationServices


enum Errors: String, Error  {
    case unknown = "An unknown error occurred."
    case canceled = "Authorization was canceled by the user."
    case invalidResponse = "The authorization request received an invalid response."
    case notHandled = "The authorization request wasn't handled."
    case failed = "The authorization request failed."
    case unknownAuthorizationError = "An unknown authorization error occurred."
}

func handleAuthorizationError(_ error: ASAuthorizationError.Code) -> Errors {
    switch error {
    case .unknown:
        return Errors.unknown
    case .canceled:
        return Errors.canceled
    case .invalidResponse:
        return Errors.invalidResponse
    case .notHandled:
        return Errors.notHandled
    case .failed:
        return Errors.failed
    @unknown default:
        return Errors.unknownAuthorizationError
    }
}

func dataFromBase64URL(base64urlString: String) -> Data? {
    var base64 = base64urlString
    
    base64 = base64.replacingOccurrences(of: "-", with: "+")
    base64 = base64.replacingOccurrences(of: "_", with: "/")
    
    let paddingLength = 4 - (base64.count % 4)
    if paddingLength < 4 {
        base64 = base64.padding(toLength: base64.count + paddingLength, withPad: "=", startingAt: 0)
    }
    
    return Data(base64Encoded: base64)
}


func base64URLFromBase64(base64String: String) -> String {
    var base64url = base64String
    
    base64url = base64url.replacingOccurrences(of: "+", with: "-")
    
    base64url = base64url.replacingOccurrences(of: "/", with: "_")
    
    base64url = base64url.replacingOccurrences(of: "=", with: "")
    
    return base64url
}
