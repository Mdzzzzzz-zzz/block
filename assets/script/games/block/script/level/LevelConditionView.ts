import { _decorator, Component, instantiate, Label, Layout, Node, Tween, tween } from 'cc';
import { BlockEventManager } from '../../../../event/BlockEventManager';
import { emLevCondition, LevelGame } from '../logic/LevelGame';
import { LevelConditionDiamondItem } from './LevelConditionDiamondItem';
import { BlockEventType } from '../define/Event';
import { UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelConditionView')
export class LevelConditionView extends Component {

    @property(Label)
    labLevel: Label = null;
    @property(Node)
    rootScoreCondition: Node = null;
    @property(Label)
    labScore: Label = null;
    @property(Label)
    labTargetScore: Label = null;
    @property(Node)
    rootDiamondCondition: Node = null;
    @property(Node)
    conditionItem: Node = null;

    @property
    isInScene: boolean = false;


    protected conditionMap: Map<number, LevelConditionDiamondItem>;
    protected score: number;
    protected manager: LevelGame;

    public getTargetScoreNode(): Node {
        return this.labTargetScore.node ? this.labTargetScore.node : this.node;
    }

    public getTargetCollectNode(key: number): Node {
        let item = this.conditionMap.get(key);
        if (item) {
            return item.node;
        }
        return this.node;
    }
    public initView(manager: LevelGame) {
        this.manager = manager;
        if (this.labLevel) {
            this.labLevel.string = `Level ${this.manager.levelConfig.id}`
        }
        this.initConditions();
    }
    start() {
        // BlockEventManager.instance.listen(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.setScore, this)
        //     .listen(BlockEventType.EVENT_SCENE_PLAY_SET_COLLECT, this.setCollect, this);
    }
    onDestroy() {
        // BlockEventManager.instance.unlisten(BlockEventType.EVENT_SCENE_PLAY_SET_SCORE, this.setScore, this)
        //     .unlisten(BlockEventType.EVENT_SCENE_PLAY_SET_COLLECT, this.setCollect, this);
    }

    initConditions() {
        if (!this.conditionItem) {
            console.error("异常的过关条件view:LevelConditionView ");
            return;
        }
        this.rootDiamondCondition.active = false;
        this.rootScoreCondition.active = false;
        this.unscheduleAllCallbacks();
        if (this.manager.conditionType == emLevCondition.Score) {
            this.rootScoreCondition.active = true;
            this.score = 0;
            this.labScore.string = "0";
            this.labTargetScore.string = this.manager.targetScore + "";
            if (!this.isInScene) {
                this.setScore(this.manager.scoreHelper.score)
            }
            this.onInitScore();
        }
        else if (this.manager.conditionType == emLevCondition.Collect) {
            this.rootDiamondCondition.destroyAllChildren();
            let keyArr = [];
            this.manager.targetCollects.forEach((value, key) => {
                keyArr.push(key);
            });
            keyArr.sort((a, b) => {
                return a - b;
            });
            this.conditionMap = new Map<number, LevelConditionDiamondItem>();
            for (let index = 0; index < keyArr.length; index++) {
                let key = keyArr[index];
                let targetNum = this.manager.targetCollects.get(key);
                let currentNum = this.manager.currentCollects.get(key);
                let itemNode = instantiate(this.conditionItem);
                let conditionItem = itemNode.getComponent(LevelConditionDiamondItem);
                conditionItem.setImageType(key);
                conditionItem.updateProgress(currentNum, targetNum);
                conditionItem.node.active = true;
                conditionItem.node.setParent(this.rootDiamondCondition);
                this.conditionMap.set(key, conditionItem);
            }
            let layout = this.rootDiamondCondition.getComponent(Layout);
            layout && layout.updateLayout(true);
            this.rootDiamondCondition.active = true;
            this.onInitCollect();
        }
    }
    onInitScore() {

    }
    onInitCollect() {
    }
    setCollectFly(fromNode:Node,key: number, curr: number, tar: number,callBack:Function,target:any){
        this.setCollect(key,curr,tar);
    }
    setCollect(key: number, curr: number, tar: number) {
        if (this.manager.conditionType == emLevCondition.Collect) {
            if (this.conditionMap.has(key)) {
                let item = this.conditionMap.get(key);
                if (item) {
                    item.updateProgress(curr, tar);
                }
            }
        }
    }

    setScore(score: number) {
        // console.log("setScore设置分数：",score,"目标分数：",this.manager.targetScore);
        score = Math.min(this.manager.scoreHelper.score,this.manager.targetScore);
        let self = this;
        if (this.manager.conditionType == emLevCondition.Score) {
            let tscore = this.score;
            let scorecz = score - this.score;
            if (scorecz > 0) {
                Tween.stopAllByTarget(this.labScore.node);
                this.score = score;
                let call = tween(this.node).call(() => {
                    tscore = tscore + 1;
                    tscore = tscore > self.manager.targetScore ? self.manager.targetScore : tscore;
                    let s = tscore.toString();
                    self.labScore.string = s;
                    // console.log("setScore设置分数： tweeen:",score,"目标分数：",self.manager.targetScore);
                    self.onScoreChange(tscore, self.manager.targetScore);
                });
                let usetime = 0.5;
                let time = usetime / scorecz;
                let delay = tween().delay(time);
                tween(this.node).repeat(scorecz, tween(this.node).sequence(delay, call)).then(tween(this.node).call(() => {
                    if (this.isInScene) {
                        this.manager && this.manager.checkIsLevelComplete();
                    }
                })).start();

            }
            this.score = score;
        }
    }
    onScoreChange(showScore, score) {

    }
    public moveToTarget(targetNode: Node, flyNode: Node, callBack: Function) {
        let dest = targetNode.worldPosition;
        let pt = flyNode.parent.getComponent(UITransform);
        dest = pt.convertToNodeSpaceAR(dest);
        if (!flyNode.active) {
            flyNode.active = true;
        }
        tween(flyNode)
            .to(0.1, { scale: new Vec3(2, 2, 1) })
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.1, { scale: new Vec3(1.6, 1.6, 1) })
            .to(0.1, { scale: new Vec3(1.4, 1.4, 1) })
            .delay(0.5)
            .parallel(
                tween().to(0.4, { position: new Vec3(dest.x, dest.y) }, { easing: 'cubicIn' }),
                tween().to(0.4, { scale: new Vec3(0.5, 0.5, 1) })
            )
            .to(0.1, { scale: new Vec3(0, 0, 0) })
            .call(() => {
                callBack && callBack.call(this);
            })
            .start();
    }
}

