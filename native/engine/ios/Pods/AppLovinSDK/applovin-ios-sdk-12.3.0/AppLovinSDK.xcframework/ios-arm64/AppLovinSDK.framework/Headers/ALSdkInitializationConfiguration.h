//
//  ALSdkInitializationConfiguration.h
//  AppLovinSDK
//
//  Created by Chris Cong on 1/22/24.
//

#import <AppLovinSDK/ALSdkSettings.h>
#import <AppLovinSDK/ALTargetingData.h>
#import <AppLovinSDK/ALUserSegment.h>

@class ALSdkInitializationConfigurationBuilder;

NS_ASSUME_NONNULL_BEGIN

/**
 *  Builder block used to create an ALSdkInitializationConfiguration object.
 */
typedef void (^ALSdkInitializationConfigurationBuilderBlock) (ALSdkInitializationConfigurationBuilder *builder);

/**
 * This class contains configurable properties and settings for the initialization of the AppLovin SDK.
 * It also reads any values you have already configured in the application's @c Info.plist.
 * To be used in @code [[ALSdk shared] initializeWithConfiguration:completionHandler].
 */
@interface ALSdkInitializationConfiguration : NSObject

@property (nonatomic, copy, readonly, nullable) NSString *sdkKey;
@property (nonatomic, copy, readonly, nullable) NSString *mediationProvider;
@property (nonatomic, copy, readonly, nullable) NSString *pluginVersion;

@property (nonatomic, strong, readonly) ALSdkSettings *settings;
@property (nonatomic, strong, readonly, nullable) ALUserSegment *userSegment;
@property (nonatomic, strong, readonly, nullable) ALTargetingData *targetingData;

@property (nonatomic, copy, readonly) NSArray<NSString *> *testDeviceAdvertisingIdentifiers;
@property (nonatomic, copy, readonly) NSArray<NSString *> *adUnitIdentifiers;

@property (nonatomic, assign, readonly, getter=isExceptionHandlerEnabled) BOOL exceptionHandlerEnabled;

#pragma mark - Initialization

+ (instancetype)configurationWithSdkKey:(NSString *)sdkKey builderBlock:(NS_NOESCAPE ALSdkInitializationConfigurationBuilderBlock)builderBlock;

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;
@end

#pragma mark - ALSdkInitializationConfiguration Builder

/**
 * Builder class used to create an ALSdkInitializationConfiguration object.
 * This class contains configurable properties and settings for the initialization of the AppLovin SDK.
 */
@interface ALSdkInitializationConfigurationBuilder : NSObject

/**
 * Set the SDK key for the AppLovin SDK.
 */
@property (nonatomic, copy, readonly) NSString *sdkKey;

/**
 * The mediation provider. Set this either by using one of the provided strings in ALMediationProvider.h, or your own string if you do not find an
 * applicable one there.
 */
@property (nonatomic, copy, nullable) NSString *mediationProvider;

/**
 * Sets the plugin version for the mediation adapter or plugin.
 */
@property (nonatomic, copy, nullable) NSString *pluginVersion;

/**
 * The settings object for the AppLovinSDK to initialize with. Note: its properties are mutable and may be modified after initialization.
 */
@property (nonatomic, strong, readonly) ALSdkSettings *settings;

/**
 * A user segment allows AppLovin to serve ads by using custom-defined rules that are based on which segment the user is in. The user segment is a custom string
 * of 32 alphanumeric characters or less.
 */
@property (nonatomic, strong, nullable) ALUserSegment *userSegment;

/**
 * A class which allows you to send any demographic or interest-based targeting data.
 */
@property (nonatomic, strong, nullable) ALTargetingData *targetingData;

/**
 * Enable devices to receive test ads by passing in the advertising identifier (IDFA or IDFV) of each test device.
 * Refer to AppLovin logs for the IDFA or IDFV of your current device.
 */
@property (nonatomic, copy) NSArray<NSString *> *testDeviceAdvertisingIdentifiers;

/**
 * The MAX ad unit IDs that you will use for this instance of the SDK. This initializes third-party SDKs with the credentials configured for these ad unit IDs.
 */
@property (nonatomic, copy) NSArray<NSString *> *adUnitIdentifiers;

/**
 * Whether or not the AppLovin SDK listens to exceptions. Defaults to @c YES.
 */
@property (nonatomic, assign) BOOL exceptionHandlerEnabled;

- (instancetype)init NS_UNAVAILABLE;
+ (instancetype)new NS_UNAVAILABLE;
@end

NS_ASSUME_NONNULL_END
