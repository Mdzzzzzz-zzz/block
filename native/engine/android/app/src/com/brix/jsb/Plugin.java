package com.brix.jsb;

import android.app.Application;
import android.util.Log;
import android.view.View;

import com.cocos.lib.CocosActivity;

import org.json.JSONException;
import org.json.JSONObject;

public class Plugin {

    private static final String TAG = "[Plugin]";

    protected CocosActivity mActivity = null;

    public Plugin() {

    }

    public CocosActivity getActivity() {
        return mActivity;
    }

    protected void initPlugin(CocosActivity activity) {
        mActivity = activity;
    }

    protected void onResume() {

    }

    protected void onPause() {

    }

    protected void onDestroy() {

    }

    protected void onStart() {

    }

    protected void onStop() {

    }

    protected void onRestart() {

    }

    public void emitWindowEvent(final String event) {
        this.emitWindowEvent(event, new JSONObject());
    }


    public void emitWindowEvent(final String event, final JSONObject data) {
        JsbCall.emitWindowEvent(event, data);
    }

    public View getView() {
        Log.d(TAG, "getView: ");
        return this.getActivity().findViewById(android.R.id.content);
    }

    public Application getApplication(){
        return  this.getActivity().getApplication();
    }

    public boolean exec(final String action, final JSONObject args, final CallbackContext callbackContext) throws JSONException {
        return false;
    }

}
