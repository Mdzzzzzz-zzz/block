//
//  TaPlugin.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/28.
//

#include "Plugin.h"
#include "ToastPlugin.h"
#import "UIView+Toast.h"
//#include "application/ApplicationManager.h"
//#include "cocos/bindings/jswrapper/SeApi.h"
@implementation ToastPlugin:Plugin

- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"show"]) {
        if ([action isEqualToString:@"show"]) {
                NSString *content = [args objectForKey:@"msg"];
                BOOL hasDuration = [args objectForKey:@"duration"] != nil;
                if (hasDuration) {
                    [self show:content duration:[[args objectForKey:@"duration"] floatValue]];
                } else {
                    [self show:content];
                }
                
            }
        return YES;
    }
    return [super execWithAction:action args:args callback:callback];
}
- (void)show:(NSString *)message {
   
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.view makeToast:message];
    });
}

- (void)show:(NSString *)message duration:(float)duration {
    dispatch_async(dispatch_get_main_queue(), ^{
        [self.view makeToast:message duration:duration position:CSToastPositionBottom];
    });
}

@end
