/*
 * @Date: 2024-02-26 10:53:24
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-03 16:27:10
 */
interface dtNetworkStatusChange {
    isConnected: boolean;
    // wifi 	wifi 网络
    // 2g 	2g 网络
    // 3g 	3g 网络
    // 4g 	4g 网络
    // 5g 	5g 网络
    // unknown 	Android 下不常见的网络类型
    // none 	无网络
    networkType: string;
    errMsg?: string;
}
interface dtGameStateInfo {
    networkConnected: boolean; //网络状态
    networkType: string; //网络类型
    isOnForeground: boolean; //当前是否是在前台
}

interface ILog {
    log(tag, msg, ...data: any[]);
    warn(tag, msg, ...data: any[]);
    error(tag, msg, ...data: any[]);
}
interface INotifier {
    register(eventType: string | number, callBack: (...any: any[]) => void, target: any);
    unregister(eventType: string | number, callBack: (...any: any[]) => void, target: any);
    registerOnce(eventType: string | number, callBack: (...any: any[]) => void, target: any);
    emit(eventType: string | number, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any);
}
