#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(ClerkAuthViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(mode, NSString)
RCT_EXPORT_VIEW_PROPERTY(isDismissible, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(onAuthEvent, RCTBubblingEventBlock)

@end
