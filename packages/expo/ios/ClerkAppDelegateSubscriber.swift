// ClerkAppDelegateSubscriber - Forwards inbound URLs to the native Clerk SDK.

import ExpoModulesCore
import UIKit

public class ClerkAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    ClerkNativeBridge.shared.handle(url: url)
    // Returning false leaves the URL available to React Native's Linking.
    return false
  }
}
