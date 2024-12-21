/*
 * @Date: 2023-05-26 19:17:04
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2024-04-02 14:20:14
 */
const kBaseEventTag = 50000;

export class BlockEventType {

    static kEvent_Game_Start = kBaseEventTag + 1;
    static kEvent_Game_Show_New_Blocks = kBaseEventTag + 2;
    static kEvent_Game_Refresh_Board = kBaseEventTag + 3;
    static kEvent_Game_Move_Block = kBaseEventTag + 4;
    static kEvent_Game_Move_Block_End = kBaseEventTag + 5;
    static kEvent_Game_Logic_Move_Block_End = kBaseEventTag + 6;
    static kEvent_Game_Lose = kBaseEventTag + 7;
    static kEvent_Game_Show_User_Guide = kBaseEventTag + 8;

    static EVENT_START_ANI_END = kBaseEventTag + 60; // 开场动画时刻
    static EVENT_BOTTOM_SHOW = kBaseEventTag + 61;   // 预览block展示时刻

    static EVENT_TATGET_SCORE_SHOW = kBaseEventTag + 80;   // 预览关卡分数显示
    static EVENT_TATGET_COLLECT_SHOW = kBaseEventTag + 81;   // 预览收集条件显示

    static EVENT_ADD_SCORE_ANI_FINISH = kBaseEventTag + 82; //清理行加分

    static EVENT_COLLECT_ITEM_END = kBaseEventTag + 99; // 获取收集物动画完成 userId
    static EVENT_PUT_BLOCK_END = kBaseEventTag + 100; // 放置块完成 userId putBlockCount
    static EVENT_CLEAR_BLOCK_END = kBaseEventTag + 101; // 消除行/列动画完成 userId ClearCount
    static EVENT_COMBO_BLOCK_END = kBaseEventTag + 102; // 连续消除行/列动画完成  userId ComboCount
    static EVENT_CLEAR_ALL_BLOCK_END = kBaseEventTag + 103; // 清空场上所有块动画完成  userId
    static EVENT_OP_USE_SKILL_ANI_END = kBaseEventTag + 104; // UI-使用技能 完成

    static EVENT_OP_SKILL_DATA = kBaseEventTag + 105; // 技能进度

    static kEvent_Game_Show_New_Blocks_History = kBaseEventTag + 106;//历史的preview刷新
    static kEvent_Game_Finish_New_Blocks = kBaseEventTag + 107;//加载新的preview block finish
    static EVENT_SCENE_PLAY_SET_SCORE = kBaseEventTag + 108;
    static EVENT_SCENE_PLAY_FLUSH_MAX_SCORE = kBaseEventTag + 109;
    static EVENT_SCENE_PLAY_SHOW_NEW_SCORE = kBaseEventTag + 110;
    static EVENT_SCENE_PLAY_RESTART = kBaseEventTag + 111;
    static EVENT_SCENE_PLAY_RELIFE = kBaseEventTag + 112;
    static EVENT_CAMETA_SHAKE = kBaseEventTag + 113;  //相机抖动
    static kEvent_Game_Init_Show_Hammer = kBaseEventTag + 114;
    static kEvent_Game_Init_Use_Hammer = kBaseEventTag + 115;
    static kEvent_Game_Init_Show_HRocket = kBaseEventTag + 116;
    static kEvent_Game_Init_Use_HRocket = kBaseEventTag + 117;

    static EVENT_RESTART_GAME = kBaseEventTag + 173 // 无尽模式重新开始
    static EVENT_SCENE_PLAY_SET_COLLECT = kBaseEventTag + 174 //收集宝石
    static EVENT_SCENE_PLAY_LEVEL_NEXT = kBaseEventTag + 175 //进入下一关卡
    static EVENT_SCENE_PLAY_LEVEL_COMPLETE = kBaseEventTag + 176 //完成当前关卡 1 成功 2 失败 3 暂停
    static EVENT_SCENE_PLAY_LEVEL_VIEW_REFRESH = kBaseEventTag + 177
    static BLOCK_TOUCH_START = kBaseEventTag + 178
    static BLOCK_COMBO = kBaseEventTag + 179
    static UNLOCK_LEVEL = kBaseEventTag + 180

    static EVENT_GAME_CREATE_NEWGUIDE_BLOCK = kBaseEventTag + 181
    static EVENT_FAILED_RESTART = kBaseEventTag + 182;
    static EVENT_BLOCK_CLICKED = kBaseEventTag + 183;             //点击方块事件
    static EVENT_USE_ITEM_HAMMER = kBaseEventTag + 184;           //使用锤子道具
    static EVENT_USE_ITEM_VROCKET = kBaseEventTag + 185;          //使用竖火箭道具
    static EVENT_USE_ITEM_HROCKET = kBaseEventTag + 186;          //使用横火箭道具
    static EVENT_USE_ITEM_REFRESHBLOCK = kBaseEventTag + 187;     //使用刷新道具
    static EVENT_USE_ITEM_END = kBaseEventTag + 188;              //使用完道具加分
    static EVENT_REFRESH_ITEM_NUM = kBaseEventTag + 189;          //刷新道具数量
    static EVENT_HAMMER_TWO_BLOCKS = kBaseEventTag + 190;         //锤两个
    static EVENT_TTSIDEBAR_REDDOT_STATUS = kBaseEventTag + 191;   //侧边栏人口红点
    static EVENT_SCORE_PROGRESS_POST_OPENCONTEXT = kBaseEventTag + 192;  //阶段性目标开放域
    static EVENT_SWITCH_SUB_CONTEXT_VIEW = kBaseEventTag + 193;  //阶段性目标开放域
    static EVENT_ACTIVE_NODE_FROM_ALBUM = kBaseEventTag + 194;
    static EVENT_GUIDE_COMPLETED = kBaseEventTag + 195;          //完成新手引导
    static EVENT_ROUND_UPDATED = kBaseEventTag + 196;            //回合数更新
    static EVENT_PROP_GIFT_PACK_FLY_PROP = kBaseEventTag + 197;            //回合数更新
    static EVENT_DAILY_CHALLENGE_REDDOT_STATUS = kBaseEventTag + 198;   //每日挑战人口红点

    static EVENT_ENTER_ADVENTURE_LEVEL = kBaseEventTag + 199;  // 进入冒险关卡
    static EVENT_RETURN_HOME = kBaseEventTag + 200;            // 第一局订阅点击返回
    static EVENT_RETRY = kBaseEventTag + 201;                  // 第一局订阅点击重玩
}
