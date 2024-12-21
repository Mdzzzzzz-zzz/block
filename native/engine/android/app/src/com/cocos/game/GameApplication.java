package com.cocos.game;

import android.app.Application;
import android.content.Context;
import android.content.res.Configuration;

//import androidx.multidex.MultiDexApplication;

//import com.barton.log.GASDKFactory;
//import com.tuyoo.alonesdk.AloneSdk;
//import com.tuyoo.pushbase.PushSDKManager;

public class GameApplication extends Application{

    @Override
    public void onCreate() {
        super.onCreate();
//        AloneSdk.getAppInjector().onCreate(this);
//        PushSDKManager.getInstance().applicationCreate(this);
//        GASDKFactory.onApplicationCreate(this);//Ga生命周期调用
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
//        AloneSdk.getAppInjector().onConfigurationChanged(newConfig);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
//        AloneSdk.getAppInjector().attachBaseContext(this, this);
    }
}
