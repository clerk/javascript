package expo.modules.clerk

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.ClerkOrganizationSwitcherViewManagerInterface

class ClerkOrganizationSwitcherViewManager : SimpleViewManager<ClerkOrganizationSwitcherNativeView>(),
    ClerkOrganizationSwitcherViewManagerInterface<ClerkOrganizationSwitcherNativeView> {

  override fun getName(): String = "ClerkOrganizationSwitcherView"

  override fun createViewInstance(reactContext: ThemedReactContext): ClerkOrganizationSwitcherNativeView {
    return ClerkOrganizationSwitcherNativeView(reactContext)
  }

  @ReactProp(name = "hidePersonal")
  override fun setHidePersonal(view: ClerkOrganizationSwitcherNativeView, hidePersonal: Boolean) {
    view.hidePersonal = hidePersonal
    view.setupView()
  }

  override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onOrganizationEvent", MapBuilder.of(
        "phasedRegistrationNames",
        MapBuilder.of("bubbled", "onOrganizationEvent")
      ))
      .build() as MutableMap<String, Any>
  }
}
