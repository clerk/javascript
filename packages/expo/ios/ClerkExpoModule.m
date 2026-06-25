#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(ClerkExpo, RCTEventEmitter)

RCT_EXTERN_METHOD(configure:(NSString *)publishableKey
                  bearerToken:(NSString *)bearerToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getClientToken:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(syncClientStateFromJs:(id)deviceToken
                  sourceId:(id)sourceId
                  didChangeClient:(BOOL)didChangeClient
                  didChangeDeviceToken:(BOOL)didChangeDeviceToken
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
