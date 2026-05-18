#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(ClerkOrganizationSwitcherViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(hidePersonal, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onOrganizationEvent, RCTBubblingEventBlock)

@end
