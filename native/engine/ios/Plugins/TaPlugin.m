#import <ThinkingSDK/ThinkingSDK.h>
#include "Plugin.h"
#include "TaPlugin.h"
@implementation TaPlugin:Plugin

- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"init"]) {
        [self initAction:args callback:callback];
        return YES;
    } else if ([action isEqualToString:@"login"]) {
        [self login:args callback:callback];
        return YES;
    } else if ([action isEqualToString:@"track"]) {
        [self track:args callback:callback];
        return YES;
    } else {
        return [super execWithAction:action args:args callback:callback];
    }
}

- (void)initAction:(NSDictionary *)args callback:(CallbackContext *)callback {
    NSString *appKey = args[@"appId"];
    NSString *serverUrl = args[@"serverUrl"];

    TDConfig *config = [[TDConfig alloc] init];
    config.appid = appKey;
    config.serverUrl = serverUrl;
    config.mode = TDModeDebug;
    [TDAnalytics startAnalyticsWithConfig:config];
    TDAutoTrackEventType eventType = TDAutoTrackEventTypeAppStart | TDAutoTrackEventTypeAppInstall | TDAutoTrackEventTypeAppEnd | TDAutoTrackEventTypeAppViewCrash;
    [TDAnalytics enableAutoTrack:eventType];
    NSDictionary *superProperties = @{@"channel": @"appstore"};
    [TDAnalytics setSuperProperties:superProperties];
    [callback successWithJSONObject:@{}];
}

- (void)login:(NSDictionary *)args callback:(CallbackContext *)callback {
    NSString *userId = args[@"userId"];
    if (userId.length > 0) {
        [TDAnalytics login:userId];
        [callback successWithJSONObject:@{}];
    } else {
        NSLog(@"Failed to perform login: ThinkingAnalyticsSDK is nil or userId is empty");
        [callback failureWithJSONObject:@{@"error": @"Failed to perform login: ThinkingAnalyticsSDK is nil or userId is empty"}];
    }
}

- (void)track:(NSDictionary *)args callback:(CallbackContext *)callback {
    NSString *eventType = args[@"eventId"];
    NSDictionary *params = args[@"params"];

    if (eventType.length > 0) {
        [TDAnalytics track:eventType properties:params];
        [callback successWithJSONObject:@{}];
    } else {
        NSLog(@"Failed to perform track: ThinkingAnalyticsSDK is nil or eventType is empty");
        [callback failureWithJSONObject:@{@"error": @"Failed to perform track: ThinkingAnalyticsSDK is nil or eventType is empty"}];
    }
}

@end
