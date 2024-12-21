//
//  AdDelegate.m
//  BlockMaster-mobile
//
//  Created by Tuyoo_ZZG on 2024/3/1.
//
#pragma once
#import <Foundation/Foundation.h>
#import <AppLovinSDK/AppLovinSDK.h>
#import "AppsFlyerAdRevenue/AppsFlyerAdRevenue.h"
#include "AdDelegate.h"
@implementation AdDelegate

-(NSDictionary *)createErrorJson:(MAError *)error{
    return @{@"error":@{
            @"code":@(error.code),
            @"message":error.message,
        }
    };
}
- (void)didPayRevenueForAd:(nonnull MAAd *)ad {
    NSDictionary *jsonObject = @{@"placement": ad.placement, @"network_placement": ad.networkPlacement,@"ad_unit_identifier":ad.adUnitIdentifier,@"creative_identifier":ad.adReviewCreativeIdentifier};
    [[AppsFlyerAdRevenue shared] logAdRevenueWithMonetizationNetwork:ad.networkName mediationNetwork:AppsFlyerAdRevenueMediationNetworkTypeApplovinMax eventRevenue:[NSNumber numberWithDouble:ad.revenue] revenueCurrency:@"USD" additionalParameters:jsonObject];
}

@end
