/*
 * @Date: 2023-05-13 01:02:14
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-06-14 22:41:34
 */
import { Color, Vec2, Vec3 } from "cc";
export var BlockConstData = {
    BlockSize: new Vec2(80, 80),
    BlockSpriteSize: new Vec2(84, 84),
    PreviewBlockSize: new Vec2(400, 400),
    BoardSize: new Vec2(672, 672),
    BoardWidth: 8,
    BoardHeight: 8,
    TuoDongBeiLv: 1,
    BlockParam: {
        clickTime: 0.03,
    },
    BlockSpawnScale: 0.5,
    BlockSpawnVector: new Vec3(0.5, 0.5, 1),
    BlockDiamondScale: new Vec3(0.7, 0.7, 1),
    BlockGenOffsetX: [-225, 0, 237], //[-126, 0, 126]（scale:0.3）,
    BlockMoveLerpSpeed: 12,
    BlockMoveOpenDrag: false,
    BlockColor: [
        new Color(74, 145, 255, 255), // 蓝色：#4A91FF00
        new Color(255, 225, 0, 255), // 黄色：#FFE10000
        new Color(221, 150, 255, 255), // 紫色：#DD96FF00
        new Color(255, 165, 0, 255), // 橘色：#FFA50000
        new Color(248, 98, 120, 255), // 红色：#F8627800
        new Color(159, 255, 0, 255), // 绿色：#9FFF0000
        new Color(0, 243, 255, 255), // 天蓝：#00F3FF00
    ],
    BlockTempColor: new Color().fromHEX("#888888"),
    // BlockScoreDesc: ["GOOD","GREAT", "EXCELLENT", "AMAZING", "UNBELIEVABLE", "UNBELIEVABLE", "UNBELIEVABLE", "UNBELIEVABLE"],
    BlockScoreDesc: [
        "太棒了！",
        "技术一流！",
        "完美消除！",
        "令人惊叹！",
        "难以置信！",
        "难以置信！",
        "难以置信！",
        "难以置信！",
    ],
    BlockScoreDescPic: [
        "UI_Score_content_1",
        "UI_Score_content_2",
        "UI_Score_content_3",
        "UI_Score_content_4",
        "UI_Score_content_5",
        "UI_Score_content_5",
    ],

    BlockDiamondShadow: {
        b101: "UI_Gem_blueshadow@UI_Gem",
        b102: "UI_Gem_orangeshadow@UI_Gem",
        b103: "UI_Gem_purpleshadow@UI_Gem",
        b104: "UI_Gem_pinkshadow@UI_Gem",
        b105: "UI_Gem_yellowshadow@UI_Gem",
        b106: "UI_Gem_greenshadow@UI_Gem",
    },

    DimaondFlyLe: {
        b101: "UI_Gem_blue@UI_le",
        b102: "UI_Gem_orange@UI_le",
        b103: "UI_Gem_purple@UI_le",
        b104: "UI_Gem_pink@UI_le",
        b105: "UI_Gem_yellow@UI_le",
        b106: "UI_Gem_green@UI_le",
    },

    CollectScale1: new Vec3(1.2, 1.2, 1),
    CollectScale2: new Vec3(1, 1, 1)


};
