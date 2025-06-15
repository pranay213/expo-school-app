// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>

@class MBXMovementInfo;

NS_SWIFT_NAME(MovementModeObserver)
@protocol MBXMovementModeObserver
- (void)onMovementModeChangedForMovementInfo:(nonnull MBXMovementInfo *)movementInfo;
/**
 * Called when an error occurs while attempting to obtain the movement mode.
 * @param error An error accompanying the movement mode change.
 */
- (void)onMovementModeErrorForError:(nonnull NSString *)error;
@end
