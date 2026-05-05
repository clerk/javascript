import React

@objc(ClerkUserProfileViewManager)
class ClerkUserProfileViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkUserProfileNativeView()
  }
}
