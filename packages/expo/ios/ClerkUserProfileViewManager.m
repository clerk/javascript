#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(ClerkUserProfileViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(isDismissable, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onProfileEvent, RCTBubblingEventBlock)

@end
