//
//  AdDelegate.h
//  BlockMaster
//
//  Created by Tuyoo_ZZG on 2024/3/1.
//

#pragma once
#import <AppLovinSDK/AppLovinSDK.h>
@interface AdDelegate:NSObject<MAAdRevenueDelegate>
-(NSDictionary *)createErrorJson:(MAError *)error;
@end
