import ExpoModulesCore
import UIKit

public class ClerkUserButtonNativeView: ClerkNativeViewHost {
  override func makeHostedController() -> UIViewController? {
    return ClerkNativeBridge.shared.makeUserButtonViewController()
  }
}

public class ClerkUserButtonViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkUserButtonView")

    View(ClerkUserButtonNativeView.self) {}
  }
}
