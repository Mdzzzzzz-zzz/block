import { FlagData } from "../../../data/FlagData";
import { TySdkManager } from "../../../sdk/TySdkManager";
import { SystemInfo } from "../SdkConfig";
import { emVideoState } from "../ad/AdDef";
import { emContentType } from "../net/HttpBase";
import { GaBase, IGaSystemConfig } from "./GaBase";

export class WechatGa extends GaBase {
    trackCrossAd(eventId: string | number, param: Record<string, any>, state: number) {
        param["state"] = state;
        this.track(eventId, param);
    }

    getGaSysConfig(): IGaSystemConfig {
        return null;
    }

    /**
     * 上传实时log,用此接口上传错误情况下的日志
     * @param logtxt:log内容log内容
     */
    uploadLogTimely(logtxt: string) {
        if (!this.checkIsNetWork()) {
            this.logger.error("BiLog", "net error!");
            return;
        }
        if (logtxt) {
            let url = SystemInfo.errorLogServer + "?cloudname=" + SystemInfo.cloudId + "." + SystemInfo.intClientId;
            // var header = ['Content-Type:text/plain'];
            // var configObj = {
            //    'url': url,
            //    'header': header,
            //    'postData': logtxt,
            //    'callback': null
            // };
            //@ts-ignore
            // this.http.post(url, logtxt, emContentType.TEXT_PLAIN).then((res) => {
            //    this.logger.log(this.tag + url, " uploadLogTimely 上报成功：" + logtxt, res);
            // }).catch((err) => {
            //    this.logger.log(this.tag + url, "uploadLogTimely 上报失败：" + logtxt, err);
            // });
        }
    }

    /*BI组打点
     参数1是事件id，参数2是[],内含扩展参数
     60001事件id
     在查询工具，cloud id+game id+事件id即可找到,GDSS有前端日志查询工具
     ty.BiLog.clickStat(ddz.StatEventInfo.DdzButtonClickInPlugin,
     [ddz.PluginHall.Model.statInfoType[scope.index],ddz.GameId]);

     // ty.BiLog.clickStat(hall5.BILogEvents.BILOG_EVENT_PLUGIN_UPDATE_SUCCESS,[hall5.BilogStatEvent.Plugin_Update_Success,gameid]);
     */
    uploadClickStatLogTimely(logtxt) {
        if (!this.checkIsNetWork()) {
            this.logger.error("BiLog", "net error!");
            return;
        }
        if (logtxt != undefined && logtxt != "") {
            // var header = ['Content-Type:text/plain'];
            // var configObj = {
            //    'url': SystemInfo.biLogServer,
            //    'headers': header,
            //    'postData': logtxt,
            //    'obj': this,
            //    'tag': null,
            //    'callback': null
            // };
        }
        let url = SystemInfo.biLogServer;
        this.http
            .post(url, logtxt, emContentType.TEXT_PLAIN)
            .then((res) => {
                this.logger.log(this.tag + url, " uploadLogTimely 上报成功：" + logtxt, res);
            })
            .catch((err) => {
                this.logger.log(this.tag + url, "uploadLogTimely 上报失败：" + logtxt, err);
            });
        // HttpUtil.httpPost(configObj, 'POST');
    }
    clickStat(eventId: number, paramsList: any) {
        paramsList = paramsList || [];
        var dyeparams = [];
        if (paramsList.length < 10) {
            for (var i = 0; i < 9; i++) {
                if (i < paramsList.length) {
                    dyeparams.push(paramsList[i]);
                } else {
                    dyeparams.push(0);
                }
            }
        } else {
            dyeparams = paramsList;
        }
        // SdkBiManager.getInstance().track(eventId,sendObj);
        // this.logger.log('BI打点', "eventid= " + eventId + " 描述 = ", dyeparams);
        var bilog = this.assemblelog(eventId, dyeparams);
        this.uploadClickStatLogTimely(bilog + "\n");
    }

    /**
     * ga打点
     * @param eventId       打点事件
     * @param paramObj      事件特有参数，最终上报时会在打点参数上添加'proj_'前缀
     *                      参数有保留值见文档http://192.168.10.51:4000/ga-book/ji-zhu-zhi-nan/ri-zhi-ge-shi.html
     */
    track(eventId, paramObj: Record<string, any> = null) {
        TySdkManager.getInstance().trackEvent(eventId, paramObj);
        return;
        // let systemInfo = SystemInfo;
        // let userInfo = UserInfo;
        // // const player = GameDataPlayer.getGamePlayer();
        // // let curProgress = player ? player.CurProgress : 0;
        // let properties = {
        //    game_id: systemInfo.gameId,
        //    ip_address: userInfo.ip || '0',
        //    phone_maker: userInfo.brand || "0",
        //    phone_model: userInfo.model || "0",
        //    proj_gameversion: systemInfo.gameVersion,
        //    proj_gameenvversion: systemInfo.gameEnvVersion
        //    // proj_cloud_id: systemInfo.cloudId,
        //    // proj_role_id: userInfo.roleId || 0,
        //    // proj_server_id: userInfo.serverId || 0,
        //    //  proj_fp: GameDataPlayer.getFP() || 0,
        //    //  proj_chapter_level:curProgress || 0,
        //    // proj_vip_level: 0,//todo
        //    // proj_ver: systemInfo.version
        // }
        // if (paramObj) {
        //    for (const key in paramObj) {
        //       //GA平台创建事件会自动添加前缀proj_
        //       if (Object.prototype.hasOwnProperty.call(paramObj, key)) {
        //          let eventKey = key.startsWith("proj_") ? key : `proj_${key}`
        //          properties[eventKey] = paramObj[key];
        //       }
        //    }
        // }
        // let sendObj = {
        //    type: "track",
        //    event: eventId,
        //    event_time: new Date().getTime(),
        //    project_id: systemInfo.projectId,
        //    client_id: systemInfo.clientId,
        //    device_id: SdkUtils.getLocalUUID(),
        //    user_id: userInfo.userId || 0,
        //    properties: properties,
        //    lib: {},
        // }
        // // SdkBiManager.getInstance().track(eventId,sendObj);
        // this.logger.log(this.tag, sendObj);
        // // console.error("ga",systemInfo.gaServer,JSON.stringify(sendObj),emContentType.TEXT_PLAIN);
        // // return;
        // let url = systemInfo.gaServer;
        // let body = JSON.stringify(sendObj);
        // //@ts-ignore
        // this.http.post(url, body, emContentType.TEXT_PLAIN).then((res) => {
        //    this.logger.log(this.tag + url, " ga track 上报成功：" + body, res);
        // }).catch((err) => {
        //    this.logger.log(this.tag + url, "ga track 上报失败：" + body, err);
        // });
    }
    trackAdEvent(
        scene: string,
        adUnitId: string,
        state: emVideoState,
        errInfo: any,
        errCode?: number,
        errPfInfo?: string
    ) {
        let errMsg: string = errInfo;
        if (errCode == null || errCode == undefined) {
            errCode = 0;
        }
        errPfInfo = errPfInfo || "";
        try {
            if (typeof errInfo == "number") {
                errMsg = errInfo.toString();
            } else {
                if (errInfo && errInfo.errMsg) {
                    if (typeof errInfo.errData == "number") {
                        errMsg = errInfo.errData.toString();
                    } else {
                        errMsg = errInfo.errMsg;
                    }
                }
            }
            if (scene == "af_ad_interstitial") {
                let times = FlagData.inst.recordTimes("af_ad_interstitial_" + state);
                this.track(scene, {
                    adscene: scene,
                    adunitid: adUnitId,
                    adstate: state,
                    aderrcode: errMsg,
                    adcode: errCode,
                    errpfinfo: errPfInfo,
                    ad_status: state,
                    times: times,
                });
            } else {
                this.track("ad_reward", {
                    adscene: scene,
                    adunitid: adUnitId,
                    adstate: state,
                    aderrcode: errMsg,
                    adcode: errCode,
                    errpfinfo: errPfInfo,
                });
            }
        } catch (error) {
            if (error) {
                let catchMsg = errMsg;
                try {
                    catchMsg = error.toString();
                } catch (error2) {}
                console.error(error);
                if (scene == "af_ad_interstitial") {
                    let times = FlagData.inst.recordTimes("af_ad_interstitial_" + state);
                    this.track(scene, {
                        adscene: scene,
                        adunitid: adUnitId,
                        adstate: state,
                        aderrcode: "track_error",
                        adcode: errCode,
                        errpfinfo: errPfInfo,
                        ad_status: state,
                        times: times,
                    });
                } else {
                    this.track("ad_reward", {
                        adscene: scene,
                        adunitid: adUnitId,
                        adstate: state,
                        aderrcode: "track_error",
                        adcode: errCode,
                        errpfinfo: errPfInfo,
                    });
                }
            }
        }
    }
}
