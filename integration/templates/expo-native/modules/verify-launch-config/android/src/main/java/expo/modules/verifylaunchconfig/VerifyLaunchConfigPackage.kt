package expo.modules.verifylaunchconfig

import android.app.Activity
import android.content.Context
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class VerifyLaunchConfigPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> =
    listOf(object : ReactActivityLifecycleListener {
      override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
        val extras = activity.intent?.extras
        LaunchInputs.captured = extras?.keySet().orEmpty()
          .filter { it.startsWith("verify") }
          .mapNotNull { key -> extras?.getString(key)?.let { key to it } }
          .toMap()
      }
    })
}

internal object LaunchInputs {
  @Volatile var captured: Map<String, String>? = null
}
