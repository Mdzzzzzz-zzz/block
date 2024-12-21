/*
 * @Date: 2023-05-25 19:25:30
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-05-25 20:26:04
 */
import { _decorator, Color, Component, Label, Node, PageView } from 'cc';
import { PageViewIndicatorEx } from './PageViewIndicatorEx';
import { Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PageViewIndicatorItem')
export class PageViewIndicatorItem extends Component {
    public index: number = 0;
    public pageView:PageView;
    @property(Label)
    labTabName: Label = null;
    @property(Sprite)
    sprIcon: Sprite = null;
    /**
     * 激活状态
     */
    public setEnable() {
        if(this.labTabName){
            this.labTabName.color = Color.BLACK;
        }
        if(this.sprIcon){
            this.sprIcon.grayscale = false;
        }
        // this.node.setPosition(this.node.position.x,10,0);
    }
    /**
     * 隐藏状态
     */
    public setDisable() {
        if(this.labTabName){
            this.labTabName.color = Color.WHITE
        }
        if(this.sprIcon){
            this.sprIcon.grayscale = true;
        }
        // this.node.setPosition(this.node.position.x,0,0);
    }
    public onClick(){
        this.pageView.setCurrentPageIndex(this.index);
        (this.pageView.indicator as PageViewIndicatorEx).changedState();
    }
}

