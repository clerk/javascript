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
  func testHostBackFallsBackWhenThereIsNoNavigationController() {
    let hostView = TestClerkNativeViewHost(appContext: nil)
    let container = UIViewController()
    container.view.addSubview(hostView)

    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
  }

  @MainActor
  func testHostBackDoesNotPopTheRootScreen() {
    let root = UIViewController()
    let navigation = UINavigationController(rootViewController: root)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    root.view.addSubview(hostView)

    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
    XCTAssertTrue(navigation.topViewController === root)
  }

  @MainActor
  func testHostBackPopsTheEnclosingScreen() {
    let root = UIViewController()
    let screen = UIViewController()
    let navigation = UINavigationController(rootViewController: root)
    navigation.setViewControllers([root, screen], animated: false)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    screen.view.addSubview(hostView)

    XCTAssertTrue(hostView.popEnclosingNavigationRoute())
    XCTAssertTrue(navigation.topViewController === root)
    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
  }

  @MainActor
  func testHostBackPopsTheScreenContainingAChildController() {
    let root = UIViewController()
    let screen = UIViewController()
    let child = UIViewController()
    screen.addChild(child)
    screen.view.addSubview(child.view)
    child.didMove(toParent: screen)
    let navigation = UINavigationController(rootViewController: root)
    navigation.setViewControllers([root, screen], animated: false)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    child.view.addSubview(hostView)

    XCTAssertTrue(hostView.popEnclosingNavigationRoute())
    XCTAssertTrue(navigation.topViewController === root)
  }

  @MainActor
  func testHostBackDoesNotPopAScreenBelowTheTopOfTheStack() {
    let root = UIViewController()
    let screen = UIViewController()
    let top = UIViewController()
    let navigation = UINavigationController(rootViewController: root)
    navigation.setViewControllers([root, screen, top], animated: false)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    screen.view.addSubview(hostView)

    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
    XCTAssertEqual(navigation.viewControllers, [root, screen, top])
  }

  @MainActor
  func testHostBackInAModalDoesNotPopTheScreenBehindIt() {
    let root = UIViewController()
    let screen = UIViewController()
    screen.definesPresentationContext = true
    let navigation = UINavigationController(rootViewController: root)
    navigation.setViewControllers([root, screen], animated: false)
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.rootViewController = navigation
    window.makeKeyAndVisible()
    window.layoutIfNeeded()
    let modal = UIViewController()
    modal.modalPresentationStyle = .currentContext
    screen.present(modal, animated: false)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    modal.view.addSubview(hostView)
    // The responder chain continues from the modal to the pushed screen behind it.
    XCTAssertTrue(modal.next === screen)

    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
    XCTAssertEqual(navigation.viewControllers, [root, screen])

    modal.dismiss(animated: false)
    window.isHidden = true
  }

  @MainActor
  func testHostBackInAModalFromANestedStackDoesNotPopTheOuterScreen() {
    let outerRoot = UIViewController()
    let outerScreen = UIViewController()
    let outer = UINavigationController(rootViewController: outerRoot)
    outer.setViewControllers([outerRoot, outerScreen], animated: false)
    let inner = UINavigationController(rootViewController: UIViewController())
    outerScreen.addChild(inner)
    outerScreen.view.addSubview(inner.view)
    inner.didMove(toParent: outerScreen)
    inner.definesPresentationContext = true
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.rootViewController = outer
    window.makeKeyAndVisible()
    window.layoutIfNeeded()
    let modal = UIViewController()
    modal.modalPresentationStyle = .currentContext
    inner.present(modal, animated: false)
    let hostView = TestClerkNativeViewHost(appContext: nil)
    modal.view.addSubview(hostView)
    XCTAssertTrue(modal.next === inner)

    XCTAssertFalse(hostView.popEnclosingNavigationRoute())
    XCTAssertEqual(outer.viewControllers, [outerRoot, outerScreen])

    modal.dismiss(animated: false)
    window.isHidden = true
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
