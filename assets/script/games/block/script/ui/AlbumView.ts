import { _decorator, Node } from "cc";
import * as env from "cc/env";

import { AlbumData } from "../../../../data/AlbumData";
import { emStageStickerStatus } from "../../../../data/AlbumDef";
import { UserAdventureLevelData } from "../../../../data/UserAdventureLevelData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { mk } from "../../../../MK";
import PanelBase from "../../../../panel/PanelBase";
import { emSharePath, emShareType } from "../../../../sdk/wechat/SocialDef";
import { Game } from "../logic/Game";
import { Util } from "../logic/Util";

const { ccclass, property } = _decorator;

@ccclass("AlbumView")
export class AlbumView extends PanelBase<Game> {
    @property(Node)
    Items: Node = null;
    @property(Node)
    Labels: Node = null;
    @property(Node)
    NotStarted: Node = null;
    currentSticker: number;
    onLoad() {
        this.setMaskLayerEnable(false);
    }
    start() {
        let currentbatchNumber = UserAdventureLevelData.inst.getLevelBatchNumber();
        for (let index = 1; index <= 5; index++) {
            let status = AlbumData.inst.getStageStickerStatus(index);
            if (status == emStageStickerStatus.not_started) {
                this.Items.getChildByPath("Item" + index.toString()).active = false;
                this.NotStarted.getChildByPath("Sprite" + index.toString()).active = true;
                this.Labels.getChildByPath("Label" + index.toString()).active = false;
            } else {
                this.Items.getChildByPath("Item" + index.toString()).active = true;
                this.NotStarted.getChildByPath("Sprite" + index.toString()).active = false;
                if (status == emStageStickerStatus.not_obtained) {
                    this.Labels.getChildByPath("Label" + index.toString()).active = true;
                    this.Items.getChildByPath("Item" + index.toString() + "/notobtained").active = false;
                    this.Items.getChildByPath("Item" + index.toString() + "/askfriend").active = false;
                    this.Items.getChildByPath("Item" + index.toString() + "/image").active = false;
                } else if (status == emStageStickerStatus.obtained) {
                    this.Labels.getChildByPath("Label" + index.toString()).active = true;
                    this.Items.getChildByPath("Item" + index.toString() + "/image").active = true;
                    this.Items.getChildByPath("Item" + index.toString() + "/notobtained").active = false;
                    this.Items.getChildByPath("Item" + index.toString() + "/askfriend").active = false;
                } else if (status == emStageStickerStatus.missed) {
                    this.Labels.getChildByPath("Label" + index.toString()).active = true;
                    this.Items.getChildByPath("Item" + index.toString() + "/askfriend").active = false;
                    if (env.PREVIEW || env.EDITOR || env.WECHAT) {
                        this.Items.getChildByPath("Item" + index.toString() + "/askfriend").active = true;
                        this.Labels.getChildByPath("Label" + index.toString()).active = false;
                    }
                    this.Items.getChildByPath("Item" + index.toString() + "/notobtained").active = true;
                    this.Items.getChildByPath("Item" + index.toString() + "/image").active = false;
                }
            }
        }
    }

    SetStickerObtained(index) {
        this.currentSticker = index;
    }

    OnShareCallBack() {
        AlbumData.inst.setStageStickerStatus(this.currentSticker, emStageStickerStatus.obtained);
        this.Items.getChildByPath("Item" + this.currentSticker.toString()).active = true;
        this.NotStarted.getChildByPath("Sprite" + this.currentSticker.toString()).active = false;
        this.Labels.getChildByPath("Label" + this.currentSticker.toString()).active = true;
        this.Items.getChildByPath("Item" + this.currentSticker.toString() + "/image").active = true;
        this.Items.getChildByPath("Item" + this.currentSticker.toString() + "/notobtained").active = false;
        this.Items.getChildByPath("Item" + this.currentSticker.toString() + "/askfriend").active = false;
    }

    onClickShare1() {
        this.SetStickerObtained(1);
        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, this.OnShareCallBack);
    }
    onClickShare2() {
        this.SetStickerObtained(2);
        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, this.OnShareCallBack);
    }
    onClickShare3() {
        this.SetStickerObtained(3);
        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, this.OnShareCallBack);
    }
    onClickShare4() {
        this.SetStickerObtained(4);
        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, this.OnShareCallBack);
    }
    onClickShare5() {
        this.SetStickerObtained(5);
        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, this.OnShareCallBack);
    }

    onClickClose() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        this.closeSelf();
    }
}
