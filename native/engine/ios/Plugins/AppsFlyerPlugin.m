//
//  AppsFlyerPlugin.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/3/5.
//

#include "AppsFlyerPlugin.h"
#import <AppsFlyerLib/AppsFlyerLib.h>
#import <AppsFlyerAdRevenue/AppsFlyerAdRevenue.h>
@implementation AppsFlyerPlugin:Plugin
- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"init"]) {
        NSString *userId = args[@"userId"];
        [[AppsFlyerLib shared] setAppsFlyerDevKey:@"rSySeWtvKabfbPZE7Lmx7C"];
        [[AppsFlyerLib shared] setAppleAppID:@"6478843145"];
        [AppsFlyerLib shared].customerUserID = userId;
#ifdef DEBUG
    [AppsFlyerLib shared].isDebug = true;
#else
    [AppsFlyerLib shared].isDebug = false;
#endif
        [[AppsFlyerLib shared] start];
        [AppsFlyerAdRevenue start];
        return YES;
    }
    else if ([action isEqualToString:@"report"]){
        
    }
    return [super execWithAction:action args:args callback:callback];
}
@end
