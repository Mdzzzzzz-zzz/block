/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-07 15:07:44
 */
import { SystemInfo, SystemInfoEnv } from "./SdkConfig";
import { SdkSingleton } from "./common/SdkSingleton";
import { SdkLog } from "./log/SdkLog";

export class SdkSystemInfo extends SdkSingleton {
    protected logger: SdkLog;
    public Init() {
        this.logger = SdkLog.getInstance();
    }
    public UnInit() {
    }
    public Setup(env: string,gameVersion:string) {
        let sysInfo = SystemInfoEnv[env];
        for (const key in sysInfo) {
            if (Object.prototype.hasOwnProperty.call(sysInfo, key) && Object.prototype.hasOwnProperty.call(SystemInfo, key)) {
                let oldValue = SystemInfo[key];
                let newValue = sysInfo[key];
                SystemInfo[key] = newValue;
                // this.logger.log(env, "替换SystemInfo参数：", key, oldValue + "->" + newValue);
            }
        }
        //游戏版本号 ga中默认使用包内传的数据 线上使用api获取参数
        SystemInfo.gameVersion = gameVersion;
    }
}