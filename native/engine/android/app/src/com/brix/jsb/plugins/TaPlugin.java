/*
 * @Date: 2024-02-26 10:53:25
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2024-03-20 13:34:52
 */
package com.brix.jsb.plugins;

import android.text.TextUtils;
import android.util.Log;

import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import com.brix.utils.AppsFlyerPlugin;
import com.cocos.lib.CocosActivity;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import cn.thinkingdata.android.ThinkingAnalyticsSDK;

public class TaPlugin extends Plugin {
    private static final String TAG = "[TaPlugin]";
    private ThinkingAnalyticsSDK instance;
    @Override
    public boolean exec(String action, JSONObject args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "init":
                initAction(args,callbackContext);
                return true;
            case "login":
                login(args,callbackContext);
                return true;
            case "track":
                track(args,callbackContext);
                return true;
            default:
                return super.exec(action, args, callbackContext);
        }
    }
    @Override
    public void initPlugin(CocosActivity activity){
        final String appKey = "b4b7284580ba4c6f9eb7ee79276d4b8c";
        final String serverUrl = "https://122-slg-online01.qijihdhk.com:8991";

        List<ThinkingAnalyticsSDK.AutoTrackEventType> eventTypeList = new ArrayList<>();
        //APP安装事件
        eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_INSTALL);
        //APP启动事件
        eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_START);
        //APP关闭事件
        eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_END);
        eventTypeList.add(ThinkingAnalyticsSDK.AutoTrackEventType.APP_CRASH);
        //开启自动采集事件
        instance = ThinkingAnalyticsSDK.sharedInstance(activity.getApplication(), appKey, serverUrl);
        instance.enableAutoTrack(eventTypeList);

        //设置公共属性
        JSONObject superProperties = new JSONObject();
        try {
            superProperties.put("channel","gp");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        instance.setSuperProperties(superProperties);
        instance.track("af_create_activity", new JSONObject());
    }
    private void initAction(JSONObject args,CallbackContext callbackContext) throws JSONException {

        callbackContext.success("");
    }
    private void login(JSONObject args,CallbackContext callbackContext) throws JSONException {
        try {
            if(instance == null){
                Log.e(TAG, "track thinkingAnalyticsSDK is null!");
                return;
            }
            String userId = args.getString("userId");
            if(TextUtils.isEmpty(userId)){
                return;
            }
            instance.login(userId);
            callbackContext.success("");
        } catch (JSONException e) {
            Log.e(TAG, "track err:", e);
        }
    }
    private void track(JSONObject args,CallbackContext callbackContext) throws JSONException {
        try {
            if(instance == null){
                Log.e(TAG, "track thinkingAnalyticsSDK is null!");
                return;
            }
            String eventType = args.optString("eventId");
            // Log.i(TAG, "track:" + eventType);
            JSONObject params = args.getJSONObject("params");
            instance.track(eventType, params);

            // boolean logAf = args.optBoolean("logAf");
            // if(logAf){
            //     AppsFlyerPlugin.logEvent(eventType,params);
            // }

            callbackContext.success("");
        } catch (JSONException e) {
            Log.e(TAG, "track err:", e);
        }
    }
    private void setSuperProperties(JSONObject args,CallbackContext callbackContext) throws JSONException {
        instance.setSuperProperties(args);
    }
}
