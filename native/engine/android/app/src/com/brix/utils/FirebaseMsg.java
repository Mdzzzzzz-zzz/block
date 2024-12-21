package com.brix.utils;

import android.util.Log;

import com.brix.jsb.Plugin;
import com.cocos.lib.CocosActivity;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;


public class FirebaseMsg  extends Plugin {

    private static final String TAG = "[FirebaseMsg]";

    @Override
    public void initPlugin(CocosActivity activity) {
        Log.d(TAG, "FirebaseMessaging::init ");
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(new OnCompleteListener<String>() {
                    @Override
                    public void onComplete(Task<String> task) {
                        if (!task.isSuccessful()) {
                            Log.w(TAG, "Fetching FCM registration token failed", task.getException());
                            return;
                        }

                        // Get new FCM registration token
                        String token = task.getResult();
                        Log.d(TAG, "FirebaseMessaging::start " + token );
                    }
                });
    }
}
