/*
 * @Date: 2023-03-25 11:02:11
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-06 16:33:34
 */
import { _decorator, sys, Component } from 'cc';
import { biEventId } from './Boot';
import { mk } from './MK';
import { SettingData } from './data/SettingData';
import { game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PolicyView')
export class PolicyView extends Component {
    onClickTerms() {
        sys.openURL("https://arksgame.com/terms.html");
    }
    onClickPrivacy() {
        sys.openURL("https://arksgame.com/ps.html");
    }
    onClickAccept() {
        SettingData.inst.isAcceptTSP = 1;
        mk.sendEvent(mk.eventType.EVENT_POLICY_AGREE);
        mk.sendEvent(mk.eventType.EVENT_POLICY_SHOW, false);
        //mk.sdk.instance.reportBI(biEventId.agree_policy, {});
    }
    onClickReject(){
        game.end();
    }
}

