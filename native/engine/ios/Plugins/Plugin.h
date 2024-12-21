#pragma once

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h> // 根据需要包含相应的头文件
#include "CallbackContext.h"

@interface Plugin : NSObject

@property (nonatomic, strong) UIApplication *application;
@property (nonatomic, strong) UIView *view;
- (void)initPlugin:(UIApplication *)activity viewController:(UIView *)viewController;
- (void)onResume;
- (void)onPause;
- (void)onDestroy;
- (void)onStart;
- (void)onStop;
- (void)onRestart;
- (void)emitWindowEvent:(NSString *)event;
- (void)emitWindowEvent:(NSString *)event data:(NSDictionary *)data;
- (UIView *)getView;
- (UIApplication *)getApplication;
- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback;

@end
