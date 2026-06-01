package expo.modules.clerk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ClerkUserProfileViewManagerInterface

class ClerkUserProfileViewManager : SimpleViewManager<ClerkUserProfileNativeView>(),
    ClerkUserProfileViewManagerInterface<ClerkUserProfileNativeView> {

  override fun getName(): String = "ClerkUserProfileView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkUserProfileNativeView {
    return ClerkUserProfileNativeView(reactContext)
  }

  @ReactProp(name = "isDismissible")
  override fun setIsDismissible(view: ClerkUserProfileNativeView, isDismissible: Boolean) {
    view.isDismissible = isDismissible
    view.setupView()
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onProfileEvent", MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onProfileEvent")
      ))
      .build() as MutableMap<String, Any>
  }
}
