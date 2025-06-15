// This file is generated and will be overwritten automatically.

#import <MapboxCoreMaps/MBMCameraManager.h>

@interface MBMCameraManager ()
- (nonnull MBXExpected<NSNull *, NSString *> *)setBoundsForOptions:(nonnull MBMCameraBoundsOptions *)options __attribute((ns_returns_retained));
- (nonnull NSArray<MBMCanonicalTileID *> *)tileCoverForTileCoverOptions:(nonnull MBMTileCoverOptions *)tileCoverOptions
                                                          cameraOptions:(nullable MBMCameraOptions *)cameraOptions __attribute((ns_returns_retained)) NS_REFINED_FOR_SWIFT;
@end
