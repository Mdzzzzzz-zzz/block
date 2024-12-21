#include "PluginManager.h"
#include "TaPlugin.h"
#include "ToastPlugin.h"
#include "SplashPlugin.h"
#include "AdMaxPlugin.h"
#include "BuglyPlugin.h"

@implementation PluginManager

+ (instancetype)sharedInstance {
    static PluginManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[PluginManager alloc] init];
    });
    return sharedInstance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _plugins = [[NSMutableDictionary alloc] init];
//        [_plugins setObject:[[LoginSDK alloc] init] forKey:@"LoginSDK"];
//        [_plugins setObject:[[FirebaseMsg alloc] init] forKey:@"FireBase"];
//        [_plugins setObject:[[AppsFlyerPlugin alloc] init] forKey:@"AppsFlyer"];
        [_plugins setObject:[[BuglyPlugin alloc] init] forKey:@"Bugly"];
        [_plugins setObject:[[ToastPlugin alloc] init] forKey:@"Toast"];
//        [_plugins setObject:[[IapPlugin alloc] init] forKey:@"Iap"];
        [_plugins setObject:[[AdMaxPlugin alloc] init] forKey:@"AdMaxPlugin"];
        [_plugins setObject:[[TaPlugin alloc] init] forKey:@"TaPlugin"];
        [_plugins setObject:[[SplashPlugin alloc] init] forKey:@"SplashPlugin"];
    }
    return self;
}

- (void)initPlugin:(UIApplication *)activity viewController:(UIView *)viewController {
    self.application = activity;
    self.view = viewController;
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin initPlugin:activity viewController:viewController];
       
    }
}

- (void)onResume {
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin onResume];
    }
}

- (void)onPause {
    for (NSString *key in self.plugins) {
        Plugin * plugin = [self.plugins objectForKey:key];
        [plugin onPause];
    }
}

- (void)onDestroy {
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin onDestroy];
    }
}

- (void)onStart {
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin onStart];
    }
}

- (void)onStop {
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin onStop];
    }
}

- (void)onRestart {
    for (NSString *key in self.plugins) {
        Plugin *plugin = [self.plugins objectForKey:key];
        [plugin onRestart];
    }
}

- (BOOL)execWithService:(NSString *)service action:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    Plugin *plugin = [self.plugins objectForKey:service];
    if (plugin) {
        [plugin execWithAction:action args:args callback:callback];
        return YES;
    }
    NSString *msg = [NSString stringWithFormat:@"exec: unknown service: %@", service];
    NSLog(@"%@", msg);
    if (callback) {
        [callback failureWithParams:msg];
    }
    return NO;
}

@end
