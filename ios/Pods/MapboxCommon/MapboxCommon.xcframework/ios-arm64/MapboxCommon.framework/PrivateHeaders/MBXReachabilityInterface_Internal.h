// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>
#import <MapboxCommon/MBXNetworkStatus_Internal.h>
#import <MapboxCommon/MBXReachabilityChanged_Internal.h>

NS_SWIFT_NAME(ReachabilityInterface)
@protocol MBXReachabilityInterface
- (uint64_t)addListenerForListener:(nonnull MBXReachabilityChanged)listener;
- (BOOL)removeListenerForId:(uint64_t)id;
- (BOOL)isReachable;
- (MBXNetworkStatus)currentNetworkStatus;
- (void)start __attribute__((deprecated("no-op (the monitoring is now controlled based on active listeners)")));
- (void)stop __attribute__((deprecated("no-op (the monitoring is now controlled based on active listeners)")));
@end
