//
//  ALTargetingData.h
//  sdk
//
//  Created by Basil on 9/18/12.
//  Copyright © 2022 AppLovin Corporation. All rights reserved.
//

@class ALTargetingDataBuilder;

NS_ASSUME_NONNULL_BEGIN

/**
 *  Builder block used to create an ALSdkInitializationConfiguration object.
 */
typedef void (^ALTargetingDataBuilderBlock) (ALTargetingDataBuilder *builder);

/**
 * This enumeration represents content ratings for the ads shown to users.
 * They correspond to IQG Media Ratings.
 */
typedef NS_ENUM(NSInteger, ALAdContentRating)
{
    ALAdContentRatingNone,
    ALAdContentRatingAllAudiences,
    ALAdContentRatingEveryoneOverTwelve,
    ALAdContentRatingMatureAudiences
};

/**
 * This enumeration represents gender.
 */
typedef NS_ENUM(NSInteger, ALGender)
{
    ALGenderUnknown,
    ALGenderFemale,
    ALGenderMale,
    ALGenderOther
};

/**
 * This class allows you to provide user or app data that will improve how we target ads.
 */
@interface ALTargetingData : NSObject

@property (nonatomic, assign) ALGender gender __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");
@property (nonatomic, assign) ALAdContentRating maximumAdContentRating __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");

@property (nonatomic, strong, nullable) NSNumber *yearOfBirth __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");

@property (nonatomic, copy, nullable) NSString *email __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");
@property (nonatomic, copy, nullable) NSString *phoneNumber __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");
@property (nonatomic, copy, nullable) NSArray<NSString *> *keywords __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");
@property (nonatomic, copy, nullable) NSArray<NSString *> *interests __deprecated_msg("This setter is deprecated and will be removed in a future SDK version. Please build a ALTargetingData instance in ALSdkInitializationConfiguration");

- (void)clearAll __deprecated_msg("This method is deprecated and will be removed in a future SDK version.");

#pragma mark - Initialization

+ (instancetype)dataWithBuilderBlock:(NS_NOESCAPE ALTargetingDataBuilderBlock)builderBlock;

- (instancetype)init __attribute__((unavailable("Please create a ALTargetingData instance in ALSdkInitializationConfiguration")));
- (instancetype)new NS_UNAVAILABLE;

@end

#pragma mark - ALTargetingData Builder

/**
 * Builder class used to create an ALTargetingData object.
 */
@interface ALTargetingDataBuilder : NSObject

/**
 * The year of birth of the user.
 * Set this property to @c nil to clear this value.
 */
@property (nonatomic, strong, nullable) NSNumber *yearOfBirth;

/**
 * The gender of the user.
 * Set this property to @c ALGenderUnknown to clear this value.
 */
@property (nonatomic, assign) ALGender gender;

/**
 * The maximum ad content rating shown to the user.
 * Set this property to @c ALAdContentRatingNone to clear this value.
 */
@property (nonatomic, assign) ALAdContentRating maximumAdContentRating;

/**
 * The email of the user.
 * Set this property to @c nil to clear this value.
 */
@property (nonatomic, copy, nullable) NSString *email;

/**
 * The phone number of the user. Do not include the country calling code.
 * Set this property to @c nil to clear this value.
 */
@property (nonatomic, copy, nullable) NSString *phoneNumber;

/**
 * The keywords describing the application.
 * Set this property to @c nil to clear this value.
 */
@property (nonatomic, copy, nullable) NSArray<NSString *> *keywords;

/**
 * The interests of the user.
 * Set this property to @c nil to clear this value.
 */
@property (nonatomic, copy, nullable) NSArray<NSString *> *interests;

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;
@end

NS_ASSUME_NONNULL_END
