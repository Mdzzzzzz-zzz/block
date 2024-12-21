#pragma once
#import <AppLovinSDK/AppLovinSDK.h>
#include "AdDelegate.h"
@interface InterstitialAdDelegate:AdDelegate<MAAdDelegate>
    @property (nonatomic, strong) MAInterstitialAd *interstitialAd;
    @property (nonatomic, assign) NSInteger retryAttempt;
@end
