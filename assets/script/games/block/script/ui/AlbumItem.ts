import { _decorator, Label, Node, Sprite } from "cc";
import * as env from "cc/env";

import { AlbumData, ChallengeAlbumConfig } from "../../../../data/AlbumData";
import { emStageStickerStatus } from "../../../../data/AlbumDef";
import { ClassicAlbumConfig } from "../../../../data/ClassicAlbumConfig";
import { ClassicAlbumData } from "../../../../data/ClassicAlbumData";
import { ResManager } from "../../../../resource/ResManager";
import { emSharePath, emShareType } from "../../../../sdk/wechat/SocialDef";
import { Holder } from "../../../../third/scrollview/adapter";
import { page_item } from "../../../../third/scrollview/example/pageView/page_item";
import { Util } from "../logic/Util";

const { ccclass, property } = _decorator;

@ccclass("AlbumItem")
export class AlbumItem extends page_item {
    @property(Sprite)
    bg: Sprite;
    @property(Sprite)
    grey: Sprite;
    @property(Sprite)
    realImg: Sprite;
    @property(Node)
    notObtained: Node = null;
    @property(Node)
    askFriend: Node = null;
    @property(Label)
    seasonLabel: Label = null;
    @property(Node)
    notStartedSprite: Node = null;
    @property(Sprite)
    wholeSprite: Sprite = null;
    @property(Label)
    itemLabel: Label = null;
    seasonNum: number = 0;

    itemData: IAlbumItem;

    private bgSpriteName: string = "";
    private greySpriteName: string = "";
    private realImgSpriteName: string = "";

    setItemData(data: IAlbumItem) {
        if (!data) {
            console.warn("[albumItem] failed to set Item data null");
            return;
        }

        let thisBatch = data.season;
        if (thisBatch < 20000) {
            this.bgSpriteName =
                "res/texture/album/ui_block_adventure_card_bg" + (thisBatch < 10 ? "0" : "") + thisBatch.toString();
            this.greySpriteName = "res/texture/album/ui_block_adventure_gray_card" + thisBatch.toString();
            this.realImgSpriteName = "res/texture/album/ui_block_adventure_card" + thisBatch.toString();
        } else {
            this.bgSpriteName = "res/texture/album/dailyChallenge/ui_block_daily_card_bg" + (thisBatch % 10).toString();
            this.greySpriteName = "res/texture/album/dailyChallenge/ui_block_daily_gray_card" + thisBatch.toString();
            this.realImgSpriteName = "res/texture/album/dailyChallenge/ui_block_daily_card" + thisBatch.toString();
        }

        this.realImg.sizeMode = Sprite.SizeMode.RAW;

        this.itemData = data;
        this.label.string = "赛季 " + data.season.toString();
        //console.log("season " + (data.season).toString() + " isShown " + data.isShown);
        this.update();
    }

    update() {
        super.update();
        if (this.itemData) {
            this.node.active = this.itemData.isShown;
        }
        this.updateSelfElement();
    }

    show(holder: Holder) {
        this._holder = holder;
    }

    updateSelfElement() {
        if (!this.itemData) {
            return;
        }

        if (!this.itemData.isShown) {
            //未展示的不更新数据
            return;
        }

        this.notStartedSprite.active = false;
        this.bg.node.active = true;
        this.grey.node.active = true;
        this.wholeSprite.enabled = true;
        this.itemLabel.node.active = false;

        if (this.bg.spriteFrame && this.bg.spriteFrame.name == this.bgSpriteName) {
        } else {
            ResManager.getInstance()
                .loadSpriteFrame(this.bgSpriteName, "block")
                .then((res) => {
                    this.bg && (this.bg.spriteFrame = res);
                });
        }

        if (this.grey.spriteFrame && this.grey.spriteFrame.name == this.greySpriteName) {
        } else {
            ResManager.getInstance()
                .loadSpriteFrame(this.greySpriteName, "block")
                .then((res) => {
                    this.grey && (this.grey.spriteFrame = res);
                });
            this.grey.sizeMode = Sprite.SizeMode.RAW;
        }

        if (this.realImg.spriteFrame && this.realImg.spriteFrame.name == this.realImgSpriteName) {
        } else {
            ResManager.getInstance()
                .loadSpriteFrame(this.realImgSpriteName, "block")
                .then((res) => {
                    this.realImg && (this.realImg.spriteFrame = res);
                });
            this.realImg.sizeMode = Sprite.SizeMode.RAW;
        }

        // console.log("this.itemData = ", this.itemData);
        let id = Number(this.itemData.season);
        if (id < 1000) {
            let status = AlbumData.inst.getStageStickerStatus(this.itemData.season);
            switch (status) {
                case emStageStickerStatus.not_started:
                    {
                        // ResManager.getInstance().loadSpriteFrame("");
                        this.bg.node.active = false;
                        this.grey.node.active = false;
                        this.realImg.node.active = false;
                        this.notObtained.active = false;
                        this.askFriend.active = false;
                        this.seasonLabel.node.active = false;
                        this.notStartedSprite.active = true;
                        this.wholeSprite.enabled = false;
                    }
                    break;

                case emStageStickerStatus.not_obtained:
                    {
                        this.notObtained.active = false; //这名起的
                        this.askFriend.active = false;
                        this.realImg.node.active = false;
                        this.seasonLabel.node.active = true;
                    }
                    break;

                case emStageStickerStatus.obtained:
                    {
                        this.notObtained.active = false; //
                        this.askFriend.active = false;
                        this.realImg.node.active = true;
                        this.seasonLabel.node.active = true;
                    }
                    break;

                case emStageStickerStatus.missed:
                    {
                        this.notObtained.active = true;
                        if (!env.BYTEDANCE) {
                            this.askFriend.active = true;
                            this.seasonLabel.node.active = false;
                        } else {
                            this.askFriend.active = false;
                            this.seasonLabel.node.active = true;
                        }
                        this.realImg.node.active = false;
                    }
                    break;

                default: {
                    this.bg.node.active = false;
                    this.grey.node.active = false;
                    this.realImg.node.active = false;
                    this.notObtained.active = false;
                    this.askFriend.active = false;
                    this.seasonLabel.node.active = false;
                    this.notStartedSprite.active = true;
                    this.wholeSprite.enabled = false;
                }
            }
        }
        // TODO uncomment this when challenge is ready
        else if (id < 20000) {
            let status = ClassicAlbumData.inst.getStickerStatusById(id);
            if (status == 1) {
                this.notObtained.active = false; //
                this.askFriend.active = false;
                this.realImg.node.active = true;
                this.seasonLabel.node.active = false;
                this.itemLabel.node.active = true;

                for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {
                    const themeArr = ClassicAlbumConfig.config[i];
                    for (let index = 0; index < themeArr.length; index++) {
                        const element = themeArr[index];
                        if (element.id == id) {
                            this.itemLabel.string = element.name;
                        }
                    }
                }
            } else {
                this.bg.node.active = false;
                this.grey.node.active = false;
                this.realImg.node.active = false;
                this.notObtained.active = false;
                this.askFriend.active = false;
                this.seasonLabel.node.active = false;
                this.notStartedSprite.active = true;
                this.wholeSprite.enabled = false;
            }
        } else {
            let status = AlbumData.inst.getChallengeStickerStatusById(id);

            switch (status) {
                case emStageStickerStatus.not_started:
                    {
                        // ResManager.getInstance().loadSpriteFrame("");
                        this.bg.node.active = false;
                        this.grey.node.active = false;
                        this.realImg.node.active = false;
                        this.notObtained.active = false;
                        this.askFriend.active = false;
                        this.seasonLabel.node.active = false;
                        this.notStartedSprite.active = true;
                        this.wholeSprite.enabled = false;
                    }
                    break;

                case emStageStickerStatus.not_obtained:
                    {
                        this.notObtained.active = false; //这名起的
                        this.askFriend.active = false;
                        this.realImg.node.active = false;
                        this.seasonLabel.node.active = true;
                    }
                    break;

                case emStageStickerStatus.obtained:
                    {
                        this.notObtained.active = false; //
                        this.askFriend.active = false;
                        this.realImg.node.active = true;

                        if (ChallengeAlbumConfig.nameConfig[id]) {
                            this.seasonLabel.string = ChallengeAlbumConfig.nameConfig[id];
                            this.seasonLabel.node.active = true;
                        } else {
                            this.seasonLabel.node.active = false;
                        }
                    }
                    break;

                case emStageStickerStatus.missed:
                    {
                        this.notObtained.active = true;
                        if (!env.BYTEDANCE) {
                            this.askFriend.active = true;
                            this.seasonLabel.node.active = false;
                        } else {
                            this.askFriend.active = false;
                            this.seasonLabel.node.active = true;
                        }
                        this.realImg.node.active = false;
                    }
                    break;
            }
        }
    }
    onClickShare() {
        if (!this.itemData) {
            return;
        }

        Util.shareMsg(emShareType.s_10001, emSharePath.sticker_request_friend, this, () => {
            if (this.itemData.season < 10000) {
                AlbumData.inst.setStageStickerStatus(this.itemData.season, emStageStickerStatus.obtained);
            } else if (this.itemData.season > 20000) {
                AlbumData.inst.setChallengeStickerStatusById(this.itemData.season, emStageStickerStatus.obtained);
            }

            this.askFriend.active = false;
            this.notObtained.active = false;
            this.realImg.node.active = true;
            this.seasonLabel.node.active = false;
        });
    }
}
