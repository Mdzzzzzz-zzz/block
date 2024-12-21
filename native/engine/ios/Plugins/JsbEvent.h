#pragma once
#import <Foundation/Foundation.h>

@interface JsbEvent : NSObject

extern NSString * const EVENT_INTERSTITIAL_LOADED;
extern NSString * const EVENT_INTERSTITIAL_SHOWN;
extern NSString * const EVENT_INTERSTITIAL_SHOW_FAILED;
extern NSString * const EVENT_INTERSTITIAL_CLICKED;
extern NSString * const EVENT_INTERSTITIAL_CLOSED;
extern NSString * const EVENT_INTERSTITIAL_WILL_OPEN;
extern NSString * const EVENT_INTERSTITIAL_FAILED_TO_LOAD;

extern NSString * const EVENT_OFFERWALL_CLOSED;
extern NSString * const EVENT_OFFERWALL_CREDIT_FAILED;
extern NSString * const EVENT_OFFERWALL_CREDITED;
extern NSString * const EVENT_OFFERWALL_SHOW_FAILED;
extern NSString * const EVENT_OFFERWALL_SHOWN;
extern NSString * const EVENT_OFFERWALL_AVAILABILITY_CHANGED;

extern NSString * const EVENT_REWARDED_VIDEO_FAILED;
extern NSString * const EVENT_REWARDED_VIDEO_REWARDED;
extern NSString * const EVENT_REWARDED_VIDEO_ENDED;
extern NSString * const EVENT_REWARDED_VIDEO_STARTED;
extern NSString * const EVENT_REWARDED_VIDEO_AVAILABILITY_CHANGED;
extern NSString * const EVENT_REWARDED_VIDEO_CLOSED;
extern NSString * const EVENT_REWARDED_VIDEO_OPENED;
extern NSString * const EVENT_REWARDED_VIDEO_LOAD_FAILED;

extern NSString * const EVENT_BANNER_DID_LOAD;
extern NSString * const EVENT_BANNER_FAILED_TO_LOAD;
extern NSString * const EVENT_BANNER_DID_CLICK;
extern NSString * const EVENT_BANNER_WILL_PRESENT_SCREEN;
extern NSString * const EVENT_BANNER_DID_DISMISS_SCREEN;
extern NSString * const EVENT_BANNER_WILL_LEAVE_APPLICATION;

@end
