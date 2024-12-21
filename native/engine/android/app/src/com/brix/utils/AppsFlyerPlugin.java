package com.brix.utils;

import android.util.Log;

import com.appsflyer.AFInAppEventParameterName;
import com.appsflyer.AFInAppEventType;
import com.appsflyer.AppsFlyerConversionListener;
import com.appsflyer.AppsFlyerLib;
import com.appsflyer.adrevenue.AppsFlyerAdRevenue;
import com.appsflyer.attribution.AppsFlyerRequestListener;
import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import com.cocos.lib.CocosActivity;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.gson.Gson;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


public class AppsFlyerPlugin extends Plugin {

    private static final String TAG = "[AppsFlyerPlugin]";

    private static final String AF_DEV_KEY = "rSySeWtvKabfbPZE7Lmx7C";

    public static CocosActivity mActivity;

    @Override
    public boolean exec(String action, JSONObject args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("report")) {
            String eventId = args.getString("eventId");
            JSONObject eventData = args.getJSONObject("eventData");
            logEvent(eventId, eventData);
            return true;
        } else if (action.equals("login")) {
            String userId = args.getString("userId");
            if (userId.isEmpty()) {
                Log.e(TAG, "error userId:" + userId);
            } else {
                AppsFlyerLib.getInstance().setCustomerUserId(userId);
            }
        }
        return super.exec(action, args, callbackContext);
    }

    @Override
    public void initPlugin(CocosActivity activity) {
        super.initPlugin(activity);
        mActivity = activity;
        Log.d(TAG, "AppsFlyerPlugin::init ");

        AppsFlyerConversionListener conversionDataListener =
                new AppsFlyerConversionListener() {

                    @Override
                    public void onConversionDataSuccess(Map<String, Object> map) {
                        Log.d(TAG, "success onConversionDataSuccess : ");
                    }

                    @Override
                    public void onConversionDataFail(String s) {
                        Log.d(TAG, "success onConversionDataFail : ");
                    }

                    @Override
                    public void onAppOpenAttribution(Map<String, String> conversionData) {
                        try {
                            JSONObject jsonObj = new JSONObject(conversionData);
                            Log.d(TAG, "success onAppOpenAttribution : " + jsonObj.toString());
                        } catch (Exception e) {
                            Log.d(TAG, "error onAppOpenAttribution : " + e);
                        }
                    }

                    @Override
                    public void onAttributionFailure(String errorMessage) {
                        Log.d(TAG, "error onAttributionFailure : " + errorMessage);
                    }
                };

        AppsFlyerLib.getInstance().setDebugLog(false);
        AppsFlyerLib.getInstance().init(AF_DEV_KEY, conversionDataListener, activity);
        AppsFlyerLib.getInstance().start(activity, AF_DEV_KEY, new AppsFlyerRequestListener() {
            @Override
            public void onSuccess() {
                Log.d(TAG, "Launch sent successfully, got 200 response code from server");
            }

            @Override
            public void onError(int i, String s) {
                Log.d(TAG, "Launch failed to be sent:\n" +
                        "Error code: " + i + "\n"
                        + "Error description: " + s);
            }
        });
        if(GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(activity) == ConnectionResult.SUCCESS){
            AppsFlyerAdRevenue.Builder afRevenueBuilder = new AppsFlyerAdRevenue.Builder(activity.getApplication());
            AppsFlyerAdRevenue.initialize(afRevenueBuilder.build());
        }
    }

    public static void logEvent(String eventId, JSONObject jsonObject) {
        Map<String, Object> eventValues = new HashMap<>();
        Iterator<String> keys = jsonObject.keys();
        while (keys.hasNext()) {
            String key = keys.next();
            try {
                Object value = jsonObject.get(key);
                eventValues.put(key, value);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        AppsFlyerLib.getInstance().logEvent(mActivity, eventId, eventValues);
    }

    public static void reportEvent(String eventId, Map<String, Object> eventValues) {
//        Map<String, Object> eventValues = new HashMap<String, Object>();
//        eventValues.put(AFInAppEventParameterName.PRICE, 1234.56);
//        eventValues.put(AFInAppEventParameterName.CONTENT_ID,"1234567");

        AppsFlyerLib.getInstance().logEvent(mActivity, eventId, eventValues);
    }
}
