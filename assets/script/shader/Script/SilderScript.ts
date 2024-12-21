/*
 * @Date: 2024-09-12 20:28:11
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-09-21 14:39:17
 */

import { _decorator, Component, Node, CCObject, Slider, EditBox, Label, CCFloat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SilderScript')
export class SilderScript extends Component {

   

    @property(CCFloat)
    min:number = 0;

    @property(CCFloat)
    max:number = 1;

    @property(Label)
    lab:Label;
   
    @property(EditBox)
    box:EditBox;

    @property(Slider)
    silder:Slider;

    start()
    {
    }

    update()
    {
        this.box.string = (this.silder.progress * (this.max-this.min)+ this.min).toFixed(2);
    }

    public setTxt(str:string):void
    {
        this.lab.string = str;
    }

    public setMin(num:number):void
    {
        this.min = num;
    }

    public setMax(num:number):void
    {
        this.max = num;
    }

    public getValue():number
    {
        return Number.parseFloat(this.box.string)
    }

    public setValue(val:number)
    {
        this.silder.progress  = (val-this.min)/(this.max-this.min);
    }

}

