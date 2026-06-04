package expo.modules.clerk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ClerkAuthViewManagerInterface

class ClerkAuthViewManager : SimpleViewManager<ClerkAuthNativeView>(),
    ClerkAuthViewManagerInterface<ClerkAuthNativeView> {

  override fun getName(): String = "ClerkAuthView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkAuthNativeView {
    return ClerkAuthNativeView(reactContext)
  }

  @ReactProp(name = "mode")
  override fun setMode(view: ClerkAuthNativeView, mode: String?) {
    // clerk-android AuthView does not currently expose a public mode parameter.
    // Keep this generated prop setter as an intentional no-op for cross-platform API parity.
  }

  @ReactProp(name = "isDismissible")
  override fun setIsDismissible(view: ClerkAuthNativeView, isDismissible: Boolean) {
    view.isDismissible = isDismissible
    view.setupView()
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onAuthEvent", MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onAuthEvent")
      ))
      .build() as MutableMap<String, Any>
  }
}
