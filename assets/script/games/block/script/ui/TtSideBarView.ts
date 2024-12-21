/*
 * @Date: 2024-06-25 14:53:32
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-07-02 01:09:01
 */
import { _decorator, Component, Node } from "cc";
import { PREVIEW } from "cc/env";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import PanelBase from "../../../../panel/PanelBase";
import * as env from "cc/env";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { JYSdkManager } from "../../../../jysdk/JYSdkManager";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { UserData } from "../../../../data/UserData";
import { emttSideBarStatus } from "../../../../define/BIDefine";
import { UserHammerData } from "../../../../data/UserHammerData";
import { mk } from "../../../../MK";
import { BlockEventType } from "../define/Event";
const { ccclass, property } = _decorator;
let a = false;
@ccclass("TtSideBarView")
export class TtSideBarView extends PanelBase<any> {
    @property(Node)
    goSideBar: Node = null;

    @property(Node)
    collect: Node = null;

    @property(Node)
    collected: Node = null;

    private sideBarStatus: number = 0;

    onLoad() {
        this.setMaskLayerEnable(false);
    }
    protected onSetData(value: any): void {
        this.sideBarStatus = value;

    }
    start() {
        this.goSideBar.active = false;
        this.collect.active = false;
        this.collected.active = false;
        if (env.BYTEDANCE) {
            if (this.sideBarStatus == emttSideBarStatus.go_side_bar) {
                this.goSideBar.active = true;
            } else if (this.sideBarStatus == emttSideBarStatus.not_collected) {
                this.collect.active = true;
            } else if (this.sideBarStatus == emttSideBarStatus.collected) {
                this.collected.active = true;
            }
        }
    }

    onBtnCollectReward() {
        this.collect.active = false;
        this.collected.active = true;
        UserData.inst.setHasReceivedTtSideBarRewardToday(true);
        UserHammerData.inst.addItem(1, false);
        mk.sendEvent(BlockEventType.EVENT_TTSIDEBAR_REDDOT_STATUS, false);
        UserData.inst.setSideBarStatus = emttSideBarStatus.collected;
    }

    onBtnGoSideBar() {
        // @ts-ignore
        tt.navigateToScene({
            scene: "sidebar",
            success: (res) => {
                console.log("ttsidebar navigateToScene sidebar success");
                this.closeSelf();
            },
            fail: (res) => {
                console.log("ttsidebar navigateToScene sidebar fail");
            },
        }
        );
    }

    onDestroy() {
    }
}

