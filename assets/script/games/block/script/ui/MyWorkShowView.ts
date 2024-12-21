import { _decorator, Component, Node, tween, Vec3, Sprite, JsonAsset, Animation, Layout, Prefab, instantiate } from 'cc';
import PanelBase from 'db://assets/script/panel/PanelBase';
import { ResManager } from '../../../../resource/ResManager';
import { AdventureLevelConfigData } from '../define/adventureLevelData';
import { UserLevelData } from 'db://assets/script/data/UserLeveData';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
const { ccclass, property } = _decorator
@ccclass('myWorkShowView')
export class myWorkShowView extends PanelBase<any> {
    @property(Layout)
    layout: Layout = null;

    @property(Prefab)
    item: Prefab = null;

    onLoad() {
        if (this.layout === null || this.layout === undefined) {
            console.error("No Layout")
        }
        if (this.item === null || this.item === undefined) {
            console.error("No item prefab");
        }

        this.setMaskLayerEnable(false);
    }

    start() {
        this.setMaskLayerEnable(false);
        let currLevel = UserLevelData.inst.getHistoryLevel();
        ResManager.getInstance().loadAsset<JsonAsset>("res/configs/myWorkConfig", "block")
            .then((asset) => {
                const configBlocks = asset.json;
                const picVal1 = this.getProgress(currLevel, configBlocks);
                let totalNum = picVal1.picIndex - 1;
                if (UserLevelData.inst.isAllLevelFinished) {
                    totalNum += 1;
                }

                for (let i = 1; i <= Math.min(totalNum, AdventureLevelConfigData.MyWorkTotalSticker); i++) {
                    let itemNode = instantiate(this.item)
                    let spriteNode = itemNode.getChildByPath("Bg/Sprite");
                    if (!spriteNode) {
                        continue;
                    }
                    let bgNode = itemNode.getChildByPath("Bg")
                    this.layout.node.addChild(itemNode);
                    this.layout.updateLayout(true);
                    let character = spriteNode.getComponent(Sprite)
                    let bg = bgNode.getComponent(Sprite)
                    ResManager.getInstance().loadSpriteFrame(`res/texture/album/UI_StickerPanel_Sticker${i.toString()}`, "block")
                        .then((sprite) => {
                            character.spriteFrame = sprite;
                        })
                    ResManager.getInstance().loadSpriteFrame(`res/texture/album/UI_StickerPanel_Sticker${i.toString()}_Base`, "block")
                        .then((sprite) => {
                            bg.spriteFrame = sprite;
                        })
                }

                for (let i = totalNum + 1; i <= AdventureLevelConfigData.MyWorkTotalSticker; i++) {
                    let itemNode = instantiate(this.item)
                    let spriteNode = itemNode.getChildByName("Bg");
                    if (!spriteNode) {
                        continue;
                    }
                    this.layout.node.addChild(itemNode);
                    this.layout.updateLayout(true);
                    let character = spriteNode.getComponent(Sprite)
                    ResManager.getInstance().loadSpriteFrame(`res/texture/album/UI_StickerPanel_Sticker${i.toString()}_Base`, "block")
                        .then((sprite) => {
                            character.spriteFrame = sprite;
                        })
                }
            })
    }

    private getProgress(currLevel: number, jsonFile: Record<string, any>) {
        let mapData = jsonFile.mapping;
        let total = 0;
        let i = 0;
        let indexInPic = 0;
        let retId = 0; // 小于等于这个id的都要被涂色
        if (UserLevelData.inst.isAllLevelFinished == 1) {
            currLevel += 1;
        }
        for (; i < mapData.length; i++) {
            let rewardList = mapData[i].rewardList
            if (total + rewardList.length >= currLevel) {
                // 说明在这张图里,且indexInPic至少为1
                indexInPic = currLevel - total;
                for (let j = 0; j < indexInPic - 1; j++) { // todo indexInPic - 1
                    retId += rewardList[j];
                }
                break;
            }
            total += rewardList.length;
        }

        console.log("picIndex: ", i + 1, " levelIndex: ", retId);
        return { picIndex: i + 1, levelIndex: retId };
    }

    onCloseBtn(){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
       this.closeSelf()
    }
   
}