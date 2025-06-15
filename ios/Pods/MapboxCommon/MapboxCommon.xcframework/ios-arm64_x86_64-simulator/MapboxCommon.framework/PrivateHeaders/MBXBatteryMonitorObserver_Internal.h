// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>

NS_SWIFT_NAME(BatteryMonitorObserver)
@protocol MBXBatteryMonitorObserver
/**
 * Called when battery charging status changes.
 * @param isCharging: True if the battery is charging, false otherwise.
 */
- (void)onBatteryChargingStatusChangedForIsCharging:(BOOL)isCharging;
/**
 * Called when an error occurs while attempting to obtain the battery status.
 * @param error An error accompanying the battery status change.
 */
- (void)onBatteryStatusErrorForError:(nonnull NSString *)error;
@end
