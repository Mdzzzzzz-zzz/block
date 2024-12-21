
  export const MsgType = {
    HEARTBEAT : 'game/heartbeat',
    LOGIN : 'login',
    BIND_USER : 'bindUser6',

    LOBBY:'lobby',
    MATCH_LIST:'matchList',

    GAME_SIGN_UP:'game/signUp', // 报名游戏   s/r
    GAME_SIGN_OUT:'game/signOut', // 取消报名 s/r
    GAME_JOIN:'game/join',  // 有人加入等待    r
    GAME_AWAY:'game/away',  // 玩家加入退出    r
    GAME_Leave:'game/leave',  // 有人离开等待  r
    GAME_START:'game/start',  // 游戏开始     r
    GAME_RESULT:'game/result',  // 游戏结果   r
    GAME_OUT:'game/out',   // 淘汰           r
    GAME_BROADCAST:"game/broadcast", // 广播协议 s/r
    GAME_QUIT:"game/quit", // 强退           s/r
    GAME_BOMB_INFO:'game/bombInfo', //      r
    GAME_ATTACK:'game/attack', //           s/r
    GAME_ATTENTION:'game/attention', //     r

    QUIT_ALBUM: 'quit_album', //退出相册
    REPORT_ALBUM_INDEX: 'report_album_index', //
    CHANGE_ALBUM_DISPLAY: 'change_album_display', //
    DISABLE_NORMAL_DISPLAY: 'disable_normal_display', //
    ALBUM_FLIP_NEXT: 'album_flip_next',
    ALBUM_FLIP_PREV: 'album_flip_previous',
  }
