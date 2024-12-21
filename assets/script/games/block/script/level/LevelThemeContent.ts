/*
 * @Date: 2023-05-25 19:54:51
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2023-07-16 12:22:23
 */
import { _decorator, Component, Node } from 'cc';
import { UserCollectLevelData } from '../../../../data/UserCollectLevelData';
import { mk } from '../../../../MK';
import { LevelSelectItem } from './LevelSelectItem';
const { ccclass, property } = _decorator;

@ccclass('LevelThemeContent')
export class LevelThemeContent extends Component {
    @property
    levelTheme: string = "";
    // @property(Node)
    rootLevelItem: Node = null;
    // @property(Node)
    rootLevelMap: Node = null;
    
    onLoad() {
        let current = UserCollectLevelData.inst.getLevelThemeName();
        if(current == this.levelTheme){
            this.refreshContent();
        }
    }
    protected start(): void {
        let current = UserCollectLevelData.inst.getLevelThemeName();
        if(current != this.levelTheme){
            this.refreshContent();
        }
    }
    refreshContent(){
        let currentLevel = UserCollectLevelData.inst.getMaxHistoryLevelByTheme(this.levelTheme);
        //加载关卡数据
        let configPath = UserCollectLevelData.inst.getLevelConfigPath();
        // console.log(configPath)
        let levelTables = mk.subRes.loadJsonConfig(configPath);
        // console.log(levelTables)
        let maxLevel = levelTables.length;
        /**
         * 主题名称和节点名称对应
         */
        let useThemeRoot: Node = this.node;

        if (useThemeRoot) {
            this.rootLevelItem = useThemeRoot.getChildByPath("ScrollView/view/content/level_content");
            this.rootLevelMap = useThemeRoot.getChildByPath("ScrollView/view/content/level_map");
        }
        if (this.rootLevelItem) {
            for (let i = 0; i < maxLevel; i++) {
                let levelTable = levelTables[i];
                let levelItem = this.createLevelItem(levelTable, currentLevel, maxLevel);
                levelItem.active = true;
            }
        }
    }
    createLevelItem(levelTable: ILevelConfig, currentLevel: number, maxLevel: number) {
        let levelItem = this.rootLevelItem.getChildByName(levelTable.id.toString()); //instantiate(this.ndLevelSelectItem);
        let cmpt: LevelSelectItem = levelItem.getComponent(LevelSelectItem);
        cmpt.initData(levelTable.id, levelTable.id <= currentLevel, levelTable.id == currentLevel, maxLevel);
        return levelItem;
    }

}

