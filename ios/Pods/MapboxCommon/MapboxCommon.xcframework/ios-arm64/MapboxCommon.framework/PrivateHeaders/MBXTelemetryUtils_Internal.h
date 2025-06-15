// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>
#import <MapboxCommon/MBXTelemetryCollectionState_Internal.h>
#import <MapboxCommon/MBXTelemetryUtilsResponseCallback_Internal.h>
@class MBXExpected<__covariant Value, __covariant Error>;

@class MBXEventsServerOptions;
@class MBXEventsServiceError;
@protocol MBXTelemetryCollectionStateObserver;

NS_SWIFT_NAME(TelemetryUtils)
__attribute__((visibility ("default")))
@interface MBXTelemetryUtils : NSObject

- (nonnull instancetype)init;
+ (void)setEventsCollectionStateForEnableCollection:(BOOL)enableCollection
                                           callback:(nullable MBXTelemetryUtilsResponseCallback)callback;
+ (BOOL)getEventsCollectionState;
+ (MBXTelemetryCollectionState)getClientServerEventsCollectionStateForEventsServerOptions:(nonnull MBXEventsServerOptions *)eventsServerOptions;
+ (nonnull NSString *)getUserID __attribute((ns_returns_retained));
- (void)setTokenForToken:(nonnull NSString *)token;
- (MBXTelemetryCollectionState)getClientServerEventsCollectionState;
- (nonnull MBXExpected<NSNull *, MBXEventsServiceError *> *)registerTelemetryCollectionStateObserverForObserver:(nonnull id<MBXTelemetryCollectionStateObserver>)observer __attribute((ns_returns_retained));
- (void)unregisterTelemetryCollectionStateObserverForObserver:(nonnull id<MBXTelemetryCollectionStateObserver>)observer;

@end
