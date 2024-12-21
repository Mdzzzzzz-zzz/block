/*
 * @Date: 2024-02-26 10:54:43
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-05 22:19:11
 */
export const Events = {
    EVENT_HIDE: -1, // 游戏隐藏
    EVENT_SHOW: -2, // 游戏显示
    EVENT_PRELOAD_RES: -3, // 资源加载进度
    EVENT_SHOW_EFFECT: -4, // 3D粒子特效加载

    EVENT_START_ANI_END: 60, // 开场动画时刻
    EVENT_BOTTOM_SHOW: 61, // 预览block展示时刻

    EVENT_PIPEI_JOIN: 98, // 匹配加入
    EVENT_PIPEI_AWAY: 99, // 匹配退出
    EVENT_PIPEI_USER_CHANGE: 100, // 匹配玩家变动
    EVENT_PIPEI_EMPETY_ICON: 101, // 匹配置空头像
    EVENT_POLICY_AGREE: 102, // 匹配置空头像
    EVENT_POLICY_SHOW: 103, // 匹配置空头像
    UNLOCK_LEVEL: 104,

    ON_TOUCH_START: 105, //点击屏幕开始
    ON_TOUCH_END: 106, //点击屏幕结束
};
