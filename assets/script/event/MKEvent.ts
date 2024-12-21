
class EventCell {
    func: Function;
    obj: Object;
    constructor(func: Function, obj: Object) {
        this.func = func;
        this.obj = obj;
    }
}

export type EventTypeKey = string | number;

class EventData {
    type: EventTypeKey;
    data: any[];
    constructor(type: EventTypeKey, ...data: any[]) {
        this.type = type;
        this.data = data;
    }
}

class MKEvent {
    private static ins = new MKEvent();

    private eventGroup = new Map<EventTypeKey, EventCell[]>();

    private eventCache = new Array<EventData>();

    private delayTime = 0;

    public static sendEvent(type: EventTypeKey, ...args: any[]) {
        const eg = MKEvent.ins.eventGroup;
        if (eg.has(type)) {
            const et = eg.get(type)!;
            for (const e of et) {
                e.func.call(e.obj,...args);
            }
        } else {
            // warn("sendEvent", type);
        }
    }

    // public static postEvent(type: EventTypeKey, ...args: any[]) {
    //     MKEvent.ins.eventCache.push(new EventData(type, args));
    // }

    public static regEvent(type: EventTypeKey, cb: Function, listener: Object) {
        const eg = MKEvent.ins.eventGroup;
        if (eg.has(type)) {
            const et = eg.get(type);
            let isExist = false;
            for (const v of et!) {
                if (v.func === cb && v.obj === listener) {
                    isExist = true;
                    break;
                }
            }
            if (isExist) {
                // warn("regEvent", type);
            } else {
                et!.push(new EventCell(cb, listener));
            }

        } else {
            eg.set(type, [new EventCell(cb, listener)]);
        }
    }

    public static unRegEvent(listener: Object): void;
    public static unRegEvent(type: number, listener: Object): void;
    public static unRegEvent(type: number | Object, listener?: Object): void {
        if (typeof (type) == "number") {
            MKEvent.ins.eventGroup.forEach((value: EventCell[], key: number) => {
                if (key === type) {
                    for (let index = value.length - 1; index >= 0; index--) {
                        const element = value[index];
                        if (element.obj === listener) {
                            value.splice(index, 1);
                        }
                    }
                }
                if (value.length == 0) {
                    MKEvent.ins.eventGroup.delete(type);
                }
            });

        } else {
            MKEvent.ins.eventGroup.forEach((value: EventCell[], key: number) => {
                for (let index = value.length - 1; index >= 0; index--) {
                    const element = value[index];
                    if (element.obj === type) {
                        value.splice(index, 1);
                    }
                }
                if (value.length == 0) {
                    MKEvent.ins.eventGroup.delete(key);
                }
            });
        }
    }

    public static update(deltaTime: number) {
        let ins = MKEvent.ins;
        // if( ins.delayTime > 0 ){
        //     ins.delayTime -= deltaTime;
        //     return;
        // }
        if (ins.eventCache.length > 0) {
            ins.eventCache.forEach((value: EventData, key: number) => {
                MKEvent.sendEvent(value.type, value.data);
            });
            ins.eventCache.length = 0;
        }
    }

    public static setDelayTime(dt:number){
        if(MKEvent.ins.delayTime < dt)
            MKEvent.ins.delayTime = dt;
    }
}

/**
 *   发送即时事件
 */
export const sendEvent = MKEvent.sendEvent;
/**
 *   发送延迟事件
 */
// export const postEvent = MKEvent.postEvent;
/**
 *   卸载监听事件
 */
export const regEvent = MKEvent.regEvent;
/**
 *   卸载监听事件
 */
export const unRegEvent = MKEvent.unRegEvent;
/**
 *   
 */
//  export const eventUpdate = MKEvent.update;