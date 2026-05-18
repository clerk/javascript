import React

@objc(ClerkOrganizationSwitcherViewManager)
class ClerkOrganizationSwitcherViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkOrganizationSwitcherNativeView()
  }
}
