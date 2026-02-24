package expo.modules.clerk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class ClerkAuthViewManager : SimpleViewManager<ClerkAuthNativeView>() {

  override fun getName(): String = "ClerkAuthView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkAuthNativeView {
    return ClerkAuthNativeView(reactContext)
  }

  @ReactProp(name = "mode")
  fun setMode(view: ClerkAuthNativeView, mode: String?) {
    view.mode = mode ?: "signInOrUp"
    view.setupView()
  }

  @ReactProp(name = "isDismissable")
  fun setIsDismissable(view: ClerkAuthNativeView, isDismissable: Boolean) {
    view.isDismissable = isDismissable
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
