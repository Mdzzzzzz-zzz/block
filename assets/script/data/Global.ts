export class Global {

   public static initHome: boolean;

   public static isHaveUseProp: boolean;
   public static shareNumberOpenDefault: any = {};

   static totalclearnumber: any;
   static shareTimes: any;
   static previousShowClearnGiftTimes: any;
   static playhistorydata: any;
   static BoardView: any;
   static Board: any;
   static storescorevalue: any;
   static useReviveCoinTimes: number;
   static shareReviveTimes: number;
   static reviveCoin: number;
   static dailyClearCountView: any;
   static changeSkinTimes: number;
   static hadshowredpacket: number;
   static hadChangeSkins: boolean;
   static enterGifted: any;
   static resignCard: any;

   static isRestart: boolean = false;

   public static hallLastPage = "hp_normal";
   public static _curGameID = 1;
   public static set curGameID(value) {
      this._curGameID = value;
   }
   public static get curGameID() {
      return this._curGameID;
   }
   public static startGameTime = 0;
   public static curGameType = 1;
   public static curMatchID = 6001;
   public static oneGameTime: number = 300;
   public static curGameSN = "";

   public static curTokenNeed = 0;
   public static curCreditNeed = 0;

   //1大厅 2战绩成就列表  3排行  4充值  5战绩计算等待界面  6 领取奖励界面   
   public static gotohall_type: number = 1;
   public static hall_gameover_ss1: number = 0;
   public static hall_gameover_ss2: number = 0;
   public static hall_gameover_pp1: string = null;
   public static hall_gameover_pp2: string = "unknown";
   public static hall_gameover_sn: string = null;

   public static PlatformTest: number = 4;
   public static PlatformGoogle: number = 1;
   public static PlatformFacebook: number = 2;
   public static PlatformApple: number = 3;

   public static Lbl_curCredit = 0;
   public static Lbl_curToken = 0;
   public static Lbl_curXp = 0;
   public static Lbl_tarCredit = 0;
   public static Lbl_tarToken = 0;
   public static Lbl_tarXp = 0;

   public static TActivity_match = 1;
   public static TActivity_tour = 2;
   public static TActivity_task = 3;
   public static TActivity_lvlup = 4;
   public static TActivity_newrank = 5;
   public static advice_type: number = 6;
   public static GameInfo_type: number = 7;

   public static LevelSelectBoard: Map<number, Map<number, ILevelSelectBoardCell>> = new Map<number, Map<number, ILevelSelectBoardCell>>();
   public static EnterStickerFrom: number = 0;
   public static myWorkShowBoard: Map<number, ILevelShowMyWork> = new Map<number, ILevelShowMyWork>();
   public static myWorkShowMaxX: number;
   public static myWorkShowMaxY: number;

   public static maxAdBeforeShare: number = 1;
   public static popFirstGameSubscribe: boolean = false;
}

