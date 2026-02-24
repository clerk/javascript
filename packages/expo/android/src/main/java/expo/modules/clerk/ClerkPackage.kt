package expo.modules.clerk

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class ClerkPackage : TurboReactPackage() {

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      NativeClerkModuleSpec.NAME -> ClerkExpoModule(reactContext)
      NativeClerkGoogleSignInSpec.NAME -> expo.modules.clerk.googlesignin.ClerkGoogleSignInModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        NativeClerkModuleSpec.NAME to ReactModuleInfo(
          NativeClerkModuleSpec.NAME,
          ClerkExpoModule::class.java.name,
          false, false, true, false, true
        ),
        NativeClerkGoogleSignInSpec.NAME to ReactModuleInfo(
          NativeClerkGoogleSignInSpec.NAME,
          expo.modules.clerk.googlesignin.ClerkGoogleSignInModule::class.java.name,
          false, false, true, false, true
        ),
      )
    }
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      ClerkAuthViewManager(),
      ClerkUserProfileViewManager(),
    )
  }
}
