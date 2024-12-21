// 登录
export type LoginModel = {
    userId: number,
    credits: number,
    tokens: number,
    xp: number,
    name: string,
    address: string,
    opened: number[],
    liked: any,
    scores: {
        1: number
    }
}

// 游戏列表
export type LobbyModel = {
    conf: {
        id: number,
        name: string,
        memo: string,
        icon: string
    }[],
    classics: number[],
    populars: number[],
    opened_games: any,
    like_games: number[],
    tournaments: {
        id: number,
        game_id: number,
        type: number,
        name: string,
        memo: string,
        cron: string,
        token: number,
        credit: number,
        time_limit: number,
        duration: number,
        player_limit: number,
        awards: {
            rank: string,
            token: number,
            credit: number,
            score: number,
            xp: number
        }[],
        start_time: number,
        ending_time: number
    }[],
    tasks: LobbyTaskModel,
}
// 任务
export type LobbyTaskModel = {
    id: number,
    name: string,
    event: string,
    memo: string,
    pid: number,
    type: number,
    reward: {
        credit: number,
        token: number,
        xp: number,
    }[],
    progress: number,
    formula: number[],
    cron: string,
    game_id: number,
    match_id: number
}[];

// 比赛列表
export type MatchListModel = {
    matches: {
        id: number,
        game_id: number,
        type: number,
        name: string,
        memo: string,
        cron: string,
        token: number,
        credit: number,
        time_limit: number,
        duration: number,
        player_limit: number,
        awards: {
            rank: string,
            token: number,
            credit: number,
            score: number,
            xp: number
        }[],
    }[],
    task: {
        task_id: number,
        match_id: number,
        status: number,
        progress: number
    }
}

// 活动详情 
export type ActivityStatsModel = {
    id: string,
    gid: number,
    type: number,
    ticket: number,
    unit: string,
    info: {
        ID: string,
        UID: number,
        Type: number,
        Players: {
            uid: number,
            score: number
        }[],
        GameId: number,
        MatchId: number,
        Ts: number,
        TID: number,
        Reward: any,
        Data: any,
        Level: number,
        Score: number
    },
    ts: number
}

// 活动列表
export type PastActivityModel = {
    cursor: number,
    page_size: number,
    activities: ActivityStatsModel[],
}

// 赛季
export type SeasonModel = {
    no: 1,
    pool: number,
    memo: string,
    ranking: any[],
    start_time: number,
    ending_time: number
}

// 锦标赛排行榜
export type RankingModel = {}

// userInfo
export type UserInfoModel = {
    nonce: string,
    userId: number,
}

// 游戏开始数据
export type GameStartModel = {
    sn: string,
    players: Array<{ uid, name, url }>,
    seed: number
}

export type GameResultModel = {
    sn: string,
    scores: any,
    players: Array<{ uid, name, url }>
}

export type SignUp = {
    uid: number,
    name: string,
    url: string
}

let Login: LoginModel;                      // 登录
let Lobby: LobbyModel;                      // 游戏列表
let LobbyTask: LobbyTaskModel;              // 任务
let MatchList: MatchListModel;              // 比赛列表
let PastActivity: PastActivityModel;        // 活动列表
let PastActivityState: ActivityStatsModel;  // 活动详情
let GetSeason: SeasonModel;                 // 赛季
let GetRanking: RankingModel;               // 锦标赛排行榜
let UserInfo: UserInfoModel;                // 用户信息
let SignUp: SignUp[];                         // 开始比赛
let SignOut: number;                        // 结束比赛
let GameStart: GameStartModel;             // 游戏开始数据
let GameResult: GameResultModel;             // 游戏开始数据

export let MsgData = {
    Login,
    Lobby,
    LobbyTask,
    MatchList,
    PastActivity,
    PastActivityState,
    GetSeason,
    GetRanking,
    UserInfo,
    SignUp,
    SignOut,
    GameStart,
    GameResult,
}
