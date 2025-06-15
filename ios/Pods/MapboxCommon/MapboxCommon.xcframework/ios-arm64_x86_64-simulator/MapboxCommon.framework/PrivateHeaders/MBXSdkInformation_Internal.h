// This file is generated and will be overwritten automatically.

#import <Foundation/Foundation.h>

NS_SWIFT_NAME(SdkInformation)
__attribute__((visibility ("default")))
@interface MBXSdkInformation : NSObject

// This class provides custom init which should be called
- (nonnull instancetype)init NS_UNAVAILABLE;

// This class provides custom init which should be called
+ (nonnull instancetype)new NS_UNAVAILABLE;

- (nonnull instancetype)initWithName:(nonnull NSString *)name
                             version:(nonnull NSString *)version
                         packageName:(nullable NSString *)packageName;

@property (nonatomic, readonly, nonnull, copy) NSString *name;
@property (nonatomic, readonly, nonnull, copy) NSString *version;
@property (nonatomic, readonly, nullable, copy) NSString *packageName;

@end
