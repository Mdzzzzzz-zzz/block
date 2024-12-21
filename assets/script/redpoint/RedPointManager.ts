/*
 * @Date: 2024-04-02 13:18:13
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-04-02 17:30:05
 */

import { EventTarget } from "cc";
import { FlagData } from "../data/FlagData";
import { UserData } from "../data/UserData";
import { BlockEventManager } from "../event/BlockEventManager";
import { Singleton } from "../Singleton";
import { emRedPointKeys, evtRedPoint } from "./RedPointDef";
import { Events } from "../event/EventType";

export class RedPointManager extends Singleton{
    private _points:Map<number,number>;
    private _event:EventTarget;

    public Init() {
        this._points = new Map<number,number>();
        this._event = new EventTarget();
        if(UserData.inst.isOpenLevel && !this.hasPointFlag(emRedPointKeys.UnclockLevel)){
            this._points.set(emRedPointKeys.UnclockLevel,1);
        }
        BlockEventManager.instance.listenOnce(Events.UNLOCK_LEVEL,()=>{
            this.addPoint(emRedPointKeys.UnclockLevel);
        },this);
    }
    public UnInit() {
    }
    public addPoint(key:number,once:boolean=true){
        if(once){
            if(this.hasPointFlag(key)){
                return
            }
        }
        this._points.set(key,1);
        FlagData.inst.recordFlag("rp_"+key,false)
        this._event.emit(evtRedPoint.Refresh,key,true);
    }
    public removePoint(key:number):void {
        if(this.hasPointFlag(key)){
            return
        }
        if(this._points.has(key)){
            this._points.delete(key);
        }
        FlagData.inst.recordFlag("rp_"+key,true);
        this._event.emit(evtRedPoint.Refresh,key,false);
    }

    public hasPointFlag(key:number):boolean {
        return FlagData.inst.hasFlag("rp_"+key);
    }

    public removePointFlag(key:number):void {
        FlagData.inst.recordFlag("rp_"+key);
    }


    public checkPoint(key:number):number{
        if(this._points && this._points.has(key)){
            return this._points.get(key);
        }
        return 0;
    }

    public listen(eventType:string|number,callBack:(...any: any[]) => void,target:any){
        this._event.on(eventType,callBack,target,false);
        return this;
    }
    public unlisten(eventType:string|number,callBack:(...any: any[]) => void,target:any){
        this._event.off(eventType,callBack,target);
        return this;
    }
    public listenOnce(eventType:string|number,callBack:(...any: any[]) => void,target:any){
        this._event.once(eventType,callBack,target);
        return this;
    }
    
}