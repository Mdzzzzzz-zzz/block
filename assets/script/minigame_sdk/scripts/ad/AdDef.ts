/*
 * @Date: 2024-03-04 10:50:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-04 10:50:41
 */
export var AD_SIZE = {
    BANNER: "banner",
    LARGE: "large",
    RECTANGLE: "rectangle",
    SMART: "smart",
};
export var AD_POSITION = {
    NO_CHANGE: 0,
    TOP_LEFT: 1,
    TOP_CENTER: 2,
    TOP_RIGHT: 3,
    LEFT: 4,
    CENTER: 5,
    RIGHT: 6,
    BOTTOM_LEFT: 7,
    BOTTOM_CENTER: 8,
    BOTTOM_RIGHT: 9,
    POS_XY: 10,
};
export enum emVideoState {
    None,
    /**
     * 请求展示
     */
    Load,
    /**
     * 展示成功
     */
    ShowSuccess,
    /**
     * 关闭广告
     */
    Close,
    /**
     * 观看成功
     */
    SeeFinish,
    /**
     * 加载失败
     */
    NoAd
}
export enum emAdPlacement {
    TOP,
    MIDDLE,
    BOTTOM,
}