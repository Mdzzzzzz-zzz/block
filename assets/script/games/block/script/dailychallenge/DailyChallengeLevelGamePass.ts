import { _decorator, Node, Label, Sprite, AnimationClip, Animation } from "cc";
import { emLevCondition } from "../logic/AdventureLevelGame";
import { mk } from "../../../../MK";
import { SceneMode } from "../define/SceneMode";
import { kGameMode } from "../define/Enumrations";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import AdventureLevelGamePass from "../LevelAdventure/AdventureLevelGamePass";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { DailyChallengeLevelGame } from "../logic/DailyChallengeLevelGame";
import { AdventureLevelConditionView } from "../LevelAdventure/AdventureLevelConditionView";
import { BlockEventType } from "../define/Event";
import { ProcedureToDailyChallengeHome } from "../../../../fsm/state/ProcedureToDailyChallengeHome";
import { BIEventID } from "../../../../define/BIDefine";
import { emButtonType } from "../../../../define/BIDefine";
import { emButtonScene } from "../../../../define/BIDefine";

const { ccclass, property } = _decorator;

@ccclass("DailyChallengeLevelGamePass")
export default class DailyChallengeLevelGamePass extends AdventureLevelGamePass {
    initView(manager: DailyChallengeLevelGame, result: number) {
        this.manager = manager;
        let conditionView = this.rootConditionView.getComponent(AdventureLevelConditionView);
        if (conditionView) {
            conditionView.initView(manager);
        }
        if (this.diamondRewardBg) {
            this.diamondRewardBg.active = false;
        }

        this.rootConditionView.active = true;
        if (this.manager.conditionType == emLevCondition.Collect) {
            if (this.diamondRewardBg) {
                this.diamondRewardBg.active = true;
            }
            this.scoreImageNode.active = false;
        } else {
            this.scoreImageNode.active = true;
        }
        mk.sendEvent(BlockEventType.EVENT_DAILY_CHALLENGE_REDDOT_STATUS, false);
        //console.log("Today is " + DailyChallengeLevelGame.CurrGameMonth + " " + DailyChallengeLevelGame.CurrGameDay)
        // Fenghe 改动，因为只有重进dailyChanllengeSceneHome才会刷新日期，所以这里可以用全局变量
        //UserDailyChallengeData.inst.setChallengeProgress(DailyChallengeLevelGame.CurrGameMonth, DailyChallengeLevelGame.CurrGameDay, 1);
        let date = UserDailyChallengeData.inst.getDate();
        UserDailyChallengeData.inst.setChallengeProgress(date.getMonth(), date.getDate(), 1);

        //根据过关结果设置推荐参数
        //用于推荐的计算
        const scoreInfo = mk.getItem("level_action_info", { score: 0, playCount: 0 });
        // 未达到最大分数
        if (result == 2) {
            //失败了
            scoreInfo.playCount++;
            mk.setItem("level_action_info", scoreInfo);
        } else if (result == 1) {
            let anim = this.node.getComponent(Animation);
            const clips = anim.clips;
            if (this.manager.conditionType == emLevCondition.Score) {
                this.rootConditionView.active = false;
                if (this.ScoreSuccSprite) {
                    this.ScoreSuccSprite.active = true;
                    this.ScoreSuccNum.string = this.manager.targetScore.toString();
                }
                if (clips.length == 2) {
                    // 播放第一个动画剪辑
                    anim.play(clips[1].name);
                    setTimeout(() => {
                        this.logoEffectNode.active = true;
                    }, 167)
                }
            } else {
                anim.play(clips[0].name);
                setTimeout(() => {
                    this.logoEffectNode.active = true;
                }, 167)
            }
            scoreInfo.playCount = 0;
            scoreInfo.score = 0;
        }
    }
    onClickBack() {
        SceneMode.gameMode = kGameMode.none;
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.daily_challenge,
            proj_scene: emButtonScene.from_daily_challenge_pass,
        });

        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        mk.fsm.changeState(ProcedureToDailyChallengeHome, "Ani");
        this.closeSelf();
    }
}
