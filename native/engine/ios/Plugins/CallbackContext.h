#pragma once
#import <Foundation/Foundation.h>
//#import "JsbCall.h" // 请确保导入 JsbCall 类

@interface CallbackContext : NSObject

@property (nonatomic, strong) NSString *_callbackId;

- (instancetype)initWithCallbackId:(NSString *)callbackId;
- (void)successWithParams:(NSString *)params;
- (void)failureWithParams:(NSString *)params;
- (void)successWithJSONObject:(NSDictionary *)obj;
- (void)failureWithJSONObject:(NSDictionary *)obj;

@end
