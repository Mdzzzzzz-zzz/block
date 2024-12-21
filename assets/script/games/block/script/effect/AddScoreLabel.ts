import { _decorator, Component, Node, Label, tween, Vec3, TweenSystem, UITransform, v3, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AddScoreLabel')
export class AddScoreLabel extends Component {
    @property(Label)
    addscoreLabel: Label = null;
    private willdealnode: Node = null;
    public score: number = 0;

    onLoad() {
        
    }
    /**
     * @description 设置需要显示的添加的分数
     * @param {Number} score 添加的分数
     */
    setScore(score: number) {
        this.score = score;
        this.addscoreLabel.string =  "+" + score.toString();
    }

    /**
    * @description 显示当前添加的分数
    */
    show(tscale: Vec3,callback:Function=null,selfNode:Node) {
        this.addscoreLabel.node.active = true;
        if (tscale) {
            this.node.scale = tscale;
        }
        this.addscoreLabel.node.setPosition(0, 0, 0);
        // let pt = this.node.parent.getComponent(UITransform);
        // dest = pt.convertToNodeSpaceAR(dest);

        let action = tween()
            .to(0.1, { scale: v3(1.2, 1.2, 1) })
            .to(0.1, { scale: v3(1.6, 1.6, 1) })
            .to(0.1, { scale: v3(1.4, 1.4, 1) })
            .delay(0.3)
            .to(0.1, { scale: new Vec3(1, 1, 1) })
        let callFunc = tween().call(() => {
            // if (SceneMode.gameMode == kGameMode.endless) {
            //     // mk.sendEvent(BlockEventType.TT_REFRESH_SCORE, this.score);
            // }
            // mk.sendEvent(BlockEventType.EVENT_ADD_SCORE_ANI_FINISH, this.willdealnode);
            Tween.stopAllByTarget(this.addscoreLabel.node);
            callback?.(this.node);
        });
        tween(this.node).sequence(action, callFunc).start();
    }
}

