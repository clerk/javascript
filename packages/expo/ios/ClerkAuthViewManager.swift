import React

@objc(ClerkAuthViewManager)
class ClerkAuthViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkAuthNativeView()
  }
}
