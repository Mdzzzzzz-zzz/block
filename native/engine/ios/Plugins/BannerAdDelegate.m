//
//  BannerAdDelegate.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/3/1.
//

#import <AppLovinSDK/AppLovinSDK.h>
#include "BannerAdDelegate.h"
#include "JsbEvent.h"
#include "JsbCall.h"
@implementation BannerAdDelegate

#pragma mark - MAAdDelegate Protocol
- (void)didLoadAd:(MAAd *)ad {
    [JsbCall emitWindowEvent:EVENT_BANNER_DID_LOAD data:@{}];
}

- (void)didFailToLoadAdForAdUnitIdentifier:(NSString *)adUnitIdentifier withError:(MAError *)error {
    [JsbCall emitWindowEvent:EVENT_BANNER_FAILED_TO_LOAD data:[self createErrorJson:error]];
}

- (void)didClickAd:(MAAd *)ad {
    [JsbCall emitWindowEvent:EVENT_BANNER_DID_CLICK data:@{}];
}

- (void)didFailToDisplayAd:(MAAd *)ad withError:(MAError *)error {
    
}

#pragma mark - MAAdViewAdDelegate Protocol

- (void)didExpandAd:(MAAd *)ad {}

- (void)didCollapseAd:(MAAd *)ad {}

#pragma mark - Deprecated Callbacks

- (void)didDisplayAd:(MAAd *)ad { /* DO NOT USE - THIS IS RESERVED FOR FULLSCREEN ADS ONLY AND WILL BE REMOVED IN A FUTURE SDK RELEASE */ }
- (void)didHideAd:(MAAd *)ad { /* DO NOT USE - THIS IS RESERVED FOR FULLSCREEN ADS ONLY AND WILL BE REMOVED IN A FUTURE SDK RELEASE */ }

@end
