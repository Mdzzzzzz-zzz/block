import { _decorator } from "cc";
import { Component, Node } from "cc";

const { ccclass, property } = _decorator;
/**
 * 数字渐变动画
 */
@ccclass
export default class UITweenNumber extends Component {
  public onFinished: Function;
  public target: any;
  public duration = 1;
  public from: number = 0;
  public to: number = 0;
  public fixed: number;

  private currentTime: number = 0;
  private currentValue: number = 0;
  private deltaValue: number = 0;
  public get CurrentValue(): number {
    return this.currentValue;
  }
  public SetEnable() {
    this.currentValue = this.from;
    this.deltaValue = this.to - this.from;
  }
  // onLoad()
  // {

  // }
  start() {
    this.SetEnable();
  }
  update(dt) {
    if (this.duration == 0) {
      this.enabled = false;
      this.onChangeValue(this.to);
      this.currentValue = this.to;
      if (this.onFinished != null) {
        this.onFinished.call(this.target);
      }
      return;
    }
    this.currentTime += dt;
    if (this.currentTime >= this.duration) {
      this.enabled = false;
      this.currentTime = 0;
      this.onChangeValue(this.to);
      this.currentValue = this.to;
      if (this.onFinished != null) {
        this.onFinished.call(this.target);
      }
      return;
    }
    this.currentValue += (dt * this.deltaValue) / this.duration;
    this.onChangeValue(this.currentValue);
  }
  public onChange: (value: number) => void;
  /**
   * todo format  as 1K 1W
   * @param value
   */
  private onChangeValue(value: number) {
    if (this.onChange) {
      this.onChange(value);
    }
  }

  public static Begin(
    node: Node,
    from: number,
    to: number,
    time: number = 1,
    onChange: (value: number) => void,
    onFinish: Function = null,
    target: any = null
  ) {
    let uITweenNumber: UITweenNumber = node.getComponent(UITweenNumber);
    if (uITweenNumber == null) {
      uITweenNumber = node.addComponent(UITweenNumber);
    }
    uITweenNumber.duration = time;
    uITweenNumber.currentTime = 0;
    uITweenNumber.to = to;
    uITweenNumber.from = from;
    uITweenNumber.onChange = onChange;
    uITweenNumber.enabled = true;
    uITweenNumber.SetEnable();
    uITweenNumber.onFinished = onFinish;
    uITweenNumber.target = target;
  }
  // public static AddValue(label:cc.Label, add:number,fixed:number=0, time:number=1, onFinish:Function = null)
  // {
  // 	let uITweenNumber:UITweenNumber = label.node.getComponent(UITweenNumber);
  // 	if (uITweenNumber == null)
  // 	{
  // 		uITweenNumber = label.node.addComponent(UITweenNumber);
  //     }
  //     let from =uITweenNumber.CurrentValue;
  // 	uITweenNumber.delayTime = time;
  // 	uITweenNumber.currentTime = 0;
  // 	uITweenNumber.to = from+add;
  // 	uITweenNumber.from = from;
  // 	uITweenNumber.label = label;
  // 	uITweenNumber.enabled = true;
  // 	uITweenNumber.SetEnable();
  // 	uITweenNumber.onFinished = onFinish;
  // }
}
