/*
 * @Date: 2023-05-30 11:47:10
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-14 11:50:18
 */
import { _decorator } from "cc";
import { BlockGenerate } from "./BlockGenerate";
import { BlockPlaceholder3 } from "./BlockPlaceholder3";
import { LevelGame } from "../logic/LevelGame";
import { AdventureLevelGame } from "../logic/AdventureLevelGame";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { Game } from "../logic/Game";
import { mk } from "../../../../MK";
import { Vec3 } from "cc";
import { BlockEventType } from "../define/Event";
import { Node } from "cc";
import { Label } from "cc";
import { BlockPlaceholderHammer } from "./BlockPlaceholderHammer";
import { biEventId } from "../../../../Boot";
import { emAdStatus } from "../../../../define/BIDefine";
import { dtSdkError, emSdkErrorCode } from "../../../../minigame_sdk/scripts/SdkError";
import { AdSdk } from "../../../../sdk/AdSdk";
import { emAdPath } from "../../../../sdk/emAdPath";
import { UITransform } from "cc";
import { BlockItemConst } from "../define/BlockType";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { LanguageManager } from "../../../../data/LanguageManager";
import { UserHRocketData } from "../../../../data/UserHRocketData";
import { BlockPlaceholderHRocket } from "./BlockPlaceholderHRocket";
const { ccclass, property } = _decorator;

@ccclass("BlockGenerateHRocket")
export class BlockGenerateHRocket extends BlockGenerate {
    @property(Node)
    ad_root: Node = null;
    @property(Label)
    lab_hammer: Label = null;
    onLoad() {
        this.onInit();
        this.scheduleOnce(() => {
            this && this.initRocket();
        }, 0.3);
        UserHRocketData.inst.onDataCountChange = this.onHRocketCountChange.bind(this);
    }
    initRocket() {
        if (UserHRocketData.inst.isCanUseItem()) {
            this.showAdRoot(false);
            this.spawnRocket();
        } else {
            this.showAdRoot(true);
        }
        this.showRocketInfo(true);
    }
    showAdRoot(show: boolean) {
        if (this.ad_root) {
            this.ad_root.active = show;
        }
    }
    showRocketInfo(show: boolean) {
        if (this.lab_hammer) {
            this.lab_hammer.node.active = show;
            if (show) {
                this.lab_hammer.string = `${UserHRocketData.inst.itemCount}/${UserHRocketData.inst.getMaxItemCount()}`;
            }
        }
    }
    onHRocketCountChange() {
        if (this.lab_hammer) {
            this.lab_hammer.string = `${UserHRocketData.inst.itemCount}/${UserHRocketData.inst.getMaxItemCount()}`;
        }
    }
    spawnRocket() {
        this.blockPlaceholders.length = 0;
        // let hammerScale = new Vec3(scale, scale, 1);
        let hRocketIndex = 1101;
        let scale = BlockItemConst[hRocketIndex].scale;
        let node = this.gameManager.getNodePoolWithPoolType(this.getBlockGroupPoolName()).get();
        if (!node.active) {
            node.active = true;
        }
        let placeholder: BlockPlaceholderHRocket = node.getComponent(BlockPlaceholderHRocket);
        placeholder.rocketScale = scale;
        node.setPosition(Vec3.ZERO);
        node.setScale(scale, scale, 1);
        let uitrans = node.getComponent(UITransform);
        if (uitrans) {
            let size = Math.ceil(120 / scale);
            uitrans.setContentSize(size, size);
        }
        node.parent = this.node;
        placeholder.originalPosition = Vec3.ZERO;
        placeholder.init(this.gameManager);
        placeholder.refresh(hRocketIndex);
        placeholder.onUseRocket = this.onUseRocket.bind(this);
        this.blockPlaceholders.push(placeholder);
        // mk.sendEvent(BlockEventType.kEvent_Game_Init_Show_Hammer, false);
    }
    onUseRocket() {
        UserHRocketData.inst.useItem();
        this.initRocket();
        this.gameManager.updateLevelHistoryData();
        mk.sendEvent(BlockEventType.kEvent_Game_Init_Use_Hammer);
    }
    checkCanPut() {
        // return true;
        // return true;
    }

    onDestroy() {
        UserHRocketData.inst.onDataCountChange = null;
        mk.unRegEvent(this);
    }
    protected onInit() {
        this.blockPlaceholders = new Array<BlockPlaceholder3>();
        if (SceneMode.gameMode == kGameMode.endless) {
            this.gameManager = Game.inst;
        } else if (SceneMode.gameMode == kGameMode.level) {
            this.gameManager = LevelGame.levlInstance;
            // this.gameManager = AdventureLevelGame.levlInstance;
        } else if (SceneMode.gameMode == kGameMode.adventure_level) {
            this.gameManager = AdventureLevelGame.levlInstance;
        }
    }
    protected getBlockGroupPoolName() {
        return "HRocketBlockGroupPool";
    }
    onClickBuyRocket() {
        // mk.sdk.instance.reportBI(biEventId.ad_unlock_rocket_h, {
        //     ad_status: emAdStatus.WakeUp,
        //     ad_mode: SceneMode.gameMode,
        // });
        AdSdk.inst
            .showRewardVideoAd(emAdPath.Block_Unlock_Rocket_H)
            .then(() => {
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tips_day_reward_2"));
                UserHRocketData.inst.addItem(UserHRocketData.inst.getMaxItemCount(), false);
                this.initRocket();
                // mk.sdk.instance.reportBI(biEventId.ad_unlock_rocket_h, {
                //     ad_status: emAdStatus.Finished,
                //     ad_mode: SceneMode.gameMode,
                // });
            })
            .catch((err: dtSdkError) => {
                if (err.errMsg == emSdkErrorCode.Sdk_Ad_Close_Reward) {
                    // mk.sdk.instance.reportBI(biEventId.ad_unlock_rocket_h, {
                    //     ad_status: emAdStatus.Closed,
                    //     ad_mode: SceneMode.gameMode,
                    // });
                    return;
                }
                SdkManager.getInstance().native.showToast(LanguageManager.translateText("tip_ad_fail"));
            });
    }
}
