import { _decorator, Node, ProgressBar, UITransform, instantiate, tween, Animation, UIOpacity, Vec3 } from 'cc';

import { AdventureLevelConditionView } from './AdventureLevelConditionView';
import { BlockEventManager } from '../../../../event/BlockEventManager';
import { BlockEventType } from '../define/Event';
import { LevelConditionDiamondItem } from '../level/LevelConditionDiamondItem';
import { Slider } from 'cc';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
import { BlockConstData } from '../define/BlockConstData';
import { Util } from '../logic/Util';
const { ccclass, property } = _decorator;

interface IFlyDiamond {
    fromNode: Node, key: number, curr: number, tar: number, callBack: Function, target: any
}

@ccclass("AdventureLevelConditionViewScene")
export class AdventureLevelConditionViewScene extends AdventureLevelConditionView {
    @property(Node)
    barScore: Node = null;
    @property(Node)
    sliderScore: Node = null;
    @property
    isShowNumWhenInit: boolean = false;

    private diamondsToFly: Array<IFlyDiamond> = new Array<IFlyDiamond>();

    protected scoreProgressBar: ProgressBar;
    protected scoreSlider: Slider;
    onLoad(): void {
        BlockEventManager.instance
            .listen(BlockEventType.EVENT_TATGET_SCORE_SHOW, this.onTargetScoreShow, this)
            .listen(BlockEventType.EVENT_TATGET_COLLECT_SHOW, this.onTargetCollectShow, this);
        this.scoreProgressBar = this.barScore.getComponent(ProgressBar); //e6SzIRmt9GpbmG3+J87nm3
        this.scoreSlider = this.sliderScore.getComponent(Slider); //c6KkgmCgJMTINRTaGwyrsK  
    }
    onDestroy(): void {
        super.onDestroy();
        BlockEventManager.instance
            .unlisten(BlockEventType.EVENT_TATGET_SCORE_SHOW, this.onTargetScoreShow, this)
            .unlisten(BlockEventType.EVENT_TATGET_COLLECT_SHOW, this.onTargetCollectShow, this);
    }

    initConditions() {
        super.initConditions();
        if (this.manager.targetScore > 999) {
            this.labTargetScore.fontSize = 24;
        } else {
            this.labTargetScore.fontSize = 32;
        }
    }

    onTargetScoreShow(): void {
        if (this.labTargetScore) {
            this.labTargetScore.node.active = true;
        }
        this.scheduleOnce(() => {
            let targetAnim = this.labTargetScore.getComponent(Animation);
            if (targetAnim) {
                // console.error("score LevelConditionDiamondItem_fk_anim");
                targetAnim.play("LevelConditionDiamondItem_fk_anim");
            }
        });
    }
    onTargetCollectShow(): void {
        let collectMaps = this.conditionMap;
        for (const key in collectMaps) {
            const element: LevelConditionDiamondItem = collectMaps[key];
            element.showNumInfo(true);
            element.node.getChildByPath("img_score").setScale(1, 1, 1);
        }
        // this.rootDiamondCondition.active = true;
    }

    onInitScore(): void {
        super.onInitScore();
        if (this.labTargetScore && !this.isTargetDisplayed) {
            this.labTargetScore.node.active = false;
        }
        this.scoreProgressBar.progress = 0;
        this.scoreSlider.progress = 0;
        if (this.manager) {
            let score = this.manager.scoreHelper.score;
            let showScore = score;
            let targetScore = this.manager.targetScore;
            // console.error(" onInitScore1:",score,targetScore,showScore);
            if (showScore > targetScore) {
                showScore = targetScore;
            }
            // console.error(" onInitScore2:",score,targetScore,showScore);
            this.onScoreChange(showScore, targetScore);
            this.labScore.string = showScore.toString();
        }
    }
    onScoreChange(showScore: any, score: any): void {
        if (showScore > score) {
            showScore = score;
        }
        showScore = Math.min(this.manager.scoreHelper.score, this.manager.targetScore);
        let curP = this.scoreProgressBar.progress;
        let progress = showScore / score;
        if (progress > curP) {
            // this.scoreProgressBar.progress = progress;
            // this.scoreSlider.progress = progress;

            tween(this.scoreProgressBar).to(0.3, { progress: progress }, {
                // onUpdate: (target, ratio) => {
                //     console.log("target", target);
                // },
                easing: "sineInOut",
            }).start();
            tween(this.scoreSlider).to(0.3, { progress: progress }, {
                // onUpdate: (target, ratio) => {
                //     console.log("target", target);
                // },
                easing: "sineInOut",
            }).start();
        }
    }
    onInitCollect(): void {
        super.onInitCollect();
        if (!this.isShowNumWhenInit) {
            let collectMaps = this.conditionMap;
            collectMaps.forEach((element: any, index) => {
                element.showNumInfo(false);
                element.node.getChildByPath("img_score").setScale(1, 1, 1);
            });
        }

        if (!this.isShowDiamondWhenInit) {
            let collectMaps = this.conditionMap;
            collectMaps.forEach((element: any, index) => {
                element.node.getComponent(UIOpacity).opacity = 0;
                // this.scheduleOnce(() => {
                //     element.node.getComponent(UIOpacity).opacity = 255;
                //     element.showNumInfo(true);
                // }, 1.15);
            });
        }
    }

    addCollectAnimDiamonds(fromNode: Node, key: number, curr: number, tar: number, callBack: Function, target: any) {
        this.diamondsToFly.push({ fromNode: fromNode, key: key, curr: curr, tar: tar, callBack: callBack, target: target })
    }

    doDiamondsAnim() {
        if (this.diamondsToFly.length == 0) { return; }

        for (let i = 0; i < this.diamondsToFly.length; i++) {
            let value = this.diamondsToFly[i];
            let item = this.conditionMap.get(value.key);
            let pos = item.node.parent.parent.getComponent(UITransform).convertToNodeSpaceAR(value.fromNode.worldPosition);
            let cloneItem = instantiate(item.node);
            let dimaondItem = cloneItem.getComponent(LevelConditionDiamondItem);

            dimaondItem.showNumInfo(false);
            cloneItem.setParent(item.node.parent.parent);
            cloneItem.setPosition(pos.x, pos.y);
            this.scheduleOnce(() => {
                dimaondItem.playFlyDiamondAppearAnim();
                this.scheduleOnce(() => {
                    dimaondItem.playFlyDiamondFlyAnim();
                    this.moveToTarget(item.node, cloneItem, () => {
                        mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                        this.setCollect(value.key, value.curr, value.tar);
                        cloneItem.destroy();
                        // item.collectAnimDoneOne.active = true;
                        // this.scheduleOnce(()=>{
                        //     item.collectAnimDoneOne.active = false;
                        // }, 0.5);
                        value.callBack && value.callBack.call(value.target);

                    });
                }, 0.3 + 0.1 * i);
            }, 0.033 * i);
        }

        this.diamondsToFly.length = 0;
    }



    setCollectFly(fromNode: Node, key: number, curr: number, tar: number, callBack: Function, target: any) {
        this.scheduleOnce(() => {
            mk.audio.playSubSound(AssetInfoDefine.audio.diamon_out);
            let item = this.conditionMap.get(key);
            let pos = item.node.parent.parent.getComponent(UITransform).convertToNodeSpaceAR(fromNode.worldPosition);
            let cloneItem = instantiate(item.node);
            let dimaonItem = cloneItem.getComponent(LevelConditionDiamondItem);
            dimaonItem.showNumInfo(false);
            cloneItem.setParent(item.node.parent.parent);
            cloneItem.setPosition(pos.x, pos.y);

            this.moveToTarget(item.node, cloneItem, () => {
                mk.audio.playSubSound(AssetInfoDefine.audio.diamond_collect);
                this.setCollect(key, curr, tar);
                cloneItem.destroy();
                callBack && callBack.call(target);
            });
        });
    }
}
