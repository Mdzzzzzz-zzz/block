package com.brix.jsb;

import android.util.Log;

import com.brix.jsb.plugins.SplashPlugin;
import com.brix.jsb.plugins.TaPlugin;
import com.brix.jsb.plugins.ads.AdMaxPlugin;
import com.brix.jsb.plugins.iap.IapPlugin;
import com.brix.utils.AppsFlyerPlugin;
import com.brix.utils.BuglyAgent;
import com.brix.utils.CXPlugin;
import com.brix.utils.FirebaseMsg;
import com.brix.utils.LoginSDK;
import com.brix.utils.TToast;
import com.cocos.lib.CocosActivity;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class PluginManager {

    final private static String TAG = "[PluginManager]";

    private CocosActivity mActivity = null;
    private Map<String, Plugin> mPlugins = null;


    public static PluginManager mInstace = null;

    public static PluginManager getInstance() {
        if (null == mInstace) {
            mInstace = new PluginManager();
        }
        return mInstace;
    }


    public PluginManager() {
        Log.d(TAG, "PluginManager: ");
        mPlugins = new HashMap<String, Plugin>();
//        mPlugins.put("CXPlugin", new CXPlugin());
        mPlugins.put("LoginSDK", new LoginSDK());
        mPlugins.put("FireBase", new FirebaseMsg());
        mPlugins.put("AppsFlyer", new AppsFlyerPlugin());
        mPlugins.put("Bugly", new BuglyAgent());
//        mPlugins.put("IronsourcePlugin", new IronsourcePlugin());
        mPlugins.put("Toast",new TToast());
        mPlugins.put("Iap", new IapPlugin());
        mPlugins.put("AdMaxPlugin",new AdMaxPlugin());
        mPlugins.put("TaPlugin",new TaPlugin());
        mPlugins.put("SplashPlugin",new SplashPlugin());
    }

    public CocosActivity getActivity() {
        return mActivity;
    }

    //on Create 走两遍？
    private boolean isInit = false;
    public void initPlugin(CocosActivity activity) {
        Log.d(TAG, "init: ");
        mActivity = activity;
        if(isInit){
            return;
        }
        isInit = true;
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().initPlugin(activity);
        }
    }

    public void onResume() {
        Log.d(TAG, "onResume: ");
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onResume();
        }
    }

    public void onPause() {
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onPause();
        }
    }

    public void onDestroy() {
        Log.d(TAG, "onDestroy: ");
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onDestroy();

        }
    }

    public void onStart() {
        Log.d(TAG, "onStart: ");
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onStart();
        }
    }


    public void onStop() {
        Log.d(TAG, "onStop: ");
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onStop();
        }
    }

    public void onRestart() {
        Log.d(TAG, "onRestart: ");
        for (Map.Entry<String, Plugin> entry : mPlugins.entrySet()) {
            System.out.println("Key: " + entry.getKey() + " Value: " + entry.getValue());
            entry.getValue().onRestart();
        }
    }

    public boolean exec(final String service, final String action, final JSONObject args, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "exec: " + service + action);
        Plugin plugin = mPlugins.get(service);

        if (plugin != null) {
            return plugin.exec(action, args, callbackContext);
        } else {
            String msg = String.format("exec: unknown service: ", service);
            Log.e(TAG, msg);

            callbackContext.failure(msg);
            return false;
        }

    }
}
