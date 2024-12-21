package com.brix.jsb.plugins;

import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import com.cocos.game.AppActivity;

import org.json.JSONException;
import org.json.JSONObject;

public class SplashPlugin extends Plugin {
    @Override
    public boolean exec(String action, JSONObject args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "show":
                AppActivity.showSplash();
                callbackContext.success("");
                return true;
            case "hide":
                AppActivity.hideSplash();
                callbackContext.success("");
                return true;
            default:
                return super.exec(action, args, callbackContext);
        }
    }
}
