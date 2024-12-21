package com.brix.utils;

import android.util.Log;

import com.appsflyer.AppsFlyerLib;
//import com.barton.log.GASDKFactory;
//import com.barton.log.builder.GAConfiguration;
//import com.barton.log.builder.ParamsBuilder;
//import com.barton.log.ebarton.BaseUrl;
//import com.barton.log.logapi.IGASDK;
import com.brix.jsb.CallbackContext;
import com.brix.jsb.Plugin;
import com.cocos.lib.CocosActivity;
import com.google.gson.Gson;
import com.tencent.bugly.crashreport.CrashReport;
//import com.tuyoo.alonesdk.AloneConfig;
//import com.tuyoo.alonesdk.AloneSdk;
//import com.tuyoo.alonesdk.Callback;
//import com.tuyoo.alonesdk.Response;
//import com.tuyoo.alonesdk.RspCode;
//import com.tuyoo.alonesdk.internal.TuYooClientID;
//import com.tuyoo.alonesdk.internal.data.info.LoginInfo;
//import com.tuyoo.alonesdk.login.IdentityInfo;
//import com.tuyoo.growsdk.params.FirebaseParams;
//import com.tuyoo.pushbase.PushSDKManager;
//import com.tuyoo.pushbase.params.PushEnum;
//import com.tuyoo.pushbase.params.PushParams;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;


public class LoginSDK extends Plugin {
    private static final String TAG = "[LoginSDK]";

//    public static IGASDK galogsdk = null;

    public static String appsFlyerId = "";

    private static Boolean uploadUser = false;

    String clientId = "Android_5.0_tyGuest,facebook.googleplay.0-hall20536.googleplay.blockPuzzle";
    String appId = "20536";
    String projectId = "20536";
    String cloudId = "121";
    String server = "https://121-block-app-online01.blockmasterbraingames.com";

    @Override
    public void initPlugin(CocosActivity activity) {
        super.initPlugin(activity);
//        GAConfiguration build = new GAConfiguration.Builder()
//                .withContext(activity)                  //当前的application对象
//                .withBaseUrl(BaseUrl.INTERNATIONAL)      //上报的url INTERNAL为国内 INTERNATIONAL为海外
//                .withProjectId(projectId)         //项目的projectId
//                .withClientId(clientId)               //项目的clientId
//                .withGameId(appId)        //当前项目的gameId
//                // .withCommonParams("sdk_common_propertiesk1", "commonPropertiesv1")      //公共参数，在这儿设置后后续每次上报都会带上该参数。
//                .build();
//
//        galogsdk = GASDKFactory.createGASDK(build);     //初始化
//
//        AloneConfig configs = AloneSdk.getConfigs();
//        configs.setAppId(appId);    //设置应用的appId
//        configs.setClientId(clientId);    //设置应用的clientId
//        configs.setServer(server);    //设置服务器域名
//        configs.setLogEnable(false);    //设置本地日志开关（上线需关闭，避免影响性能）
//        configs.setBiLogEnable(false); //设置BI日志上报开关（上线需打开，避免缺少打点影响分析）
        AppsFlyerLib.getInstance().setDebugLog(false);
        appsFlyerId = AppsFlyerLib.getInstance().getAppsFlyerUID(activity);
        this.initPushSDK();
    }

    private void initPushSDK() {
//        Log.d(TAG, "init Push SDK::start");
//        FirebaseParams firebaseParams = new FirebaseParams("block-master-brain-puzzles");
//        PushParams pushBuild = new PushParams.builder()
//                .withLogEnable(false)  //上线、提测前务必设置为false
//                .withClientId(clientId)
//                .withGameId(appId)
//                .withCloudId(cloudId)
//                .withAppId(appId)
//                .withProject(appId)
//                .withPushChannelParams(firebaseParams)
//                .withPush(PushEnum.UPUSH)
//                .build();
//        PushSDKManager.getInstance().init(getActivity(), pushBuild);
//        Log.d(TAG, "init Push SDK::end");
    }

    @Override
    public boolean exec(String action, JSONObject args, final CallbackContext callback) throws JSONException {
        if (action.equals("login")) {
            this.login(args, callback);
            return true;
        }
        else if (action.equals("reportBI")) {
            this.reportBI(args, callback);
        }
        else if (action.equals("localUserId")) {
            String localUserId = args.optString("localUserId");
//            galogsdk.setUserId(localUserId);
            reportAF(localUserId);
            return true;
        }
        return super.exec(action, args, callback);
    }

    void login(JSONObject args, final CallbackContext _callback) throws JSONException {
//        AloneSdk.getAloneApi().getIdentity(TuYooClientID.tyGuest, null, new Callback<IdentityInfo>() {
//            @Override
//            public void call(int code, Response<IdentityInfo> response) {
//                if (code == Callback.OPERATION_OK && response.code == RspCode.GET_IDENTITY_OK) {
//                    Log.d(TAG, response.data.toString());
//                    AloneSdk.getAloneApi().loginByIdentity(response.data, new Callback<LoginInfo>() {
//                        @Override
//                        public void call(int loginCode, Response<LoginInfo> loginResponse) {
//                            if (loginCode == Callback.OPERATION_OK && null != loginResponse && loginResponse.code == RspCode.SUCCESS) {
//                                JSONObject result = new JSONObject();
//                                try {
//                                    result.put("userId", loginResponse.data.userId);
//                                } catch (JSONException e) {
//                                    e.printStackTrace();
//                                }
//                                try {
//                                    result.put("authorCode", loginResponse.data.authorCode);
//                                } catch (JSONException e) {
//                                    e.printStackTrace();
//                                }
//
//                                _callback.success(result.toString());
//                                reportAF(loginResponse.data.userId);
//                            }
//                            assert loginResponse != null;
//                            if (loginCode == Callback.OPERATION_FAILED || loginResponse.code == RspCode.FAILED) {
//                                _callback.failure(loginResponse.msg);
//                            }
//                            if (loginCode == Callback.OPERATION_CANCEL) {
//                                _callback.failure(loginResponse.msg);
//                            }
//                        }
//                    });
//                } else {
//                    _callback.failure(response.msg);
//                }
//            }
//        });
    }

    void reportBI(JSONObject args, final CallbackContext _callback) throws JSONException {
        String eventIdStr = args.optString("eventId");
//        if(eventIdStr.equals("agree_policy"))
//        {
//            galogsdk.userAgreePrivacy();
//        }
        JSONObject params = args.getJSONObject("params");
        Map<String, String> paramsMap = new Gson().fromJson(params.toString(), Map.class);
        Log.d(TAG, "report_bi:: " + eventIdStr);
//        galogsdk.track(eventIdStr, ParamsBuilder.newInstance().append(paramsMap));
        Map<String, Object> paramsMap2 = new Gson().fromJson(params.toString(), Map.class);
        AppsFlyerLib.getInstance().logEvent(mActivity, eventIdStr, paramsMap2);
    }

    void reportAF(String userId) {
        if (uploadUser && !userId.isEmpty()) {
            Log.d(TAG, "af_report::again return");
            return;
        }

        uploadUser = true;
        Log.d(TAG, "af_report::start" + userId + " " + appsFlyerId);
        Log.d(TAG, "Push sdk set userId::start " + userId);
//        PushSDKManager.getInstance().setUserId(userId);
//
//        galogsdk.setUserId(userId);
        AppsFlyerLib.getInstance().setCustomerUserId(userId);
//        galogsdk.track("af_report", ParamsBuilder.newInstance()
//                .append("af_device_id", appsFlyerId));
        Log.d(TAG, "af_report::end" + userId);

        CrashReport.setUserId(userId);
    }
}
