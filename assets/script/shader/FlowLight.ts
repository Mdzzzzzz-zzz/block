/*
 * @Date: 2024-05-30 19:53:19
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 14:38:27
 */

import { _decorator, Component, Node, director, Sprite, EditBox } from 'cc';
import { SilderScript } from './Script/SilderScript';
const { ccclass,executeInEditMode,property } = _decorator;

/**
 * Predefined variables
 * Name = SpriteStandard
 * DateTime = Sun Aug 21 2022 15:59:37 GMT+0800 (中国标准时间)
 * Author = leehong
 * FileBasename = SpriteStandard.ts
 * FileBasenameNoExtension = SpriteStandard
 * URL = db://assets/00SpriteStandard/SpriteStandard.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
@ccclass('FlowLight')
@executeInEditMode
export class FlowLight extends Component {


    @property(SilderScript)
    speed:SilderScript;

    @property(SilderScript)
    lineWidth:SilderScript;

    @property(SilderScript)
    radian:SilderScript;

    @property(Sprite)
    sprite:Sprite;

    start () {
        this.speed.setMin(1);
        this.speed.setMax(10);
        this.speed.setTxt("流光速度");
        this.speed.setValue(1);
        this.lineWidth.setMin(0);
        this.lineWidth.setMax(1);
        this.lineWidth.setTxt("流光宽度");
        this.lineWidth.setValue(0.1);
        this.radian.setMin(0);
        this.radian.setMax(3.14);
        this.radian.setValue(0.52);
        this.radian.setTxt("弧度");
    }

    update ()
    {
        this.sprite.material.setProperty("_speed",this.speed.getValue());
        this.sprite.material.setProperty("_lineWidth",this.lineWidth.getValue());
        this.sprite.material.setProperty("_radian",this.radian.getValue());
    }

    public onClick()
    {
        director.loadScene("Main");    
    }
}


