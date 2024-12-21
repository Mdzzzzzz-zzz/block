/*
 * @Date: 2024-06-01 10:03:40
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2024-06-01 10:05:10
 */
import { sys } from "cc";
import { Singleton } from "../Singleton";
import { PREVIEW } from "cc/env";

export class ToastManager extends Singleton{
    platform: any;
    public Init() {
        if(sys.platform == sys.Platform.WECHAT_GAME){
            this.platform = window["wx"];
        }
    }
    public UnInit() {

    }
    public showToast(content: string, duration: number = 1000) {
        if(PREVIEW){
            console.log(content);
            return;
        }
        this.platform.showToast({
            title: content,
            icon: "none",
            duration: duration,
        });
    }
    public hideToast() {
        if(PREVIEW){
            return;
        }
        this.platform.hideToast();
    }
    public showLoading(title: string) {
        if(PREVIEW){
            return;
        }
        this.platform.showLoading({
            title: title,
        });
    }
    public hideLoading() {
        if(PREVIEW){
            return;
        }
        this.platform.hideLoading();
    }
    
}