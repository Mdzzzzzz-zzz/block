import { ProgressBar, math } from 'cc';
import { _decorator } from "cc";
import { Component, Node } from "cc";

const { ccclass, property } = _decorator;
@ccclass("UITweenBarComponent")
export class UITweenBarComponent extends Component {


	public delayTime: number = 1;
	public from: number = 1;
	public to: number = 1;
	/**
	 * 次数
	 */
	public count: number = 0;
	@property(ProgressBar)
	public bar: ProgressBar = null;
	
	private currentTime: number = 0;
	private currentValue: number = 0;
	private deltaValue: number = 0;
	private target: any;
	public setTarget(target: any) {
		this.target = target;
	}

	public onFinished: Function = null;
	public SetEnable() {
		this.currentValue = this.from;
		this.deltaValue = this.to - this.from + this.count;
	}
	start() {
		this.SetEnable();
	}
	update(dt) {
		if (this.bar == null) {
			return;
		}
		if (this.delayTime < 0) {
			return;
		}
		if (this.delayTime == 0) {
			this.delayTime = -1;
			this.bar.progress = this.to;
			if (this.onFinished != null) {
				this.onFinished.call(this.target, this.to);
			}
			this.enabled = false;
			return;
		}
		this.currentTime += dt;
		if (this.currentTime >= this.delayTime) {
			this.currentTime = 0;
			this.bar.progress = this.to;
			this.delayTime = -1;
			if (this.onFinished != null) {
				this.onFinished.call(this.target, this.to);
			}
			this.enabled = false;
			return;
		}
		this.currentValue += dt * this.deltaValue / this.delayTime;
		if (this.deltaValue >= 0 && this.currentValue >= 1) {
			this.currentValue -= 1;
		}
		else {
			if (this.deltaValue < 0 && this.currentValue <= 0) {
				this.currentValue += 1;
			}
		}
		let targetValue = Math.min(this.currentValue,this.to);
		// this.bar.progress = targetValue;

		if (this.onProgressHandler != null) {
			this.onProgressHandler.call(this.onProgressTarget,targetValue);
		}
	}
	public onProgressHandler: Function = null;
	public onProgressTarget:any = null;
	public addProgressListener(handler: Function,target:any) {
		this.onProgressHandler = handler;
		this.onProgressTarget = target;
	}
	public removeListener() {
		this.onFinished = null;
		this.onProgressHandler = null;
	}
	public static Begin(bar: ProgressBar, from: number, to: number, time: number = 0.2, count: number = 0, onFinish: Function = null): UITweenBarComponent {
		bar.progress = from;
		// if (bar.progress == cc.misc.clamp01(to))
		// {
		// 	return;
		// }
		let uITweenBar: UITweenBarComponent = bar.node.getComponent(UITweenBarComponent);
		if (uITweenBar == null) {
			uITweenBar = bar.node.addComponent(UITweenBarComponent);
		}
		uITweenBar.currentTime = 0;
		uITweenBar.delayTime = time;
		uITweenBar.from = from;
		uITweenBar.to = math.clamp01(to);
		uITweenBar.count = count;
		uITweenBar.bar = bar;
		uITweenBar.enabled = true;
		uITweenBar.SetEnable();
		if (uITweenBar.onFinished == null) {
			uITweenBar.onFinished = onFinish;
		}
		return uITweenBar;
	}
}
