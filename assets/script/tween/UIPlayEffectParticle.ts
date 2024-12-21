/*
 * @Date: 2024-05-23 22:58:52
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-28 10:46:12
 */
import { _decorator, Component, Node, ParticleSystem } from "cc";
const { ccclass, property } = _decorator;

@ccclass("UIPlayEffectParticle")
export class UIPlayEffectParticle extends Component {
    @property({ type: [ParticleSystem] })
    public particles: ParticleSystem[] = [];
    start() {}

    public play() {
        if (this.particles.length == 0) {
            this.particles = this.getComponentsInChildren(ParticleSystem);
        }
        this.particles.forEach((element) => {
            if (element) {
                element.play();
            }
        });
    }
    public stop() {
        this.particles.forEach((element) => {
            if (element) {
                element.stop();
            }
        });
    }
    protected onDisable(): void {
        this.stop();
    }
    protected onEnable(): void {
        this.play();
    }
}
