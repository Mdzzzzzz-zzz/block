export var SocialEvt = {
    Auth: "Auth",
    Share: "Share",
    ShareWakeUp: "ShareWakeUp",
    WatchVideo: "WatchVideo"
}
export interface edShareWakeUp {
    share: IOnShowInfo;
    result: boolean;
}

export enum emShareType {
    /**
     * 复活
     */
    None = 99999,
    s_10001 = 10001,
    s_10002 = 10002,
    s_10003 = 10003,
    s_10004 = 10004,
    s_10005 = 10005,
    s_10006 = 10006,
    s_10007 = 10007,
    s_10008 = 10008,
    s_10009 = 10009,
    s_10010 = 10010,
    s_10011 = 10011,
    s_10100 = 10100,
    s_10101 = 10101,
    s_10102 = 10102,
    s_10103 = 10103,
    s_10104 = 10104,
    s_10200 = 10200,
    s_10201 = 10201,
    s_10202 = 10202,
    s_10203 = 10203,
    s_10204 = 10204,
    s_10300 = 10300,
    s_10301 = 10301,
    s_10302 = 10302,
    s_10303 = 10303,
    s_10304 = 10304,
    s_10400 = 10400,
    s_10401 = 10401,
    s_10402 = 10402,
    s_10403 = 10403,
    s_10404 = 10404,
    s_10500 = 10500,
    s_10501 = 10501,
    s_10502 = 10502,
    s_10503 = 10503,
    s_10504 = 10504,
    s_66666 = 66666,
}
export enum emShareEvent {
    share_happy = "share_happy"
}
export enum emSharePath {
    none,
    default,    // 微信默认
    start_game, // 开始游戏
    revive,     // 复活
    sticker_request_friend, // 贴纸求助好友 
    score_success,
    score_fail,
    level_success,
    level_fail,
    score_happy,
    level_happy,
    score_rank
}
/**
 * 分享显示的类型 
 */
export enum emShareShowType {
    None,
    Video,
    Share,
}
export const VideoADIDConfig = {
    // 1098:"adunit-5eda09fb84291014",
    // 1099:"adunit-0866e714fc55ce25",
    // 1100:"adunit-0866e714fc55ce25",

}
export interface IShareInfo {
    tittle: string;
    imageUrl: string;
    imageUrlId: string;
}

export interface IOnShowInfo {
    scene: string;
    query: any;
    shareTicket: string;
    referrerInfo: { appId: string, extraData: any };
}

export const ShareConfig = {
    10001: {
        id: 10001,
        tittle: "帮我拿个贴纸吧～这游戏真上头!",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/help.png",
        imageUrlId: "",
    },
    10002: {
        id: 10002,
        tittle: "迷路了，谁能来帮我找到家？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/1.jpg",
        imageUrlId: "",
    },
    10003: {
        id: 10003,
        tittle: "好像卡住了，谁来帮帮我！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/6.jpg",
        imageUrlId: "",
    },
    10004: {
        id: 10004,
        tittle: "称心如意,块从人愿",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/share_icon.png",
        imageUrlId: "",
    },
    10005: {
        id: 10005,
        tittle: "帮我拿个贴纸吧～这游戏真上头！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/4.jpg",
        imageUrlId: "",
    },
    10006: {
        id: 10006,
        tittle: "据说只有1%的人可以通关！玻璃心勿进！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.png",
        imageUrlId: "",
    },
    10007: {
        id: 10007,
        tittle: "敢不敢来打破我的纪录?",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10008: {
        id: 10008,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/failview.png",
        imageUrlId: "",
    },
    10009: {
        id: 10009,
        tittle: "看谁能成为大神?",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/defaultshare.png",
        imageUrlId: "",
    },
    10010: {
        id: 10010,
        tittle: "真有那么厉害?",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/bestscoreview.png",
        imageUrlId: "",
    },
    10011: {
        id: 10011,
        tittle: "来，别光说不练",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/rankview.png",
        imageUrlId: "",
    },
    10100: {
        id: 10100,
        tittle: "上厕所别点，我怕你蹲到腿麻！！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10101: {
        id: 10101,
        tittle: "上厕所别点，我怕你蹲到腿麻！！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_1.png",
        imageUrlId: "",
    },
    10102: {
        id: 10102,
        tittle: "上厕所别点，我怕你蹲到腿麻！！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.png",
        imageUrlId: "",
    },
    10103: {
        id: 10103,
        tittle: "上厕所别点，我怕你蹲到腿麻！！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_3.png",
        imageUrlId: "",
    },
    10104: {
        id: 10104,
        tittle: "上厕所别点，我怕你蹲到腿麻！！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_4.png",
        imageUrlId: "",
    },
    10200: {
        id: 10200,
        tittle: "据说通关的都能达到爱因斯坦的IQ！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10201: {
        id: 10201,
        tittle: "据说通关的都能达到爱因斯坦的IQ！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_1.png",
        imageUrlId: "",
    },
    10202: {
        id: 10202,
        tittle: "据说通关的都能达到爱因斯坦的IQ！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.png",
        imageUrlId: "",
    },
    10203: {
        id: 10203,
        tittle: "据说通关的都能达到爱因斯坦的IQ！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_3.png",
        imageUrlId: "",
    },
    10204: {
        id: 10204,
        tittle: "据说通关的都能达到爱因斯坦的IQ！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_4.png",
        imageUrlId: "",
    },
    10300: {
        id: 10300,
        tittle: "我只说一遍：真的难！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10301: {
        id: 10301,
        tittle: "我只说一遍：真的难！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_1.png",
        imageUrlId: "",
    },
    10302: {
        id: 10302,
        tittle: "我只说一遍：真的难！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.jpg",
        imageUrlId: "",
    },
    10303: {
        id: 10303,
        tittle: "我只说一遍：真的难！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_3.png",
        imageUrlId: "",
    },
    10304: {
        id: 10304,
        tittle: "我只说一遍：真的难！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_4.png",
        imageUrlId: "",
    },
    10400: {
        id: 10400,
        tittle: "敢不敢来测算下你的智商够不够？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10401: {
        id: 10401,
        tittle: "敢不敢来测算下你的智商够不够？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_1.png",
        imageUrlId: "",
    },
    10402: {
        id: 10402,
        tittle: "敢不敢来测算下你的智商够不够？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.png",
        imageUrlId: "",
    },
    10403: {
        id: 10403,
        tittle: "敢不敢来测算下你的智商够不够？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_3.png",
        imageUrlId: "",
    },
    10404: {
        id: 10404,
        tittle: "敢不敢来测算下你的智商够不够？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_4.png",
        imageUrlId: "",
    },
    10500: {
        id: 10500,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge.png",
        imageUrlId: "",
    },
    10501: {
        id: 10501,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_1.png",
        imageUrlId: "",
    },
    10502: {
        id: 10502,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_2.png",
        imageUrlId: "",
    },
    10503: {
        id: 10503,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_3.png",
        imageUrlId: "",
    },
    10504: {
        id: 10504,
        tittle: "敢不敢睡觉前玩这个游戏？",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/challenge_4.png",
        imageUrlId: "",
    },
    99999: {
        id: 9999,
        tittle: "你觉得这个方块放的位置合适吗！",
        imageUrl: "https://waxiaoqn.nalrer.cn/waxiao/share/share.jpg",
        imageUrlId: "",
    }
}