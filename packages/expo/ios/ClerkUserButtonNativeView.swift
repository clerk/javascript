import React
import UIKit

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  override func makeHostedController() -> UIViewController? {
    return ClerkNativeBridge.shared.makeUserButtonViewController()
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
