package com.brix.jsb.plugins.ads;

import android.content.Context;
import android.os.Handler;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

import com.applovin.mediation.MaxAd;
import com.applovin.mediation.MaxAdFormat;
import com.applovin.mediation.MaxAdListener;
import com.applovin.mediation.MaxAdRevenueListener;
import com.applovin.mediation.MaxAdViewAdListener;
import com.applovin.mediation.MaxError;
import com.applovin.mediation.MaxReward;
import com.applovin.mediation.MaxRewardedAdListener;
import com.applovin.mediation.ads.MaxAdView;
import com.applovin.mediation.ads.MaxInterstitialAd;
import com.applovin.mediation.ads.MaxRewardedAd;
import com.applovin.sdk.AppLovinSdk;
import com.applovin.sdk.AppLovinSdkConfiguration;
import com.applovin.sdk.AppLovinSdkUtils;
import com.appsflyer.AppsFlyerLib;
import com.appsflyer.adrevenue.AppsFlyerAdRevenue;
import com.appsflyer.adrevenue.adnetworks.generic.MediationNetwork;
import com.appsflyer.adrevenue.adnetworks.generic.Scheme;
import com.brix.jsb.Plugin;
import com.brix.jsb.CallbackContext;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

import java.util.Currency;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.TimeUnit;


public class AdMaxPlugin extends Plugin implements MaxAdRevenueListener {
    private final String FALLBACK_USER_ID = "userId";

    private static final String TAG = "[AdMaxPlugin]";

    private static final String EVENT_INTERSTITIAL_LOADED = "interstitialLoaded";
    private static final String EVENT_INTERSTITIAL_SHOWN = "interstitialShown";
    private static final String EVENT_INTERSTITIAL_SHOW_FAILED = "interstitialShowFailed";
    private static final String EVENT_INTERSTITIAL_CLICKED = "interstitialClicked";
    private static final String EVENT_INTERSTITIAL_CLOSED = "interstitialClosed";
    private static final String EVENT_INTERSTITIAL_WILL_OPEN = "interstitialWillOpen";
    private static final String EVENT_INTERSTITIAL_FAILED_TO_LOAD = "interstitialFailedToLoad";

    private static final String EVENT_OFFERWALL_CLOSED = "offerwallClosed";
    private static final String EVENT_OFFERWALL_CREDIT_FAILED = "offerwallCreditFailed";
    private static final String EVENT_OFFERWALL_CREDITED = "offerwallCreditReceived";
    private static final String EVENT_OFFERWALL_SHOW_FAILED = "offerwallShowFailed";
    private static final String EVENT_OFFERWALL_SHOWN = "offerwallShown";
    private static final String EVENT_OFFERWALL_AVAILABILITY_CHANGED = "offerwallAvailabilityChanged";

    private static final String EVENT_REWARDED_VIDEO_FAILED = "rewardedVideoFailed";
    private static final String EVENT_REWARDED_VIDEO_REWARDED = "rewardedVideoRewardReceived";
    private static final String EVENT_REWARDED_VIDEO_ENDED = "rewardedVideoEnded";
    private static final String EVENT_REWARDED_VIDEO_STARTED = "rewardedVideoStarted";
    private static final String EVENT_REWARDED_VIDEO_AVAILABILITY_CHANGED = "rewardedVideoAvailabilityChanged";
    private static final String EVENT_REWARDED_VIDEO_CLOSED = "rewardedVideoClosed";
    private static final String EVENT_REWARDED_VIDEO_OPENED = "rewardedVideoOpened";
    private static final String EVENT_REWARDED_VIDEO_LOAD_FAILED = "rewardedVideoLoadFailed";

    private static final String EVENT_BANNER_DID_LOAD = "bannerDidLoad";
    private static final String EVENT_BANNER_FAILED_TO_LOAD = "bannerFailedToLoad";
    private static final String EVENT_BANNER_DID_CLICK = "bannerDidClick";
    private static final String EVENT_BANNER_WILL_PRESENT_SCREEN = "bannerWillPresentScreen";
    private static final String EVENT_BANNER_DID_DISMISS_SCREEN = "bannerDidDismissScreen";
    private static final String EVENT_BANNER_WILL_LEAVE_APPLICATION = "bannerWillLeaveApplication";
    protected boolean autoShowBanner = true;

    @Override
    public boolean exec(String action, JSONObject args, final CallbackContext callbackContext) throws JSONException {
//        Log.d(TAG, "exec: ");
        switch (action) {
            case "init":
                this.initAction(args, callbackContext);
                return true;
            case "setDynamicUserId":
                this.setDynamicUserIdAction(args, callbackContext);
                return true;
            case "setConsent":
                this.setConsentAction(args, callbackContext);
                return true;
            case "validateIntegration":
                // this.validateIntegrationAction(args, callbackContext);
                return true;
            case "showRewardedVideo":
                this.showRewardedVideoAction(args, callbackContext);
                return true;
            case "loadRewardedVideo":
                this.loadRewardedVideoAction(args, callbackContext);
                return true;
            case "hasRewardedVideo":
                this.hasRewardedVideoAction(args, callbackContext);
                return true;
            case "isRewardedVideoCappedForPlacement":
                this.isRewardedVideoCappedForPlacementAction(args, callbackContext);
                return true;
            case "loadBanner":
                this.loadBannerAction(args, callbackContext);
                return true;
            case "showBanner":
                this.showBannerAction(args, callbackContext);
                return true;
            case "hideBanner":
                this.hideBannerAction(args, callbackContext);
                return true;
            case "hasOfferwall":
//                this.hasOfferwallAction(args, callbackContext);
                return true;
            case "showOfferwall":
//                this.showOfferwallAction(args, callbackContext);
                return true;
            case "loadInterstitial":
                this.loadInterstitialAction(args, callbackContext);
                return true;
            case "hasInterstitial":
                this.hasInterstitialAction(args, callbackContext);
                return true;
            case "showInterstitial":
                this.showInterstitialAction(args, callbackContext);
                return true;
            default:
                return super.exec(action, args, callbackContext);
        }
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
    protected void onPause() {
        super.onPause();
//        IronSource.onPause(this.getActivity());
    }

    @Override
    protected void onRestart() {
        super.onRestart();
    }

    @Override
    protected void onResume() {
        super.onResume();
//        IronSource.onResume(this.getActivity());
    }

//    @Override
//    protected void onStart() {
//        super.onStart();
//    }
//
//    @Override
//    protected void onStop() {
//        super.onStop();
//    }

    /**
     * ----------------------- UTILS ---------------------------
     */

    private JSONObject createErrorJSON(MaxError ironSourceError) {
        JSONObject data = new JSONObject();
        JSONObject errorData = new JSONObject();
        try {
            errorData.put("code", ironSourceError.getCode());
            errorData.put("message", ironSourceError.getMessage());
            data.put("error", errorData);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return data;
    }


    /** ----------------------- INITIALIZATION --------------------------- */

    /**
     * Intilization action Initializes IronSource
     */
    private void initAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        // Log.d(TAG, "initAction: " + args.toString());
//        final String appKey = args.getString("appKey");
//        final String providedUserId = args.getString("providedUserId");
        final String rewardAdUnitID = args.getString("rewardAdUnitID");
        final String bannerAdUnitID = args.getString("bannerAdUnitID");
        final String insertAdUnitID = args.getString("insertAdUnitID");
        final String userId = args.getString("userId");
        Context context = this.getActivity().getApplicationContext();
        AppLovinSdk adSdk = AppLovinSdk.getInstance(context);
        if (adSdk == null || adSdk.isInitialized()) {
            return;
        }
        AppLovinSdk.getInstance(context).setMediationProvider("max");
        AppLovinSdk.getInstance(context).setUserIdentifier(userId);
        AppLovinSdk.initializeSdk(context, new AppLovinSdk.SdkInitializationListener() {
            @Override
            public void onSdkInitialized(final AppLovinSdkConfiguration configuration) {
                // AppLovin SDK is initialized, start loading ads
                init(rewardAdUnitID, bannerAdUnitID, insertAdUnitID);
                callbackContext.success("");
                // Log.d(TAG, "initAction: success....");
            }
        });
        // Log.d(TAG, "initAction: end....");
    }

    /**
     * Initializes IronSource
     *
     * @todo Provide
     */
    private void init(String rewardAdUnitID, String bannerAdUnitID, String insertAdUnitID) {

        this.initRewardAd(rewardAdUnitID);
        this.initInserstitialAd(insertAdUnitID);
        this.initBannerAd(bannerAdUnitID);


        // set the IronSource offerwall listener
//        IronSource.setOfferwallListener(this);

        // set the IronSource interstitial listener;


        // set client side callbacks for the offerwall
//        SupersonicConfig.getConfigObj().setClientSideCallbacks(true);

        // Set user id
//        IronSource.setUserId(userId);

        // init the IronSource SDK
//        IronSource.init(this.getActivity(), appKey);
//        IronSource.init(this.getActivity(), appKey, IronSource.AD_UNIT.REWARDED_VIDEO, IronSource.AD_UNIT.INTERSTITIAL, IronSource.AD_UNIT.BANNER);
        //Init Interstitial
//        IronSource.init(this.getActivity(), appKey, IronSource.AD_UNIT.INTERSTITIAL);
//        //Init Offerwall
//        IronSource.init(this.getActivity(), appKey, IronSource.AD_UNIT.OFFERWALL);
//        //Init Banner
//        IronSource.init(this.getActivity(), appKey,IronSource.AD_UNIT.BANNER);
//        if (isDebug) {
//            IronSource.setAdaptersDebug(true);
//        }
        // Log.d(TAG, "init: end .....");
    }

    /**
     * ----------------------- SET DYNAMIC USER ID ---------------------------
     */

    private void setDynamicUserIdAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {

        final String userId = args.getString("userId");

        this.getActivity().runOnUiThread(new Runnable() {
            public void run() {
//                IronSource.setDynamicUserId(userId);
                callbackContext.success("");
            }
        });
    }

    /**
     * ----------------------- SET CONSENT ---------------------------
     */

    private void setConsentAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {

        final boolean consent = args.getBoolean("consent");

        this.getActivity().runOnUiThread(new Runnable() {
            public void run() {
//                IronSource.setConsent(consent);
                callbackContext.success("");
            }
        });
    }

    /**
     * ----------------------- VALIDATION INTEGRATION ---------------------------
     */

    /**
     * Validates integration action release 不需要验证！
     */
    private void validateIntegrationAction(JSONObject args, final CallbackContext callbackContext) {
        final AdMaxPlugin self = this;
        this.getActivity().runOnUiThread(new Runnable() {
            public void run() {
//                IntegrationHelper.validateIntegration(self.getActivity());
                callbackContext.success("");
            }
        });
    }

    /**
     * ----------------------- REWARDED VIDEO ---------------------------
     */
    private MaxRewardedAd rewardedAd;
    private int retryRewardAttempt;

    private void initRewardAd(String rewardAdUnitID) {
        if (rewardedAd == null) {
            rewardedAd = MaxRewardedAd.getInstance(rewardAdUnitID, this.getActivity());
            rewardedAd.setListener(new MaxRewardedAdListener() {
                @Override
                public void onUserRewarded(MaxAd maxAd, MaxReward maxReward) {
                    String rewardName = maxReward.getLabel();
                    int rewardAmount = maxReward.getAmount();
                    JSONObject placementData = new JSONObject();
                    try {
                        placementData.put("name", maxAd.getPlacement());
                        placementData.put("reward", rewardName);
                        placementData.put("amount", rewardAmount);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    JSONObject data = new JSONObject();
                    try {
                        data.put("placement", placementData);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    emitWindowEvent(EVENT_REWARDED_VIDEO_REWARDED, data);
                }

                @Override
                public void onRewardedVideoStarted(MaxAd maxAd) {

                }

                @Override
                public void onRewardedVideoCompleted(MaxAd maxAd) {

                }

                @Override
                public void onAdLoaded(MaxAd maxAd) {
                    retryRewardAttempt = 0;
                    JSONObject data = new JSONObject();
                    try {
                        data.put("available", true);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    Log.d("onAdLoaded", "loaded");
                    emitWindowEvent(EVENT_REWARDED_VIDEO_AVAILABILITY_CHANGED, data);
                }

                @Override
                public void onAdDisplayed(MaxAd maxAd) {
                    emitWindowEvent(EVENT_REWARDED_VIDEO_OPENED, new JSONObject());
                }

                @Override
                public void onAdHidden(MaxAd maxAd) {
                    emitWindowEvent(EVENT_REWARDED_VIDEO_CLOSED, new JSONObject());
                    rewardedAd.loadAd();
                }

                @Override
                public void onAdClicked(MaxAd maxAd) {

                }

                @Override
                public void onAdLoadFailed(String s, MaxError maxError) {
                    emitWindowEvent(EVENT_REWARDED_VIDEO_LOAD_FAILED, createErrorJSON(maxError));
                    retryRewardAttempt++;
                    long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(6, retryRewardAttempt)));
                    new Handler().postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            rewardedAd.loadAd();
                        }
                    }, delayMillis);
                }

                @Override
                public void onAdDisplayFailed(MaxAd maxAd, MaxError maxError) {
                    emitWindowEvent(EVENT_REWARDED_VIDEO_FAILED, createErrorJSON(maxError));
                    rewardedAd.loadAd();
                }
            });
            rewardedAd.setRevenueListener(this);
            rewardedAd.loadAd();
        }
    }

    private void loadRewardedVideoAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        if (rewardedAd == null) {
            callbackContext.failure("");
            return;
        }
        if (rewardedAd.isReady()) {
            callbackContext.success("");
            return;
        }
        rewardedAd.loadAd();
        callbackContext.success("");
    }

    private void showRewardedVideoAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        if (rewardedAd == null || !rewardedAd.isReady()) {
            callbackContext.failure("");
            return;
        }
        this.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                rewardedAd.showAd();
                callbackContext.success("");
            }
        });
    }

    private void hasRewardedVideoAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        if (rewardedAd == null) {
            callbackContext.success("false");
            return;
        }
        boolean available = rewardedAd.isReady();
        callbackContext.success("" + available);
    }

    private void isRewardedVideoCappedForPlacementAction(JSONObject args, final CallbackContext callbackContext)
            throws JSONException {
        boolean capped = false;
        callbackContext.success("" + capped);
    }


    /**
     * ----------------------- INTERSTITIAL ---------------------------
     */

    private MaxInterstitialAd interstitialAd;
    private int retryInsertAttempt;

    private void initInserstitialAd(String insertAdUnitID) {
        interstitialAd = new MaxInterstitialAd(insertAdUnitID, this.getActivity());
        interstitialAd.setListener(new MaxAdListener() {
            // MAX Ad Listener
            @Override
            public void onAdLoaded(final MaxAd maxAd) {
                // Interstitial ad is ready to be shown. interstitialAd.isReady() will now return 'true'
                emitWindowEvent(EVENT_INTERSTITIAL_LOADED);
                // Reset retry attempt
                retryInsertAttempt = 0;
            }

            @Override
            public void onAdLoadFailed(final String adUnitId, final MaxError error) {
                // Interstitial ad failed to load
                // AppLovin recommends that you retry with exponentially higher delays up to a maximum delay (in this case 64 seconds)
                emitWindowEvent(EVENT_INTERSTITIAL_FAILED_TO_LOAD, createErrorJSON(error));
                retryInsertAttempt++;
                long delayMillis = TimeUnit.SECONDS.toMillis((long) Math.pow(2, Math.min(6, retryInsertAttempt)));

                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        interstitialAd.loadAd();
                    }
                }, delayMillis);
            }

            @Override
            public void onAdDisplayFailed(final MaxAd maxAd, final MaxError error) {
                // Interstitial ad failed to display. AppLovin recommends that you load the next ad.
                emitWindowEvent(EVENT_INTERSTITIAL_SHOW_FAILED, createErrorJSON(error));
                interstitialAd.loadAd();
            }

            @Override
            public void onAdDisplayed(final MaxAd maxAd) {
                emitWindowEvent(EVENT_INTERSTITIAL_SHOWN, new JSONObject());
            }

            @Override
            public void onAdClicked(final MaxAd maxAd) {
                emitWindowEvent(EVENT_INTERSTITIAL_CLICKED, new JSONObject());
            }

            @Override
            public void onAdHidden(final MaxAd maxAd) {
                // Interstitial ad is hidden. Pre-load the next ad
                emitWindowEvent(EVENT_INTERSTITIAL_CLOSED, new JSONObject());
                interstitialAd.loadAd();
            }
        });
        interstitialAd.setRevenueListener(this);
        interstitialAd.loadAd();
    }

    private void hasInterstitialAction(JSONObject args, final CallbackContext callbackContext) {
        if (interstitialAd == null) {
            callbackContext.success("false");
            return;
        }
        boolean ready = interstitialAd.isReady();
        callbackContext.success(ready + "");
    }

    private void loadInterstitialAction(JSONObject args, final CallbackContext callbackContext) {
        if (interstitialAd == null) {
            callbackContext.failure("");
            return;
        }
        if (interstitialAd.isReady()) {
            callbackContext.success("");
            return;
        }
        interstitialAd.loadAd();
        callbackContext.success("");
    }

    private void showInterstitialAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        if (interstitialAd == null) {
            callbackContext.failure("");
            return;
        }
        this.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                if (interstitialAd.isReady()) {
                    interstitialAd.showAd();
                }
                callbackContext.success("");
            }
        });

    }

    /**
     * ----------------------- BANNER ---------------------------
     */

    private MaxAdView adView;

    private void initBannerAd(String bannerAdUnitID) {
        if (adView == null) {
            adView = new MaxAdView(bannerAdUnitID, this.getActivity());
            adView.setListener(new MaxAdViewAdListener() {
                // MAX Ad Listener
                @Override
                public void onAdLoaded(final MaxAd maxAd) {
                    emitWindowEvent(EVENT_BANNER_DID_LOAD);
                }

                @Override
                public void onAdLoadFailed(final String adUnitId, final MaxError error) {
                    emitWindowEvent(EVENT_BANNER_FAILED_TO_LOAD, createErrorJSON(error));
                }

                @Override
                public void onAdDisplayFailed(final MaxAd maxAd, final MaxError error) {
                }

                @Override
                public void onAdClicked(final MaxAd maxAd) {
                    emitWindowEvent(EVENT_BANNER_DID_CLICK);
                }

                @Override
                public void onAdExpanded(final MaxAd maxAd) {
                }

                @Override
                public void onAdCollapsed(final MaxAd maxAd) {
                }

                @Override
                public void onAdDisplayed(final MaxAd maxAd) { /* DO NOT USE - THIS IS RESERVED FOR FULLSCREEN ADS ONLY AND WILL BE REMOVED IN A FUTURE SDK RELEASE */ }

                @Override
                public void onAdHidden(final MaxAd maxAd) { /* DO NOT USE - THIS IS RESERVED FOR FULLSCREEN ADS ONLY AND WILL BE REMOVED IN A FUTURE SDK RELEASE */ }

            });
            adView.setRevenueListener(this);

            // Stretch to the width of the screen for banners to be fully functional
            int width = ViewGroup.LayoutParams.MATCH_PARENT;

            // Get the adaptive banner height.
            int heightDp = MaxAdFormat.BANNER.getAdaptiveSize(this.getActivity()).getHeight();
            int heightPx = AppLovinSdkUtils.dpToPx(this.getActivity(), heightDp);
            FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(width, heightPx);
            layoutParams.gravity = Gravity.BOTTOM;
            adView.setLayoutParams(layoutParams);
            adView.setGravity(Gravity.BOTTOM);
            adView.setExtraParameter("adaptive_banner", "true");
            adView.setLocalExtraParameter("adaptive_banner_width", 400);
            adView.getAdFormat().getAdaptiveSize(400, this.getActivity()).getHeight(); // Set your ad height to this value

            ViewGroup rootView = this.getActivity().findViewById(android.R.id.content);
            rootView.addView(adView);
        }
        // Load the ad
        adView.loadAd();
        hideBanner();
    }

    private void loadBannerAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "loadBannerAction: ");
        final AdMaxPlugin self = this;

        final String placement = args.getString("placement");
        final String size = args.getString("size");
        final String position = args.getString("position");
        adView.loadAd();
        callbackContext.success("");
    }

    private void showBannerAction(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "showBannerAction: ");
        final AdMaxPlugin self = this;
        this.getActivity().runOnUiThread(new Runnable() {

            public void run() {
                self.showBanner();
                callbackContext.success("");

            }
        });
    }

    /**
     * Destroys IronSource Banner and removes it from the container
     */
    private void hideBannerAction(JSONObject args, final CallbackContext callbackContext) {
        Log.d(TAG, "hideBannerAction: ");
        final AdMaxPlugin self = this;

        this.getActivity().runOnUiThread(new Runnable() {

            public void run() {
                self.hideBanner();
                callbackContext.success("");
            }
        });
    }

    private void hideBanner() {
        Log.d(TAG, "hideBanner: ");
        if (adView != null) {
            this.autoShowBanner = false;
            adView.setVisibility(View.INVISIBLE);
        }
    }

    private void showBanner() {
        Log.d(TAG, "showBanner: ");
        if (adView != null) {
            this.autoShowBanner = false;
            adView.setVisibility(View.VISIBLE);
        }
    }


    private int getPixelsFromDp(int size) {

        DisplayMetrics metrics = new DisplayMetrics();

        getActivity().getWindowManager().getDefaultDisplay().getMetrics(metrics);

        return (size * metrics.densityDpi) /
                DisplayMetrics.DENSITY_DEFAULT;
    }

    @Override
    public void onAdRevenuePaid(@NonNull MaxAd maxAd) {
        if(GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(mActivity) == ConnectionResult.SUCCESS){
            Map<String, String> customParams = new HashMap<>();
            String adUnitId = maxAd.getAdUnitId();
            String placement = maxAd.getPlacement();
            String networkPlacement = maxAd.getNetworkPlacement();
            String adReviewCreativeId = maxAd.getAdReviewCreativeId();

            customParams.put("ad_unit_identifier", adUnitId != null ? adUnitId : "");
            customParams.put(Scheme.PLACEMENT, placement != null ? placement : "");
            customParams.put("network_placement", networkPlacement != null ? networkPlacement : "");
            customParams.put("creative_identifier", adReviewCreativeId != null ? adReviewCreativeId : "");
            double adRevenue = maxAd.getRevenue();
            String revenue = String.format("%.2f", adRevenue);
            customParams.put("ad_revenue", revenue);
            AppsFlyerAdRevenue.logAdRevenue(maxAd.getNetworkName(), MediationNetwork.applovinmax, Currency.getInstance(Locale.US), maxAd.getRevenue(), customParams);
        }
    }
}
