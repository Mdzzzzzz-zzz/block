//
//  AdMaxPlugin.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/29.
//

#import <Foundation/Foundation.h>
#import <AppLovinSDK/AppLovinSDK.h>
#include "Plugin.h"
#include "AdMaxPlugin.h"
#include "InterstitialAdDelegate.h"
#include "RewardedAdDelegate.h"
#include "BannerAdDelegate.h"
@implementation AdMaxPlugin:Plugin
- (BOOL)execWithAction:(NSString *)action args:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ([action isEqualToString:@"init"]) {
        [self initActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"setDynamicUserId"]){
        [self setDynamicUserIdActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"setConsent"]){
        [self setConsentActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"validateIntegration"]){
        [self validateIntegrationActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"showRewardedVideo"]){
        [self showRewardedVideoActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"loadRewardedVideo"]){
        [self loadRewardedVideoActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"hasRewardedVideo"]){
        [self hasRewardedVideoActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"isRewardedVideoCappedForPlacement"]){
        [self isRewardedVideoCappedForPlacementActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"loadBanner"]){
        [self loadBannerActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"showBanner"]){
        [self showBannerActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"hideBanner"]){
        [self hideBannerActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"loadInterstitial"]){
        [self loadInterstitialActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"hasInterstitial"]){
        [self hasInterstitialActionWithArgs:args callback:callback];
        return YES;
    }
    else if ([action isEqualToString:@"showInterstitial"]){
        [self showInterstitialActionWithArgs:args callback:callback];
        return YES;
    }
    return [super execWithAction:action args:args callback:callback];
}
- (BOOL)initActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    NSString *userId = args[@"userId"];
    NSString *rewardAdUnitID = args[@"rewardAdUnitID"];
    NSString *bannerAdUnitID = args[@"bannerAdUnitID"];
    NSString *insertAdUnitID = args[@"insertAdUnitID"];
    [ALSdk shared].mediationProvider = @"max";

    [ALSdk shared].userIdentifier = userId;

    [[ALSdk shared] initializeSdkWithCompletionHandler:^(ALSdkConfiguration *configuration) {
        // Start loading ads
        [self initAdUnitWithRewardAdUnitID:rewardAdUnitID];
        [self initAdUnitWithBannerAdUnitID:bannerAdUnitID];
        [self initAdUnitWithInsertAdUnitID:insertAdUnitID];
    }];
    return YES;
}
- (void)initAdUnitWithRewardAdUnitID:(NSString *)rewardAdUnitID {
    self.rewardedAd = [MARewardedAd sharedWithAdUnitIdentifier: rewardAdUnitID];
    RewardAdDelegate *ad = [RewardAdDelegate alloc];
    self.rewardedAd.delegate = ad;
    self.rewardedAd.revenueDelegate=ad;
    ad.rewardedAd = self.rewardedAd;
    [self.rewardedAd loadAd];
}

- (void)initAdUnitWithBannerAdUnitID:(NSString *)bannerAdUnitID {
    self.bannerAdView = [[MAAdView alloc] initWithAdUnitIdentifier: bannerAdUnitID];
    BannerAdDelegate *ad = [BannerAdDelegate alloc];
    self.bannerAdView.delegate = ad;
    self.bannerAdView.revenueDelegate =ad;

    // Banner height on iPhone and iPad is 50 and 90, respectively
    CGFloat height = (UIDevice.currentDevice.userInterfaceIdiom == UIUserInterfaceIdiomPad) ? 90 : 50;

    // Stretch to the width of the screen for banners to be fully functional
    CGFloat width = CGRectGetWidth(UIScreen.mainScreen.bounds);
    CGFloat x = 0; // X position is at the left edge
    CGFloat y = CGRectGetHeight(self.view.bounds) - height; // Y position is at the bottom of the screen

    self.bannerAdView.frame = CGRectMake(x, y, width, height);

    // Set background or background color for banner ads to be fully functional
    self.bannerAdView.backgroundColor = [UIColor whiteColor];

    [self.view addSubview: self.bannerAdView];

    // Load the ad
    [self.bannerAdView loadAd];
}

- (void)initAdUnitWithInsertAdUnitID:(NSString *)insertAdUnitID {
    self.interstitialAd = [[MAInterstitialAd alloc] initWithAdUnitIdentifier: insertAdUnitID];
    InterstitialAdDelegate *ad = [InterstitialAdDelegate alloc];
    self.interstitialAd.delegate = ad;
    self.interstitialAd.revenueDelegate=ad;
    ad.interstitialAd = self.interstitialAd;
    [self.interstitialAd loadAd];
}
- (BOOL)setDynamicUserIdActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    return YES;
}

- (BOOL)setConsentActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    return YES;
}

- (BOOL)validateIntegrationActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    return YES;
}
#pragma mark - Reward Api
- (BOOL)showRewardedVideoActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    if([self.rewardedAd isReady]){
        [self.rewardedAd showAd];
        [callback successWithParams:@""];
        return YES;
    }
    [callback failureWithParams:@""];
    return YES;
}

- (BOOL)loadRewardedVideoActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    if([self.rewardedAd isReady]){
        [callback successWithParams:@""];
        return YES;
    }
    [self.rewardedAd loadAd];
    [callback successWithParams:@""];
    return YES;
}

- (BOOL)hasRewardedVideoActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    bool ready = [self.rewardedAd isReady];
    [callback successWithParams:[NSString stringWithFormat:@"%@", ready ? @"true" : @"false"]];
    return YES;
}
//弃用
- (BOOL)isRewardedVideoCappedForPlacementActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    bool ready = [self.rewardedAd isReady];
    [callback successWithParams:[NSString stringWithFormat:@"%@", ready ? @"true" : @"false"]];
    return YES;
}

#pragma mark - Banner Api
- (BOOL)loadBannerActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    [self.bannerAdView loadAd];
    [callback successWithParams:@""];
    return YES;
}

- (BOOL)showBannerActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.bannerAdView.hidden = NO;
        [self.bannerAdView startAutoRefresh];
        [callback successWithParams:@""];
    });
    return YES;
}

- (BOOL)hideBannerActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    dispatch_async(dispatch_get_main_queue(), ^{
        self.bannerAdView.hidden = YES;
        [self.bannerAdView stopAutoRefresh];
        [callback successWithParams:@""];
    });
    return YES;
}
#pragma mark - Interstitial Api
- (BOOL)loadInterstitialActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    if([self.interstitialAd isReady]){
        [callback successWithParams:@""];
        return YES;
    }
    [self.interstitialAd loadAd];
    [callback successWithParams:@""];
    return YES;
}

- (BOOL)hasInterstitialActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    bool ready = [self.interstitialAd isReady];
    [callback successWithParams:[NSString stringWithFormat:@"%@", ready ? @"true" : @"false"]];
    return YES;
}

- (BOOL)showInterstitialActionWithArgs:(NSDictionary *)args callback:(CallbackContext *)callback {
    if ( [self.interstitialAd isReady] )
    {
        [self.interstitialAd showAd];
    }
    [callback successWithParams:@""];
    return YES;
}

@end
