//
//  BuglyPlugin.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/28.
//

#import <Bugly/Bugly.h>
#include "Plugin.h"
#include "BuglyPlugin.h"
@implementation BuglyPlugin:Plugin
- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"init"]) {
        [Bugly startWithAppId:@"2ab08e1e7c"];
        return YES;
    }
    else if ([action isEqualToString:@"putUserData"]){
        NSString *key = args[@"key"];
        NSString *value = args[@"value"];
        [Bugly setUserValue:value forKey:key];
        return YES;
    }
    else if ([action isEqualToString:@"postException"]){
        return YES;
    }
    else if([action isEqualToString:@"deviceId"]){
        NSString *deviceId = args[@"deviceId"];
        [Bugly setUserIdentifier:deviceId];
        return YES;
    }
    return [super execWithAction:action args:args callback:callback];
}
@end
