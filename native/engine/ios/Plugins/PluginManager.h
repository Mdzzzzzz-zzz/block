#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h> // 请根据需要包含相应的头文件
#include "Plugin.h"
#include "CallbackContext.h"

@interface PluginManager : NSObject

@property (nonatomic, strong) UIApplication *application;
@property (nonatomic, strong) UIView *view;
@property (nonatomic, strong) NSMutableDictionary<NSString *,Plugin *> *plugins;

+ (instancetype)sharedInstance;
- (void)initPlugin:(UIApplication *)activity viewController:(UIView *)viewController;
- (void)onResume;
- (void)onPause;
- (void)onDestroy;
- (void)onStart;
- (void)onStop;
- (void)onRestart;
- (BOOL)execWithService:(NSString *)service action:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback;

@end
