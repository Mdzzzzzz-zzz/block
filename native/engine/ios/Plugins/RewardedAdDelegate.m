//
//  RewardedAdDelegate.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/29.
//

#import <Foundation/Foundation.h>
#import <AppLovinSDK/AppLovinSDK.h>
#import "RewardedAdDelegate.h"
#include "JsbEvent.h"
#include "JsbCall.h"
@implementation RewardAdDelegate
#pragma mark - MAAdDelegate Protocol

- (void)didLoadAd:(MAAd *)ad
{
    // Rewarded ad is ready to be shown. '[self.rewardedAd isReady]' will now return 'YES'
    
    // Reset retry attempt
    self.retryAttempt = 0;
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_AVAILABILITY_CHANGED data:@{
        @"available":@(YES)
    }];
}

- (void)didFailToLoadAdForAdUnitIdentifier:(NSString *)adUnitIdentifier withError:(MAError *)error
{
    // Rewarded ad failed to load
    // We recommend retrying with exponentially higher delays up to a maximum delay (in this case 64 seconds)
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_LOAD_FAILED data:[self createErrorJson:error]];
    self.retryAttempt++;
    NSInteger delaySec = pow(2, MIN(6, self.retryAttempt));
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delaySec * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self.rewardedAd loadAd];
    });
}

- (void)didDisplayAd:(MAAd *)ad {
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_OPENED data:@{}];
}

- (void)didClickAd:(MAAd *)ad {}

- (void)didHideAd:(MAAd *)ad
{
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_CLOSED data:@{}];
    // Rewarded ad is hidden. Pre-load the next ad
    [self.rewardedAd loadAd];
}

- (void)didFailToDisplayAd:(MAAd *)ad withError:(MAError *)error
{
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_FAILED data:[self createErrorJson:error]];
    // Rewarded ad failed to display. We recommend loading the next ad
    [self.rewardedAd loadAd];
}

#pragma mark - MARewardedAdDelegate Protocol

- (void)didStartRewardedVideoForAd:(MAAd *)ad {}

- (void)didCompleteRewardedVideoForAd:(MAAd *)ad {}

- (void)didRewardUserForAd:(MAAd *)ad withReward:(MAReward *)reward
{
    NSString *name = reward.description;
    NSString *rewardName = reward.description; // 替换为实际的奖励名称
    NSNumber *rewardAmount = reward.amount; // 替换为实际的奖励数量

    NSDictionary *placementData = @{
        @"name": name,
        @"reward": rewardName,
        @"amount": rewardAmount
    };
    // Rewarded ad was displayed and user should receive the reward
    [JsbCall emitWindowEvent:EVENT_REWARDED_VIDEO_REWARDED data:placementData];
}

@end
