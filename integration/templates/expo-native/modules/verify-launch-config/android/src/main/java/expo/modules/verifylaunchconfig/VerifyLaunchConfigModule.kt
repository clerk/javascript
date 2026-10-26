package expo.modules.verifylaunchconfig

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val PREFERENCES = "verify_launch_config"
private const val STORAGE_SCOPE_KEY = "storageScope"
private val CLERK_STORAGE = listOf("clerk_preferences", "SecureStore")

class VerifyLaunchConfigModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("VerifyLaunchConfig")

    Function("readLaunchInputs") {
      // The JS bundle can run before React Native sets currentActivity in onHostResume, so the extras are captured at activity creation.
      checkNotNull(LaunchInputs.captured) { "readLaunchInputs ran before the main activity was created, so the launch extras are unknown" }
    }

    Function("applyStorageScope") { scope: String ->
      val context = checkNotNull(appContext.reactContext) { "applyStorageScope ran without a React context, so the stored Clerk state was not cleared" }
      val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
      if (preferences.getString(STORAGE_SCOPE_KEY, null) == scope) {
        return@Function
      }

      CLERK_STORAGE.forEach { context.deleteSharedPreferences(it) }
      preferences.edit().putString(STORAGE_SCOPE_KEY, scope).commit()
    }
  }
}
