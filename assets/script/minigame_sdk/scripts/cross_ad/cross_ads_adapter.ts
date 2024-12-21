/*
 * @Date: 2023-06-06 17:29:09
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-07-11 20:44:48
 */
import { _decorator, Component, Node } from 'cc';
import { ads_manager } from './ads_manager';
import { Vec3 } from 'cc';
import { SdkEventManager } from '../SdkEventManager';
import { SdkEventType } from '../SdkEventType';
import { SdkCrossAdManager } from '../SdkCrossAdManager';
import { emCrossAdPath } from './CrossAdConfig';
import * as env from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('cross_ads_adapter')
export class cross_ads_adapter extends Component {
    private nodeList: Node;
    start() {
        SdkEventManager.getInstance().register(SdkEventType.CROSS_AD_SHOW_LIST_PLAY, this.onShowListPlay, this)
            .register(SdkEventType.GET_ADMANAGER_ICON_INFO_SUCCESS, this.onGetIconInfo, this);
        let delayShow = 180;
        if (env.PREVIEW) {
            delayShow = 0;
        }
        //60秒以后展示
        this.scheduleOnce(() => {
            SdkCrossAdManager.getInstance().loadLocalAdBoxConfig();
        }, delayShow);
    }
    onShowListPlay(show: boolean, scene: string) {
        if (this.nodeList) {
            this.nodeList.active = show;
        }
        else {
            if (show) {
                ads_manager.addAdsNode(emCrossAdPath.List, this.node, Vec3.ZERO, scene).then((nodeList) => {
                    this.nodeList = nodeList;
                    nodeList.active = true;
                })
            }
        }
    }
    onGetIconInfo() {
        SdkEventManager.getInstance().emit(SdkEventType.CROSS_AD_SHOW_LIST_PLAY, true);
    }
    protected onDestroy(): void {
        SdkEventManager.getInstance().unregister(SdkEventType.CROSS_AD_SHOW_LIST_PLAY, this.onShowListPlay, this)
            .unregister(SdkEventType.GET_ADMANAGER_ICON_INFO_SUCCESS, this.onGetIconInfo, this);
    }
}

