import { EventTarget } from "cc";

export class BlockEventManager extends EventTarget{
    private static _inst: BlockEventManager;
    public static get instance () {
        if (this._inst) return this._inst;
        this._inst = new BlockEventManager();
        return this._inst;
    }
    public listen(eventType:number,callBack:(...any: any[]) => void,target:any){
        this.on(eventType,callBack,target,false);
        return this;
    }
    public unlisten(eventType:number,callBack:(...any: any[]) => void,target:any){
        this.off(eventType,callBack,target);
        return this;
    }
    public listenOnce(eventType:number,callBack:(...any: any[]) => void,target:any){
        this.once(eventType,callBack,target);
        return this;
    }
}