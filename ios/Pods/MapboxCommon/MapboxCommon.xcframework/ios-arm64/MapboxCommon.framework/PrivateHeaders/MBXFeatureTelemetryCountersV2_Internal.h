// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>

NS_SWIFT_NAME(FeatureTelemetryCountersV2)
__attribute__((visibility ("default")))
@interface MBXFeatureTelemetryCountersV2 : NSObject

// This class provides custom init which should be called
- (nonnull instancetype)init NS_UNAVAILABLE;

// This class provides custom init which should be called
+ (nonnull instancetype)new NS_UNAVAILABLE;

/**
 * Increments counter.
 *
 * @param name Name of counter. Should match ^[A-Za-z][A-Za-z0-9_/()]* pattern.
 */
+ (void)incrementForName:(nonnull NSString *)name;

@end
