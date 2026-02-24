package expo.modules.clerk

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ClerkPackage : ReactPackage {

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(
      ClerkExpoModule(reactContext),
      expo.modules.clerk.googlesignin.ClerkGoogleSignInModule(reactContext),
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      ClerkAuthViewManager(),
      ClerkUserProfileViewManager(),
    )
  }
}
