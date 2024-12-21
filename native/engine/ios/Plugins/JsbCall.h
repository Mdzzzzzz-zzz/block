// JsbCall.h
#pragma once
#import <Foundation/Foundation.h>
@interface JsbCall : NSObject

+ (void)init;
+ (void)execWithService:(NSString *)service action:(NSString *)action params:(NSString *)params callbackId:(NSString *)callbackId;
+ (void)emitWindowEvent:(NSString *)event data:(NSDictionary *)data;
+ (void)emitIapEvent:(NSString *)eventName eventData:(NSDictionary *)eventData;
+ (void)successCall:(NSString *)callbackId params:(NSString *)params;
+ (void)failureCall:(NSString *)callbackId params:(NSString *)params;

@end


