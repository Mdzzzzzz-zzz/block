import { _decorator, Node, ProgressBar, UITransform, instantiate } from 'cc';

import { LevelConditionView } from './LevelConditionView';
import { BlockEventManager } from '../../../../event/BlockEventManager';
import { BlockEventType } from '../define/Event';
import { LevelConditionDiamondItem } from './LevelConditionDiamondItem';
import { Slider } from 'cc';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
const { ccclass, property } = _decorator;

@ccclass('LevelConditionViewScene')
export class LevelConditionViewScene extends LevelConditionView {

    @property(Node)
    barScore: Node = null;
    @property(Node)
    sliderScore: Node = null;
    @property
    isShowNumWhenInit:boolean= false;  

    protected scoreProgressBar: ProgressBar;
    protected scoreSlider: Slider;
    onLoad(): void {
        BlockEventManager.instance.listen(BlockEventType.EVENT_TATGET_SCORE_SHOW, this.onTargetScoreShow, this)
            .listen(BlockEventType.EVENT_TATGET_COLLECT_SHOW, this.onTargetCollectShow, this);
        this.scoreProgressBar = this.barScore.getComponent(ProgressBar);
        this.scoreSlider = this.sliderScore.getComponent(Slider);
    }
    onDestroy(): void {
        super.onDestroy();
        BlockEventManager.instance.unlisten(BlockEventType.EVENT_TATGET_SCORE_SHOW, this.onTargetScoreShow, this)
            .unlisten(BlockEventType.EVENT_TATGET_COLLECT_SHOW, this.onTargetCollectShow, this);
    }

    onTargetScoreShow(): void {
        if (this.labTargetScore) {
            this.labTargetScore.node.active = true;
        }
    }
    onTargetCollectShow(): void {
        let collectMaps = this.conditionMap;
        for (const key in collectMaps) {
            const element: LevelConditionDiamondItem = collectMaps[key];
            element.showNumInfo(true);
        }
    }

    onInitScore(): void {
        super.onInitScore();
        if (this.labTargetScore) {
            this.labTargetScore.node.active = false;
        }
       
        this.scoreProgressBar.progress = 0;
        this.scoreSlider.progress = 0;
        if(this.manager){
            let score  = this.manager.scoreHelper.score;
            let showScore = score;
            let targetScore = this.manager.targetScore;
            // console.error(" onInitScore1:",score,targetScore,showScore);
            if (showScore > targetScore) {
                showScore = targetScore;
            }
            // console.error(" onInitScore2:",score,targetScore,showScore);
            this.onScoreChange(showScore,targetScore);
            this.labScore.string = showScore.toString();
        }
    }
    onScoreChange(showScore: any, score: any): void {
        if (showScore > score) {
            showScore = score;
        }
        showScore = Math.min(this.manager.scoreHelper.score,this.manager.targetScore);
        let curP = this.scoreProgressBar.progress;
        let progress = showScore / score;
        if (progress > curP) {
            this.scoreProgressBar.progress = progress;
            this.scoreSlider.progress = progress;
        }
    }
    onInitCollect(): void {
        super.onInitCollect();
        if(!this.isShowNumWhenInit){
            let collectMaps = this.conditionMap;
            collectMaps.forEach((element: any, index) => {
                element.showNumInfo(false);
            });
        }
    }

    setCollectFly(fromNode: Node, key: number, curr: number, tar: number,callBack:Function,target:any) {
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
                callBack&&callBack.call(target);
            });
        })
    }
}

