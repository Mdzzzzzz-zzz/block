// JsbCall.m

#import "JsbCall.h"
#include "CallbackContext.h"
#include "PluginManager.h"
#include "platform/apple/JsbBridgeWrapper.h"
//#include "application/ApplicationManager.h"
//#include "cocos/bindings/jswrapper/SeApi.h"
@implementation JsbCall

+ (void)init{
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
      OnScriptEventListener jsbCallListener = ^void(NSString* args){
          NSData *data = [args dataUsingEncoding:NSUTF8StringEncoding];
          NSError *error = nil;
          NSDictionary *jsonObject = [NSJSONSerialization JSONObjectWithData:data options:0 error:&error];

          if (jsonObject) {
              // 从 JSON 对象中获取参数值
              NSString *service = jsonObject[@"service"];
              NSString *action = jsonObject[@"action"];
              NSString *params = jsonObject[@"params"];
              NSString *callbackId = jsonObject[@"callbackId"];
              [JsbCall execWithService:service action:action params:params callbackId:callbackId];
          } else {
              NSLog(@"Error parsing JSON: %@", error.localizedDescription);
          }
      };
    [m addScriptEventListener:@"JsbCall" listener:jsbCallListener];
}
+ (void)execWithService:(NSString *)service action:(NSString *)action params:(NSString *)params callbackId:(NSString *)callbackId {
    NSLog(@"exec: %@ %@ %@ %@", service, action, params, callbackId);
    // 在这里调用相应的方法，并根据结果调用成功或失败的回调
    CallbackContext *callbackContext = [[CallbackContext alloc] initWithCallbackId:callbackId];
    NSData *jsonData = [params dataUsingEncoding:NSUTF8StringEncoding];
    NSError *error;
    id jsonObject = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
    NSDictionary *resultDictionary = (NSDictionary *)jsonObject;
    [[PluginManager sharedInstance] execWithService:service action:action args:resultDictionary callback:callbackContext];
}

+ (void)emitWindowEvent:(NSString *)event data:(NSDictionary *)data {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSDictionary *jsonObject = @{@"event": event, @"data": data};
        JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
              [m dispatchEventToScript:@"emitWindowEvent" arg:[self jsonStringFromDictionary:jsonObject]];
    });
}

+ (void)emitIapEvent:(NSString *)eventName eventData:(NSDictionary *)eventData {
    NSLog(@"emitWindowEvent[iap]: %@ data: %@", eventName, eventData);
    // 在这里调用 emitWindowEvent 方法
    [self emitWindowEvent:eventName data:eventData];
}

+ (void)successCall:(NSString *)callbackId params:(NSString *)params {
    NSLog(@"successCall: %@ params: %@", callbackId, params);
    // 在这里调用相应的方法，并根据结果调用成功或失败的回调
    NSDictionary *jsonObject = @{@"event": callbackId, @"data": params};
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
          [m dispatchEventToScript:@"callBackCallSuccess" arg:[self jsonStringFromDictionary:jsonObject]];
}

+ (void)failureCall:(NSString *)callbackId params:(NSString *)params {
    NSLog(@"failureCall: %@ params: %@", callbackId, params);
    // 在这里调用相应的方法，并根据结果调用成功或失败的回调
    NSDictionary *jsonObject = @{@"event": callbackId, @"data": params};
    JsbBridgeWrapper* m = [JsbBridgeWrapper sharedInstance];
          [m dispatchEventToScript:@"callBackCallFailure" arg:[self jsonStringFromDictionary:jsonObject]];
}

+ (NSString *)jsonStringFromDictionary:(NSDictionary *)dictionary {
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dictionary options:0 error:&error];
    if (!jsonData) {
        NSLog(@"jsonStringFromDictionary error: %@", error.localizedDescription);
        return @"{}";
    } else {
        return [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
}

@end
