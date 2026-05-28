package expo.modules.clerk

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class ClerkUserButtonViewManager : SimpleViewManager<ClerkUserButtonNativeView>() {

  override fun getName(): String = "ClerkUserButtonView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkUserButtonNativeView {
    return ClerkUserButtonNativeView(reactContext)
  }
}
