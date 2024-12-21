import { _decorator, Node, Label, Component } from "cc";
import { mk } from "../../../../MK";
import { kGameMode } from "../define/Enumrations";
import { SceneMode } from "../define/SceneMode";
import { ProcedureToLevel } from "../../../../fsm/state/ProcedureToLevel";
import { UserCollectLevelData } from "../../../../data/UserCollectLevelData";
import { LevelSelectItem } from "../level/LevelSelectItem";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";
import { ProcedureToLevelTheme } from "../../../../fsm/state/ProcedureToLevelTheme";
import { ResManager } from "../../../../resource/ResManager";
import { Prefab } from "cc";
import { instantiate } from "cc";
import { Vec3 } from "cc";
import { tween } from "cc";
import { LanguageManager } from "../../../../data/LanguageManager";
import { NodePool } from "../../../../util/NodePool";
import { LevelTheme } from "../level/LevelTheme";
import * as env from "cc/env";
import { AdSdk } from "../../../../sdk/AdSdk";
import { BIEventID, emButtonType, emButtonScene } from "../../../../define/BIDefine";
const { ccclass, property } = _decorator;

@ccclass("SceneLevelSeclect")
export class SceneLevelSeclect extends Component {
    // @property(Node)
    // ndLevelContent: Node = null;
    // @property(Node)
    // ndLevelSelectItem: Node = null;
    @property(Label)
    labCurrentLevel: Label = null;
    // @property(Node)
    rootLevelItem: Node = null;
    rootLevelItemLabel: Node = null;
    // @property(Node)
    rootLevelMap: Node = null;
    @property(Node)
    themeNode: Node = null;

    private levelItemNodePool: NodePool;
    private levelLabelNodePool: NodePool;
    onLoad() {
        this.leftExitPositon = new Vec3(-800, 0, 0);
        this.rightShowPositon = new Vec3(800, 0, 0);
        this.changeThemeState();
        // this.levelItemNodePool = NodePoolManager.inst.getPoolWithBundleName("prefab/LevelSelectItem", "level");
        // this.levelLabelNodePool = NodePoolManager.inst.getPoolWithBundleName("prefab/LevelSelectItemLabel", "level")
    }
    private currentShowThemeNode: Node = null;
    private currentShowTheme: LevelTheme = null;
    private leftExitPositon: Vec3;
    private rightShowPositon: Vec3;
    public changeThemeState() {
        let currentLevel = UserCollectLevelData.inst.getMaxHistoryLevel();
        this.labCurrentLevel.string = `${LanguageManager.translateText("txt_level")} ${currentLevel}`;
        //加载关卡数据
        let configPath = UserCollectLevelData.inst.getLevelConfigPath();
        // console.log(configPath)
        let levelTables = mk.subRes.loadJsonConfig(configPath);
        // console.log(levelTables)
        let maxLevel = levelTables.length;

        let themeName = UserCollectLevelData.inst.getLevelThemeName();

        //设置奖杯的状态
        // this.trophySpr = this.trophyNode.getComponent(Sprite);
        // this.trophySprBear = this.trophyNodeBear.getComponent(Sprite);
        // this.trophySprsheep = this.trophyNodeSheep.getComponent(Sprite)
        // let isAllFinished = UserCollectLevelData.inst.isAllLevelFinished;
        // if (themeName == emLevelTheme.cat) {
        //     this.trophySpr.grayscale = isAllFinished == 0;
        // } else if (themeName == emLevelTheme.bear) {
        //     this.trophySprBear.grayscale = isAllFinished == 0;
        // }else if(themeName==emLevelTheme.sheep){
        //     this.trophySprsheep.grayscale = isAllFinished == 0;
        // }
        AdSdk.inst.hideMainPageBannerAd();
        // SdkAdManager.getInstance().hideCustomGridAd();
        /**
         * 主题名称和节点名称对应
         */
        let themes = this.themeNode.children;
        let useThemeRoot: Node = null;
        let exitThemeRoot: Node = this.currentShowThemeNode;
        let exitTheme: LevelTheme = this.currentShowTheme;
        if (exitThemeRoot) {
            //当前展示的主题
            let items = exitTheme.items;
            let itemLabels = exitTheme.itemLables;
            tween(exitThemeRoot).to(0.3, { position: this.leftExitPositon }).start();
            if (env.PREVIEW) {
                console.log("回收节点：", exitThemeRoot.name);
            }
            items.forEach((item) => {
                this.levelItemNodePool.put(item);
            });
            itemLabels.forEach((label) => {
                this.levelLabelNodePool.put(label);
            });
            exitTheme.clearItems();
        }
        themes.forEach((child) => {
            if (child && child.isValid) {
                if (themeName == child.name) {
                    //下一个展示的主题
                    child.setPosition(this.rightShowPositon);
                    child.active = true;
                    useThemeRoot = child;
                    tween(child).to(0.3, { position: Vec3.ZERO }).start();
                    this.currentShowThemeNode = useThemeRoot;
                    this.currentShowTheme = useThemeRoot.getComponent(LevelTheme);
                    //对象池中获取节点
                    this.rootLevelItem = useThemeRoot.getChildByPath("ScrollView/view/content/level_content");
                    this.rootLevelMap = useThemeRoot.getChildByPath("ScrollView/view/content/level_map");
                    this.rootLevelItemLabel = useThemeRoot.getChildByPath("ScrollView/view/content/label_content");
                    if (this.rootLevelItem) {
                        for (let i = 0; i < maxLevel; i++) {
                            let levelTable = levelTables[i];
                            let levelItem = this.createLevelItem(levelTable, currentLevel, maxLevel);
                            if (!levelItem.active) {
                                levelItem.active = true;
                            }
                        }
                    }
                } else {
                    child.active = false;
                }
            }
        });
        if (!useThemeRoot) {
            ResManager.getInstance()
                .loadAsset<Prefab>(`prefab/theme_${themeName}`, "level")
                .then((prefab) => {
                    if (prefab && this) {
                        let useThemeRoot: Node = instantiate(prefab);
                        if (useThemeRoot) {
                            this.rootLevelItem = useThemeRoot.getChildByPath("ScrollView/view/content/level_content");
                            this.rootLevelMap = useThemeRoot.getChildByPath("ScrollView/view/content/level_map");
                            this.rootLevelItemLabel = useThemeRoot.getChildByPath(
                                "ScrollView/view/content/label_content"
                            );
                            // useThemeRoot.active = false;
                            useThemeRoot.setParent(this.themeNode);
                            useThemeRoot.setPosition(this.rightShowPositon);
                            // this.scheduleOnce(()=>{
                            //     useThemeRoot.active = true
                            // },0.02);
                            // useThemeRoot.active = true;
                            useThemeRoot.setScale(1, 1, 1);
                            useThemeRoot.name = themeName;
                            tween(useThemeRoot).to(0.3, { position: Vec3.ZERO }).start();
                            this.currentShowThemeNode = useThemeRoot;
                            this.currentShowTheme = useThemeRoot.getComponent(LevelTheme);
                            if (this.rootLevelItem) {
                                for (let i = 0; i < maxLevel; i++) {
                                    let levelTable = levelTables[i];
                                    let levelItem = this.createLevelItem(levelTable, currentLevel, maxLevel);
                                    if (!levelItem.active) {
                                        levelItem.active = true;
                                    }
                                }
                            }
                        }
                    }
                });
        }
        // this.timePass = 0;
    }
    createLevelItem(levelTable: ILevelConfig, currentLevel: number, maxLevel: number) {
        let levelItemLabel = this.levelLabelNodePool.get();
        let levelItemNode = this.levelItemNodePool.get();
        let levelItemSelect = levelItemNode.getComponent(LevelSelectItem);
        levelItemSelect.labLevel = levelItemLabel.getComponent(Label);
        levelItemSelect.initData(levelTable.id, levelTable.id <= currentLevel, levelTable.id == currentLevel, maxLevel);
        this.rootLevelItem.addChild(levelItemNode);
        levelItemNode.setSiblingIndex(levelTable.id);
        this.rootLevelItemLabel.addChild(levelItemLabel);
        levelItemLabel.setSiblingIndex(levelTable.id);
        this.currentShowTheme.addItems(levelItemNode, levelItemLabel);
        return levelItemNode;
    }

    onClickHome() {
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.none;
        mk.fsm.changeState(ProcedureToLevelTheme, "level_select");
    }
    onClickNextLevel() {
        mk.sdk.instance.reportBI(BIEventID.btn_click, {
            proj_btn_type: emButtonType.click_adventure_start,
            proj_scene: emButtonScene.from_adventure_choose_level,
        });
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        let currentLevel = UserCollectLevelData.inst.getMaxHistoryLevel();
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        SceneMode.gameMode = kGameMode.level;
        UserCollectLevelData.inst.updateHistoryLevel(currentLevel);
        mk.fsm.changeState(ProcedureToLevel, "level_select");
    }
    protected onDestroy(): void {
        // AdSdk.inst.showMainPageBannerAd();
    }
    // timePass: number = 0;
    // lateUpdate(dt: number) {
    //     this.timePass += dt;
    //     if (this.timePass > 1) {
    //         this.timePass = 0;
    //         //每隔两秒检测一次
    //         AdSdk.inst.hideMainPageBannerAd();
    //         // SdkAdManager.getInstance().hideCustomGridAd();
    //     }
    // }
}
