import UIKit
import XCTest
@testable import ClerkExpo

final class ClerkNativeViewHostTests: XCTestCase {
  @MainActor
  func testConfigureNotificationDoesNotReplaceAttachedController() {
    let hostView = TestClerkNativeViewHost(appContext: nil)
    let controller = UIViewController()
    hostView.controller = controller
    let window = mountInWindow(hostView)
    let callsBeforeNotification = hostView.makeHostedControllerCallCount

    NotificationCenter.default.post(name: .clerkNativeSDKDidConfigure, object: nil)

    XCTAssertEqual(hostView.makeHostedControllerCallCount, callsBeforeNotification)
    XCTAssertTrue(controller.view.superview === hostView)
    unmount(hostView, from: window)
  }

  @MainActor
  func testConfigureNotificationAttachesControllerWhenInitiallyUnavailable() {
    let hostView = TestClerkNativeViewHost(appContext: nil)
    let window = mountInWindow(hostView)
    let callsBeforeConfiguration = hostView.makeHostedControllerCallCount
    let controller = UIViewController()
    hostView.controller = controller

    NotificationCenter.default.post(name: .clerkNativeSDKDidConfigure, object: nil)

    XCTAssertEqual(hostView.makeHostedControllerCallCount, callsBeforeConfiguration + 1)
    XCTAssertTrue(controller.view.superview === hostView)

    NotificationCenter.default.post(name: .clerkNativeSDKDidConfigure, object: nil)

    XCTAssertEqual(hostView.makeHostedControllerCallCount, callsBeforeConfiguration + 1)
    unmount(hostView, from: window)
  }

  @MainActor
  private func mountInWindow(_ hostView: UIView) -> UIWindow {
    let window = UIWindow(frame: UIScreen.main.bounds)
    let viewController = UIViewController()
    window.rootViewController = viewController
    viewController.view.addSubview(hostView)
    window.makeKeyAndVisible()
    return window
  }

  @MainActor
  private func unmount(_ hostView: UIView, from window: UIWindow) {
    hostView.removeFromSuperview()
    window.isHidden = true
  }
}

@MainActor
private final class TestClerkNativeViewHost: ClerkNativeViewHost {
  var controller: UIViewController?
  private(set) var makeHostedControllerCallCount = 0

  override func makeHostedController() -> UIViewController? {
    makeHostedControllerCallCount += 1
    return controller
  }
}
