/*
 * @Date: 2024-09-12 20:28:11
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 14:38:38
 */
import { _decorator, Component, Node, Sprite,director } from 'cc';
import { SilderScript } from './Script/SilderScript';
const { ccclass, property } = _decorator;
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
 
@ccclass('Distort')
export class Distort extends Component {

    @property(SilderScript)
    speed:SilderScript;

    @property(SilderScript)
    strength:SilderScript;
    
    @property(Sprite)
    sprite:Sprite;

    start () {
        this.speed.setMin(0);
        this.speed.setMax(1);
        this.speed.setValue(0.1);
        this.speed.setTxt("扭曲变化速度");
        this.strength.setMin(0);
        this.strength.setMax(0.5);
        this.strength.setValue(0.1);
        this.strength.setTxt("扭曲变化强度");
    }

    update ()
    {
        this.sprite.getMaterial(0).setProperty("_speed",this.speed.getValue());
        this.sprite.getMaterial(0).setProperty("_strength",this.strength.getValue());
    }
    

    public onClick()
    {
        director.loadScene("Main");    
    }

  
}


