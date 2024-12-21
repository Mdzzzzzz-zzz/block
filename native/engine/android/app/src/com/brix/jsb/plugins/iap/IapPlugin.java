package com.brix.jsb.plugins.iap;

import android.util.Log;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.AcknowledgePurchaseResponseListener;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.ConsumeResponseListener;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.ProductDetailsResponseListener;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchaseHistoryResponseListener;
import com.android.billingclient.api.PurchasesResponseListener;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchaseHistoryParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.SkuDetails;
import com.android.billingclient.api.SkuDetailsParams;
import com.android.billingclient.api.SkuDetailsResponseListener;
import com.brix.jsb.CallbackContext;
import com.brix.jsb.JsbCall;
import com.brix.jsb.Plugin;
import com.cocos.lib.CocosActivity;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.ArrayList;
import java.util.List;

public class IapPlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String TAG = "[IapPlugin]";
    private BillingClient billingClient;
    private BillingResult billingResult;
    private List<Purchase> purchases;

    private List<SkuDetails> inappSkuDetails;
    private List<SkuDetails> subsSkuDetails;
    private List<ProductDetails> inappProductDetails;

    @Override
    protected void initPlugin(CocosActivity activity) {
        super.initPlugin(activity);
        billingClient = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases()
                .build();
    }

    @Override
    protected void onResume() {
        queryPurchaseAsync();
    }

    @Override
    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
        this.billingResult = billingResult;
        this.purchases = purchases;
        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.OK
                && purchases != null) {
            for (Purchase purchase : purchases) {
                // Log.d(TAG, purchase.getSku() + " purchased");
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    String orderId = purchase.getOrderId();
                    List<String> productIds = purchase.getProducts();
                    if (productIds.size() > 0) {
                        String productId = productIds.get(0);
//                    String signedData = purchase.getOriginalJson();
//                    String signature = purchase.getSignature();
//                    String purchaseToken = purchase.getPurchaseToken();

                        if (productId.contains("_sub_")) {
                            //订阅类型
                            notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.SUBS, BillingAction.PURCHASE, 0);
                            acknowledgedPurchase(purchase, productId, orderId, BillingClient.ProductType.SUBS, BillingAction.PURCHASE);
                        } else if (productId.contains("_gift_")) {
                            //非消耗品
                            notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE, 0);
                            acknowledgedPurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE);
                        } else {
                            //消耗品
                            notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE, 0);
                            consumePurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE);
                        }
                    }
                }
            }
        } else if (responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            if (purchases != null) {
                for (Purchase purchase : purchases) {
                    // Log.d(TAG, purchase.getSku() + " purchased");
                    String orderId = purchase.getOrderId();
                    List<String> productIds = purchase.getProducts();
                    if (productIds.size() > 0) {
                        String productId = productIds.get(0);
                        //消耗品
                        if (productId.contains("_sub_")) {
                            //订阅类型 重复订阅
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.SUBS, BillingAction.PURCHASE, responseCode);
                        } else if (productId.contains("_gift_")) {
                            //非消耗品 重复购买礼包
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE, responseCode);
                        } else {
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE, responseCode);
                            //消耗品卡单了 没有进行消耗 没有发货进行一次消耗
                            consumePurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.PURCHASE);
                        }
                    }
                }
            }
        }
    }

    void acknowledgedPurchase(Purchase purchase, String productId, String orderId, String productType, String action) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED && !purchase.isAcknowledged()) {
            AcknowledgePurchaseParams acknowledgePurchaseParams =
                    AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchase.getPurchaseToken())
                            .build();
            if (billingClient == null) {
                return;
            }
            billingClient.acknowledgePurchase(acknowledgePurchaseParams, new AcknowledgePurchaseResponseListener() {
                @Override
                public void onAcknowledgePurchaseResponse(BillingResult billingResult) {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        // Handle the success of the consume operation.
                        //订阅和礼包确认购买成功
                        JSONObject obj = new JSONObject();
                        try {
                            obj.put("orderId", orderId);
                            obj.put("skuId", productId);
                            obj.put("skuType", productType);

//                            long subscriptionPeriod = purchase.subscriptionPeriod;
//                            val startTimeMillis = purchase.purchaseTime
//                            val endTimeMillis = startTimeMillis + subscriptionPeriod
//                            val currentTimeMillis = System.currentTimeMillis()
//                            if (currentTimeMillis < endTimeMillis) {
//                                // 订阅有效
//                            } else {
//                                // 订阅已过期
//                            }

                        } catch (JSONException e) {
                            throw new RuntimeException(e);
                        }
                        notifyPurchaseToGame(productId, orderId, productType, BillingAction.ACKNOWLEDGE, 0);
                    } else {
                        notifyPurchaseToGame(productId, orderId, productType, BillingAction.ACKNOWLEDGE, billingResult.getResponseCode());
                    }
                }
            });
        }
    }

    /**
     * 消耗品进行消耗
     *
     * @param purchase
     */
    void consumePurchase(Purchase purchase, String productId, String orderId, String productType, String action) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            //消耗完 要不要确认下呢？
            if (!purchase.isAcknowledged()) {
                AcknowledgePurchaseParams acknowledgePurchaseParams =
                        AcknowledgePurchaseParams.newBuilder()
                                .setPurchaseToken(purchase.getPurchaseToken())
                                .build();
                billingClient.acknowledgePurchase(acknowledgePurchaseParams, new AcknowledgePurchaseResponseListener() {
                    @Override
                    public void onAcknowledgePurchaseResponse(BillingResult billingResult) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
//                                    notifyPurchaseToGame(productId, orderId, productType, 0);
                            Log.i(TAG,"消耗后确认成功");
                        } else {
                            Log.i(TAG,"消耗后确认失败:"+billingResult.getResponseCode());
//                                    notifyPurchaseToGame(productId, orderId, productType, billingResult.getResponseCode());
                        }
                    }
                });
            }
            else {
                //确认过的商品直接消耗
                ConsumeParams consumeParams =
                        ConsumeParams.newBuilder()
                                .setPurchaseToken(purchase.getPurchaseToken())
                                .build();
                ConsumeResponseListener listener = new ConsumeResponseListener() {
                    @Override
                    public void onConsumeResponse(BillingResult billingResult, String purchaseToken) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            // Handle the success of the consume operation.
                            //消耗物品成功
                            JSONObject obj = new JSONObject();
                            try {
                                obj.put("orderId", orderId);
                                obj.put("skuId", productId);
                                obj.put("skuType", productType);
                            } catch (JSONException e) {
                                throw new RuntimeException(e);
                            }
                            notifyPurchaseToGame(productId, orderId, productType, BillingAction.CONSUME, 0);
                        } else {
                            notifyPurchaseToGame(productId, orderId, productType, BillingAction.CONSUME, billingResult.getResponseCode());
                        }
                    }
                };
                if (billingClient == null) {
                    return;
                }
                billingClient.consumeAsync(consumeParams, listener);
            }
        }
    }

    void notifyPurchaseToGame(String productId, String orderId, String productType, String action, int errCode) {
        JSONObject obj = new JSONObject();
        try {
            obj.put("orderId", orderId);
            obj.put("skuId", productId);
            obj.put("skuType", productType);
            obj.put("errCode", errCode);
            obj.put("action", action);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        JsbCall.emitIapEvent(BillingGameEvent.IAP_PURCHASE, obj);
    }

    void notifyIapTipsToGame(String productId, String orderId, String productType, String action, int errCode) {
        JSONObject obj = new JSONObject();
        try {
            obj.put("orderId", orderId);
            obj.put("skuId", productId);
            obj.put("skuType", productType);
            obj.put("errCode", errCode);
            obj.put("action", action);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        JsbCall.emitWindowEvent(BillingGameEvent.IAP_PURCHASE_TIPS, obj);
    }


    @Override
    public boolean exec(String action, JSONObject args, final CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "exec: ");
        if (action.equals("init")) {
            onActionInit(args, callbackContext);
            return true;
        } else if (action.equals("query")) {
            if (billingClient == null) {
                return false;
            }
            if (billingClient.isFeatureSupported(BillingClient.FeatureType.PRODUCT_DETAILS).getResponseCode() == BillingClient.BillingResponseCode.OK) {
                onActionQueryProductDetailsAsync(args, callbackContext);
            } else {
                //老版本的需要查两次
                onActionQuerySkuDetailsAsync(args, callbackContext, BillingClient.SkuType.INAPP);
                onActionQuerySkuDetailsAsync(args, callbackContext, BillingClient.SkuType.SUBS);
            }
            return true;
        } else if (action.equals("buy")) {
            String skuId = args.getString("skuId");
            String skuType = args.getString("skuType");
            if (!(skuType.equals(BillingClient.ProductType.SUBS) || skuType.equals(BillingClient.ProductType.INAPP))) {
                callbackContext.failure("sku type error support [inapp,subs]");
                return false;
            }
            if (billingClient == null) {
                return false;
            }
            if (billingClient.isFeatureSupported(BillingClient.FeatureType.PRODUCT_DETAILS).getResponseCode() == BillingClient.BillingResponseCode.OK) {
                onActionBuyByProductDetail(skuId, skuType, callbackContext);
            } else {
                onActionBuyBySkuDetail(skuId, skuType, callbackContext);
            }
            return true;
        } else if ((action.equals("recover"))) {
            //恢复购买
            //查询购买过的用品
            recoverPurchase();
            return true;
        } else if ((action.equals("history"))) {
            //恢复购买
            //查询购买过的用品
            checkHistoryPurchase();
            return true;
        }
        return super.exec(action, args, callbackContext);
    }

    private void checkHistoryPurchase() {
        if (billingClient == null) {
            return;
        }
        billingClient.queryPurchaseHistoryAsync(
                QueryPurchaseHistoryParams.newBuilder()
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build(),
                new PurchaseHistoryResponseListener() {
                    public void onPurchaseHistoryResponse(
                            BillingResult billingResult, List purchasesHistoryList) {
                        // check billingResult
                        // process returned purchase history list, e.g. display purchase history
                    }
                }
        );
        billingClient.queryPurchaseHistoryAsync(
                QueryPurchaseHistoryParams.newBuilder()
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build(),
                new PurchaseHistoryResponseListener() {
                    public void onPurchaseHistoryResponse(
                            BillingResult billingResult, List purchasesHistoryList) {
                        // check billingResult
                        // process returned purchase history list, e.g. display purchase history
                    }
                }
        );
    }

    private void recoverPurchase() {
        if (billingClient == null) {
            return;
        }
        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build(),
                new PurchasesResponseListener() {
                    public void onQueryPurchasesResponse(BillingResult billingResult, List<Purchase> purchases) {
                        onHandlerHistoryPurchase(billingResult, purchases);
                    }
                }
        );
        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build(),
                new PurchasesResponseListener() {
                    public void onQueryPurchasesResponse(BillingResult billingResult, List purchases) {
                        // check billingResult
                        // process returned purchase list, e.g. display the plans user owns
//                        onPurchasesUpdated(billingResult,purchases);
                        onHandlerHistoryPurchase(billingResult, purchases);
                    }
                }
        );
    }

    private void onHandlerHistoryPurchase(BillingResult billingResult, List<Purchase> purchases) {
        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) {
                // Log.d(TAG, purchase.getSku() + " purchased");
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    String orderId = purchase.getOrderId();
                    List<String> productIds = purchase.getProducts();
                    if (productIds.size() > 0) {
                        String productId = productIds.get(0);
                        if (purchase.isAcknowledged()) {
                            if (productId.contains("_sub_")) {
                                //订阅类型
                                notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.SUBS, BillingAction.RECOVER, 0);
                            } else if (productId.contains("_gift_")) {
                                //非消耗品
                                notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RECOVER, 0);
                            }
                        } else {
                            //消耗品
                            notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RECOVER, 0);
                            consumePurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RECOVER);
                        }
                    }
                }
            }

        }
    }

    /**
     * 查看是否有卡单
     */
    private void queryPurchaseAsync() {
        if (billingClient == null) {
            return;
        }
        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build(),
                new PurchasesResponseListener() {
                    public void onQueryPurchasesResponse(BillingResult billingResult, List<Purchase> purchases) {
                        // check billingResult
                        // process returned purchase list, e.g. display the plans user owns
                        onHandlerResumePurchase(billingResult, purchases);
                    }
                }
        );
        billingClient.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder()
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build(),
                new PurchasesResponseListener() {
                    public void onQueryPurchasesResponse(BillingResult billingResult, List purchases) {
                        // check billingResult
                        // process returned purchase list, e.g. display the plans user owns
                        onHandlerResumePurchase(billingResult, purchases);
                    }
                }
        );
    }

    private void onHandlerResumePurchase(BillingResult billingResult, List<Purchase> purchases) {
        this.billingResult = billingResult;
        this.purchases = purchases;
        int responseCode = billingResult.getResponseCode();
        if (responseCode == BillingClient.BillingResponseCode.OK
                && purchases != null) {
            for (Purchase purchase : purchases) {
                // Log.d(TAG, purchase.getSku() + " purchased");
                if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
                    String orderId = purchase.getOrderId();
                    List<String> productIds = purchase.getProducts();
                    if (productIds.size() > 0) {
                        String productId = productIds.get(0);
//                    String signedData = purchase.getOriginalJson();
//                    String signature = purchase.getSignature();
//                    String purchaseToken = purchase.getPurchaseToken();

                        if (productId.contains("_sub_")) {
                            //订阅类型
                            if (!purchase.isAcknowledged()) {
                                notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.SUBS, BillingAction.RESUME, 0);
                                acknowledgedPurchase(purchase, productId, orderId, BillingClient.ProductType.SUBS, BillingAction.RESUME);
                            }
                        } else if (productId.contains("_gift_")) {
                            //非消耗品
                            if (!purchase.isAcknowledged()) {
                                notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME, 0);
                                acknowledgedPurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME);
                            }
                        } else {
                            //消耗品
                            notifyPurchaseToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME, 0);
                            consumePurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME);
                        }
                    }
                }
            }
        } else if (responseCode == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) {
            if (purchases != null) {
                for (Purchase purchase : purchases) {
                    // Log.d(TAG, purchase.getSku() + " purchased");
                    String orderId = purchase.getOrderId();
                    List<String> productIds = purchase.getProducts();
                    if (productIds.size() > 0) {
                        String productId = productIds.get(0);
                        //消耗品
                        if (productId.contains("_sub_")) {
                            //订阅类型 重复订阅
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.SUBS, BillingAction.RESUME, responseCode);
                        } else if (productId.contains("_gift_")) {
                            //非消耗品 重复购买礼包
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME, responseCode);
                        } else {
                            notifyIapTipsToGame(productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME, responseCode);
                            //消耗品卡单了 没有进行消耗 没有发货进行一次消耗
                            consumePurchase(purchase, productId, orderId, BillingClient.ProductType.INAPP, BillingAction.RESUME);
                        }
                    }
                }
            }
        }
    }

    private void onActionBuyBySkuDetail(String skuId, String skuType, CallbackContext callbackContext) {
        if (billingClient == null) {
            return;
        }
        SkuDetails skuDetails = null;
        if (skuType == BillingClient.SkuType.INAPP && inappSkuDetails != null) {
            for (SkuDetails detail : inappSkuDetails) {
                if (detail.getSku().equals(skuId)) {
                    skuDetails = detail;
                    break;
                }
            }
        } else if (skuType == BillingClient.SkuType.SUBS && subsSkuDetails != null) {
            for (SkuDetails detail : subsSkuDetails) {
                if (detail.getSku().equals(skuId)) {
                    skuDetails = detail;
                    break;
                }
            }
        }
        if (skuDetails == null) {
            int errCode = BillingClient.BillingResponseCode.ITEM_UNAVAILABLE;
            JSONObject obj = new JSONObject();
            try {
                obj.put("skuId", skuId);
                obj.put("errCode", errCode);
            } catch (JSONException e) {
                Log.e(TAG, e.getMessage());
            }
            callbackContext.failure(obj);
            return;
        }
        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setSkuDetails(skuDetails)
                .build();
        BillingResult billingResult = billingClient.launchBillingFlow(this.getActivity(), billingFlowParams);
        this.onRequestBuy(skuId, skuType, callbackContext, billingResult);
    }

    private void onRequestBuy(String skuId, String skuType, CallbackContext callbackContext, BillingResult billingResult) {
        int errCode = billingResult.getResponseCode();
        JSONObject obj = new JSONObject();
        try {
            obj.put("skuId", skuId);
            obj.put("errCode", errCode);
        } catch (JSONException e) {
            Log.e(TAG, e.getMessage());
        }
        if (errCode == BillingClient.BillingResponseCode.OK) {
//            Log.i(TAG,"准备提交购买 product：成功"+skuId);
            callbackContext.success(obj);
        } else {
//            Log.e(TAG,"准备提交购买 product：失败"+skuId+" code:"+errCode);
            callbackContext.failure(obj);
        }
        notifyPurchaseToGame(skuId, "", skuType, BillingAction.REQUEST_BUY, errCode);
    }

    private void onActionBuyByProductDetail(String skuId, String skuType, CallbackContext callbackContext) {
        if (billingClient == null) {
            return;
        }
        ProductDetails productDetails = null;
        if (inappProductDetails != null) {
            for (ProductDetails detail :
                    inappProductDetails) {
                if (detail.getProductId().equals(skuId)) {
                    productDetails = detail;
                    break;
                }
            }
        }

        if (productDetails == null) {
            int errCode = BillingClient.BillingResponseCode.ITEM_UNAVAILABLE;
            JSONObject obj = new JSONObject();
            try {
                obj.put("skuId", skuId);
                obj.put("errCode", errCode);
            } catch (JSONException e) {
                Log.e(TAG, e.getMessage());
            }
            callbackContext.failure(obj);
            return;
        }
        List<ProductDetails.SubscriptionOfferDetails> offerDetails = productDetails
                .getSubscriptionOfferDetails();
        String offerToken = "";
        if (offerDetails != null && offerDetails.size() > 0) {
            offerToken = offerDetails.get(0)
                    .getOfferToken();
        }
        List<BillingFlowParams.ProductDetailsParams> productDetailsParamsList = new ArrayList<>();
        BillingFlowParams.ProductDetailsParams productDetailsParams = offerToken.equals("") ? BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(productDetails)
                .build() : BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(productDetails)
                .setOfferToken(offerToken)
                .build();
        productDetailsParamsList.add(productDetailsParams);
        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(productDetailsParamsList)
                .build();
        // Launch the billing flow
        BillingResult billingResult = billingClient.launchBillingFlow(this.getActivity(), billingFlowParams);
        this.onRequestBuy(skuId, skuType, callbackContext, billingResult);
    }

    /**
     * 初始化的时候请求连击支付服务器
     *
     * @param args            sku:商品id,type:商品类型
     * @param callbackContext
     */
    private void onActionInit(JSONObject args, final CallbackContext callbackContext) {
        if (billingClient == null) {
            billingClient = BillingClient.newBuilder(this.getActivity())
                    .setListener(this)
                    .enablePendingPurchases()
                    .build();
        }
        this.inappSkuDetails = new ArrayList<>();
        this.subsSkuDetails = new ArrayList<>();
        this.inappProductDetails = new ArrayList<>();
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    // billing client is ready to use
                    // Log.d(TAG, "Billing client is ready to use");
                    callbackContext.success("success");
                    //检查卡单情况
                    queryPurchaseAsync();
                } else {
                    // Log.d(TAG, "Billing client setup failed");
                    callbackContext.success(billingResult.getResponseCode() + "");
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Try to restart the connection on the next request to
                // Google Play by calling the startConnection() method.
                // Log.d(TAG, "Billing client disconnected");
                billingClient = null;
                JsbCall.emitIapEvent(BillingGameEvent.IAP_CLIENT_DISCONNECT, null);
            }
        });
    }

    private void onActionQuerySkuDetailsAsync(JSONObject args, final CallbackContext callbackContext, String productType) throws JSONException {
        if (billingClient == null) {
            return;
        }
        JSONArray inAppSkuList;
        SkuDetailsParams.Builder params = SkuDetailsParams.newBuilder();
        List<String> products = new ArrayList<>();
        if (productType.equals(BillingClient.SkuType.INAPP)) {
            inappSkuDetails.clear();
            inAppSkuList = args.getJSONArray("inapp");
            int skuSize = inAppSkuList.length();
            for (int i = 0; i < skuSize; i++) {
                JSONObject obj = inAppSkuList.getJSONObject(i);
                String skuId = obj.getString("skuId");
                products.add(skuId);
            }
            params.setSkusList(products).setType(BillingClient.SkuType.INAPP);
        } else if (productType.equals(BillingClient.SkuType.SUBS)) {
            subsSkuDetails.clear();
            inAppSkuList = args.getJSONArray("subs");
            int skuSize = inAppSkuList.length();
            for (int i = 0; i < skuSize; i++) {
                JSONObject obj = inAppSkuList.getJSONObject(i);
                String skuId = obj.getString("skuId");
                products.add(skuId);
            }
            params.setSkusList(products).setType(BillingClient.SkuType.SUBS);
        }
        billingClient.querySkuDetailsAsync(params.build(),
                new SkuDetailsResponseListener() {
                    @Override
                    public void onSkuDetailsResponse(BillingResult billingResult, List<SkuDetails> skuDetailsList) {
                        JSONObject data = new JSONObject();
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK
                                && skuDetailsList != null) {
                            JSONArray skuInAppArray = new JSONArray();
                            JSONArray skuSubsArray = new JSONArray();
                            for (SkuDetails skuDetails : skuDetailsList) {
                                // Log.d(TAG, skuDetails.getSku() + ": " + skuDetails.getPrice());
                                JSONObject jo = new JSONObject();
                                String skuId = skuDetails.getSku();
                                String price = skuDetails.getPrice();
                                String skuType = skuDetails.getType();
                                try {
                                    jo.put("skuId", skuId);
                                    jo.put("formattedPrice", price);
                                    jo.put("skuType", skuType);
                                } catch (JSONException e) {
                                    Log.e(TAG, e.getMessage());
                                }
                                if (skuType.equals(BillingClient.SkuType.INAPP)) {
                                    skuInAppArray.put(jo);
                                    if (!inappSkuDetails.contains(skuDetails)) {
                                        inappSkuDetails.add(skuDetails);
                                    }
                                } else if (skuType.equals(BillingClient.SkuType.SUBS)) {
                                    skuSubsArray.put(jo);
                                    if (!subsSkuDetails.contains(skuDetails)) {
                                        subsSkuDetails.add(skuDetails);
                                    }
                                }
                            }
                            try {
                                data.put("errCode", 0);
                                data.put("inapp", skuInAppArray);
                                data.put("subs", skuSubsArray);
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                            callbackContext.success(data.toString());
                        } else {
                            try {
                                data.put("errCode", billingResult.getResponseCode());
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                            callbackContext.failure(data.toString());
                        }
                    }
                });
    }

    private void onActionQueryProductDetailsAsync(JSONObject args, final CallbackContext callbackContext) throws JSONException {
        if (billingClient == null) {
            return;
        }
        JSONArray inAppSkuList = args.getJSONArray("inapp");
        int skuSize = inAppSkuList.length();
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        for (int i = 0; i < skuSize; i++) {
            JSONObject obj = inAppSkuList.getJSONObject(i);
            String skuId = obj.getString("skuId");
            products.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(skuId)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build());
        }
        inAppSkuList = args.getJSONArray("subs");
        skuSize = inAppSkuList.length();
        products = new ArrayList<>();
        for (int i = 0; i < skuSize; i++) {
            JSONObject obj = inAppSkuList.getJSONObject(i);
            String skuId = obj.getString("skuId");
            products.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(skuId)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build());
        }
        QueryProductDetailsParams queryProductDetailsParams =
                QueryProductDetailsParams.newBuilder()
                        .setProductList(
                                products)
                        .build();
        inappProductDetails.clear();
        billingClient.queryProductDetailsAsync(
                queryProductDetailsParams,
                new ProductDetailsResponseListener() {
                    public void onProductDetailsResponse(BillingResult billingResult,
                                                         List<ProductDetails> productDetailsList) {
                        // check billingResult
                        // process returned productDetailsList
                        JSONObject data = new JSONObject();
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && productDetailsList != null) {
                            inappProductDetails.clear();
                            JSONArray skuInAppArray = new JSONArray();
                            JSONArray skuSubsArray = new JSONArray();
                            int count = productDetailsList.size();
                            for (int i = 0; i < count; i++) {
                                ProductDetails details = productDetailsList.get(i);
                                JSONObject obj = new JSONObject();
                                String type = details.getProductType();
                                try {
                                    obj.put("skuId", details.getProductId());
                                    obj.put("skuType", details.getProductType());
                                } catch (JSONException e) {
                                    Log.e(TAG, e.getMessage());
                                }
                                if (type == BillingClient.ProductType.INAPP) {
                                    try {
                                        obj.put("formattedPrice", details.getOneTimePurchaseOfferDetails().getFormattedPrice());
                                    } catch (JSONException e) {
                                        Log.e(TAG, e.getMessage());
                                    }
                                    skuInAppArray.put(obj);
                                } else if (type == BillingClient.ProductType.SUBS) {
                                    try {
                                        JSONArray subs = new JSONArray();
                                        String formattedPrice = details.getOneTimePurchaseOfferDetails().getFormattedPrice();
                                        List<ProductDetails.SubscriptionOfferDetails> subsList = details.getSubscriptionOfferDetails();
                                        int subsCount = subsList.size();
                                        for (int j = 0; j < subsCount; j++) {
                                            ProductDetails.SubscriptionOfferDetails subsDetail = subsList.get(j);
                                            JSONObject jo = new JSONObject();
                                            jo.put("basePlanId", subsDetail.getBasePlanId());
                                            JSONArray pricingPhases = new JSONArray();
                                            List<ProductDetails.PricingPhase> pricingPhaseList = subsDetail.getPricingPhases().getPricingPhaseList();
                                            int pricingCount = pricingPhaseList.size();
                                            for (int k = 0; k < pricingCount; k++) {
                                                ProductDetails.PricingPhase pricingPhase = pricingPhaseList.get(k);
                                                JSONObject joo = new JSONObject();
                                                if (j == subsCount - 1 && k == pricingCount - 1) {
                                                    formattedPrice = pricingPhase.getFormattedPrice();
                                                }
                                                joo.put("formattedPrice", pricingPhase.getFormattedPrice());
                                                joo.put("billingPeriod", pricingPhase.getBillingPeriod());
                                                pricingPhases.put(joo);
                                            }
                                            jo.put("pricingPhases", pricingPhases);
                                            subs.put(jo);
                                        }
                                        //兼容5.0以前版本取最后一个计划的价格展示
                                        obj.put("formattedPrice", formattedPrice);
                                        obj.put("plans", subs);
                                    } catch (JSONException e) {
                                        Log.e(TAG, e.getMessage());
                                    }
                                    skuSubsArray.put(obj);
                                }
                            }
                            try {
                                data.put("errCode", 0);
                                data.put("inapp", skuInAppArray);
                                data.put("subs", skuSubsArray);
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                            callbackContext.success(data.toString());
                        } else {
                            try {
                                data.put("errCode", billingResult.getResponseCode());
                            } catch (JSONException e) {
                                Log.e(TAG, e.getMessage());
                            }
                            callbackContext.failure(data.toString());
                        }
                    }
                }
        );
    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface BillingAction {
        String CONSUME = "consume";
        String PURCHASE = "purchase";
        String INIT = "init";
        String RECOVER = "recover";
        String RESUME = "resume";
        String ACKNOWLEDGE = "acknowledge";
        String REQUEST_BUY = "request_buy";
        /**
         * 恢复购买后确认
         */
        String RECOVER_ACKNOWLEDGE = "recover_acknowledge";
        /**
         * 恢复购买后消耗
         */
        String RECOVER_CONSUME = "recover_consume";

    }

    @Retention(RetentionPolicy.SOURCE)
    public @interface BillingGameEvent {
        String IAP_PURCHASE_TIPS = "iap_purchase_tips";
        String IAP_PURCHASE = "iap_purchase";
        String IAP_CLIENT_DISCONNECT = "iap_client_disconnect";
    }
}
