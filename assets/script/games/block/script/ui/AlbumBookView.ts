import { _decorator, game, Node, UITransform, Animation } from "cc";
import { AlbumControlView } from "./AlbumControlView";
import { PanelManager } from "../../../../panel/PanelManager";
import PanelBase from "../../../../panel/PanelBase";
import { mk } from "../../../../MK";
import { emEnterAlbumFrom } from "../../../../define/BIDefine";


const {ccclass, property} = _decorator;

@ccclass("AlbumBookView")
export class AlbumBookView extends PanelBase<any> {
    @property(AlbumControlView)
    albumControlView: AlbumControlView = null;  
    
    @property(AlbumControlView)
    albumControlNextPageView: AlbumControlView = null;

    @property(AlbumControlView)
    albumControlPrevPageView: AlbumControlView = null;

    @property(Node)
    albumNextPageNode: Node = null;

    @property(Node)
    albumPrevPageNode: Node = null;

    private albumPageIndex:number = 0;

    onLoad() {
        mk.regEvent(mk.msgType.QUIT_ALBUM, this.onRecClose, this);
        // mk.regEvent(mk.msgType.REPORT_ALBUM_INDEX, this.onRecAlbumIndex, this)
        // mk.regEvent(mk.msgType.CHANGE_ALBUM_DISPLAY, this.onRecChangeAlbumDisplay ,this);
        // mk.regEvent(mk.msgType.DISABLE_NORMAL_DISPLAY, this.onRecDisableNormalDisplay, this);
        // mk.regEvent(mk.msgType.ALBUM_FLIP_NEXT, this.onRecFlipNext, this);
        // mk.regEvent(mk.msgType.ALBUM_FLIP_PREV, this.onRecFlipPrev, this);
        this.setMaskLayerEnable(false);
    }

    start() {
        this.albumControlNextPageView.label = "nextPage";
        this.albumControlPrevPageView.label = "prevPage";
    }

    onSetData(value: {source: emEnterAlbumFrom}) {
        this.turnOnPage("normal")
        switch(value.source) {
            case emEnterAlbumFrom.adventure_level_select: {
                this.albumControlView.playOpenAnim(1);
                break;
            }
            case emEnterAlbumFrom.game_over: {
                this.albumControlView.playOpenAnim(2);
                break;
            }

            case emEnterAlbumFrom.scene_home: {
                this.albumControlView.playOpenAnim(2);
                break;
            }

            case emEnterAlbumFrom.daily_challenge_home: {
                this.albumControlView.setOpenPageType(2);
                this.albumControlView.playOpenAnim(1);
                break;
            }
        }
    }

    private onRecFlipNext() {
        this.turnOnPage("next")
    }

    private onRecFlipPrev() {
        this.turnOnPage("prev")
    }

    private onRecClose() {
        this.scheduleOnce(this.closeSelf, 0.5)
    }

    private onRecAlbumIndex(index) {
        this.albumPageIndex = index;
        if (this.albumNextPageNode && this.albumNextPageNode.active)
            this.albumControlNextPageView.scrollToPage(this.albumPageIndex);
        if (this.albumPrevPageNode && this.albumPrevPageNode.active)
            this.albumControlPrevPageView.scrollToPage(this.albumPageIndex);
        if (this.albumControlView && this.albumControlView.node.active)
            this.albumControlView.scrollToPage(this.albumPageIndex);
    }   

    private onRecChangeAlbumDisplay(album: string) {
        if (!this.albumControlView) {
            return;
        }

        switch (album) {
            case "normal": 
            this.albumNextPageNode.active = false;
            this.albumPrevPageNode.active = false;
            this.albumControlView.node.active = true;
            this.albumControlView.scrollToPage(this.albumPageIndex);
            break;

            case "next": 
            this.albumPrevPageNode.active = false;
            this.albumControlView.node.active = true;
            this.albumControlView.scrollToPage(this.albumPageIndex - 1);
            this.albumNextPageNode.active = true;
            this.albumControlNextPageView.scrollToPage(this.albumPageIndex);
            break;

            case "prev":
            this.albumControlView.node.active = true;
            this.albumControlView.scrollToPage(this.albumPageIndex + 1);
            this.albumNextPageNode.active = false;
            this.albumPrevPageNode.active = true;
            this.albumControlPrevPageView.scrollToPage(this.albumPageIndex);
            break; 
        }
        
    }

    private onRecDisableNormalDisplay() {
        this.albumControlView.node.active = false;
    }

    private turnOnPage(album: string) {
        if (!this.albumControlView) {
            return;
        }
        switch (album) {
            case "normal": 
            this.albumNextPageNode.active = false;
            this.albumPrevPageNode.active = false;
            
            this.albumControlView.node.active = true;
            this.albumControlView.scrollToPage(this.albumPageIndex);
            break;

            case "next": 
            this.albumPrevPageNode.active = false;
            //this.albumControlView.node.active = false;
            //this.albumControlView.scrollToPage(this.albumPageIndex, true);
            this.albumNextPageNode.active = true;
            this.albumControlNextPageView.scrollToPage(this.albumPageIndex + 1);
            console.log("flip next, page index: " + this.albumPageIndex, + " " + this.albumPageIndex + 1)
            break;

            case "prev":
            //this.albumControlView.node.active = false;
            this.albumNextPageNode.active = false;
            // this.albumControlView.scrollToPage(this.albumPageIndex, true);
            this.albumPrevPageNode.active = true;
            this.albumControlPrevPageView.scrollToPage(this.albumPageIndex - 1);
            console.log("flip prev, page index: " + this.albumPageIndex, + " " + this.albumPageIndex - 1)
            break; 
        }
    }
}


