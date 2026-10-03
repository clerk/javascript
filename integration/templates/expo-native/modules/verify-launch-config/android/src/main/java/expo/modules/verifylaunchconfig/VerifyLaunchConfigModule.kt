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
      val extras = appContext.currentActivity?.intent?.extras ?: return@Function emptyMap<String, String>()
      extras.keySet()
        .filter { it.startsWith("verify") }
        .mapNotNull { key -> extras.getString(key)?.let { key to it } }
        .toMap()
    }

    Function("applyStorageScope") { scope: String ->
      val context = appContext.reactContext ?: return@Function
      val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
      if (preferences.getString(STORAGE_SCOPE_KEY, null) == scope) {
        return@Function
      }

      CLERK_STORAGE.forEach { context.deleteSharedPreferences(it) }
      preferences.edit().putString(STORAGE_SCOPE_KEY, scope).commit()
    }
  }
}
