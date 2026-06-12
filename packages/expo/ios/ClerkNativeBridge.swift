// ClerkNativeBridge - Provides app-target Clerk SDK operations and SwiftUI view controllers to ClerkExpo.
// This file is injected into the app target by the config plugin.
// It uses the ClerkKit Swift package, which is only accessible from the app target.

import UIKit
import SwiftUI
import Observation
@_spi(FrameworkIntegration) import ClerkKit
import ClerkKitUI
import ClerkExpo  // Import the pod to access ClerkNativeBridgeProtocol

// MARK: - Native Bridge Implementation

public final class ClerkNativeBridge: ClerkNativeBridgeProtocol {
  public static let shared = ClerkNativeBridge()

  private static let clerkLoadMaxAttempts = 30
  private static let clerkLoadIntervalNs: UInt64 = 100_000_000
  private static var clerkConfigured = false
  private static var configuredPublishableKey: String?

  /// Parsed light and dark themes from Info.plist "ClerkTheme" dictionary.
  var lightTheme: ClerkTheme?
  var darkTheme: ClerkTheme?

  private var clientObservationGeneration = 0
  private var lastObservedClient: Client?

  private init() {}

  /// Resolves the keychain service name, checking ClerkKeychainService in Info.plist first
  /// (for extension apps sharing a keychain group), then falling back to the bundle identifier.
  private static var keychainService: String? {
    if let custom = Bundle.main.object(forInfoDictionaryKey: "ClerkKeychainService") as? String, !custom.isEmpty {
      return custom
    }
    return Bundle.main.bundleIdentifier
  }

  // Register this app-target bridge with the ClerkExpo module.
  @MainActor public static func register() {
    shared.loadThemes()
    clerkNativeBridge = shared
  }

  @MainActor
  public func configure(publishableKey: String, bearerToken: String? = nil) async throws {
    if Self.shouldReconfigure(for: publishableKey) {
      try await Clerk.reconfigure(publishableKey: publishableKey, options: Self.makeClerkOptions())
      Self.clerkConfigured = true
      Self.configuredPublishableKey = publishableKey
      startClientObserver(reset: true)

      try await Self.syncTokenState(bearerToken: bearerToken)
      await Self.waitForLoadedSession()
      return
    }

    if Self.clerkConfigured {
      startClientObserver()
      try await Self.syncTokenState(bearerToken: bearerToken)
      await Self.waitForLoadedSession()
      return
    }

    Self.clerkConfigured = true
    Self.configuredPublishableKey = publishableKey
    Clerk.configure(publishableKey: publishableKey, options: Self.makeClerkOptions())
    startClientObserver()

    try await Self.syncTokenState(bearerToken: bearerToken)
    await Self.waitForLoadedSession()
  }

  @MainActor
  private func startClientObserver(reset: Bool = false) {
    guard reset || clientObservationGeneration == 0 else { return }

    clientObservationGeneration += 1
    let generation = clientObservationGeneration
    lastObservedClient = Clerk.shared.client
    observeClient(generation: generation)
  }

  @MainActor
  private func observeClient(generation: Int) {
    withObservationTracking {
      _ = Clerk.shared.client
    } onChange: { [weak self] in
      Task { @MainActor [weak self] in
        await Task.yield()

        guard let self, generation == self.clientObservationGeneration else { return }

        let newClient = Clerk.shared.client
        if newClient != self.lastObservedClient {
          self.lastObservedClient = newClient
          emitClerkNativeRefreshClient()
        }

        self.observeClient(generation: generation)
      }
    }
  }

  private static func syncTokenState(bearerToken: String?) async throws {
    guard let token = bearerToken, !token.isEmpty else { return }
    _ = try await Clerk.shared.updateDeviceToken(token)
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

  @MainActor
  public func getClientToken() async -> String? {
    guard Self.clerkConfigured else { return nil }
    return Clerk.shared.deviceToken
  }

  // MARK: - Inline View Creation

  public func makeAuthViewController(
    mode: String,
    dismissible: Bool,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    makeHostingController(
      rootView: ClerkInlineAuthWrapperView(
        mode: Self.authMode(from: mode),
        dismissible: dismissible,
        lightTheme: lightTheme,
        darkTheme: darkTheme
      ),
      onDismiss: dismissible ? { onEvent(.dismissed, [:]) } : nil
    )
  }

  public func makeUserProfileViewController(
    dismissible: Bool,
    onEvent: @escaping (ClerkNativeViewEvent, [String: Any]) -> Void
  ) -> UIViewController? {
    makeHostingController(
      rootView: ClerkInlineProfileWrapperView(
        dismissible: dismissible,
        lightTheme: lightTheme,
        darkTheme: darkTheme
      ),
      onDismiss: dismissible ? { onEvent(.dismissed, [:]) } : nil
    )
  }

  public func makeUserButtonViewController() -> UIViewController? {
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

  private func makeHostingController<Content: View>(
    rootView: Content,
    onDismiss: (() -> Void)? = nil
  ) -> UIViewController {
    let hostingController = ClerkNativeHostingController(rootView: rootView, onDismiss: onDismiss)
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
  }
}

// MARK: - Inline Auth View Wrapper (for embedded rendering)

struct ClerkInlineAuthWrapperView: View {
  let mode: AuthView.Mode
  let dismissible: Bool
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?

  @Environment(\.colorScheme) private var colorScheme

  private var themedAuthView: some View {
    let view = AuthView(mode: mode, isDismissible: dismissible)
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
  let dismissible: Bool
  let lightTheme: ClerkTheme?
  let darkTheme: ClerkTheme?

  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    let view = UserProfileView(isDismissible: dismissible)
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
  }
}
