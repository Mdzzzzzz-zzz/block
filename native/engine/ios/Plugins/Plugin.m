#import "Plugin.h"
#include "CallbackContext.h"
//#import "JsbCall.h"

@implementation Plugin

- (void)initPlugin:(UIApplication *)activity viewController:(UIView *)viewController {
    self.application = activity;
    self.view = viewController;
}

- (void)onResume {
    // Implement onResume logic here
}

- (void)onPause {
    // Implement onPause logic here
}

- (void)onDestroy {
    // Implement onDestroy logic here
}

- (void)onStart {
    // Implement onStart logic here
}

- (void)onStop {
    // Implement onStop logic here
}

- (void)onRestart {
    // Implement onRestart logic here
}

- (void)emitWindowEvent:(NSString *)event {
    [self emitWindowEvent:event data:@{}];
}

- (void)emitWindowEvent:(NSString *)event data:(NSDictionary *)data {
//    [JsbCall emitWindowEvent:event data:data];
}

- (UIView *)getView {
    return  self.view;
}

- (UIApplication *)getApplication {
    return [UIApplication sharedApplication];
}

- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    return NO;
}

@end
