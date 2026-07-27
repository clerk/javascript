// ClerkNativeBridge - Provides Clerk SDK operations and SwiftUI view controllers to ClerkExpo.

import UIKit
import SwiftUI
import Observation
@_spi(FrameworkIntegration) import ClerkKit
@_spi(FrameworkIntegration) import ClerkKitUI

/// Events emitted by the native view wrappers to their React Native host views.
public enum ClerkNativeViewEvent: String {
  /// Emitted by the Expo host view when app-owned dismissible content leaves the window.
  case dismissed
}

extension Notification.Name {
  static let clerkNativeSDKDidConfigure = Notification.Name("com.clerk.expo.native-sdk.did-configure")
}

@Observable
final class ClerkInlineAuthLogoState {
  struct Content {
    let view: UIView
    let size: CGSize
  }

  private(set) var content: Content?

  func setView(_ view: UIView) {
    content = Content(view: view, size: view.bounds.size)
  }

  func updateSize(for view: UIView) {
    guard content?.view === view else { return }
    let currentSize = view.bounds.size
    guard content?.size != currentSize else { return }
    content = Content(view: view, size: currentSize)
  }

  func removeView(_ view: UIView) {
    guard content?.view === view else { return }
    content = nil
  }
}

@MainActor
@Observable
final class ClerkUserProfileCustomPageState {
  typealias InactiveResetAction = @MainActor () -> Void
  typealias PostInactiveReset = (@escaping InactiveResetAction) -> Void

  private struct PagePresentation {
    let path: String
    let navigationDepth: Int?
  }

  private(set) var views: [UIView] = []
  @ObservationIgnored private var navigateBackAction: (() -> Void)?
  @ObservationIgnored private var popToRootAction: (() -> Void)?
  @ObservationIgnored private var pushAction: ((String) -> Void)?
  @ObservationIgnored private var pageEventHandler: ((String, String) -> Void)?
  @ObservationIgnored private var pagePresentation: PagePresentation?
  @ObservationIgnored private var retainedNavigationPath = NavigationPath()
  @ObservationIgnored private var retainedCustomPagePathsByDepth: [Int: String] = [:]
  @ObservationIgnored private var retainedNavigatorPaths: [String] = []
  @ObservationIgnored private var navigatorResetGeneration = 0
  @ObservationIgnored private var hasObservedUserID = false
  @ObservationIgnored private var observedUserID: String?
  private let postInactiveReset: PostInactiveReset

  init(
    postInactiveReset: @escaping PostInactiveReset = { action in
      Task { @MainActor in
        await Task.yield()
        action()
      }
    }
  ) {
    self.postInactiveReset = postInactiveReset
  }

  func insertView(_ view: UIView, at index: Int) {
    view.removeFromSuperview()
    views.insert(view, at: min(max(index, 0), views.count))
  }

  func removeView(_ view: UIView) {
    guard let index = views.firstIndex(where: { $0 === view }) else { return }
    view.removeFromSuperview()
    views.remove(at: index)
  }

  func configureNavigation(
    _ navigator: UserProfileNavigator<String>,
    navigateBack: @escaping () -> Void
  ) {
    configureNavigation(
      navigateBack: navigateBack,
      popToRoot: navigator.popToRoot,
      push: navigator.push
    )
  }

  func configureNavigation(_ navigationPath: Binding<NavigationPath>) {
    configureNavigation(
      navigateBack: {
        guard !navigationPath.wrappedValue.isEmpty else { return }
        navigationPath.wrappedValue.removeLast()
      },
      popToRoot: {
        navigationPath.wrappedValue = NavigationPath()
      },
      push: {
        navigationPath.wrappedValue.append($0)
      }
    )
  }

  func setPageEventHandler(_ handler: @escaping (String, String) -> Void) {
    pageEventHandler = handler
  }

  func pageDidPresent(path: String, navigationDepth: Int? = nil) {
    if navigationDepth == nil {
      cancelPendingNavigatorReset()
      retainNavigatorPath(path)
    }
    pagePresentation = PagePresentation(path: path, navigationDepth: navigationDepth)
    if let navigationDepth {
      retainedCustomPagePathsByDepth[navigationDepth] = path
    }
    pageEventHandler?("presented", path)
  }

  func pageDidDismiss(path: String) {
    guard pagePresentation?.path == path else { return }
    let usesNavigator = pagePresentation?.navigationDepth == nil
    if usesNavigator, retainedNavigatorPaths.last == path {
      retainedNavigatorPaths.removeLast()
      scheduleNavigatorResetIfInactive()
    }
    dismissPage(path)
  }

  func navigationDepthDidChange(_ navigationDepth: Int) {
    let removedPaths = retainedCustomPagePathsByDepth
      .filter { $0.key > navigationDepth }
      .sorted { $0.key > $1.key }
      .map(\.value)
    let remainingPathsByDepth = retainedCustomPagePathsByDepth.filter {
      $0.key <= navigationDepth
    }
    let remainingPaths = Set(remainingPathsByDepth.values)
    retainedCustomPagePathsByDepth = remainingPathsByDepth

    var dismissedPaths = Set<String>()
    for path in removedPaths where !remainingPaths.contains(path) && dismissedPaths.insert(path).inserted {
      dismissPage(path)
    }

    if let pagePresentation,
       let presentedDepth = pagePresentation.navigationDepth,
       navigationDepth < presentedDepth
    {
      self.pagePresentation = nil
    }
  }

  /// Expo can rebuild its hosting controller when a tab detaches. The live path starts
  /// empty in each new controller so ClerkKitUI captures the correct zero-depth baseline,
  /// while this retained snapshot is restored after that first appearance.
  func navigationPathForRestoration() -> NavigationPath {
    retainedNavigationPath
  }

  func navigationPathDidChange(_ navigationPath: NavigationPath) {
    retainedNavigationPath = navigationPath
    navigationDepthDidChange(navigationPath.count)
  }

  func userDidChange(to userID: String?) {
    guard hasObservedUserID else {
      observedUserID = userID
      hasObservedUserID = true
      return
    }

    guard observedUserID != userID else { return }
    observedUserID = userID
    invalidateNavigation()
  }

  func reconcileCustomPagePaths(_ validPaths: Set<String>) {
    var retainedPaths = Set(retainedCustomPagePathsByDepth.values)
    retainedPaths.formUnion(retainedNavigatorPaths)
    if let presentedPath = pagePresentation?.path {
      retainedPaths.insert(presentedPath)
    }
    guard !retainedPaths.isSubset(of: validPaths) else { return }

    invalidateNavigation()
  }

  func navigate(action: String, routeKey: String?) {
    switch action {
    case "back":
      navigateBackAction?()
    case "popToRoot":
      popToRootAction?()
    case "push":
      if let routeKey {
        guard !retainedCustomPagePathsByDepth.values.contains(routeKey),
              !retainedNavigatorPaths.contains(routeKey)
        else { return }
        if let pagePresentation, pagePresentation.navigationDepth == nil {
          retainNavigatorPath(routeKey)
        }
        pushAction?(routeKey)
      }
    default:
      break
    }
  }

  private func configureNavigation(
    navigateBack: @escaping () -> Void,
    popToRoot: @escaping () -> Void,
    push: @escaping (String) -> Void
  ) {
    navigateBackAction = navigateBack
    popToRootAction = popToRoot
    pushAction = push
  }

  private func invalidateNavigation() {
    var dismissedPaths = retainedCustomPagePathsByDepth
      .sorted { $0.key > $1.key }
      .map(\.value)
    dismissedPaths.append(contentsOf: retainedNavigatorPaths.reversed())
    if let presentedPath = pagePresentation?.path,
       !dismissedPaths.contains(presentedPath)
    {
      dismissedPaths.insert(presentedPath, at: 0)
    }

    retainedNavigationPath = NavigationPath()
    retainedCustomPagePathsByDepth.removeAll()
    retainedNavigatorPaths.removeAll()
    cancelPendingNavigatorReset()
    popToRootAction?()
    var uniqueDismissedPaths: [String] = []
    for path in dismissedPaths where !uniqueDismissedPaths.contains(path) {
      uniqueDismissedPaths.append(path)
    }
    for path in uniqueDismissedPaths {
      dismissPage(path)
    }
  }

  private func retainNavigatorPath(_ path: String) {
    guard let retainedIndex = retainedNavigatorPaths.lastIndex(of: path) else {
      retainedNavigatorPaths.append(path)
      return
    }

    let removedPaths = Array(retainedNavigatorPaths.suffix(from: retainedIndex + 1).reversed())
    retainedNavigatorPaths.removeSubrange((retainedIndex + 1)..<retainedNavigatorPaths.endIndex)
    for removedPath in removedPaths {
      dismissPage(removedPath)
    }
  }

  private func scheduleNavigatorResetIfInactive() {
    navigatorResetGeneration += 1
    let generation = navigatorResetGeneration
    postInactiveReset { [weak self] in
      guard let self, generation == navigatorResetGeneration else { return }
      resetInactiveNavigatorPaths()
    }
  }

  private func cancelPendingNavigatorReset() {
    navigatorResetGeneration += 1
  }

  private func resetInactiveNavigatorPaths() {
    guard pagePresentation == nil else { return }

    let dismissedPaths = retainedNavigatorPaths.reversed()
    retainedNavigatorPaths.removeAll()
    navigateBackAction = nil
    popToRootAction = nil
    pushAction = nil
    for path in dismissedPaths {
      dismissPage(path)
    }
  }

  private func dismissPage(_ path: String) {
    if pagePresentation?.path == path {
      pagePresentation = nil
    }
    pageEventHandler?("dismissed", path)
  }
}

struct ClerkUserProfileCustomRowConfig: Decodable {
  struct Placement: Decodable {
    let type: String
    let section: String?
    let row: String?
  }

  let path: String
  let label: String
  let icon: String
  let placement: Placement
  let showAsRow: Bool?

  var shouldShowAsRow: Bool {
    showAsRow ?? true
  }

  var nativeRow: UserProfileCustomRow<String> {
    UserProfileCustomRow(
      route: path,
      title: label,
      icon: .system(name: systemIconName),
      placement: nativePlacement
    )
  }

  private var systemIconName: String {
    switch icon {
    case "user": "person"
    case "profile": "person.crop.circle"
    case "security": "shield"
    case "billing": "creditcard"
    case "key": "key"
    case "lock": "lock"
    case "email": "envelope"
    case "phone": "phone"
    case "add": "plus"
    case "switch": "arrow.left.arrow.right"
    case "users": "person.2"
    case "warning": "exclamationmark.triangle"
    case "info": "info.circle"
    case "globe": "globe"
    case "folder": "folder"
    case "book": "book"
    default: "gearshape"
    }
  }

  private var nativePlacement: UserProfileCustomRowPlacement {
    switch placement.type {
    case "sectionStart": .sectionStart(nativeSection)
    case "before": .before(nativeAnchorRow)
    case "after": .after(nativeAnchorRow)
    default: .sectionEnd(nativeSection)
    }
  }

  private var nativeSection: UserProfileSection {
    placement.section == "account" ? .account : .profile
  }

  private var nativeAnchorRow: UserProfileRow {
    switch placement.row {
    case "security": .security
    case "switchAccount": .switchAccount
    case "addAccount": .addAccount
    case "signOut": .signOut
    default: .manageAccount
    }
  }
}

func decodeUserProfileCustomPages(_ json: String) -> [ClerkUserProfileCustomRowConfig] {
  guard let data = json.data(using: .utf8),
        let rows = try? JSONDecoder().decode([ClerkUserProfileCustomRowConfig].self, from: data)
  else {
    return []
  }
  return rows
}

func parseUserProfileCustomPages(_ json: String, pageCount: Int) -> [ClerkUserProfileCustomRowConfig] {
  Array(decodeUserProfileCustomPages(json).prefix(pageCount))
}

func userProfileCustomPageLabel(
  for path: String,
  rows: [ClerkUserProfileCustomRowConfig]
) -> String {
  rows.first(where: { $0.path == path })?.label ?? ""
}

private let clerkNativeClientEventQueue = DispatchQueue(label: "com.clerk.expo.native-client-events")
private var clerkNativeAuthFlowChangedEmitter: (([String: Any]?) -> Void)?
private var clerkNativeClientChangedEmitter: (([String: Any]?) -> Void)?

struct ClerkNativeErrorDescriptor {
  let code: String
  let message: String
}

private struct ClerkExpoTrustedDeviceError: LocalizedError {
  let code: String
  let message: String

  var errorDescription: String? {
    message
  }
}

private struct ClerkExpoHeaderMiddleware: ClerkRequestMiddleware {
  private static var hostSdkVersion: String? {
    Bundle.main.object(forInfoDictionaryKey: "ClerkExpoVersion") as? String
  }

  func prepare(_ request: inout URLRequest) async throws {
    request.addValue("expo", forHTTPHeaderField: "x-clerk-host-sdk")
    if let hostSdkVersion = Self.hostSdkVersion, !hostSdkVersion.isEmpty {
      request.addValue(hostSdkVersion, forHTTPHeaderField: "x-clerk-host-sdk-version")
    }
  }
}

// MARK: - Native Bridge Implementation

final class ClerkNativeBridge {
  static let shared = ClerkNativeBridge()

  private static let clerkLoadMaxAttempts = 30
  private static let clerkLoadIntervalNs: UInt64 = 100_000_000
  private static var clerkConfigured = false
  private static var configuredPublishableKey: String?

  /// Parsed light and dark themes from Info.plist "ClerkTheme" dictionary.
  var lightTheme: ClerkTheme?
  var darkTheme: ClerkTheme?

  private var clientObservationGeneration = 0
  private var lastObservedClientState: ClientStateSnapshot?
  private var authFlowObservationGeneration = 0
  private var lastObservedAuthFlowState: AuthFlowStateSnapshot?
  private var configurationDepth = 0
  private var jsOriginatedClientSyncDepth = 0
  private var pendingURL: URL?
  private var shouldFlushPendingURL = false

  private init() {}

  private struct ClientStateSnapshot: Equatable {
    let client: Client?
    let deviceToken: String?
  }

  private struct AuthFlowStateSnapshot: Equatable {
    let isLoaded: Bool
    let isAuthFlowComplete: Bool
  }

  private struct ClientStateChanges {
    let client: Bool
    let deviceToken: Bool

    static let all = ClientStateChanges(client: true, deviceToken: true)
  }

  /// Resolves the keychain service name, checking ClerkKeychainService in Info.plist first
  /// (for extension apps sharing a keychain group), then falling back to the bundle identifier.
  private static var keychainService: String? {
    if let custom = Bundle.main.object(forInfoDictionaryKey: "ClerkKeychainService") as? String, !custom.isEmpty {
      return custom
    }
    return Bundle.main.bundleIdentifier
  }

  @MainActor
  func configure(publishableKey: String, bearerToken: String? = nil) async throws {
    configurationDepth += 1
    defer {
      lastObservedClientState = Self.clerkConfigured ? Self.clientStateSnapshot() : nil
      let authFlowState = Self.authFlowStateSnapshot()
      lastObservedAuthFlowState = authFlowState
      configurationDepth = max(0, configurationDepth - 1)
      Self.emitAuthFlowChanged(Self.authFlowStatePayload(authFlowState))

      // Overlapping calls can finish out of order, so replay once the last one settles and any
      // of them succeeded. A batch where every call threw keeps the URL for the next attempt.
      if configurationDepth == 0, shouldFlushPendingURL {
        shouldFlushPendingURL = false
        flushPendingURL()
      }
    }

    loadThemes()

    if Self.shouldReconfigure(for: publishableKey) {
      try await Clerk.reconfigure(publishableKey: publishableKey, options: Self.makeClerkOptions())
      Self.clerkConfigured = true
      Self.configuredPublishableKey = publishableKey
      startClientObserver(reset: true)
      startAuthFlowObserver(reset: true)

      let shouldWaitForClient = try await Self.syncTokenState(bearerToken: bearerToken)
      await Self.waitForLoadedClientIfNeeded(shouldWaitForClient)
      Self.postConfiguredNotification()
      shouldFlushPendingURL = true
      return
    }

    if Self.clerkConfigured {
      startClientObserver()
      startAuthFlowObserver()
      let didUpdateDeviceToken = try await Self.syncTokenState(bearerToken: bearerToken)
      if didUpdateDeviceToken {
        await Self.waitForLoadedClient()
      } else if let token = bearerToken?.trimmingCharacters(in: .whitespacesAndNewlines), !token.isEmpty {
        // A remounted JS runtime can have the same token while native client
        // state is stale, so preserve one refresh in that case.
        _ = try await Clerk.shared.refreshClient()
        await Self.waitForLoadedClient()
      }
      shouldFlushPendingURL = true
      return
    }

    Self.clerkConfigured = true
    Self.configuredPublishableKey = publishableKey
    Clerk.configure(publishableKey: publishableKey, options: Self.makeClerkOptions())
    startClientObserver()
    startAuthFlowObserver()

    let shouldWaitForClient = try await Self.syncTokenState(bearerToken: bearerToken)
    await Self.waitForLoadedClientIfNeeded(shouldWaitForClient)
    Self.postConfiguredNotification()
    shouldFlushPendingURL = true
  }

  @MainActor
  private func flushPendingURL() {
    guard let url = pendingURL else { return }
    pendingURL = nil
    handle(url: url)
  }

  /// `AuthView` only reaches `Clerk.handle(_:)` from `.onOpenURL`, which never fires for a UIKit-hosted controller.
  @MainActor
  func handle(url: URL) {
    // A cold launch delivers the callback before, or partway through, JS calling `configure`.
    guard Self.clerkConfigured, configurationDepth == 0 else {
      pendingURL = url
      return
    }

    Task { @MainActor in
      do {
        try await Clerk.shared.handle(url)
      } catch {
        NSLog("[Clerk] Failed to handle callback URL: \(error.localizedDescription)")
      }
    }
  }

  @MainActor
  private func startClientObserver(reset: Bool = false) {
    guard reset || clientObservationGeneration == 0 else {
      return
    }

    clientObservationGeneration += 1
    let generation = clientObservationGeneration
    lastObservedClientState = Self.clientStateSnapshot()
    observeClient(generation: generation)
  }

  @MainActor
  private func observeClient(generation: Int) {
    withObservationTracking {
      _ = Self.clientStateSnapshot()
    } onChange: { [weak self] in
      Task { @MainActor [weak self] in
        await Task.yield()

        guard let self, generation == self.clientObservationGeneration else { return }

        let newClientState = Self.clientStateSnapshot()
        if let previousClientState = self.lastObservedClientState, newClientState != previousClientState {
          self.lastObservedClientState = newClientState
          if self.configurationDepth == 0, self.jsOriginatedClientSyncDepth == 0 {
            let payload = Self.clientChangedPayload(
              changes: .init(
                client: newClientState.client != previousClientState.client,
                deviceToken: newClientState.deviceToken != previousClientState.deviceToken
              )
            )
            Self.emitClientChanged(payload)
          }
        }

        self.observeClient(generation: generation)
      }
    }
  }

  @MainActor
  private func startAuthFlowObserver(reset: Bool = false) {
    guard reset || authFlowObservationGeneration == 0 else {
      return
    }

    authFlowObservationGeneration += 1
    let generation = authFlowObservationGeneration
    lastObservedAuthFlowState = Self.authFlowStateSnapshot()
    observeAuthFlow(generation: generation)
  }

  @MainActor
  private func observeAuthFlow(generation: Int) {
    withObservationTracking {
      _ = Self.authFlowStateSnapshot()
    } onChange: { [weak self] in
      Task { @MainActor [weak self] in
        await Task.yield()

        guard let self, generation == self.authFlowObservationGeneration else { return }

        let newState = Self.authFlowStateSnapshot()
        if let previousState = self.lastObservedAuthFlowState, newState != previousState {
          self.lastObservedAuthFlowState = newState
          if self.configurationDepth == 0 {
            Self.emitAuthFlowChanged(Self.authFlowStatePayload(newState))
          }
        }

        self.observeAuthFlow(generation: generation)
      }
    }
  }

  @MainActor
  private static func authFlowStateSnapshot() -> AuthFlowStateSnapshot {
    guard clerkConfigured else {
      return AuthFlowStateSnapshot(isLoaded: false, isAuthFlowComplete: false)
    }

    return AuthFlowStateSnapshot(
      isLoaded: Clerk.shared.isLoaded,
      isAuthFlowComplete: Clerk.shared.isAuthFlowComplete
    )
  }

  private static func authFlowStatePayload(_ state: AuthFlowStateSnapshot) -> [String: Any] {
    [
      "isLoaded": state.isLoaded,
      "isAuthFlowComplete": state.isAuthFlowComplete,
    ]
  }

  @MainActor
  private static func clientStateSnapshot() -> ClientStateSnapshot {
    let client = Clerk.shared.client

    return ClientStateSnapshot(
      client: client,
      deviceToken: Clerk.shared.deviceToken
    )
  }

  @MainActor
  private static func clientChangedPayload(sourceId: String? = nil, changes: ClientStateChanges = .all) -> [String: Any] {
    var payload: [String: Any] = [:]
    payload["changed"] = [
      "client": changes.client,
      "deviceToken": changes.deviceToken,
    ]
    payload["deviceToken"] = Clerk.shared.deviceToken ?? NSNull()
    if let sourceId, !sourceId.isEmpty {
      payload["sourceId"] = sourceId
    }

    return payload
  }

  @MainActor
  private static func syncTokenState(bearerToken: String?) async throws -> Bool {
    await waitForLoadedClient()

    guard let token = bearerToken?.trimmingCharacters(in: .whitespacesAndNewlines), !token.isEmpty
    else {
      return false
    }
    guard Clerk.shared.deviceToken != token || Clerk.shared.client == nil else {
      return false
    }
    _ = try await Clerk.shared.updateDeviceToken(token)
    return true
  }

  private static func shouldReconfigure(for publishableKey: String) -> Bool {
    guard clerkConfigured, let configuredPublishableKey else { return false }
    return configuredPublishableKey != publishableKey
  }

  private static func makeClerkOptions() -> Clerk.Options {
    let middleware = Clerk.Options.MiddlewareConfig(request: [ClerkExpoHeaderMiddleware()])
    guard let service = keychainService else {
      return .init(middleware: middleware)
    }
    return .init(keychainConfig: .init(service: service), middleware: middleware)
  }

  @MainActor
  private static func waitForLoadedClient() async {
    // Wait for Clerk to finish loading client state from cached data + API refresh.
    // The bridge sync contract is device-token based, not session based.
    for _ in 0..<clerkLoadMaxAttempts {
      if Clerk.shared.isLoaded {
        return
      }
      try? await Task.sleep(nanoseconds: clerkLoadIntervalNs)
    }
  }

  @MainActor
  private static func waitForLoadedClientIfNeeded(_ shouldWait: Bool) async {
    guard shouldWait else { return }
    await waitForLoadedClient()
  }

  @MainActor
  func getClientToken() async -> String? {
    guard Self.clerkConfigured else { return nil }
    return Clerk.shared.deviceToken
  }

  @MainActor
  func getAuthFlowState() -> [String: Any] {
    Self.authFlowStatePayload(Self.authFlowStateSnapshot())
  }

  // MARK: - Trusted devices

  @MainActor
  func getTrustedDeviceAvailability(id: String?, identifierHint: String?) async throws -> [String: Any] {
    let availability = try await Clerk.shared.trustedDevices.availability(
      id: id,
      identifierHint: identifierHint
    )

    return [
      "isAvailable": availability.isAvailable,
      "unavailableReason": availability.unavailableReason
        .map(Self.trustedDeviceUnavailableReason) ?? NSNull(),
    ]
  }

  @MainActor
  func listTrustedDevices() async throws -> [[String: Any]] {
    let trustedDevices = try await Clerk.shared.trustedDevices.list()
    return trustedDevices.map(Self.trustedDevicePayload)
  }

  @MainActor
  func enrollTrustedDevice(
    deviceName: String?,
    identifierHint: String?,
    reason: String?,
    policy: String
  ) async throws -> [String: Any] {
    guard let trustedDevicePolicy = TrustedDevicePolicy(rawValue: policy) else {
      throw ClerkExpoTrustedDeviceError(
        code: "invalid_trusted_device_policy",
        message: "Invalid trusted-device policy: \(policy)."
      )
    }

    let trustedDevice = try await Clerk.shared.trustedDevices.enroll(
      deviceName: deviceName,
      identifierHint: identifierHint,
      reason: reason,
      policy: trustedDevicePolicy
    )
    return Self.trustedDevicePayload(trustedDevice)
  }

  @MainActor
  func revokeTrustedDevice(id: String) async throws -> [String: Any] {
    let trustedDevice = try await Clerk.shared.trustedDevices.revoke(id: id)
    return Self.trustedDevicePayload(trustedDevice)
  }

  @MainActor
  func signInWithTrustedDevice(
    id: String?,
    identifierHint: String?,
    reason: String?
  ) async throws -> [String: Any] {
    let signIn = try await Clerk.shared.auth.signInWithTrustedDevice(
      id: id,
      identifierHint: identifierHint,
      reason: reason
    )

    return [
      "status": signIn.status.rawValue,
      "createdSessionId": Self.bridgeValue(signIn.createdSessionId),
    ]
  }

  private static func trustedDevicePayload(_ trustedDevice: TrustedDevice) -> [String: Any] {
    [
      "id": trustedDevice.id,
      "object": trustedDevice.object,
      "platform": trustedDevice.platform.rawValue,
      "appIdentifier": trustedDevice.appIdentifier,
      "name": bridgeValue(trustedDevice.name),
      "algorithm": trustedDevice.algorithm.rawValue,
      "status": trustedDevice.status.rawValue,
      "createdAt": millisecondsSince1970(trustedDevice.createdAt),
      "updatedAt": millisecondsSince1970(trustedDevice.updatedAt),
      "lastUsedAt": optionalMillisecondsSince1970(trustedDevice.lastUsedAt),
      "revokedAt": optionalMillisecondsSince1970(trustedDevice.revokedAt),
    ]
  }

  private static func trustedDeviceUnavailableReason(
    _ reason: TrustedDeviceAvailability.UnavailableReason
  ) -> String {
    snakeCase(reason.rawValue)
  }

  static func trustedDeviceErrorDescriptor(
    _ error: Error,
    fallbackCode: String
  ) -> ClerkNativeErrorDescriptor {
    if let error = error as? ClerkExpoTrustedDeviceError {
      return ClerkNativeErrorDescriptor(code: error.code, message: error.localizedDescription)
    }

    if let error = error as? ClerkAPIError {
      return ClerkNativeErrorDescriptor(code: error.code, message: error.localizedDescription)
    }

    if let error = error as? TrustedDeviceKeyManagerError {
      return ClerkNativeErrorDescriptor(
        code: trustedDeviceKeyManagerErrorCode(error),
        message: error.localizedDescription
      )
    }

    return ClerkNativeErrorDescriptor(code: fallbackCode, message: error.localizedDescription)
  }

  private static func trustedDeviceKeyManagerErrorCode(
    _ error: TrustedDeviceKeyManagerError
  ) -> String {
    switch error {
    case .unsupportedPlatform:
      "unsupported_platform"
    case .biometricAuthenticationUnavailable:
      "biometric_authentication_unavailable"
    case .biometricAuthenticationCanceled:
      "biometric_authentication_canceled"
    case .biometricAuthenticationFailed:
      "biometric_authentication_failed"
    case .keyGenerationFailed:
      "key_generation_failed"
    case .keyNotFound:
      "key_not_found"
    case .invalidPublicKey:
      "invalid_public_key"
    case .publicKeyExportFailed:
      "public_key_export_failed"
    case .unsupportedAlgorithm:
      "unsupported_algorithm"
    case .signingFailed:
      "signing_failed"
    case .deletionFailed:
      "key_deletion_failed"
    @unknown default:
      "trusted_device_key_manager_error"
    }
  }

  private static func snakeCase(_ value: String) -> String {
    value
      .replacingOccurrences(
        of: "([A-Z]+)([A-Z][a-z])",
        with: "$1_$2",
        options: .regularExpression
      )
      .replacingOccurrences(
        of: "([a-z0-9])([A-Z])",
        with: "$1_$2",
        options: .regularExpression
      )
      .lowercased()
  }

  private static func millisecondsSince1970(_ date: Date) -> Double {
    date.timeIntervalSince1970 * 1_000
  }

  private static func optionalMillisecondsSince1970(_ date: Date?) -> Any {
    guard let date else { return NSNull() }
    return millisecondsSince1970(date)
  }

  private static func bridgeValue<Value>(_ value: Value?) -> Any {
    guard let value else { return NSNull() }
    return value
  }

  // MARK: - Inline View Creation

  func makeAuthViewController(
    mode: String,
    dismissible: Bool,
    logoState: ClerkInlineAuthLogoState,
    logoMaxHeight: CGFloat?,
    hostBackAction: (() -> Void)? = nil,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    guard Self.clerkConfigured else { return nil }

    return makeHostingController(
      rootView: ClerkInlineAuthWrapperView(
        mode: Self.authMode(from: mode),
        dismissible: dismissible,
        hostBackAction: hostBackAction.map(ClerkHostBackAction.init),
        lightTheme: lightTheme,
        darkTheme: darkTheme,
        logoState: logoState,
        logoMaxHeight: logoMaxHeight
      ),
      onDismiss: dismissible ? { onEvent(.dismissed, [:]) } : nil
    )
  }

  @MainActor
  func makeUserProfileViewController(
    dismissible: Bool,
    customRows: [ClerkUserProfileCustomRowConfig],
    customPageState: ClerkUserProfileCustomPageState,
    hostBackAction: (() -> Void)? = nil,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    guard Self.clerkConfigured else { return nil }

    return makeHostingController(
      rootView: ClerkInlineProfileWrapperView(
        dismissible: dismissible,
        hostBackAction: hostBackAction.map(ClerkHostBackAction.init),
        lightTheme: lightTheme,
        darkTheme: darkTheme,
        customRows: customRows,
        customPageState: customPageState
      )
      .environment(Clerk.shared),
      onDismiss: dismissible ? { onEvent(.dismissed, [:]) } : nil
    )
  }

  @MainActor
  func makeUserButtonViewController(
    customRows: [ClerkUserProfileCustomRowConfig],
    customPageState: ClerkUserProfileCustomPageState
  ) -> UIViewController? {
    guard Self.clerkConfigured else { return nil }

    return makeHostingController(
      rootView: ClerkInlineUserButtonWrapperView(
        lightTheme: lightTheme,
        darkTheme: darkTheme,
        customRows: customRows,
        customPageState: customPageState
      )
      .environment(Clerk.shared)
    )
  }

  @MainActor
  func syncClientStateFromJs(
    deviceToken: String?,
    sourceId: String?,
    didChangeClient: Bool,
    didChangeDeviceToken: Bool
  ) async throws {
    guard Self.clerkConfigured else { return }

    let previousClientState = Self.clientStateSnapshot()
    var completedSuccessfully = false
    jsOriginatedClientSyncDepth += 1
    defer {
      let finalClientState = Self.clientStateSnapshot()
      lastObservedClientState = finalClientState
      jsOriginatedClientSyncDepth = max(0, jsOriginatedClientSyncDepth - 1)

      if !completedSuccessfully, finalClientState != previousClientState {
        Self.emitClientChanged(
          Self.clientChangedPayload(
            changes: .init(
              client: finalClientState.client != previousClientState.client,
              deviceToken: finalClientState.deviceToken != previousClientState.deviceToken
            )
          )
        )
      }
    }

    var refreshedClientWhileUpdatingToken = false

    if didChangeDeviceToken,
      let token = deviceToken?.trimmingCharacters(in: .whitespacesAndNewlines), !token.isEmpty
    {
      if Clerk.shared.deviceToken != token {
        _ = try await Clerk.shared.updateDeviceToken(token)
        await Self.waitForLoadedClient()
        refreshedClientWhileUpdatingToken = true
      }
    }

    if !refreshedClientWhileUpdatingToken, didChangeClient || didChangeDeviceToken {
      _ = try await Clerk.shared.refreshClient()
      await Self.waitForLoadedClient()
    }

    let newClientState = Self.clientStateSnapshot()
    lastObservedClientState = newClientState
    Self.emitClientChanged(
      Self.clientChangedPayload(
        sourceId: sourceId,
        changes: .init(
          client: newClientState.client != previousClientState.client,
          deviceToken: newClientState.deviceToken != previousClientState.deviceToken
        )
      )
    )
    completedSuccessfully = true
  }

  private static func postConfiguredNotification() {
    NotificationCenter.default.post(name: .clerkNativeSDKDidConfigure, object: nil)
  }

  static func setClientChangedEmitter(_ emitter: (([String: Any]?) -> Void)?) {
    clerkNativeClientEventQueue.sync {
      clerkNativeClientChangedEmitter = emitter
    }
  }

  static func setAuthFlowChangedEmitter(_ emitter: (([String: Any]?) -> Void)?) {
    clerkNativeClientEventQueue.sync {
      clerkNativeAuthFlowChangedEmitter = emitter
    }
  }

  static func emitAuthFlowChanged(_ body: [String: Any]? = nil) {
    let emitter = clerkNativeClientEventQueue.sync {
      clerkNativeAuthFlowChangedEmitter
    }
    emitter?(body)
  }

  /// Requests that ClerkProvider reload the JS client from native client state.
  static func emitClientChanged(_ body: [String: Any]? = nil) {
    let emitter = clerkNativeClientEventQueue.sync {
      clerkNativeClientChangedEmitter
    }
    emitter?(body)
  }

  private static func authMode(from mode: String) -> AuthView.Mode {
    switch mode {
    case "signIn":
      .signIn
    case "signUp":
      .signUp
    default:
      .signInOrUp
    }
  }

  // MARK: - Theme Parsing

  /// Reads the "ClerkTheme" dictionary from Info.plist and builds light / dark themes.
  @MainActor func loadThemes() {
    guard let themeDictionary = Bundle.main.object(forInfoDictionaryKey: "ClerkTheme") as? [String: Any] else {
      return
    }

    // Build light theme from top-level "colors" and "design"
    let lightColors = (themeDictionary["colors"] as? [String: String]).flatMap { parseColors(from: $0) }
    let design = (themeDictionary["design"] as? [String: Any]).flatMap { parseDesign(from: $0) }
    let fonts = (themeDictionary["design"] as? [String: Any]).flatMap { parseFonts(from: $0) }

    if lightColors != nil || design != nil || fonts != nil {
      lightTheme = ClerkTheme(colors: lightColors ?? .default, fonts: fonts ?? .default, design: design ?? .default)
    }

    // Build dark theme from "darkColors" (inherits same design/fonts)
    if let darkColorsDict = themeDictionary["darkColors"] as? [String: String] {
      let darkColors = parseColors(from: darkColorsDict)
      if darkColors != nil || design != nil || fonts != nil {
        darkTheme = ClerkTheme(colors: darkColors ?? .default, fonts: fonts ?? .default, design: design ?? .default)
      }
    }
  }

  private func parseColors(from dict: [String: String]) -> ClerkTheme.Colors? {
    let hasAny = dict.values.contains { colorFromHex($0) != nil }
    guard hasAny else { return nil }

    return ClerkTheme.Colors(
      primary: dict["primary"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultPrimaryColor,
      background: dict["background"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultBackgroundColor,
      input: dict["input"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultInputColor,
      danger: dict["danger"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultDangerColor,
      success: dict["success"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultSuccessColor,
      warning: dict["warning"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultWarningColor,
      foreground: dict["foreground"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultForegroundColor,
      mutedForeground: dict["mutedForeground"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultMutedForegroundColor,
      primaryForeground: dict["primaryForeground"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultPrimaryForegroundColor,
      inputForeground: dict["inputForeground"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultInputForegroundColor,
      neutral: dict["neutral"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultNeutralColor,
      ring: dict["ring"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultRingColor,
      muted: dict["muted"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultMutedColor,
      secondaryButtonBackground: dict["secondaryButtonBackground"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultSecondaryButtonBackgroundColor,
      secondaryButtonForeground: dict["secondaryButtonForeground"].flatMap { colorFromHex($0) },
      shadow: dict["shadow"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultShadowColor,
      border: dict["border"].flatMap { colorFromHex($0) } ?? ClerkTheme.Colors.defaultBorderColor
    )
  }

  private func colorFromHex(_ hex: String) -> Color? {
    var cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    if cleaned.hasPrefix("#") { cleaned.removeFirst() }

    var rgb: UInt64 = 0
    guard Scanner(string: cleaned).scanHexInt64(&rgb) else { return nil }

    switch cleaned.count {
    case 6:
      return Color(
        red: Double((rgb >> 16) & 0xFF) / 255.0,
        green: Double((rgb >> 8) & 0xFF) / 255.0,
        blue: Double(rgb & 0xFF) / 255.0
      )
    case 8:
      return Color(
        red: Double((rgb >> 24) & 0xFF) / 255.0,
        green: Double((rgb >> 16) & 0xFF) / 255.0,
        blue: Double((rgb >> 8) & 0xFF) / 255.0,
        opacity: Double(rgb & 0xFF) / 255.0
      )
    default:
      return nil
    }
  }

  private func parseFonts(from dict: [String: Any]) -> ClerkTheme.Fonts? {
    guard let fontFamily = dict["fontFamily"] as? String, !fontFamily.isEmpty else { return nil }
    return ClerkTheme.Fonts(fontFamily: fontFamily)
  }

  private func parseDesign(from dict: [String: Any]) -> ClerkTheme.Design? {
    guard let radius = dict["borderRadius"] as? Double else { return nil }
    return ClerkTheme.Design(borderRadius: CGFloat(radius))
  }

  private func makeHostingController<Content: View>(
    rootView: Content,
    onDismiss: (() -> Void)? = nil
  ) -> UIViewController {
    let hostingController = ClerkNativeHostingController(rootView: rootView, onDismiss: onDismiss)
    hostingController.view.backgroundColor = .clear
    return hostingController
  }

}

// MARK: - Inline User Button Wrapper (for embedded rendering)

struct ClerkInlineUserButtonWrapperView: View {
  @Environment(Clerk.self) private var clerk
  @Environment(\.colorScheme) private var colorScheme

  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?
  let customRows: [ClerkUserProfileCustomRowConfig]
  let customPageState: ClerkUserProfileCustomPageState

  private var userID: String? {
    clerk.user?.id
  }

  var body: some View {
    let view = UserButton()
      .userProfileRows(customRows.filter(\.shouldShowAsRow).map(\.nativeRow))
      .userProfileDestination { routeKey in
        ClerkReactUserProfileCustomPage(
          path: routeKey,
          rows: customRows,
          state: customPageState
        )
      }
    let theme = colorScheme == .dark ? (darkTheme ?? lightTheme) : lightTheme
    let themedView = Group {
      if let theme {
        view.environment(\.clerkTheme, theme)
      } else {
        view
      }
    }
    themedView
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
      .onAppear {
        customPageState.userDidChange(to: userID)
      }
      .onChange(of: userID) { _, newUserID in
        customPageState.userDidChange(to: newUserID)
      }
  }
}

// MARK: - Inline Auth View Wrapper (for embedded rendering)

struct ClerkInlineAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissible: Bool
  let hostBackAction: ClerkHostBackAction?
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?
  let logoState: ClerkInlineAuthLogoState
  let logoMaxHeight: CGFloat?

  @Environment(\.colorScheme) private var colorScheme

  @ViewBuilder private var themedAuthView: some View {
    let view = AuthView(mode: mode, isDismissible: dismissible)
      .environment(Clerk.shared)
      .environment(\.clerkHostBackAction, hostBackAction)
    let theme = colorScheme == .dark ? (darkTheme ?? lightTheme) : lightTheme
    let themedView = Group {
      if let theme {
        view.environment(\.clerkTheme, theme)
      } else {
        view
      }
    }

    if let logo = logoState.content {
      themedView.clerkAppIconView {
        ClerkReactLogoView(view: logo.view)
          .frame(width: logo.size.width, height: logo.size.height)
      }
    } else if let logoMaxHeight {
      themedView.clerkAppIcon(maxHeight: logoMaxHeight)
    } else {
      themedView
    }
  }

  var body: some View {
    themedAuthView
  }
}

private struct ClerkReactLogoView: UIViewRepresentable {
  let view: UIView

  func makeUIView(context: Context) -> ClerkReactContentContainerView {
    return ClerkReactContentContainerView(contentView: view)
  }

  func updateUIView(_ uiView: ClerkReactContentContainerView, context: Context) {
    uiView.setContentView(view)
  }
}

private final class ClerkReactContentContainerView: UIView {
  private var contentView: UIView?

  init(contentView: UIView) {
    super.init(frame: .zero)
    setContentView(contentView)
  }

  required init?(coder: NSCoder) {
    return nil
  }

  func setContentView(_ view: UIView) {
    guard contentView !== view else { return }
    contentView?.removeFromSuperview()
    view.removeFromSuperview()
    contentView = view
    addSubview(view)
    setNeedsLayout()
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    contentView?.frame = bounds
  }
}

private final class ClerkNativeHostingController<Content: View>: UIHostingController<Content> {
  private let onDismiss: (() -> Void)?
  private var didSendDismiss = false

  init(rootView: Content, onDismiss: (() -> Void)? = nil) {
    self.onDismiss = onDismiss
    super.init(rootView: rootView)
  }

  @MainActor @preconcurrency required dynamic init?(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func dismiss(animated flag: Bool, completion: (() -> Void)? = nil) {
    sendDismissIfNeeded()
    super.dismiss(animated: flag, completion: completion)
  }

  private func sendDismissIfNeeded() {
    guard !didSendDismiss else { return }
    didSendDismiss = true
    onDismiss?()
  }
}

// MARK: - Inline Profile View Wrapper (for embedded rendering)

struct ClerkInlineProfileWrapperView: View {
  @Environment(Clerk.self) private var clerk
  @Environment(\.colorScheme) private var colorScheme

  let dismissible: Bool
  let hostBackAction: ClerkHostBackAction?
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?
  let customRows: [ClerkUserProfileCustomRowConfig]
  let customPageState: ClerkUserProfileCustomPageState

  @State private var navigationPath = NavigationPath()
  @State private var didRestoreNavigation = false

  private var userID: String? {
    clerk.user?.id
  }

  var body: some View {
    let view = NavigationStack(path: $navigationPath) {
      UserProfileView(
        isDismissible: dismissible,
        navigationPath: $navigationPath
      )
      .userProfileRows(customRows.filter(\.shouldShowAsRow).map(\.nativeRow))
      .navigationDestination(for: String.self) { routeKey in
        ClerkReactEmbeddedUserProfileCustomPage(
          path: routeKey,
          rows: customRows,
          state: customPageState,
          navigationPath: $navigationPath
        )
      }
    }
    .environment(\.clerkHostBackAction, hostBackAction)
    let theme = colorScheme == .dark ? (darkTheme ?? lightTheme) : lightTheme
    let themedView = Group {
      if let theme {
        view.environment(\.clerkTheme, theme)
      } else {
        view
      }
    }
    themedView
      .onAppear {
        customPageState.configureNavigation($navigationPath)
        customPageState.userDidChange(to: userID)
      }
      .onChange(of: navigationPath.count) { _, _ in
        customPageState.navigationPathDidChange(navigationPath)
      }
      .onChange(of: userID) { _, newUserID in
        customPageState.userDidChange(to: newUserID)
      }
      .task(restoreNavigationIfNeeded)
  }

  @MainActor
  private func restoreNavigationIfNeeded() async {
    guard !didRestoreNavigation else { return }
    await Task.yield()
    guard !Task.isCancelled else { return }
    navigationPath = customPageState.navigationPathForRestoration()
    didRestoreNavigation = true
  }
}

private struct ClerkReactUserProfileCustomPage: View {
  @Environment(UserProfileNavigator<String>.self) private var navigator
  @Environment(\.dismiss) private var dismiss

  let path: String
  let rows: [ClerkUserProfileCustomRowConfig]
  let state: ClerkUserProfileCustomPageState

  var body: some View {
    ClerkReactUserProfileCustomPageContent(path: path, rows: rows, state: state)
      .onAppear {
        state.configureNavigation(navigator) {
          dismiss()
        }
        state.pageDidPresent(path: path)
      }
      .onDisappear {
        state.pageDidDismiss(path: path)
      }
  }
}

private struct ClerkReactEmbeddedUserProfileCustomPage: View {
  let path: String
  let rows: [ClerkUserProfileCustomRowConfig]
  let state: ClerkUserProfileCustomPageState
  @Binding var navigationPath: NavigationPath

  var body: some View {
    ClerkReactUserProfileCustomPageContent(path: path, rows: rows, state: state)
      .onAppear {
        state.configureNavigation($navigationPath)
        state.pageDidPresent(path: path, navigationDepth: navigationPath.count)
      }
  }
}

private struct ClerkReactUserProfileCustomPageContent: View {
  let path: String
  let rows: [ClerkUserProfileCustomRowConfig]
  let state: ClerkUserProfileCustomPageState

  var body: some View {
    Group {
      if let index = rows.firstIndex(where: { $0.path == path }),
         state.views.indices.contains(index)
      {
        ClerkReactCustomPageView(view: state.views[index])
      }
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .navigationTitle(userProfileCustomPageLabel(for: path, rows: rows))
    .navigationBarTitleDisplayMode(.inline)
  }
}

private struct ClerkReactCustomPageView: UIViewRepresentable {
  let view: UIView

  func makeUIView(context: Context) -> ClerkReactContentContainerView {
    ClerkReactContentContainerView(contentView: view)
  }

  func updateUIView(_ uiView: ClerkReactContentContainerView, context: Context) {
    uiView.setContentView(view)
  }
}
