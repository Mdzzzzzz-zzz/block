#pragma once
#include "Plugin.h"
#import <AppLovinSDK/AppLovinSDK.h>
@interface AdMaxPlugin : Plugin
@property (nonatomic, strong) MAInterstitialAd *interstitialAd;
@property (nonatomic, strong) MARewardedAd *rewardedAd;
@property (nonatomic, strong) MAAdView *bannerAdView;
@end

