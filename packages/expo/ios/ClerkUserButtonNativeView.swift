import React
import UIKit
import ClerkExpoBridge

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  override func makeHostedController() -> UIViewController? {
    guard let bridge = clerkNativeBridge else { return nil }

    return bridge.makeUserButtonViewController()
  }
}

@objc(ClerkUserButtonViewManager)
class ClerkUserButtonViewManager: RCTViewManager {

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    return ClerkUserButtonNativeView()
  }
}
