#if !RCT_NEW_ARCH_ENABLED
import ExpoModulesCore
import UIKit
import XCTest
import ClerkExpo

final class ClerkAuthNativeViewPaperTests: XCTestCase {
  @MainActor
  func testAddingAndRemovingLogoAfterMountKeepsReactChildOutOfHostHierarchy() {
    let window = UIWindow(frame: UIScreen.main.bounds)
    let viewController = UIViewController()
    let authView = ClerkAuthNativeView(appContext: nil)
    window.rootViewController = viewController
    viewController.view.addSubview(authView)
    window.makeKeyAndVisible()

    let logoView = UIView(frame: CGRect(x: 0, y: 0, width: 120, height: 40))
    authView.insertReactSubview(logoView, at: 0)
    authView.didUpdateReactSubviews()

    XCTAssertFalse(logoView.superview === authView)

    authView.removeReactSubview(logoView)
    authView.didUpdateReactSubviews()

    XCTAssertNil(logoView.superview)
    window.isHidden = true
  }
}
#endif
