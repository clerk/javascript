import UIKit

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  override func makeHostedController() -> UIViewController? {
    guard let factory = clerkViewFactory else { return nil }

    return factory.createUserButton()
  }

  override var clearsHostedViewBackground: Bool {
    true
  }
}
