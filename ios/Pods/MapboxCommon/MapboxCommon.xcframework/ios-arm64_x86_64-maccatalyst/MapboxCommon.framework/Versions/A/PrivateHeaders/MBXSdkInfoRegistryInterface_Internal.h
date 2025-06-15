// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>

@class MBXSdkInformation;

NS_SWIFT_NAME(SdkInfoRegistryInterface)
@protocol MBXSdkInfoRegistryInterface
- (void)registerSdkInformationForInfo:(nonnull MBXSdkInformation *)info;
- (nonnull NSArray<MBXSdkInformation *> *)getSdkInformation;
@end
