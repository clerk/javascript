package expo.modules.clerk

import android.util.Log

// Release builds are silent by default; `adb shell setprop log.tag.ClerkExpo DEBUG`
// enables module debug logs and clerk-android SDK debug logging without a rebuild.
internal const val CLERK_EXPO_DEBUG_TAG = "ClerkExpo"

internal fun clerkExpoDebugEnabled(): Boolean =
    BuildConfig.DEBUG || Log.isLoggable(CLERK_EXPO_DEBUG_TAG, Log.DEBUG)
