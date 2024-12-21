import { _decorator, Label, Node, Sprite, Animation, Event, AnimationState, UIOpacity, instantiate, Vec2, UITransform, Button } from "cc";
import { mk } from "../../../../MK";
import { ResManager } from "../../../../resource/ResManager";
import { pageView } from "../../../../third/scrollview/example/pageView/pageView";
import { albumViewV2 } from "./AlbumViewV2";
import { AdventureLevelConfigData } from "../define/adventureLevelData";
import { PageViewManager } from "../../../../third/scrollview/adapter";
import { ChallengeAlbumConfig } from "../../../../data/AlbumData";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { ClassicAlbumConfig } from "../../../../data/ClassicAlbumConfig";
import { AssetInfoDefine } from "../../../../define/AssetInfoDefine";

const { ccclass, property } = _decorator;

const itemPerPage = 6;

@ccclass("AlbumControlView")
export class AlbumControlView extends pageView {
    @property(Label)
    pageNum: Label = null;

    @property(Node)
    homeButtonNode: Node = null;

    @property(Node)
    prevPageNode: Node = null;

    @property(Node)
    nextPageNode: Node = null;

    @property(Sprite)
    titleSprite: Sprite = null;

    @property(Animation)
    BookNodeAnim: Animation = null;

    @property(Node)
    tmpDisplayBlock: Node = null;

    @property(UIOpacity)
    bgMask: UIOpacity = null;

    private openScenario: number = 0;

    setOpenPageType(openPage: number) {
        this.openScenario = openPage;
    }

    label: string = "real"

    private currIndex: number = 0;

    private totalPages: number = 1;
    private pageList = new Array<IAlbumPage>();

    private duplicatedNode: Node = null;
    private posList = Array<Vec2>();

    private onFlip: boolean = false;

    private openType: number = 1;

    private adventurePageIndex = 0;
    private classicPageIndex = 0;
    private challengePageIndex = 0;

    onLoad() {
        console.log("start Scene Album");

        // this.node.active = false;
    }

    start() {
        // TODO testcode to delete
        //UserDailyChallengeData.inst.setChallengeProgress(7, 1, 1);

        if (this.bgMask && this.bgMask.opacity) {
            this.bgMask.opacity = 255;
        }

        this.homeButtonNode.getComponent(Button).interactable = true;
        if (this.tmpDisplayBlock) {
            this.tmpDisplayBlock.active = false;
        }
        this.BookNodeAnim.on(Animation.EventType.FINISHED, this._onPlayAnimEnd, this);

        let currentbatchNumber = AdventureLevelConfigData.LevelTotalNumer;
        let pageList = new Array<IAlbumPage>();
        this.totalPages = Math.floor(currentbatchNumber / itemPerPage) + 1
        for (let i = 0; i < this.totalPages; i++) {
            pageList.push({
                name: `# ${i}`,
                type: 0, //i % 2
                page: i,
                childItemSeq: [],
            })
        }

        this.classicPageIndex = this.totalPages
        for (let i = 0; i < ClassicAlbumConfig.config.length; i++) {

            let page = {
                name: `# ${this.totalPages}`,
                type: 0, //i % 2
                page: this.totalPages,
                childItemSeq: [],
            }
            const theme = ClassicAlbumConfig.config[i];
            for (let j = 0; j < theme.length; j++) {
                const obj = theme[j];
                // console.log("obj = ", obj);
                page.childItemSeq.push(obj.id);
            }
            pageList.push(page);
            this.totalPages++;
        }

        this.challengePageIndex = this.totalPages;
        let challengePages = this.getChallengeStickerPages();
        let challengePagesCount = challengePages == null || challengePages == undefined ? 0 : challengePages.length;

        console.log("challengePagesCount : " + challengePagesCount)
        for (let i = 0; i < challengePagesCount; i++) {
            let page = {
                name: `# ${this.totalPages}`,
                type: 0, //i % 2
                page: this.totalPages,
                childItemSeq: [],
            }

            let monthSticker = challengePages[i]
            for (let j = 0; j < monthSticker.stickers; j++) {

                let stickerId = ChallengeAlbumConfig.calculateIdByMonth(monthSticker.year, monthSticker.month, j + 1);
                page.childItemSeq.push(stickerId);
            }
            pageList.push(page);
            this.totalPages++;
        }

        for (let i = 0; i < currentbatchNumber; i++) {
            pageList[Math.floor(i / itemPerPage)].childItemSeq.push(i + 1);
        }
        console.log("[SceneAlbum.start]", pageList);
        this.modelManager.insert(pageList).then(() => {
            this.setItemElementData(pageList);

            this.pageViewManager.on(PageViewManager.Event.ON_SCROLL_PAGE_BEFOR, this._onScrollPageStart, this);
            this.pageViewManager.on(PageViewManager.Event.ON_SCROLL_PAGE_END, this._onScrollPageEnd, this);
            this._refreshView();
        });
        this.pageList = pageList;
        if (this.openScenario == 2) {
            if (this.pageList.length == this.challengePageIndex) {
                this.pageViewManager.scrollToPage(0.5, this.challengePageIndex - 1);
            } else {
                this.pageViewManager.scrollToPage(0.5, this.challengePageIndex);
            }

        }

        // if (Global.EnterStickerFrom != emEnterAlbumFrom.adventure_level_select) {
        //     this.pageViewManager.scrollToPage(0.001, 2);
        //     this.currIndex = 2;
        //     this.BookNodeAnim.play("book_open_02");
        // } else {
        //     this.BookNodeAnim.play("book_open");
        //     this.currIndex = 0;
        // }

    }
    /**
     * Checks if the challenge page is empty.
     *
     * @return {boolean} Whether the challenge page is empty.
     */
    getChallengeStickerPages() {
        return UserDailyChallengeData.inst.getStickerObtainedSeq();

        // return seq == null || seq == undefined? 0: seq.length;
    }

    scrollToPage(pageIndex: number, isBlock: boolean = false) {
        if (this.label != "real") {
            return;
        }

        if (isBlock) {
            this.pageViewManager.off(PageViewManager.Event.ON_SCROLL_PAGE_END, this._onScrollPageEnd, this);
        }

        this._refreshView();
        if (this.node.active && this.node.parent && this.node.parent.active) {
            this.pageViewManager.scrollToPage(0, pageIndex);
        }

        this.currIndex = pageIndex;

        if (isBlock) {
            this.pageViewManager.on(PageViewManager.Event.ON_SCROLL_PAGE_END, this._onScrollPageEnd, this);
        }

    }

    playOpenAnim(openType: number) {
        this.openType = openType;
        if (openType == 1) {
            this.BookNodeAnim.play("book_open");
        } else if (openType == 2) {
            this.BookNodeAnim.play("book_open_02");
        }
    }

    private _onScrollPageStart(index: number, dir: number) {
        // dir 0 prev, 1 next
        // if (this.onFlip === false) {
        //     if (dir == 1) {
        //         mk.sendEvent(mk.msgType.ALBUM_FLIP_NEXT)
        //         //this.tmpDisplayBlock.active = true;
        //         this.onFlip = true;
        //         this.BookNodeAnim.play("book_flip_next_02")     
        //     } else if (dir == 0) {
        //         mk.sendEvent(mk.msgType.ALBUM_FLIP_PREV)
        //         //this.tmpDisplayBlock.active = true;
        //         this.onFlip = true;
        //         this.BookNodeAnim.play("book_flip_previous")   
        //     }
        // }

    }

    private _onScrollPageEnd(index: number) {
        if (this.currIndex < index) {
            // let currIndexPage = this.scrollManager.content.node.getChildByName('_layerLowest').children[this.currIndex]
            // let worldPos = currIndexPage.getComponent(UITransform).convertToWorldSpaceAR(Vec2.ZERO);
            // this.duplicatedNode = instantiate(currIndexPage)
            // this.tmpDisplayBlock.active = true;
            // this.duplicatedNode.setParent(this.tmpDisplayBlock, true)
            // this.duplicatedNode.setWorldPosition(worldPos);

        } else if (this.currIndex > index) {
            // let currIndexPage = this.scrollManager.content.node.getChildByName('_layerLowest').children[this.currIndex]
            // let worldPos = currIndexPage.getComponent(UITransform).convertToWorldSpaceAR(Vec2.ZERO);
            // this.duplicatedNode = instantiate(currIndexPage)
            // this.tmpDisplayBlock.active = true;
            // this.duplicatedNode.setParent(this.tmpDisplayBlock, true)
            // this.duplicatedNode.setWorldPosition(worldPos);

        } else {

        }
        this.currIndex = index;
        this._refreshView();
        this.onFlip = false
    }

    private _onPlayAnimEnd(event: Animation.EventType, state: AnimationState) {
        if (this.label != "real") {
            return;
        }
        if (state.name == "book_close" || state.name == "book_close_02") {
            // if (Global.EnterStickerFrom == emEnterAlbumFrom.game_over) {
            //     //mk.sendEvent(BlockEventType.EVENT_ACTIVE_NODE_FROM_ALBUM);
            //     //mk.fsm.changeState(ProcedureToGame);
            //     mk.fsm.changeState(ProcedureToHome);
            // } else if (Global.EnterStickerFrom == emEnterAlbumFrom.adventure_level_select) {
            //     mk.fsm.changeState(ProcedureToAdventureLevelSelectV2);
            // } else if (Global.EnterStickerFrom == emEnterAlbumFrom.scene_home) {
            //     mk.fsm.changeState(ProcedureToHome);
            // }
            mk.sendEvent(mk.msgType.QUIT_ALBUM)
        } else if (state.name == "book_flip_next_02") {
            mk.sendEvent(mk.msgType.REPORT_ALBUM_INDEX, this.currIndex);
            mk.sendEvent(mk.msgType.CHANGE_ALBUM_DISPLAY, "normal");
            // this.duplicatedNode.destroy();
            // this.duplicatedNode = null;
            // this.tmpDisplayBlock.active = false;
        } else if (state.name == "book_flip_previous") {
            mk.sendEvent(mk.msgType.REPORT_ALBUM_INDEX, this.currIndex);
            mk.sendEvent(mk.msgType.CHANGE_ALBUM_DISPLAY, "normal");
            // this.duplicatedNode.destroy();
            // this.duplicatedNode = null;
            // this.tmpDisplayBlock.active = false;
            // mk.sendEvent(mk.msgType.DISABLE_NORMAL_DISPLAY)
            // this._refreshView();
            // mk.sendEvent(mk.msgType.CHANGE_ALBUM_DISPLAY, "normal");
        } else if (state.name == "book_open_02") {
            this.node.active = true;
            this.pageViewManager.scrollToPage(0.5, 2);
            this.homeButtonNode.getComponent(Button).interactable = true;
        } else if (state.name == "book_open") {
            this.node.active = true;
            this.homeButtonNode.getComponent(Button).interactable = true;
        }
        this.onFlip = false;
    }

    private _refreshView() {
        let currIndex = this.pageViewManager.currentIndex
        if (this.pageNum) {
            this.pageNum.string = (currIndex + 1).toString() + '/' + this.totalPages.toString();
        }

        if (this.prevPageNode) {
            this.prevPageNode.active = true;
            this.nextPageNode.active = true;
        }


        if (currIndex === 0 && this.prevPageNode) {
            this.prevPageNode.active = false;
        } else if (currIndex === this.totalPages - 1 && this.nextPageNode) {
            this.nextPageNode.active = false;
        }
        if (!this.titleSprite) return;
        if (currIndex < 2) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/album/UI_Nianzhi_title_xiyou", "block")
                .then((sprite) => {
                    this.titleSprite.spriteFrame = sprite;
                });
        } else if (currIndex == 2) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/album/UI_Nianzhi_title_redai", "block")
                .then((sprite) => {
                    this.titleSprite.spriteFrame = sprite;
                });
        } else if (currIndex == 3) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/album/UI_Nianzhi_title_shayu", "block")
                .then((sprite) => {
                    this.titleSprite.spriteFrame = sprite;
                });
        } else if (currIndex == 4) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/album/UI_Nianzhi_title_zhenzushoushi", "block")
                .then((sprite) => {
                    this.titleSprite.spriteFrame = sprite;
                });
        } else if (currIndex >= this.getChallengePageIndex()) {
            ResManager.getInstance()
                .loadSpriteFrame("res/texture/album/UI_Nianzhi_title_meiritiaozhan", "block")
                .then((sprite) => {
                    this.titleSprite.spriteFrame = sprite;
                });
        }

        //this.setItemElementData(this.pageList);
    }

    home() {
        // this.BookNodeAnim.on(Animation.EventType.FINISHED, ()=>{
        //     if (Global.EnterStickerFrom == emEnterAlbumFrom.game_over) {
        //         //mk.sendEvent(BlockEventType.EVENT_ACTIVE_NODE_FROM_ALBUM);
        //         //mk.fsm.changeState(ProcedureToGame);
        //         mk.fsm.changeState(ProcedureToHome);
        //     } else if (Global.EnterStickerFrom == emEnterAlbumFrom.adventure_level_select) {
        //         mk.fsm.changeState(ProcedureToAdventureLevelSelectV2);
        //     } else if (Global.EnterStickerFrom == emEnterAlbumFrom.scene_home) {
        //         mk.fsm.changeState(ProcedureToHome);
        //     }
        // }, this)
        mk.audio.playSubSound(AssetInfoDefine.audio.touch);
        if (this.bgMask && this.bgMask.opacity) {
            this.bgMask.opacity = 0;
        }

        if (this.openType == 1) {
            this.BookNodeAnim.play("book_close");
        } else {
            this.BookNodeAnim.play("book_close_02");
        }

        this.homeButtonNode.getComponent(Button).interactable = false;
    }


    setItemElementData(pageList: Array<IAlbumPage>) {
        let pageElementNode = this.scrollManager.content.node.getChildByName('_layerLowest');
        let i = 0;

        pageElementNode.children.forEach((child) => {
            let albumComp = child.getComponent(albumViewV2)
            albumComp.setPageViewData(pageList[i]);
            i++;
        })

    }

    getClassicPageIndex() {
        return this.classicPageIndex;
    }

    getChallengePageIndex() {
        return this.challengePageIndex;
    }

}

