//
//  BuglyPlugin.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/28.
//
#include "Plugin.h"
#include "SplashPlugin.h"
@implementation SplashPlugin:Plugin
- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"show"]) {
        // 创建一个父视图
        UIView *parentView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 375, 812)];
        parentView.backgroundColor = [UIColor whiteColor]; // 设置背景颜色为白色

        // 创建一个图像视图
        UIImageView *imageView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"LaunchScreenBackground.png"]];
        imageView.contentMode = UIViewContentModeScaleAspectFill;
//        imageView.clipsToBounds = YES;

        // 添加图像视图到父视图
        [parentView addSubview:imageView];

        // 设置图像视图的约束
        imageView.translatesAutoresizingMaskIntoConstraints = NO;
        [imageView.topAnchor constraintEqualToAnchor:parentView.topAnchor].active = YES;
        [imageView.bottomAnchor constraintEqualToAnchor:parentView.bottomAnchor].active = YES;
        [imageView.leadingAnchor constraintEqualToAnchor:parentView.leadingAnchor].active = YES;
        [imageView.trailingAnchor constraintEqualToAnchor:parentView.trailingAnchor].active = YES;

        // 将父视图添加到你的视图控制器的视图中
        [self.view addSubview:parentView];
        self.splashImageView = parentView;
        return YES;
    }
    else if ([action isEqualToString:@"hide"]){
        [self.splashImageView removeFromSuperview];
        [callback successWithParams:@""];
        return YES;
    }
    return [super execWithAction:action args:args callback:callback];
}
@end
