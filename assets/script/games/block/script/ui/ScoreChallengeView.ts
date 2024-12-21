/*
 * @Date: 2024-06-25 14:53:32
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-17 19:07:08
 */
import { _decorator, Component, game, Node, view, Animation, ProgressBar, Label } from "cc";
import { UserScoreLevelData } from "../../../../data/UserScoreLevelData";
import PanelBase from "../../../../panel/PanelBase";
import * as env from "cc/env";
import { SdkUtils } from "../../../../minigame_sdk/scripts/SdkUtils";
import { WechatMiniApi } from "../../../../sdk/wechat/WechatMiniApi";
import { emSharePath } from "../../../../sdk/wechat/SocialDef";
import { SdkManager } from "../../../../minigame_sdk/scripts/SdkManager";
import { emShareType } from "../../../../sdk/wechat/SocialDef";
import { UserData } from "../../../../data/UserData";
import { UserLevelData } from "../../../../data/UserLeveData";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { mk } from '../../../../MK';
import { PanelManager } from "db://assets/script/panel/PanelManager";
import { BIEventID, emButtonScene, emButtonType } from "db://assets/script/define/BIDefine";
const { ccclass, property } = _decorator;
let a = false;
@ccclass("ScoreChallengeView")
export class ScoreChallengeView extends PanelBase<any> {
    @property(ProgressBar)
    bar: ProgressBar = null;
    @property(Node)
    btnget: Node = null;
    @property(Node)
    hasGeted: Node = null;
    @property(Label)
    progressLabel: Label = null;

    private currProgress:number = 0;
    private totalProgress:number = 0;

    onLoad() {
        this.setMaskLayerEnable(false);
        this.initData()
        if(env.WECHAT){      
            let openid = UserData.inst.getOpenID()
            console.log("-------------------------callFunction-openid:",openid)
            //@ts-ignore
            wx.cloud.init()
            //@ts-ignore
            wx.cloud.callFunction({
                name: 'get',
                data: {
                  from_app_user_id: openid  // 请使用微信openid或者京游SDK返回的id，保证对于同一用户统一
                },
                success: res => {
                  console.log(res.result)  // 结果存在result结构体中
                  UserData.inst.setScoreChallengeData(res.result)

                  if(this.currProgress >= this.totalProgress){
                    mk.sdk.instance.reportBI(BIEventID.offerWall_finish, {
                        proj_offerWall_type: 1,
                        proj_scene: emButtonScene.from_score_challenge,
                      });
                  }
               
                  this.refreshView()
                },
                fail: err => {
                  console.error('获取三国冰河进度错误：', err)
                }
              })


            //@ts-ignore
            wx.onShow((res: IOnShowInfo) => {
                console.log("------------------callFunction22--openid:", openid)
                //@ts-ignore
                wx.cloud.callFunction({
                    name: 'get',
                    data: {
                      from_app_user_id: openid  // 请使用微信openid或者京游SDK返回的id，保证对于同一用户统一
                    },
                    success: res => {
                      console.log(res.result)  // 结果存在result结构体中
                      UserData.inst.setScoreChallengeData(res.result)
                      this.refreshView()

                      if(this.currProgress >= this.totalProgress){
                        mk.sdk.instance.reportBI(BIEventID.offerWall_finish, {
                            proj_offerWall_type: 1,
                            proj_scene: emButtonScene.from_score_challenge,
                          });
                      }
                    },
                    fail: err => {
                      console.error('获取三国冰河进度错误：', err)
                    }
                  })
    
            });
        }
    }

    initData(){
        let  result = UserData.inst.getScoreChallengeData()
        if(!result || result == null){
            this.currProgress = 0;
            this.totalProgress = 7;
        }else{
            this.currProgress = result.progress;
            this.totalProgress = result.maxProgress;
        }
    }

    start() {
        this.refreshView()
    }

    initNode(){

    }

    refreshView(){
        let result = UserData.inst.getScoreChallengeData()
        if(result != null){
            this.currProgress = result.progress;
            this.totalProgress = result.maxProgress;
        }
      
        let pro = this.currProgress / this.totalProgress;
        this.bar.progress = pro;
        this.progressLabel.string = this.currProgress + "/" +  this.totalProgress;
        this.bar.node.active = pro < 1;


        let finishNum = UserData.inst.getScoreFinishNum() 
        this.btnget.active = pro >= 1 && finishNum != 1
        this.hasGeted.active = finishNum == 1
    }

    onClickGoto(event: Event, id: number){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        //拉起三国冰河
        if (env.PREVIEW || env.EDITOR) {
            return;
        }

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.goto_ice,
            proj_scene: emButtonScene.from_score_challenge,
        });

        let openid = UserData.inst.getOpenID()
        console.log("------------------navigateToMiniProgram--openid:", openid)
        //@ts-ignore
        wx.navigateToMiniProgram({
            appId: 'wx209b8a6bc1c08b85',
            path:'?aid=62&advPlatform=exchange&actName=fangkuaibinghe&wxgamecid=CCBgAAoXkpQY9NktXCo7GT',
            // shortLink: '#小程序://三国：冰河时代/H0m71sefPItaeik',
            extraData: {
                userId: openid,
                from_app_id:"20197",
                to_app_id:"62",
                // scheme_from:"?aid=62&advPlatform=exchange&actName=fangkuaibinghe&wxgamecid=CCBgAAoXkpQY9NktXCo7GT"
            },
            envVersion: 'trial', //develop  trial  release
            success(res) {
              // 打开成功
            }
          })

    }

    onClickGet(event: Event, id: number){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);

        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.get_skin,
            proj_scene: emButtonScene.from_score_challenge,
        });

        //领奖
        PanelManager.inst.addPopUpView(AssetInfoDefine.prefab.stickerRewardView.path,
                            { id: 1 }
                        );
        UserData.inst.setScoreFinishNum(1) 
        this.refreshView()
    }

    onCloseBtn(){
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        this.closeSelf()
    }
   
    onDestroy() {
        
    }
}
