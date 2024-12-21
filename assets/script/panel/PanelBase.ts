import { _decorator, Component, Enum, BlockInputEvents, Node } from 'cc';
import { emPanelType } from "./PanelDef";
import { PanelBaseMask } from './PanelBaseMask';
import * as env from 'cc/env';

const { ccclass, property } = _decorator;

@ccclass
export default class PanelBase<T> extends Component {

  @property({ type: Enum(emPanelType) })
  panelType: emPanelType = emPanelType.Popup;

  /** 面板数据 */
  protected _data: T = null;
  protected get data(): T {
    return this._data;
  }
  protected set data(value: T) {
    this._data = value;
  }
  /** 弹出效果 */
  private _enabledPopupEffect: boolean = false;
  /** 面板遮罩节点 */
  private _maskLayer: Node = null;
  /** 是否启用遮罩 */
  private _enabledMaskLayer: boolean = true;
  public panelName: string = "";

  public parentManager: IPanelManager = null;


  onLoad() { }

  start() { }

  onDestroy() { }

  onEnable() { }

  onDisable() { }

  /** 是否启用遮罩 */
  public setMaskLayerEnable(enable: boolean) {
    this._enabledMaskLayer = enable;
  }

  /** 初始化MaskLayer */
  private initMaskLayer(maskLayer: Node) {
    if (!this._enabledMaskLayer) return;
    if (this._maskLayer && this._maskLayer.isValid) return;
    if (!maskLayer) return;
    if (!maskLayer.getComponent(BlockInputEvents)) {
      maskLayer.addComponent(BlockInputEvents);
    }
    let baseMask = maskLayer.getComponent(PanelBaseMask);
    if (baseMask) {
      baseMask.container = this;
    }
    this.node.addChild(maskLayer);
    this._maskLayer = maskLayer;
    this._maskLayer.setSiblingIndex(0);
    this._maskLayer.setPosition(0, 0, 0);
    this._maskLayer.active = true;
    maskLayer.name = this.name + "_mask"
  }

  /** 设置遮罩透明度 */
  private setMaskLayerOpactity(opacity: number) {
    // if (this._maskLayer) {
    //   this._maskLayer.opacity = opacity;
    // }
  }

  protected beforeWillShow() { }

  /** 窗口即将显示，窗口显示动画播放之前 */
  protected onWillShow() {

  }

  /** 窗口显示动画播放完成 */
  protected onShow() {
  }

  /** 窗口即将关闭，窗口关闭动画播放之前触发 */
  protected onWillClose() {

  }

  /** 窗口关闭动画播放完成 */
  protected onClose() {
    if (this.parentManager) {
      this.parentManager.onClosePanel(this.panelName);
    }
  }

  public setData(value: T) {
    this._data = value;
    if (env.PREVIEW || env.EDITOR) {
      console.log("data", value);
    }
    this.onSetData(value);
  }
  protected onSetData(value: T) { }

  // 关闭面板
  public closeSelf() {
    this.willClose();
  }

  private exeCloseUI() {
    this.onClose();
    if (this.node && this.node.isValid) {
      this.doClosePanel();
    }
    let pm = this.parentManager;
    if (pm != null) {
      pm.checkQueue();
    }
  }

  protected doClosePanel() {
    this.node.destroy();
  }

  private exeShowUI() {
    this.onShow();
  }

  private willClose() {
    this.onWillClose();
    if (this._enabledPopupEffect) {
      if (this.isValid && this.node && this.node.isValid) {

        // tween(this.node)
        //   .sequence(
        //     tween(this.node).to(0.03, { scale: 1.1 }),
        //     tween(this.node).to(0.06, { scale: 0.6 }),
        //     tween(this.node).call(() => {
        //       this.exeCloseUI();
        //     }, this)
        //   )
        //   .start();
        // this.node.runAction(seq);
        this.exeCloseUI();
      }
    } else {
      this.exeCloseUI();
    }
  }

  public willShow(isPopUpAni: boolean, maskLayer: Node) {
    if (this.node == null) {
      return;
    }
    this._enabledPopupEffect = isPopUpAni;
    this.beforeWillShow();
    this.onWillShow();
    this.initMaskLayer(maskLayer);
    if (this._enabledPopupEffect) {
      // this.node.stopAllActions();
      // let scale = this.node.scale;
      // let seq = sequence(
      //   scaleTo(0.2, scale * 1.1),
      //   scaleTo(0.03, scale),
      //   callFunc(() => {
      //     this.exeShowUI();
      //   }, this)
      // );
      // this.node.scale = 0.8;
      // //tween(this.node).sequence(seq).start();
      // tween(this.node)
      //   .sequence(
      //     tween(this.node).to(0.3, { scale: 1.1 }),
      //     tween(this.node).to(0.1, { scale: 1 }),
      //     tween(this.node).call(() => {
      //       this.exeShowUI();
      //     }, this)
      //   )
      //   .start();
      // // this.node.runAction(seq);
      this.exeShowUI();
    } else {
      this.exeShowUI();
    }
  }
}
