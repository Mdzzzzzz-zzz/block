package com.brix.utils;

import android.util.Log;

import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;

import org.json.JSONException;
import org.json.JSONObject;

public class CXPlugin extends Plugin {
    private static final String TAG = "[CXPlugin]";

    @Override
    public boolean exec(String action, JSONObject args, final CallbackContext callback) throws JSONException {
        if (action.equals("funcName_test")) {
            funcTest(args, callback);
            return true;
        }
        return super.exec(action, args, callback);
    }

    private static void funcTest(JSONObject args, final CallbackContext callback) throws JSONException {
        String arg1 = args.optString("arg1");
        Log.d(TAG, "这是入参哦: " + arg1);
        callback.success(arg1);
    }

}
