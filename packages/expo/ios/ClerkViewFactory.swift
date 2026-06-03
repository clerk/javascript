// ClerkViewFactory - Provides Clerk view controllers to the ClerkExpo module
// This file is injected into the app target by the config plugin.
// It uses `import ClerkKit` (SPM) which is only accessible from the app target.

import UIKit
import SwiftUI
import Security
import ClerkKit
import ClerkKitUI
import ClerkExpo  // Import the pod to access ClerkViewFactoryProtocol

// MARK: - View Factory Implementation

public final class ClerkViewFactory: ClerkViewFactoryProtocol {
  public static let shared = ClerkViewFactory()

  private static let clerkLoadMaxAttempts = 30
  private static let clerkLoadIntervalNs: UInt64 = 100_000_000
  private static var clerkConfigured = false
  private static var configuredPublishableKey: String?

  /// Parsed light and dark themes from Info.plist "ClerkTheme" dictionary.
  var lightTheme: ClerkTheme?
  var darkTheme: ClerkTheme?

  private enum KeychainKey {
    static let jsClientJWT = "__clerk_client_jwt"
    static let nativeDeviceToken = "clerkDeviceToken"
    static let cachedClient = "cachedClient"
    static let cachedEnvironment = "cachedEnvironment"
  }

  private init() {}

  /// Resolves the keychain service name, checking ClerkKeychainService in Info.plist first
  /// (for extension apps sharing a keychain group), then falling back to the bundle identifier.
  private static var keychainService: String? {
    if let custom = Bundle.main.object(forInfoDictionaryKey: "ClerkKeychainService") as? String, !custom.isEmpty {
      return custom
    }
    return Bundle.main.bundleIdentifier
  }

  private static var keychain: ExpoKeychain? {
    guard let service = keychainService, !service.isEmpty else { return nil }
    return ExpoKeychain(service: service)
  }

  // Register this factory with the ClerkExpo module
  @MainActor public static func register() {
    shared.loadThemes()
    clerkViewFactory = shared
  }

  @MainActor
  public func configure(publishableKey: String, bearerToken: String? = nil) async throws {
    if Self.shouldReconfigure(for: publishableKey) {
      try await Clerk.reconfigure(publishableKey: publishableKey, options: Self.makeClerkOptions())
      Self.clerkConfigured = true
      Self.configuredPublishableKey = publishableKey

      Self.syncTokenState(bearerToken: bearerToken)
      if !(bearerToken?.isEmpty ?? true) {
        _ = try? await Clerk.shared.refreshClient()
      }

      await Self.waitForLoadedSession()
      return
    }

    Self.syncTokenState(bearerToken: bearerToken)

    // If already configured with a new bearer token, refresh the client
    // to pick up the session associated with the device token we just wrote.
    // Clerk.configure() is idempotent for the same publishable key, so use refreshClient().
    if Self.shouldRefreshConfiguredClient(for: bearerToken) {
      _ = try? await Clerk.shared.refreshClient()
      await Self.waitForLoadedSession()
      return
    }

    if Self.clerkConfigured {
      return
    }

    Self.clerkConfigured = true
    Self.configuredPublishableKey = publishableKey
    Clerk.configure(publishableKey: publishableKey, options: Self.makeClerkOptions())

    await Self.waitForLoadedSession()
  }

  private static func syncTokenState(bearerToken: String?) {
    // Sync JS SDK's client token to native keychain so both SDKs share the same client.
    // This handles the case where the user signed in via JS SDK but the native SDK
    // has no device token (e.g., after app reinstall or first launch).
    if let token = bearerToken, !token.isEmpty {
      let existingToken = readNativeDeviceToken()
      writeNativeDeviceToken(token)

      // If the device token changed (or didn't exist), clear stale cached client/environment.
      // A previous launch may have cached an anonymous client (no device token), and the
      // SDK would send both the new device token AND the stale client ID in API requests,
      // causing a 400 error. Clearing the cache forces a fresh client fetch using only
      // the device token.
      if existingToken != token {
        clearCachedClerkData()
      }
      return
    }

    syncJSTokenToNativeKeychainIfNeeded()
  }

  private static func shouldRefreshConfiguredClient(for bearerToken: String?) -> Bool {
    clerkConfigured && !(bearerToken?.isEmpty ?? true)
  }

  private static func shouldReconfigure(for publishableKey: String) -> Bool {
    guard clerkConfigured, let configuredPublishableKey else { return false }
    return configuredPublishableKey != publishableKey
  }

  private static func makeClerkOptions() -> Clerk.Options {
    guard let service = keychainService else {
      return .init()
    }
    return .init(keychainConfig: .init(service: service))
  }

  @MainActor
  private static func waitForLoadedSession() async {
    // Wait for Clerk to finish loading (cached data + API refresh).
    // The static configure() fires off async refreshes; poll until loaded.
    for _ in 0..<clerkLoadMaxAttempts {
      if Clerk.shared.isLoaded && Clerk.shared.session != nil && Clerk.shared.user != nil {
        return
      }
      try? await Task.sleep(nanoseconds: clerkLoadIntervalNs)
    }
  }

  /// Copies the JS SDK's client JWT from expo-secure-store to the native SDK's
  /// keychain entry, but only if the native SDK doesn't already have a device token.
  /// Both expo-secure-store and the native Clerk SDK use the iOS Keychain with the
  /// bundle identifier as the service name, making cross-SDK token sharing possible.
  private static func syncJSTokenToNativeKeychainIfNeeded() {
    guard let keychain else { return }
    guard keychain.string(forKey: KeychainKey.nativeDeviceToken) == nil else { return }
    guard let jsToken = keychain.string(forKey: KeychainKey.jsClientJWT), !jsToken.isEmpty else { return }

    keychain.set(jsToken, forKey: KeychainKey.nativeDeviceToken)
  }

  /// Reads the native device token from keychain, if present.
  private static func readNativeDeviceToken() -> String? {
    keychain?.string(forKey: KeychainKey.nativeDeviceToken)
  }

  /// Clears stale cached client and environment data from keychain.
  /// This prevents the native SDK from loading a stale anonymous client
  /// during initialization, which would conflict with a newly-synced device token.
  private static func clearCachedClerkData() {
    keychain?.delete(KeychainKey.cachedClient)
    keychain?.delete(KeychainKey.cachedEnvironment)
  }

  /// Writes the provided bearer token as the native SDK's device token.
  /// If the native SDK already has a device token, it is updated with the new value.
  private static func writeNativeDeviceToken(_ token: String) {
    keychain?.set(token, forKey: KeychainKey.nativeDeviceToken)
  }

  public func getClientToken() -> String? {
    Self.readNativeDeviceToken()
  }

  // MARK: - Inline View Creation

  public func createAuthView(
    mode: String,
    dismissible: Bool,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    makeHostingController(
      rootView: ClerkInlineAuthWrapperView(
        mode: Self.authMode(from: mode),
        dismissible: dismissible,
        lightTheme: lightTheme,
        darkTheme: darkTheme,
        onEvent: onEvent
      )
    )
  }

  public func createUserProfileView(
    dismissible: Bool,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    makeHostingController(
      rootView: ClerkInlineProfileWrapperView(
        dismissible: dismissible,
        lightTheme: lightTheme,
        darkTheme: darkTheme,
        onEvent: onEvent
      )
    )
  }

  public func createUserButton() -> UIViewController? {
    makeHostingController(
      rootView: ClerkInlineUserButtonWrapperView(
        lightTheme: lightTheme,
        darkTheme: darkTheme
      )
    )
  }

  @MainActor
  public func getSession() async -> [String: Any]? {
    guard Self.clerkConfigured, let session = Clerk.shared.session else {
      return nil
    }
    return Self.sessionPayload(from: session, user: session.user ?? Clerk.shared.user)
  }

  @MainActor
  public func refreshClient() async throws {
    guard Self.clerkConfigured else { return }
    _ = try await Clerk.shared.refreshClient()
    await Self.waitForLoadedSession()
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

  private func makeHostingController<Content: View>(rootView: Content) -> UIViewController {
    let hostingController = UIHostingController(rootView: rootView)
    hostingController.view.backgroundColor = .clear
    return hostingController
  }

  private static func sessionPayload(from session: Session, user: User?) -> [String: Any] {
    var payload: [String: Any] = [
      "sessionId": session.id,
      "status": String(describing: session.status)
    ]

    if let user {
      payload["user"] = userPayload(from: user)
    }

    return payload
  }

  private static func userPayload(from user: User) -> [String: Any] {
    var payload: [String: Any] = [
      "id": user.id,
      "imageUrl": user.imageUrl
    ]

    if let firstName = user.firstName {
      payload["firstName"] = firstName
    }
    if let lastName = user.lastName {
      payload["lastName"] = lastName
    }
    if let primaryEmail = user.emailAddresses.first(where: { $0.id == user.primaryEmailAddressId }) {
      payload["primaryEmailAddress"] = primaryEmail.emailAddress
    } else if let firstEmail = user.emailAddresses.first {
      payload["primaryEmailAddress"] = firstEmail.emailAddress
    }

    return payload
  }
}

private struct ExpoKeychain {
  private let service: String

  init(service: String) {
    self.service = service
  }

  func string(forKey key: String) -> String? {
    guard let data = data(forKey: key) else { return nil }
    return String(data: data, encoding: .utf8)
  }

  func set(_ value: String, forKey key: String) {
    guard let data = value.data(using: .utf8) else { return }

    var addQuery = baseQuery(for: key)
    addQuery[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    addQuery[kSecValueData as String] = data

    let status = SecItemAdd(addQuery as CFDictionary, nil)
    if status == errSecDuplicateItem {
      let attributes: [String: Any] = [
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
      ]
      SecItemUpdate(baseQuery(for: key) as CFDictionary, attributes as CFDictionary)
    }
  }

  func delete(_ key: String) {
    SecItemDelete(baseQuery(for: key) as CFDictionary)
  }

  private func data(forKey key: String) -> Data? {
    var query = baseQuery(for: key)
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne

    var result: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess else {
      return nil
    }

    return result as? Data
  }

  private func baseQuery(for key: String) -> [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: key,
    ]
  }
}

// MARK: - Inline User Button Wrapper (for embedded rendering)

struct ClerkInlineUserButtonWrapperView: View {
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?

  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    let view = UserButton()
      .environment(Clerk.shared)
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
      .onChange(of: Clerk.shared.client) { _, _ in
        emitClerkNativeRefreshClient()
      }
  }
}

// MARK: - Inline Auth View Wrapper (for embedded rendering)

struct ClerkInlineAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissible: Bool
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?
  let onEvent: (ClerkNativeViewEvent, [String: Any]) -> Void

  // Track initial session to detect new sign-ins (same approach as Android)
  @State private var initialSessionId: String? = Clerk.shared.session?.id
  @State private var refreshEventSent = false

  @Environment(\.colorScheme) private var colorScheme

  private func emitRefreshClient() {
    guard !refreshEventSent else { return }
    refreshEventSent = true
    emitClerkNativeRefreshClient()
  }

  private func handleActiveSession(sessionId: String) {
    guard sessionId != initialSessionId else { return }
    emitRefreshClient()
    if dismissible {
      onEvent(.dismissed, [:])
    }
  }

  private var themedAuthView: some View {
    let view = AuthView(mode: mode, isDismissable: dismissible)
      .environment(Clerk.shared)
    let theme = colorScheme == .dark ? (darkTheme ?? lightTheme) : lightTheme
    return Group {
      if let theme {
        view.environment(\.clerkTheme, theme)
      } else {
        view
      }
    }
  }

  var body: some View {
    themedAuthView
      .onChange(of: Clerk.shared.client) { _, _ in
        guard let sessionId = Clerk.shared.session?.id else { return }
        handleActiveSession(sessionId: sessionId)
      }
  }
}

// MARK: - Inline Profile View Wrapper (for embedded rendering)

struct ClerkInlineProfileWrapperView: View {
  let dismissible: Bool
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?
  let onEvent: (ClerkNativeViewEvent, [String: Any]) -> Void

  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    let view = UserProfileView(isDismissable: dismissible)
      .environment(Clerk.shared)
    let theme = colorScheme == .dark ? (darkTheme ?? lightTheme) : lightTheme
    let themedView = Group {
      if let theme {
        view.environment(\.clerkTheme, theme)
      } else {
        view
      }
    }
    themedView
      .onChange(of: Clerk.shared.client) { _, _ in
        emitClerkNativeRefreshClient()
      }
  }
}
