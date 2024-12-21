import { EventTarget } from "cc";
import { SdkSingleton } from "./common/SdkSingleton";
export class SdkEventManager extends SdkSingleton {
    protected manager: EventTarget;
    public Init() {
        this.manager = new EventTarget();
        return this;
    }
    public UnInit() {
    }
    public register(eventType: string | number, callBack: (...any: any[]) => void, target: any) {
        this.manager.on(eventType, callBack, target, false);
        return this;
    }
    public unregister(eventType: string | number, callBack: (...any: any[]) => void, target: any) {
        this.manager.off(eventType, callBack, target);
        return this;
    }
    public registerOnce(eventType: string | number, callBack: (...any: any[]) => void, target: any) {
        this.manager.once(eventType, callBack, target);
        return this;
    }
    public emit(eventType: string | number, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        this.manager.emit(eventType, arg0, arg1, arg2, arg3, arg4);
    }
}