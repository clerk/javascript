import React

@objc(ClerkUserButtonViewManager)
class ClerkUserButtonViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkUserButtonNativeView()
  }
}
