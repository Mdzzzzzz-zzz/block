/*
 * @Date: 2023-05-15 10:23:50
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-06 16:40:03
 */
import { SystemInfo, UserInfo } from '../SdkConfig';
import { SdkUtils } from '../SdkUtils';
import { GaBase, IGaSystemConfig } from './GaBase';
export class WebbrowserGa extends GaBase {
    trackCrossAd(eventId: string | number, param: Record<string, any>,state:number) {
        console.log("trackCrossAd:", param,state);
    }
    trackAdEvent(scene: string, adUnitId: string, state: number, errInfo: any,errCode?:number,errPfInfo?:string) {
        console.log("trackAdEvent:", {
            scene: scene,
            adUnitId: adUnitId,
            state: state,
            errInfo: errInfo,
            errCode:errCode,
            errPfInfo:errPfInfo
        });
    }
    uploadClickStatLogTimely(eventId: string | number, logtxt: string) {
        console.log("uploadClickStatLogTimely:", eventId, logtxt);
    }
    /**
* ga打点
* @param eventId       打点事件
* @param paramObj      事件特有参数，最终上报时会在打点参数上添加'proj_'前缀
*                      参数有保留值见文档http://192.168.10.51:4000/ga-book/ji-zhu-zhi-nan/ri-zhi-ge-shi.html
*/
    track(eventId, paramObj = null) {

        let systemInfo = SystemInfo;
        let userInfo = UserInfo;
        // const player = GameDataPlayer.getGamePlayer();
        // let curProgress = player ? player.CurProgress : 0;
        let properties = {
            game_id: systemInfo.gameId,
            ip_address: userInfo.ip || '0',
            phone_maker: userInfo.brand || "0",
            phone_model: userInfo.model || "0",
            // proj_cloud_id: systemInfo.cloudId,
            // proj_role_id: userInfo.roleId || 0,
            // proj_server_id: userInfo.serverId || 0,
            // //  proj_fp: GameDataPlayer.getFP() || 0,
            // //  proj_chapter_level:curProgress || 0,
            // proj_vip_level: 0,//todo
            // proj_ver: systemInfo.version
        }
        if (paramObj) {
            for (const key in paramObj) {
                if (!key.startsWith("proj_") && Object.prototype.hasOwnProperty.call(paramObj, key)) {
                    properties["proj_" + key] = paramObj[key];
                }
            }
        }
        let sendObj = {
            type: "track",
            event: eventId,
            event_time: new Date().getTime(),
            project_id: systemInfo.projectId,
            client_id: systemInfo.clientId,
            device_id: SdkUtils.getLocalUUID(),
            user_id: userInfo.userId || 0,
            properties: properties,
            lib: {},
        }
        let body = JSON.stringify(sendObj);
        let url = systemInfo.gaServer;
        this.logger.log("ga：", url, body);
        //@ts-ignore
        // this.http.post(url, body, emContentType.TEXT_PLAIN).then((res) => {
        //     this.logger.log(this.tag + url, "ga上报成功：" + body, res);
        // }).catch((err) => {
        //     this.logger.log(this.tag + url, "ga上报失败：" + body, err);
        // });
    }
    getGaSysConfig(): IGaSystemConfig {
        return null;
    }
    uploadLogTimely(eventId: string | number, logInfoTxt: string) {
        console.log("log timely :", eventId, logInfoTxt);
    }
    clickStat(eventId: number, param: any) {
        console.log("clickStat:", eventId, param);
    }

}