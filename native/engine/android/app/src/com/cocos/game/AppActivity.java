/****************************************************************************
Copyright (c) 2015-2016 Chukong Technologies Inc.
Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.

http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
****************************************************************************/
package com.cocos.game;

import android.content.Context;
import android.os.Bundle;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.CountDownTimer;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageView;

import com.brix.jsb.JsbCall;
import com.brix.jsb.PluginManager;
import com.cocos.service.SDKWrapper;
import com.cocos.lib.CocosActivity;
import com.ty.world.blk.R;
//import com.tuyoo.alonesdk.AloneConfig;
//import com.tuyoo.alonesdk.AloneSdk;
//import com.tuyoo.pushbase.PushLifeCycle;

public class AppActivity extends CocosActivity {
    private static  CocosActivity cocosActivity;
    private static ImageView sSplashBgImageView = null;
    public static void showSplash() {
        sSplashBgImageView = new ImageView(cocosActivity);
        sSplashBgImageView.setImageResource(R.drawable.loading);
        sSplashBgImageView.setScaleType(ImageView.ScaleType.FIT_XY);
        cocosActivity.addContentView(sSplashBgImageView,
                new WindowManager.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,
                        FrameLayout.LayoutParams.MATCH_PARENT
                )
        );
    }

    public static void hideSplash() {
        cocosActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (sSplashBgImageView != null) {
                    sSplashBgImageView.setVisibility(View.GONE);
                }
            }
        });
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // DO OTHER INITIALIZATION BELOW
        SDKWrapper.shared().init(this);
//
//        AloneConfig configs = AloneSdk.getConfigs();
//        configs.setAppId("20536");	//设置应用的appId
//        configs.setClientId("Android_5.0_tyGuest,facebook.googleplay.0-hall20536.googleplay.blockPuzzle");	//设置应用的clientId
//        configs.setServer("https://app-yuanzuxiang-dev.tugameworld.com/");	//设置服务器域名
//        configs.setLogEnable(true);	//设置本地日志开关（上线需关闭，避免影响性能）
//        configs.setBiLogEnable(true); //设置BI日志上报开关（上线需打开，避免缺少打点影响分析）
//
//        AloneSdk.getActInjector().onCreate(this, savedInstanceState);
//        PushLifeCycle.getIns().onCreate(this);
//        JsbCall.init();
        PluginManager.getInstance().initPlugin(this);
        //显示一个splash
        cocosActivity = this;
        showSplash();

    }

    @Override
    protected void onResume() {
        super.onResume();
        SDKWrapper.shared().onResume();
//        AloneSdk.getActInjector().onResume(this);
        PluginManager.getInstance().onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        SDKWrapper.shared().onPause();
//        AloneSdk.getActInjector().onPause(this);
        PluginManager.getInstance().onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
        if (!isTaskRoot()) {
            return;
        }
        SDKWrapper.shared().onDestroy();
        PluginManager.getInstance().onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SDKWrapper.shared().onActivityResult(requestCode, resultCode, data);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        SDKWrapper.shared().onNewIntent(intent);
//        AloneSdk.getActInjector().onNewIntent(this, intent);
//        PushLifeCycle.getIns().onNewIntent(intent);
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        SDKWrapper.shared().onRestart();
//        AloneSdk.getActInjector().onRestart(this);
        PluginManager.getInstance().onRestart();
    }

    @Override
    protected void onStop() {
        super.onStop();
        SDKWrapper.shared().onStop();
//        AloneSdk.getActInjector().onStop(this);
        PluginManager.getInstance().onStop();
    }

    @Override
    public void onBackPressed() {
        SDKWrapper.shared().onBackPressed();
        super.onBackPressed();
//        AloneSdk.getActInjector().onBackPressed(this);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        SDKWrapper.shared().onConfigurationChanged(newConfig);
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        SDKWrapper.shared().onRestoreInstanceState(savedInstanceState);
        super.onRestoreInstanceState(savedInstanceState);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        SDKWrapper.shared().onSaveInstanceState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
    }

    @Override
    protected void onStart() {
        SDKWrapper.shared().onStart();
        super.onStart();
//        AloneSdk.getActInjector().onStart(this);
        PluginManager.getInstance().onStart();
    }

    @Override
    public void onLowMemory() {
        SDKWrapper.shared().onLowMemory();
        super.onLowMemory();
    }
}
