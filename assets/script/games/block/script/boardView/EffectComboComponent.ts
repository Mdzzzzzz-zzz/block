/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-25 19:06:41
 */
import { _decorator, Component, Node, Animation } from "cc";
import { BlockEventManager } from "../../../../event/BlockEventManager";
import { BlockEventType } from "../define/Event";
import { UIPlayEffectParticle } from "../../../../tween/UIPlayEffectParticle";
const { ccclass, property } = _decorator;

@ccclass("EffectComboComponent")
export class EffectComboComponent extends Component {
    @property(Node)
    rootCombo: Node = null;
    @property(Node)
    rootComboKeep: Node = null;
    @property(Node)
    rootComboAdd: Node = null;

    private keepAnim: Animation = null;
    private keepAnimParticles: UIPlayEffectParticle = null;
    private addAnim: Animation = null;
    private addAnimParticles: UIPlayEffectParticle = null;
    onLoad() {
        BlockEventManager.instance.listen(BlockEventType.BLOCK_COMBO, this.onShowCombo, this);
        this.keepAnim = this.rootComboKeep.getComponentInChildren(Animation);
        this.keepAnimParticles = this.rootComboKeep.getComponent(UIPlayEffectParticle);
        this.addAnim = this.rootComboAdd.getComponentInChildren(Animation);
        this.addAnimParticles = this.rootComboAdd.getComponent(UIPlayEffectParticle);
    }
    onShowCombo(show: boolean, comboTimes: number) {
        if (show) {
            if(comboTimes<=2){
                if (this.rootCombo.active) {
                    this.rootCombo.active = false;
                }
                if (this.rootComboKeep.active) {
                    this.rootComboKeep.active = false;
                }
                return
            }
            if (!this.rootCombo.active) {
                this.rootCombo.active = true;
            }
            if (comboTimes <= 3) {
                if (!this.rootComboKeep.active) {
                    this.rootComboKeep.active = true;
                }
                if (this.keepAnim) {
                    this.keepAnim.play();
                    this.keepAnimParticles.play();
                }
            } else {
                if (!this.rootComboAdd.active) {
                    this.rootComboAdd.active = true;
                }
                if (this.addAnim) { 
                    this.addAnim.play();
                    this.addAnimParticles.play();
                }
            }
        } else {
            if (this.rootCombo.active) {
                this.rootCombo.active = false;
            }

            if (this.keepAnim) {
                this.keepAnim.stop();
                this.keepAnimParticles.stop();
            }
            if (this.addAnim) {
                this.addAnim.stop();
                this.addAnimParticles.stop();
            }
            if (this.rootComboAdd.active) {
                this.rootComboAdd.active = false;
            }
            if (this.rootComboKeep.active) {
                this.rootComboKeep.active = false;
            }
        }
    }
    protected onDestroy(): void {
        BlockEventManager.instance.unlisten(BlockEventType.BLOCK_COMBO, this.onShowCombo, this);
    }

    // update(deltaTime: number) {

    // }
}
