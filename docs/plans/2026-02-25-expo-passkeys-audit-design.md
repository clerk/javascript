# expo-passkeys Audit & Fix Design

**Date:** 2026-02-25
**Package:** `packages/expo-passkeys`
**Approach:** Risk-tiered — correctness → dependencies → modernization

## Background

The `@clerk/expo-passkeys` package is rarely touched and was found to have several issues ranging from deprecated native APIs to stale release-candidate dependencies. This document captures the full audit findings and the three-phase fix plan.

## Audit Findings

### Phase 1 — Correctness / Runtime Bugs

| #   | Layer   | File                                                                  | Issue                                                                                                                           | Risk                                      |
| --- | ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | iOS     | `ios/AccountManager.swift`                                            | `UIApplication.shared.keyWindow` is deprecated since iOS 15; returns `nil` in scene-based apps (all modern Expo apps)           | Passkey sheet may silently fail to appear |
| 2   | iOS     | `ios/ClerkExpoPasskeys.podspec` + `ios/ClerkExpoPasskeysModule.swift` | podspec declares min iOS `13.4` but module is decorated `@available(iOS 15.0, *)` — peer dep already requires Expo 53 (iOS 16+) | Misleading contract; App Store warnings   |
| 3   | Android | `android/build.gradle`                                                | `androidx.credentials` pinned to `1.3.0-rc01` in production                                                                     | Release candidate in production           |
| 4   | Config  | `expo-module.config.json`                                             | `tvos` listed as a supported platform — passkeys require biometric hardware absent on Apple TV                                  | False capability advertised               |
| 5   | JS      | `package.json`                                                        | `devDependencies.expo ~52.0.47` but `peerDependencies.expo >=53 <55`                                                            | Package tested against wrong Expo version |

### Phase 2 — Dependency Updates

| #   | Layer   | File                   | Change                                                                                          |
| --- | ------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| 6   | Android | `android/build.gradle` | `compileSdkVersion` 34 → 35 (already targets 35)                                                |
| 7   | Android | `android/build.gradle` | `kotlinx-coroutines-android` 1.7.3 → 1.9.0                                                      |
| 8   | Android | `android/build.gradle` | `androidx.credentials` 1.3.0-rc01 → 1.5.0 (covered in Phase 1 #3, listed here for completeness) |

### Phase 3 — Expo Module Pattern Modernization

| #   | Layer    | File                         | Change                                                                                              |
| --- | -------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| 9   | Android  | `ClerkExpoPasskeysModule.kt` | Replace manual `CoroutineScope(Dispatchers.Default)` with Expo's built-in `moduleCoroutineScope`    |
| 10  | iOS      | `ios/AccountManager.swift`   | Presentation anchor already addressed in Phase 1 #1                                                 |
| 11  | iOS + JS | `src/index.ts`               | Wire up `autofill()` JS function and fix `isAutoFillSupported()` (currently unconditionally throws) |

## Breaking Changes

None for consumers on supported Expo versions (>=53). The podspec iOS minimum bump from 13.4 → 16.0 is already enforced by the Expo 53 peer dependency.

## Phase 1 Fix Design

### Fix 1 — iOS presentation anchor

Replace `presentationAnchor` in `ios/AccountManager.swift`:

```swift
func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    guard let scene = UIApplication.shared.connectedScenes
        .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
          let window = scene.keyWindow ?? scene.windows.first else {
        fatalError("No active window found")
    }
    return window
}
```

### Fix 2 — podspec and availability annotation

- `ios/ClerkExpoPasskeys.podspec`: `s.platforms = { :ios => '16.0' }` (drop tvOS)
- `ios/ClerkExpoPasskeysModule.swift`: `@available(iOS 16.0, *)` (was 15.0)

### Fix 3 — Android RC dependency

- `android/build.gradle`: bump both `androidx.credentials` artifacts from `1.3.0-rc01` → `1.5.0`

### Fix 4 — tvOS config

- `expo-module.config.json`: remove `"tvos"` from `platforms` array

### Fix 5 — Dev Expo version

- `package.json`: `devDependencies.expo` → `~53.0.0`

## Phase 2 Fix Design

- `android/build.gradle`: `compileSdkVersion` 34 → 35
- `android/build.gradle`: `kotlinx-coroutines-android` 1.7.3 → 1.9.0

## Phase 3 Fix Design

### Modernization 1 — Android coroutine scope

Remove the manually created `CoroutineScope` field and use `moduleCoroutineScope` (provided by Expo's `Module` base class, cancelled automatically with the module lifecycle):

```kotlin
// Remove: private val coroutineScope = CoroutineScope(Dispatchers.Default)

AsyncFunction("create") { request: String, promise: Promise ->
    moduleCoroutineScope.launch { ... }
}
```

### Modernization 2 — JS autofill wiring

- `isAutoFillSupported()`: return `Platform.OS === 'ios' && parseInt(Platform.Version as string, 10) >= 16`
- Add `autofill(publicKeyOptions)` to the `passkeys` object, mirroring `get()` but calling the native `autofill` method
