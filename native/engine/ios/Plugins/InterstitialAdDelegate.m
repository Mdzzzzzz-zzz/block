//
//  InterstitialAdDelegate.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/2/29.
//

#include "InterstitialAdDelegate.h"
#include "JsbEvent.h"
#include "JsbCall.h"

@implementation InterstitialAdDelegate
#pragma mark - MAAdDelegate Protocol

- (void)didLoadAd:(MAAd *)ad
{
    // Interstitial ad is ready to be shown. '[self.interstitialAd isReady]' will now return 'YES'
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_LOADED data:@{}];
    // Reset retry attempt
    self.retryAttempt = 0;
}

- (void)didFailToLoadAdForAdUnitIdentifier:(NSString *)adUnitIdentifier withError:(MAError *)error
{
    // Interstitial ad failed to load
    // We recommend retrying with exponentially higher delays up to a maximum delay (in this case 64 seconds)
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_FAILED_TO_LOAD data:[self createErrorJson:error]];
    self.retryAttempt++;
    NSInteger delaySec = pow(2, MIN(6, self.retryAttempt));
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, delaySec * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        [self.interstitialAd loadAd];
    });
}

- (void)didDisplayAd:(MAAd *)ad {
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_SHOWN data:@{}];
}

- (void)didClickAd:(MAAd *)ad {
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_CLICKED data:@{}];
}

- (void)didHideAd:(MAAd *)ad
{
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_CLOSED data:@{}];
    // Interstitial ad is hidden. Pre-load the next ad
    [self.interstitialAd loadAd];
}

- (void)didFailToDisplayAd:(MAAd *)ad withError:(MAError *)error
{
    [JsbCall emitWindowEvent:EVENT_INTERSTITIAL_SHOW_FAILED data:[self createErrorJson:error]];
    // Interstitial ad failed to display. We recommend loading the next ad
    [self.interstitialAd loadAd];
}

@end
