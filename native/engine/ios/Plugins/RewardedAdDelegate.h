#pragma once
#import <AppLovinSDK/AppLovinSDK.h>
#include "AdDelegate.h"
@interface RewardAdDelegate:AdDelegate<MARewardedAdDelegate>
    @property (nonatomic, strong) MARewardedAd *rewardedAd;
    @property (nonatomic, assign) NSInteger retryAttempt;
@end

