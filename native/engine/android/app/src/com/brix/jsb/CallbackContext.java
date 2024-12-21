package com.brix.jsb;

import org.json.JSONObject;

public class CallbackContext {

    private String mCallbackId = null;

    public CallbackContext(String callbackId) {
        mCallbackId = callbackId;
    }

    public void success(String params) {
        JsbCall.successCall(mCallbackId, params);
    }

    public void failure(String params) {
        JsbCall.failureCall(mCallbackId, params);
    }
    public void success(JSONObject obj){
        JsbCall.successCall(mCallbackId, obj.toString());
    }
    public void failure(JSONObject obj) {
        JsbCall.failureCall(mCallbackId, obj.toString());
    }
}
