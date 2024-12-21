package com.brix.utils;

import android.content.Context;

import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import com.cocos.lib.CocosActivity;

import com.google.gson.Gson;
import com.tencent.bugly.crashreport.CrashReport;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

public class BuglyAgent extends Plugin {

    private static final String TAG = "[BuglyAgent]";

    private static final String APPID = "f41139e0a8";

    private static Context _context;

    @Override
    public boolean exec(String action, JSONObject args, final CallbackContext callback) throws JSONException {
        if (action.equals("putUserData")) {
            this.putUserData(args, callback);
            return true;
        }
        if (action.equals("deviceId")) {
            CrashReport.setDeviceId(_context, args.optString("deviceId"));
            return true;
        }

        if (action.equals("postException")) {
            this.postException(args, callback);
        }

        return super.exec(action, args, callback);
    }

    void putUserData(JSONObject args, final CallbackContext _callback) throws JSONException {
        String keyStr = args.optString("key");
        String valueStr = args.optString("value");
        CrashReport.putUserData(_context, keyStr, valueStr);
    }

    void postException(JSONObject args, final CallbackContext _callback) throws JSONException {
        int category = args.optInt("category");
        String name = args.optString("name");
        String reason = args.optString("reason");
        String stack = args.optString("stack");
        JSONObject extraInfo = args.getJSONObject("extraInfo");
        Map<String, String> extraInfoMap = new Gson().fromJson(extraInfo.toString(), Map.class);
        BuglyAgent.postException(category, name, reason, stack, extraInfoMap);
    }

    @Override
    public void initPlugin(CocosActivity activity) {
        _context = activity.getApplicationContext();
        CrashReport.initCrashReport(_context, APPID, false);
    }

    public static void postException(int category, String name, String reason, String stack) {
        postException(category, name, reason, stack, null);
    }

    public static void postException(int category, String name, String reason, String stack, Map<String, String> extraInfo) {
        CrashReport.postException(category, name, reason, stack, extraInfo);
    }
}