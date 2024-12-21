package com.brix.utils;

import android.annotation.SuppressLint;
import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import org.json.JSONException;
import org.json.JSONObject;

public final class TToast extends Plugin {
    private Toast sToast;

    @Override
    public boolean exec(String action, JSONObject args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("show")){
            String content = args.getString("msg");
            boolean hasDuration = !args.isNull("duration");
            if(hasDuration){
                show(content,args.getInt("duration"));
                return true;
            }
            show(content);
            return true;
        }
        return super.exec(action, args, callbackContext);
    }

    public void show(String msg) {
        show(msg, Toast.LENGTH_SHORT);
    }

    public  void show(String msg, int duration) {
        mActivity.runOnUiThread(new Runnable() {
            public void run() {
                Toast toast = getToast(mActivity.getApplicationContext());
                if (toast != null) {
                    toast.setDuration(duration);
                    toast.setText(String.valueOf(msg));
                    toast.show();
                } else {
                    Log.i("TToast", "toast msg: " + String.valueOf(msg));
                }
            }
        });
    }

    @SuppressLint("ShowToast")
    private Toast getToast(Context context) {
        if (context == null) {
            return sToast;
        }
        if (sToast == null) {
            synchronized (TToast.class) {
                if (sToast == null) {
                    sToast = Toast.makeText(context.getApplicationContext(), "", Toast.LENGTH_SHORT);
                }
            }
        }
        return sToast;
    }

}
