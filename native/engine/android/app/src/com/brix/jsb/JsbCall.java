/*
 * @Date: 2024-02-26 10:53:25
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-02-27 14:00:39
 */
package com.brix.jsb;

import android.util.Log;

import com.cocos.lib.CocosHelper;
import com.cocos.lib.CocosJavascriptJavaBridge;
import com.cocos.lib.JsbBridge;

import org.json.JSONException;
import org.json.JSONObject;


public class JsbCall {

    static final private String TAG = "[JsbCall]";

    public static void exec(String service, String action, String params, String callbackId) {
        Log.d(TAG, "exec: " + service + " " + action + " " + params + " " + callbackId);
        final CallbackContext callbackContext = new CallbackContext(callbackId);
        try {
            JsbCall.exec(service, action, new JSONObject(params), callbackContext);
        } catch (JSONException e) {
            Log.e(TAG, "exec: e: ", e);
            callbackContext.failure(String.format("params to json or params error, params: %s", params));
        }
    }


    private static boolean exec(String service, String action, JSONObject args, final CallbackContext callbackContext) throws JSONException {
        return PluginManager.getInstance().exec(service, action, args, callbackContext);
    }

    public static void emitWindowEvent(final String event, final JSONObject data) {
        // Log.d(TAG, "emitWindowEvent: " + event + " data: " + data.toString());
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
//                String dataStr = "";
//                try{
//                   dataStr = URLEncoder.encode(data.toString(), "UTF-8");
//                }catch (UnsupportedEncodingException e){
//                    dataStr = "";
//                }
                String dataStr = "";

                String jsStr = String.format("window.JsbNativeCall.emitWindowEvent('%s', '%s')", event, dataStr);
                // Log.d(TAG, "emitWindowEvent: jsStr:" + jsStr);
                CocosJavascriptJavaBridge.evalString(jsStr);
            }
        });
    }
    public static void emitIapEvent(String eventName, JSONObject eventData) {
        Log.d(TAG, "emitWindowEvent[iap]: " + eventName + " data: " + eventData.toString());
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                String dataStr =eventData==null?"{}": eventData.toString();
                String jsStr = String.format("window.JsbNativeCall.emitWindowEvent('%s', '%s')", eventName, dataStr);
//                Log.d(TAG, "emitWindowEvent: jsStr:" + jsStr);
                CocosJavascriptJavaBridge.evalString(jsStr);
            }
        });
    }


    public static void successCall(final String callbackId, final String params) {
        Log.d(TAG, "successCall: " + callbackId + " params: " + params);
        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                // Log.d(TAG, "successCall: log....");
                String jsStr = String.format("window.JsbNativeCall.callBackCallSuccess('%s', '%s')", callbackId, params);
                // Log.d(TAG, "successCall: evalString: " + jsStr);
                CocosJavascriptJavaBridge.evalString(jsStr);
            }
        });
    }

    public static void failureCall(final String callbackId, final String params) {
        Log.d(TAG, "failureCall: " + callbackId + " params: " + params);

        CocosHelper.runOnGameThread(new Runnable() {
            @Override
            public void run() {
                String jsStr = String.format("window.JsbNativeCall.callBackCallFailure('%s', '%s')", callbackId, params);
                Log.d(TAG, "failureCall: evalString: " + jsStr);
                CocosJavascriptJavaBridge.evalString(jsStr);
            }
        });
    }
}
