/*
 * @Date: 2023-05-13 01:02:14
 * @LastEditors: dengchongliiang 958169797@qq.com
 * @LastEditTime: 2024-12-12 18:37:15
 */

export enum emAdStatus {
    WakeUp = 1,
    Closed = 2,
    Finished = 3,
    Error = 4,
}

export enum emButtonType {
    enter_adventure = 1,
    enter_classic = 2,
    enter_settings = 3,
    click_settings_home = 4,
    click_settings_replay = 5,
    click_adventure_start = 6,
    click_adventure_next_level = 7,
    click_adventrue_rechallenge = 8,
    enter_leaderboard = 9,
    enter_mysticker = 10,
    daily_challenge = 11,
    daily_challenge_start = 12,
    daily_challenge_restart = 13,
    how_to_play = 14,
    enter_mywork = 15,
    enter_skin = 16,
    enter_score = 17,
    goto_ice = 18,
    get_skin = 19,
}

export enum emButtonScene {
    from_home = 1,
    from_classic = 2,
    from_adventure = 3,
    from_settings = 4,
    from_fail_classic = 5,
    from_new_record_classic = 6,
    from_adventure_choose_level = 7,
    from_adventure_pass = 8,
    from_adventrue_fail = 9,
    from_daily_challenge_game_view = 10,
    from_daily_challenge_choose_level = 11,
    from_daily_challenge_pass = 12,
    from_daily_challenge_fail = 13,
    from_score_challenge = 14,
}

export const BIEventID = {
    af_complete_registration: "af_complete_registration", //注册
    af_login: "af_login", //登录
    jingyou_sdk_login: "jingyou_sdk_login", //jingyou_sdk登录
    loading_done: "af_loading_done", // 初始化完成
    guide_step: "af_guide_step", // 新手引导开始
    guide_step_new: "af_guide_step_new", // 新手引导开始新版
    guide_click: "guide_click",                // 引导点击
    firstEnter_roundNum: "firstEnter_roundNum", //经典首局每5个回合打点
    classic_start: "af_classic_start", // 开始无尽模式 最高分
    classic_exit: "af_classic_exit", // 离开无尽模式 最高分 是否突破最高分
    classic_finish: "af_classic_finish", // 无尽新纪录
    classic_restart: "classic_restart", // 无尽重开
    classic_clear_all: "classic_clear_all", //无尽清台
    level_start: "af_level_start", //关卡开始 关卡id
    level_exit: "level_exit", //退出关卡模式 关卡id
    level_restart: "level_restart", //重新开始关卡 关卡id
    level_finish: "af_level_finish", //关卡失败 关卡id resulet 1 成功 2 失败
    daily_start: "daily_start",                // 每日挑战开始
    daily_exit: "daily_exit",                  // 每日挑战退出
    daily_finish: "daily_finish",              // 每日挑战完成
    daily_restart: "daily_restart",            // 每日挑战重新开始
    ui_revive: "ui_revive", //界面_复活 1=展示 2=点击复活按钮 3=点击关闭
    af_ad_interstitial: "af_ad_interstitial",
    ad_revivie: "af_ad_revivie", //广告复活 status:1 拉起 2 关闭 3 完成 4 异常 mode：2 无尽 3 关卡
    ad_begin: "af_ad_begin",  //广告开始游戏
    af_ad_levelbegin: "af_ad_levelbegin",    // 广告开始关卡
    af_ad_dailybegin: "af_ad_dailybegin",    // 广告开始每日挑战
    ad_item: "af_ad_item",    //广告使用道具
    btn_click: "btn_click", // 按钮点击,
    share_click: "share_click",//分享点击
    offerWall_finish: "offerWall_finish", //积分墙广告完成

    agree_policy: "af_agree_policy", //同意隐私权限
    af_gudie_begin: "af_gudie_begin", //引导开始
    af_gudie_end: "af_gudie_end", //引导结束
    af_classicgame: "af_classicgame", //玩家每玩完一局classic消除后发送一次
    af_adventuregame: "af_adventuregame", //玩家完成一局adventure消除后发送
    af_ad_reward_finish: "af_ad_reward_finish",
    af_ad_interstitial_finish: "af_ad_interstitial_finish",
    af_ad_watch_times: "af_ad_watch_times", //用来记录插屏和激励 累计观看次数
    guide_done: "guide_done", // 新手引导结束
    classic_enter: "af_classic_enter", // 进入无尽模式 最高分
    classic_newrecord: "af_classic_newrecord", // 无尽新纪录
    level_clear_all: "level_clear_all", //关卡清台
    level_enter: "af_level_enter", //开始关卡模式
    level_replay: "level_replay",
    ad_refresh_block: "af_ad_refresh_block", //看广告刷新块  status:1 拉起 2 关闭 3 完成 4 异常 mode：2 无尽 3 关卡
    ad_refresh_all_block: "af_ad_refresh_all_block", //看广告刷新全部块  status:1 拉起 2 关闭 3 完成 4 异常 mode：2 无尽 3 关卡
    ad_unlock_hammer: "af_ad_unlock_hammer", //看广告解锁锤子
    ad_unlock_rocket_h: "af_ad_unlock_rocket_h", //看广告解锁横向火箭
    ad_unlock_rocket_v: "af_ad_unlock_rocket_v", //看广告解锁纵向火箭
    item_use_change_all: "af_af_item_use_change", //用户使用换一换
    ai_tips: "ai_tips",        //智能提示
    af_ad_treasure: "af_ad_treasure", //看广告获得贴纸
    ui_treasure: "ui_treasure", // 获得贴纸弹窗
    ui_itempackage: "ui_itempackage",          // 道具礼包
    af_ad_itempackage: "af_ad_itempackage",    // 广告道具礼包
    af_ad_5times: "af_ad_5times",
    af_ad_10times: "af_ad_10times",

    //关卡
    levelmode_start: "levelmode_start",
    levelmode_exit: "levelmode_exit",
    levelmode_restart: "levelmode_restart",
    levelmode_finish: "levelmode_finish",
    af_ad_levelmodebegin: "af_ad_levelmodebegin",

    //订阅
    subscription: "subscription",
};

export enum emPropType {
    none = 0,
    hammer = 1,
    v_rocket = 2,
    h_rocket = 3,
    refresh_block = 4,
};

export enum emScene {
    none = 0,
    main_scene = 1,   //主界面
    not_using = 2,    //暂时不用
    not_using2 = 3,   //暂时不用
    setting_scene = 4,//设置界面
    classic_fail_scene = 5, //经典失败界面
    classic_new_record_scene = 6, //经典新纪录界面,
    adventure_level_game_over = 8, //冒险关卡失败界面
    scene_adventure_level_select = 7, //冒险关卡选择界面
};

export enum emttSideBarStatus {
    none = 0,
    go_side_bar = 1,
    not_collected = 2,
    collected = 3,
};

export enum emEnterAlbumFrom {
    none = 0,
    scene_home = 1,
    adventure_level_select = 2,
    game_over = 3,
    daily_challenge_home = 4,
};
