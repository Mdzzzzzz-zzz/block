
import { Vec3, Node } from 'cc';
import { GAEvent, StateInfo, SystemInfo, UserInfo, } from './SdkConfig';
import { SdkEventType } from './SdkEventType';
import { SdkUtils } from './SdkUtils';
import { GaBase } from './bi/GaBase';
import { clickStatEventType } from './bi/GaClickStatEventDef';
import { ChannelBase } from './channel/ChannelBase';
import { dtRawAdInfo, emCrossAdPath } from './cross_ad/CrossAdConfig';
import { ads_manager } from './cross_ad/ads_manager';
import { SdkSingleton } from './common/SdkSingleton';
import { HttpBase } from './net/HttpBase';
import { SdkEventManager } from './SdkEventManager';
import { resources } from 'cc';
import { JsonAsset } from 'cc';
import { sys } from 'cc';

export class SdkCrossAdManager extends SdkSingleton {
    public Init() {
        throw new Error('Method not implemented.');
    }
    public UnInit() {
        throw new Error('Method not implemented.');
    }
    protected ga: GaBase;
    protected logger: ILog;
    protected http: HttpBase;
    channel: ChannelBase


    retryCrossTimes: number;
    allAdInfoList: Array<dtRawAdInfo>
    rawAdInfoList: Array<dtRawAdInfo>
    crossAdType: number;
    public Setup(ga: GaBase, log: ILog, channel: ChannelBase, http: HttpBase) {
        this.ga = ga;
        this.logger = log;
        this.channel = channel;
        this.http = http;
        this.retryCrossTimes = 3;
        SdkEventManager.getInstance().register(SdkEventType.GO_TO_MINIGAME, this.onEvnGotoMiniGame, this)
        .register(SdkEventType.NET_STATE_CHANGE,this.onNetChange,this);
        // this.loadLocalAdBoxConfig();
        // this.requestADInfo();
        // ads_manager.setData(CrossAdConfig)
    }
    protected onNetChange(){
        //重新加载一次配置
        this.loadLocalAdBoxConfig();
    }
    requestADInfo() {
        this.retryCrossTimes--;
        var timeStamp = new Date().getTime();
        var reqObj = {
            act: 'api.getCrossConfig',
            time: timeStamp,
            game_mark: SystemInfo.cloudId + "-" + SystemInfo.gameId
        }
        var signStr = SdkUtils.getConfigSignStr(reqObj);
        var paramStrList = [];
        for (var key in reqObj) {
            paramStrList.push(key + '=' + reqObj[key]);
        }
        paramStrList.push('sign=' + signStr);
        var finalUrl = SystemInfo.shareManagerUrl + '?' + paramStrList.join('&');
        this.http.get(finalUrl).then((res) => {
            if (res.retcode == 1) {
                var ret = res;
                this.allAdInfoList = [];
                if (ret.retmsg) {
                    this.rawAdInfoList = ret.retmsg;
                    this.processIconConfigInfo();
                }
            }
            else if (res.statusCode == 200 && res.data) {
                var ret = res.data;
                this.allAdInfoList = [];
                if (ret.retmsg) {
                    this.rawAdInfoList = ret.retmsg;
                    this.processIconConfigInfo();
                }

            } else {
                if (this.retryCrossTimes > 0) {
                    this.requestADInfo();
                } else {
                    //请求远程配置失败直接用本地
                    this.loadLocalAdBoxConfig();
                }
            }
        }).catch((res) => {
            if (this.retryCrossTimes > 0) {
                this.requestADInfo();
            } else {
                //请求远程配置失败直接用本地
                this.loadLocalAdBoxConfig();
            }
        })
    }
    private hasInitLoaclConfig:boolean =false;
    loadLocalAdBoxConfig() {
        if(this.hasInitLoaclConfig){
            return;
        }
        if(sys.getNetworkType()!=0){
            resources.load<JsonAsset>("ads/ad_box", (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                this.hasInitLoaclConfig = true;
                this.rawAdInfoList = data.json as Array<dtRawAdInfo>;
                this.processIconConfigInfo();
            });
        }
    }

    processIconConfigInfo() {
        this.allAdInfoList = [];
        if (this.rawAdInfoList == undefined) {
            return;
        }

        //这里需要login之后再调用
        // if (UserInfo.userId) {
        //     return;
        // }
        this.rawAdInfoList.forEach((v) => {
            if (v.icon_weight == undefined || Math.floor(v.icon_weight) <= 0.1) {
                v.icon_weight = 0;
            }
            var isTestMode = false; //是否是测试模式
            var _test_uidList = v.push_uids || [];
            for (var i = 0, len = _test_uidList.length; i < len; i++) {
                if (UserInfo.userId.toString() == _test_uidList[i]) {
                    isTestMode = true;
                    break;
                }
            }
            if (isTestMode) {
                this.allAdInfoList.push(v);
            } else {
                var _white_rear_uidList = v.push_users || [];
                var _len = _white_rear_uidList.length;
                if (0 == _len) {
                    this.allAdInfoList.push(v);
                } else {
                    for (var j = 0; j < _len; j++) {
                        var _sUid = UserInfo.userId.toString();
                        if (_sUid.charAt(_sUid.length - 1) == _white_rear_uidList[j]) {
                            this.allAdInfoList.push(v);
                            break;
                        }
                    }
                }
            }
        });
        ads_manager.setRawData(this.rawAdInfoList);
        SdkEventManager.getInstance().emit(SdkEventType.GET_ADMANAGER_ICON_INFO_SUCCESS, this.rawAdInfoList);
    }
    AddAd(type: string, parent: Node, pos: Vec3, scene: string) {
        ads_manager.addAdsNode(type, parent, pos, scene);
    }
    private jumpTargetAdDetail: dtRawAdInfo;
    onEvnGotoMiniGame(data: dtRawAdInfo, showPath: emCrossAdPath,adType:number) {
        this.jumpTargetAdDetail = data;
        this.crossAdType = adType;
        let cfg = this.getCrossAdConfigByAppId(data.toappid);
        this.jump2MiniProgramByConfig(cfg, showPath);
    }
    getCrossAdConfigByAppId(wx_app_id: string) {
        let list = this.rawAdInfoList;
        if (list) {
            for (let i = 0; i < list.length; ++i) {
                let tmp_c = list[i];
                if (tmp_c.toappid === wx_app_id) {
                    return tmp_c
                }
            }
        }
        else {
            console.error("cross ad error:rawAdInfoList 为空",);
        }

        return null;
    }
    jump2MiniProgramByConfig(config: dtRawAdInfo, showPath: emCrossAdPath) {
        if (!config) return
        try {
            var skip_type = config.icon_skip_type;
            var toappid = config.toappid;
            var togame = config.togame;
            var topath = config.path;
            var second_toappid = config.second_toappid;
            var icon_id = config.icon_id;
            var config_id = config.id;
            var webpage_url = '';
            var webpage_id = '0';
            var bi_paramlist = [icon_id, config_id, webpage_url, toappid, togame, webpage_id, this.crossAdType];
            var gaData = {
                config_id: config_id,
                icon_id: icon_id,
                toappid: toappid,
                showtype: showPath,
            };
            this.ga.trackCrossAd(GAEvent.cross_ad_jump, gaData, 1);
            this.ga.clickStat(clickStatEventType.clickStatEventTypeClickAdBtn, bi_paramlist)
            let finaltoAppid = skip_type === 1 ? toappid : second_toappid
            if (1 === skip_type) {
                this.channel.navigateToMiniProgram(finaltoAppid, topath, 'release', bi_paramlist).then(res => {
                    this.ga.clickStat(clickStatEventType.clickStatEventTypeClickDirectToMiniGameSuccess, bi_paramlist);
                    this.ga.trackCrossAd(GAEvent.cross_ad_jump, gaData, 2);
                    SdkEventManager.getInstance().emit(SdkEventType.GO_TO_MINIGAME_SUCCESS, this.jumpTargetAdDetail);
                    this.logger.log('wx.navigateToMiniProgram success', res);
                }).catch(res => {
                    this.ga.clickStat(clickStatEventType.clickStatEventTypeClickDirectToMiniGameFail, bi_paramlist);
                    this.ga.trackCrossAd(GAEvent.cross_ad_jump, gaData, 3);
                    SdkEventManager.getInstance().emit(SdkEventType.GO_TO_MINIGAME_FAIL, this.jumpTargetAdDetail);
                    this.logger.log('wx.navigateToMiniProgram fail', res);
                })
            }
        } catch (err) {
            this.logger.log("error:", "AdManager.onClickAdIconBtn——" + JSON.stringify(err));
        }
    }

}

