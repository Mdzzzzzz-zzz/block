#import "JsbEvent.h"

@implementation JsbEvent

NSString * const EVENT_INTERSTITIAL_LOADED = @"interstitialLoaded";
NSString * const EVENT_INTERSTITIAL_SHOWN = @"interstitialShown";
NSString * const EVENT_INTERSTITIAL_SHOW_FAILED = @"interstitialShowFailed";
NSString * const EVENT_INTERSTITIAL_CLICKED = @"interstitialClicked";
NSString * const EVENT_INTERSTITIAL_CLOSED = @"interstitialClosed";
NSString * const EVENT_INTERSTITIAL_WILL_OPEN = @"interstitialWillOpen";
NSString * const EVENT_INTERSTITIAL_FAILED_TO_LOAD = @"interstitialFailedToLoad";

NSString * const EVENT_OFFERWALL_CLOSED = @"offerwallClosed";
NSString * const EVENT_OFFERWALL_CREDIT_FAILED = @"offerwallCreditFailed";
NSString * const EVENT_OFFERWALL_CREDITED = @"offerwallCreditReceived";
NSString * const EVENT_OFFERWALL_SHOW_FAILED = @"offerwallShowFailed";
NSString * const EVENT_OFFERWALL_SHOWN = @"offerwallShown";
NSString * const EVENT_OFFERWALL_AVAILABILITY_CHANGED = @"offerwallAvailabilityChanged";

NSString * const EVENT_REWARDED_VIDEO_FAILED = @"rewardedVideoFailed";
NSString * const EVENT_REWARDED_VIDEO_REWARDED = @"rewardedVideoRewardReceived";
NSString * const EVENT_REWARDED_VIDEO_ENDED = @"rewardedVideoEnded";
NSString * const EVENT_REWARDED_VIDEO_STARTED = @"rewardedVideoStarted";
NSString * const EVENT_REWARDED_VIDEO_AVAILABILITY_CHANGED = @"rewardedVideoAvailabilityChanged";
NSString * const EVENT_REWARDED_VIDEO_CLOSED = @"rewardedVideoClosed";
NSString * const EVENT_REWARDED_VIDEO_OPENED = @"rewardedVideoOpened";
NSString * const EVENT_REWARDED_VIDEO_LOAD_FAILED = @"rewardedVideoLoadFailed";

NSString * const EVENT_BANNER_DID_LOAD = @"bannerDidLoad";
NSString * const EVENT_BANNER_FAILED_TO_LOAD = @"bannerFailedToLoad";
NSString * const EVENT_BANNER_DID_CLICK = @"bannerDidClick";
NSString * const EVENT_BANNER_WILL_PRESENT_SCREEN = @"bannerWillPresentScreen";
NSString * const EVENT_BANNER_DID_DISMISS_SCREEN = @"bannerDidDismissScreen";
NSString * const EVENT_BANNER_WILL_LEAVE_APPLICATION = @"bannerWillLeaveApplication";

@end
