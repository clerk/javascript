# expo-passkeys Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix correctness bugs, update stale dependencies, and modernize Expo module patterns in `packages/expo-passkeys`.

**Architecture:** Three sequential phases — correctness first (deprecated APIs, RC deps, config mismatches), then dependency version bumps, then one Expo module pattern fix. No new features; no public API changes. The `autofill` JS function remains intentionally commented out (known upstream Expo issue with popup not appearing).

**Tech Stack:** Swift (iOS), Kotlin (Android), TypeScript (JS bridge), Expo Modules SDK, androidx.credentials, ExpoModulesCore

---

### Task 1: Fix iOS presentation anchor

The current `presentationAnchor` in `AccountManager.swift` uses `UIApplication.shared.keyWindow!` which is deprecated and returns `nil` in all scene-based Expo apps — causing the passkey sheet to silently fail.

**Files:**

- Modify: `packages/expo-passkeys/ios/AccountManager.swift:178-180`

**Step 1: Replace the function**

Open `packages/expo-passkeys/ios/AccountManager.swift` and replace lines 178–180:

```swift
// Before
func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    return UIApplication.shared.keyWindow!;
}

// After
func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
    guard let scene = UIApplication.shared.connectedScenes
        .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
          let window = scene.keyWindow ?? scene.windows.first else {
        fatalError("No active UIWindowScene found")
    }
    return window
}
```

**Step 2: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0, no TypeScript errors (native changes verified at next native build).

**Step 3: Commit**

```bash
git add packages/expo-passkeys/ios/AccountManager.swift
git commit -m "fix(expo-passkeys): replace deprecated keyWindow with connectedScenes presentation anchor"
```

---

### Task 2: Align podspec minimum iOS and `@available` annotations

The podspec declares `ios => '13.4'` and `tvos => '13.4'` but:

- The module class is decorated `@available(iOS 15.0, *)` — misleading contract
- The peer dependency already requires Expo 53 which enforces iOS 16+
- tvOS has no biometric hardware for passkeys

**Files:**

- Modify: `packages/expo-passkeys/ios/ClerkExpoPasskeys.podspec:13-14`
- Modify: `packages/expo-passkeys/ios/AccountManager.swift:7,13`
- Modify: `packages/expo-passkeys/ios/ClerkExpoPasskeysModule.swift:3`

**Step 1: Update the podspec**

In `packages/expo-passkeys/ios/ClerkExpoPasskeys.podspec`, replace line 13:

```ruby
# Before
s.platforms      = { :ios => '13.4', :tvos => '13.4' }

# After
s.platforms      = { :ios => '16.0' }
```

**Step 2: Update `@available` in AccountManager.swift**

In `packages/expo-passkeys/ios/AccountManager.swift`, replace both occurrences of `@available(iOS 15.0, *)` (lines 7 and 13) with `@available(iOS 16.0, *)`:

```swift
// Before (line 7)
@available(iOS 15.0, *)
struct AuthorizationResponse {

// After
@available(iOS 16.0, *)
struct AuthorizationResponse {
```

```swift
// Before (line 13)
@available(iOS 15.0, *)
class AccountManager: NSObject, ...

// After
@available(iOS 16.0, *)
class AccountManager: NSObject, ...
```

**Step 3: Update `@available` in ClerkExpoPasskeysModule.swift**

In `packages/expo-passkeys/ios/ClerkExpoPasskeysModule.swift`, replace line 3:

```swift
// Before
@available(iOS 15.0, *)

// After
@available(iOS 16.0, *)
```

**Step 4: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0.

**Step 5: Commit**

```bash
git add packages/expo-passkeys/ios/ClerkExpoPasskeys.podspec \
        packages/expo-passkeys/ios/AccountManager.swift \
        packages/expo-passkeys/ios/ClerkExpoPasskeysModule.swift
git commit -m "fix(expo-passkeys): align podspec and @available annotations with Expo 53 iOS 16+ minimum"
```

---

### Task 3: Remove tvOS from Expo module config

`expo-module.config.json` lists `tvos` as a supported platform. Passkeys require biometric hardware that does not exist on Apple TV.

**Files:**

- Modify: `packages/expo-passkeys/expo-module.config.json:2`

**Step 1: Remove tvos from platforms**

In `packages/expo-passkeys/expo-module.config.json`, replace line 2:

```json
// Before
"platforms": ["ios", "tvos", "android", "web"],

// After
"platforms": ["ios", "android", "web"],
```

**Step 2: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add packages/expo-passkeys/expo-module.config.json
git commit -m "fix(expo-passkeys): remove tvOS from supported platforms (no biometric hardware)"
```

---

### Task 4: Replace androidx.credentials RC with stable + bump Android SDK and coroutines

Three build.gradle changes in one task since they're all in the same file:

1. `androidx.credentials` `1.3.0-rc01` → `1.5.0` (release candidate in production)
2. `compileSdkVersion` `34` → `35` (mismatches `targetSdkVersion 35`)
3. `kotlinx-coroutines-android` `1.7.3` → `1.9.0`

**Files:**

- Modify: `packages/expo-passkeys/android/build.gradle:28,49-50,52`

**Step 1: Apply all three changes to build.gradle**

In `packages/expo-passkeys/android/build.gradle`:

```groovy
// Line 28 — Before
compileSdkVersion safeExtGet("compileSdkVersion", 34)

// After
compileSdkVersion safeExtGet("compileSdkVersion", 35)
```

```groovy
// Lines 49–52 — Before
implementation("androidx.credentials:credentials:1.3.0-rc01")
implementation("androidx.credentials:credentials-play-services-auth:1.3.0-rc01")
implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3"

// After
implementation("androidx.credentials:credentials:1.5.0")
implementation("androidx.credentials:credentials-play-services-auth:1.5.0")
implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0"
```

**Step 2: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0 (Gradle changes are verified at Android build time, TypeScript build confirms no JS regressions).

**Step 3: Commit**

```bash
git add packages/expo-passkeys/android/build.gradle
git commit -m "fix(expo-passkeys): upgrade credentials to 1.5.0 stable, compileSdk to 35, coroutines to 1.9.0"
```

---

### Task 5: Fix devDependency Expo version mismatch

`devDependencies.expo` is `~52.0.47` but `peerDependencies` requires `>=53 <55`. The package is currently built and type-checked against the wrong Expo version.

**Files:**

- Modify: `packages/expo-passkeys/package.json:38`

**Step 1: Update devDependency**

In `packages/expo-passkeys/package.json`, replace line 38:

```json
// Before
"expo": "~52.0.47"

// After
"expo": "~53.0.0"
```

**Step 2: Install updated dependency**

```bash
pnpm install
```

Expected: lockfile updated, no resolution errors.

**Step 3: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0.

**Step 4: Commit**

```bash
git add packages/expo-passkeys/package.json pnpm-lock.yaml
git commit -m "fix(expo-passkeys): align devDependency expo version with peerDependency (53.x)"
```

---

### Task 6: Replace manual CoroutineScope with moduleCoroutineScope

The module creates a `CoroutineScope(Dispatchers.Default)` that is never cancelled. Expo Modules SDK provides `moduleCoroutineScope` on the `Module` base class, which is automatically cancelled when the module is destroyed.

**Files:**

- Modify: `packages/expo-passkeys/android/src/main/java/expo/modules/clerkexpopasskeys/ClerkExpoPasskeysModule.kt`

**Step 1: Remove the manual scope and its imports**

In `ClerkExpoPasskeysModule.kt`, replace the entire file with:

```kotlin
package expo.modules.clerkexpopasskeys

import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch

class ClerkExpoPasskeysModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("ClerkExpoPasskeys")

        AsyncFunction("create") { request: String, promise: Promise ->
            this@ClerkExpoPasskeysModule.moduleCoroutineScope.launch {
                try {
                    val response = createPasskey(request, appContext)
                    promise.resolve(response)
                } catch (e: CreateCredentialException) {
                    handleCreationFailure(e, promise)
                }
            }
        }

        AsyncFunction("get") { request: String, promise: Promise ->
            this@ClerkExpoPasskeysModule.moduleCoroutineScope.launch {
                try {
                    val response = getPasskey(request, appContext)
                    promise.resolve(response)
                } catch (e: GetCredentialException) {
                    handleGetFailure(e, promise)
                }
            }
        }
    }
}
```

Key changes:

- Removed `private val mCoroutine = CoroutineScope(Dispatchers.Default)`
- Removed `import kotlinx.coroutines.CoroutineScope` and `import kotlinx.coroutines.Dispatchers`
- Replaced `mCoroutine.launch` with `this@ClerkExpoPasskeysModule.moduleCoroutineScope.launch`

**Step 2: Verify build**

```bash
cd packages/expo-passkeys && pnpm build
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add packages/expo-passkeys/android/src/main/java/expo/modules/clerkexpopasskeys/ClerkExpoPasskeysModule.kt
git commit -m "fix(expo-passkeys): replace leaked CoroutineScope with moduleCoroutineScope"
```

---

## Notes

**autofill**: The iOS native `autofill` async function exists in `ClerkExpoPasskeysModule.swift` but is intentionally not exposed through the JS layer. There is a known issue (see comment in `src/index.ts:174`) where the autofill popup does not appear in Expo. Do not wire this up until the upstream issue is resolved.

**Testing**: This package has no unit test infrastructure — all native changes require a physical device or simulator running the example app. The `pnpm build` command verifies TypeScript compilation only. After completing all tasks, test on a real iOS 16+ device and Android 9+ device by running the example app from `app.json`.

**Changeset**: After all tasks are complete, add a patch changeset:

```bash
pnpm changeset
# Select @clerk/expo-passkeys, patch, describe: "Fix deprecated iOS presentation anchor, remove tvOS support, upgrade Android credentials to stable 1.5.0, align Expo dev dependency, replace leaked coroutine scope"
```
