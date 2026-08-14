import ExpoModulesCore
import UIKit

public class ClerkUserButtonNativeView: ClerkUserProfileCustomPageHost {
  override func makeHostedController() -> UIViewController? {
    return ClerkNativeBridge.shared.makeUserButtonViewController(
      customRows: customRows(),
      customPageState: customPageState
    )
  }
}

public class ClerkUserButtonViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClerkUserButtonView")

    View(ClerkUserButtonNativeView.self) {
      Events("onCustomPageEvent")

      Prop("customPages") { (view: ClerkUserButtonNativeView, customPages: String?) in
        view.setCustomPages(customPages)
      }

      AsyncFunction("navigateCustomPage") {
        (view: ClerkUserButtonNativeView, action: String, routeKey: String?) in
        view.navigateCustomPage(action: action, routeKey: routeKey)
      }
    }
  }
}
