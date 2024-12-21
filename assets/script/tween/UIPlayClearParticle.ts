/*
 * @Date: 2024-05-24 10:59:16
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-05-24 14:24:00
 */
import { _decorator, Color, GradientRange } from "cc";
import { UIPlayEffectParticle } from "./UIPlayEffectParticle";
const { ccclass, property } = _decorator;

@ccclass("UIPlayClearParticle")
export class UIPlayClearParticle extends UIPlayEffectParticle {
    public setColor(color: Color) {
        let gradient = new GradientRange();
        gradient.color = color;
        this.particles.forEach((element) => {
            element.startColor = gradient;
        });
    }
}
