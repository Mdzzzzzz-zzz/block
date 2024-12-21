/*
 * @Date: 2024-06-25 14:53:32
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-04 10:50:45
 */
import { _decorator, Component, game, Node, view, Animation } from "cc";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import PanelBase from "../../../../panel/PanelBase";
import * as env from "cc/env";
import { SdkUtils } from "../../../../minigame_sdk/scripts/SdkUtils";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { emShareType } from "../../../../sdk/wechat/SocialDef";
import { UserData } from "../../../../data/UserData";
import { mk } from '../../../../MK';
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
const { ccclass, property } = _decorator;
let a = false;
@ccclass("FriendRankListView")
export class FriendRankListView extends PanelBase<any> {
    @property(Node)
    noPermission: Node = null;
    @property(Node)
    shadeViewRoot = null;
    @property(Node)
    subContextView = null;
    @property(Node)
    btnShare = null;
    onLoad() {
        this.noPermission.active = false;
        this.setMaskLayerEnable(false);
        //
    }

    start() {
        this.node.getComponent(Animation).play("FriendRankList_enter");
        this.btnShare.active = false;
        if (env.WECHAT) {
            //检查key问题
            this.subContextView.active = true;
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "check",
                key: "score",
            });
            //更新当前的分数
            // @ts-ignore
            // wx.getOpenDataContext().postMessage({
            //     event: "updata",
            //     key: "score",
            //     data: 50,
            // });

            // let callbackTarget = {}; // Replace with the actual target if needed
            // WechatMiniApi.getInstance().checkAuthInfo((isAuth: boolean) => {
            //     return isAuth;
            // }, callbackTarget);
            // if (UserData.inst.wxUserAgreePolicy == false) {
            //     SdkManager.getInstance()
            //         .channel.aggreePrivacy()
            //         .then(() => {
            //             UserData.inst.wxUserAgreePolicy = true;
            //         })
            //         .catch((res) => { });
            // }

            // @ts-ignore
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting["scope.WxFriendInteraction"]) {
                        // @ts-ignore
                        wx.authorize({
                            scope: "scope.WxFriendInteraction",
                            success: () => {
                                //请求打开排行榜
                                // @ts-ignore
                                wx.getOpenDataContext().postMessage({
                                    event: "score",
                                    key: "score",
                                    data: UserScoreLevelData.inst.getHighestScore(),
                                });
                                this.btnShare.active = true;
                                this.setPermissionStatus(false);
                            },
                            fail: () => {
                                this.setPermissionStatus(true);
                            },
                        });
                    } else {
                        this.setPermissionStatus(false);
                        //请求打开排行榜
                        // @ts-ignore
                        wx.getOpenDataContext().postMessage({
                            event: "score",
                            key: "score",
                            data: UserScoreLevelData.inst.getHighestScore(),
                        });
                        this.btnShare.active = true;
                    }
                },
            });
        }
    }
    setPermissionStatus(status) {
        this.noPermission.active = status;
    }
    onClickShareSelf() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        WechatMiniApi.getInstance().showShare(emShareType.s_10011, emSharePath.level_success, this, null);
    }
    onClickAuth() {
        let info = SdkUtils.convertNodeLTPosToWorldPos(this.shadeViewRoot);
        console.log("onClickAuth", info);
        let button = SdkManager.getInstance().account.createUserInfoButton({
            left: info.left,
            top: info.top,
            width: info.width,
            height: info.height,
            btnText: "点我进行授权",
        });
    }

    onClickClose() {
        this.subContextView.active = false;
        this.node.getComponent(Animation).play("FriendRankList_exit");
        if (env.WECHAT) {
            //更新当前的分数
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "clearlayout",
            });
        }
        this.scheduleOnce(this.closeSelf, 0.3)
        //this.closeSelf();
    }

    onDestroy() {
        if (env.WECHAT) {
            //更新当前的分数
            // @ts-ignore
            wx.getOpenDataContext().postMessage({
                event: "clear",
            });
        }
    }

    onCloseBtn(){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
       this.closeSelf()
    }
}
