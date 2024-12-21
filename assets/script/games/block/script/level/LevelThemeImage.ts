/*
 * @Date: 2023-05-20 18:28:32
 * @LastEditors: lzb 2589358976@qq.com
 * @LastEditTime: 2023-07-11 19:45:32
 */
import { Sprite } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { ResManager } from '../../../../resource/ResManager';
import { SpriteAtlas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelThemeImage')
export class LevelThemeImage extends Component {
    @property
    levelTheme: string = "";
    @property
    spriteAtlas:SpriteAtlas = null;
    onLoad() {
        let imageSpr = this.node.getComponent(Sprite);
        let levelTheme =this.levelTheme==""? UserCollectLevelData.inst.getLevelThemeName():this.levelTheme;
        
        let curLevel = UserCollectLevelData.inst.getHistoryLevelWithTheme(levelTheme);

        let imageIndex = Math.floor(curLevel / 6 + 1);
        // console.log( curLevel+ levelTheme)
        let imagePath = `${levelTheme}/${imageIndex}`;
        let spriteFrame = ResManager.getInstance().loadSpriteFrame(imagePath,"level").then((spriteFrame)=>{
            if(imageSpr&&spriteFrame){
                imageSpr.spriteFrame = spriteFrame;
            }
        }).catch((err)=>{
            if(err){
                console.error(err);
            }
        });
    }
}

