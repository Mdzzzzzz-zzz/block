/*
 * @Date: 2023-06-14 16:46:44
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-20 13:09:47
 */
import { Label, Sprite, SpriteFrame } from 'cc';
import { _decorator } from 'cc';
import { mk } from '../../MK';
import { DialogType } from './MKUICtr';
const { ccclass, property } = _decorator;
interface IDialogParam {
    content: string;
    type?: number;
    tittle?: string;
    title?: string;//兼容老代码的拼写错误
    confirmBtnLabel?: string;
    cancelBtnLabel?: string;
    cancelCallback?: () => void; // 点击 取消的回调函数
    confirmCallback?: () => void;// 点击 确定的回调函数
    closeCallback?: () => void;  // 点击 x的回调函数
}
@ccclass('MKDialog')
export class MKDialog extends mk.UIBase {
    @property(Label)
    labContent: Label = null;
    @property(Label)
    tittle: Label = null;
    @property(Label)
    confirm: Label = null;
    @property(Label)
    cancel: Label = null;

    private confirmCallback: () => void = null;
    private cancelCallback: () => void = null;
    private closeCallback: () => void = null;

    init(param?: IDialogParam) {
        if (param) {
            if (param.content && this.labContent) {
                this.labContent.string = param.content;
            }
            if (param.confirmBtnLabel && this.confirm) {
                this.confirm.string = param.confirmBtnLabel;
            }
            if (param.cancelBtnLabel && this.cancel) {
                this.cancel.string = param.cancelBtnLabel;
            }
            if (param.tittle && this.tittle) {
                this.tittle.string = param.tittle;
            }
            if (param.title && this.tittle) {
                this.tittle.string = param.title;
            }
            if (typeof param.confirmCallback === "function") {
                this.confirmCallback = param.confirmCallback;
            }
            if (typeof param.cancelCallback === "function") {
                this.cancelCallback = param.cancelCallback;
            }
            if (typeof param.closeCallback === "function") {
                this.closeCallback = param.closeCallback;
            }
        }
    }

    /** 确定按钮 */
    onBtnConfirm() {
        mk.audio.playBtnEffect();
        this.confirmCallback?.();
        this.closeSelf();
    }

    /** 取消按钮 */
    onBtnCancel() {
        mk.audio.playBtnEffect();
        this.cancelCallback?.();
        this.closeSelf();
    }

    /** x关闭按钮 */
    onClickClose() {
        mk.audio.playBtnEffect();
        this.closeCallback?.();
        this.closeSelf();
    }

    closeSelf() {
        this.node.destroy();
    }
}
