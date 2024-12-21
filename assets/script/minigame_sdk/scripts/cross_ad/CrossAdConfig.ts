/*
 * @Date: 2023-05-25 15:41:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-03 16:54:55
 */
export interface dtRawAdInfo {
    id: number;
    icon_interval: number;
    icon_id: string;
    icon_url: string[];
    icon_weight: number;
    icon_type: number;
    icon_skip_type: number;
    time_interval: number;
    second_toappid: string;
    toappid: string;
    togame: string;
    appName: string;
    path: string;
    province: string[];
    push_users: string[];
    push_uids: string[];
    phone_type: string;
    gender: number;
    webpages: dtRWebpage[];
    reward_name: string;
    reward_url: string;
    reward_value: number;
    reward_id: number;
    reward_limit: number;
}

export interface dtRWebpage {
    webpage_url: string;
    webpage_name: string;
    webpage_weight: string;
    webpage_id: string;
    config_id: string;
}

export interface dtAddAdEvent {
    pos: any;
    parent: Node;
    ads_type: string;
}
export interface dtAdNodeData {
    type: string;
    blink_display: number;
    ads_data: dtRawAdInfo[];
    /**
     * 随机权重 blink使用
     */
    ads_qz: number[];
    ads_subtype: string;
}
export interface dtCrossAdConfig {
    ads: dtRawAdInfo[];
    blink_display: number;
    banner_menu: dtAdsConfigForDifType;
    banner_gameover: dtAdsConfigForDifType;
    blink_menu: dtAdsConfigForBlinkType;
    blink_play: dtAdsConfigForBlinkType;
    list_menu: dtAdsConfigForDifType;
    list_play: dtAdsConfigForDifType;
}
export interface dtAdsConfigForDifType {
    type: string;
    ads: number[];
}
export interface dtAdsConfigForBlinkType {
    type: string;
    ads: number[][];
}
export enum emCrossAdPath {
    None = "none",
    Blink = "blink",
    List = "list",
    Banner = "banner",
}
export var CrossRewardConfig = {
    reward_name: "宝石",
    reward_url: "",
    reward_value: 1,
    reward_id: 10001,
    reward_reset: 1, //奖励领取状态重置方式 1 按天
    exchange_consume: 3, //3个宝石兑换一个奖励物品
    exchange_id: 1001, //兑换物品的id
    exchange_name: "锤子",
};
export var CrossAdConfig = {
    url: "https://elsfkws.nalrer.cn/teris/share_image/jiayi/daoliu/",
};
export interface dtCrossAdExchange {
    appid: string;
    exchangeCount: number;
    exchangeId: number;
    exchangeName: string;
}
export interface dtCrossAdRewardChange {
    appid: string;
    canGetReward: boolean;
    rewardValue: number;
    rewardName: string;
    rewardGetValue: number;
    consumeValue: number;
}
