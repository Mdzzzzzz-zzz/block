/*
 * @Date: 2023-05-25 19:49:07
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2023-07-16 14:53:40
 */
import { _decorator, Component, Node } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { PageViewIndicatorItem } from '../../../../panel/PageViewIndicatorItem';
import { Sprite, Color } from 'cc';
import { mk } from '../../../../MK';
import { AssetInfoDefine } from '../../../../define/AssetInfoDefine';
const { ccclass, property } = _decorator;

@ccclass('LevelThemeToggle')
export class LevelThemeToggle extends Component {
    @property
    levelTheme: string = "";
    @property(Sprite)
    sprIcon: Sprite = null;
    protected onLoad(): void {
       this.changeState();
    }
    
    public changeState(){
        let current = UserCollectLevelData.inst.getLevelThemeName();
        if(current == this.levelTheme){
            this.setEnable();
        }
        else{
            this.setDisable();
        }
    }
    /**
     * 激活状态
     */
    public setEnable() {
        if(this.sprIcon){
            this.sprIcon.grayscale = false;
        }
    }
    /**
     * 隐藏状态
     */
    public setDisable() {
        if(this.sprIcon){
            this.sprIcon.grayscale = true;
        }
    }
    onClick(){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        if(this.levelTheme&&this.levelTheme!=""){
            UserCollectLevelData.inst.setLevelThemeName(this.levelTheme);
        }
        let compts = this.node.parent.getComponentsInChildren(LevelThemeToggle);
        compts.forEach((cmpt)=>{
            cmpt.changeState();
        })
    }
}

