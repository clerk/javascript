import UIKit

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  override func makeHostedController() -> UIViewController? {
    guard let bridge = clerkNativeBridge else { return nil }

    return bridge.makeUserButtonViewController()
  }

  override var clearsHostedViewBackground: Bool {
    true
  }
}
