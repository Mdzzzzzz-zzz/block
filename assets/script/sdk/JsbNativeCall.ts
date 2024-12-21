import { sys, native } from "cc";
import { PREVIEW } from "cc/env";
import * as env from "cc/env";

export interface CallbackContext {
    success?: Function;
    failure?: Function;
    callbackId: string;
}

export class JsbNativeCall {
    private static _callbackMaps: { [key: string]: CallbackContext } = {};
    private static _callbackId: number = 0;

    public static init() {
        native.jsbBridgeWrapper.addNativeEventListener("emitWindowEvent", (data) => {
            let jsonObj = JSON.parse(data);
            let eventType = jsonObj.event;
            let eventData = jsonObj.data;
            JsbNativeCall.emitWindowEvent(eventType, eventData);
        });

        native.jsbBridgeWrapper.addNativeEventListener("callBackCallSuccess", (data) => {
            let jsonObj = JSON.parse(data);
            let callbackId = jsonObj.event;
            let params = jsonObj.data;
            JsbNativeCall.callBackCallSuccess(callbackId, params);
        });

        native.jsbBridgeWrapper.addNativeEventListener("callBackCallFailure", (data) => {
            let jsonObj = JSON.parse(data);
            let callbackId = jsonObj.event;
            let params = jsonObj.data;
            JsbNativeCall.callBackCallFailure(callbackId, params);
        });
    }
    public static addEventListener(event: string, listener: Function) {
        native.jsbBridgeWrapper.addNativeEventListener(event, (data) => {
            if (data && data.length > 0) {
                let jsonObj = JSON.parse(data);
                listener(jsonObj);
            } else {
                listener();
            }
        });
    }
    public static removeEventListener(event: string, listener: native.OnNativeEventListener) {
        native.jsbBridgeWrapper.removeNativeEventListener(event, listener);
    }

    private static getCallbackContext(callbackId: string): CallbackContext | null {
        if (JsbNativeCall._callbackMaps.hasOwnProperty(callbackId)) {
            const callbackContext = JsbNativeCall._callbackMaps[callbackId];
            delete JsbNativeCall._callbackMaps[callbackId];
            return callbackContext;
        } else {
            return null;
        }
    }

    private static setCallbackContext(obj: CallbackContext) {
        JsbNativeCall._callbackMaps[obj.callbackId] = obj;
    }

    private static getCallBackId(): string {
        JsbNativeCall._callbackId++;
        return JsbNativeCall._callbackId + "";
    }

    private static _exec(service: string, action: string, params: Object | undefined, callbackId: string) {
        if (PREVIEW || env.WECHAT || env.BYTEDANCE) {
            if (env.DEBUG) {
                console.log("JsbNativeCall", "_exec", service, action, params, callbackId);
            }
            return;
        }
        let data = {
            service: service,
            action: action,
            params: params,
            callbackId: callbackId,
        };
        // native.jsbBridgeWrapper.dispatchEventToNative("JsbCall", JSON.stringify(data));
        if (sys.os == sys.OS.ANDROID) {
            native.reflection.callStaticMethod(
                "com.brix.jsb.JsbCall",
                "exec",
                "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",
                service,
                action,
                params,
                callbackId
            );
        } else if (sys.os == sys.OS.IOS) {
            //反射方式
            // native.reflection.callStaticMethod(
            //     "JsbCall",
            //     "execWithService:action:params:callbackId:",
            //     service,
            //     action,
            //     params,
            //     callbackId
            // );
            //jsb方式
            let data = {
                service: service,
                action: action,
                params: params,
                callbackId: callbackId,
            };
            native.jsbBridgeWrapper.dispatchEventToNative("JsbCall", JSON.stringify(data));
        }
    }

    /**
     * exec Native method Call
     * @param {string} service
     * @param {string} action
     * @param {Object} params
     * @param {function} success
     * @param {function} failure
     */
    public static exec(service: string, action: string, params?: Object, success?: Function, failure?: Function) {
        if (PREVIEW || env.WECHAT || env.BYTEDANCE) {
            if (env.DEBUG) {
                console.log("JsbNativeCall", "_exec", service, action, params);
            }
            return;
        }
        const callbackId = JsbNativeCall.getCallBackId();
        const callbackContext: CallbackContext = {
            success,
            failure,
            callbackId,
        };
        JsbNativeCall.setCallbackContext(callbackContext);

        JsbNativeCall._exec(service, action, JSON.stringify(params), callbackContext.callbackId);
    }

    public static callBackCallSuccess(callbackId: string, params: string) {
        const callbackContext = JsbNativeCall.getCallbackContext(callbackId);
        if (
            callbackContext &&
            callbackContext.hasOwnProperty("success") &&
            typeof callbackContext.success == "function"
        ) {
            callbackContext.success(params);
        }
    }

    public static callBackCallFailure(callbackId: string, params: string) {
        const callbackContext = JsbNativeCall.getCallbackContext(callbackId);
        if (
            callbackContext &&
            callbackContext.hasOwnProperty("failure") &&
            typeof callbackContext.success == "function"
        ) {
            callbackContext.failure(params);
        }
    }
    //aos 目前还是反射 iOS改成了jsbbridge
    public static emitWindowEvent(type: string, data: any) {
        const evt = JsbNativeCall.createEvent(type, data);
        window.dispatchEvent(evt);
    }
    private static createEvent(type: string, data: any): Event {
        const event = new window.Event(type);
        if (data) {
            for (let i in data) {
                if (data.hasOwnProperty(i)) {
                    event[i] = data[i];
                }
            }
        }
        (event as any)._result = data;
        return event;
    }
}
window["JsbNativeCall"] = JsbNativeCall;
