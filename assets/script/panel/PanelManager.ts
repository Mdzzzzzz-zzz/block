import { Node, instantiate, Vec3 } from "cc";
import PanelBase from "./PanelBase";
import { emPanelType } from "./PanelDef";
import { Prefab } from "cc";
import { ResManager } from "../resource/ResManager";
export class PanelManager implements IPanelManager {
    private static _inst: PanelManager = null;
    public static get inst() {
        if (PanelManager._inst == null) PanelManager._inst = new PanelManager();
        return PanelManager._inst;
    }

    /** 面板队列 */
    private mQueuePanels: Array<object> = []; // 弹出队列
    public mIsShowing: number = 0; // 是否正在显示

    public panelRoot: Node;
    public maskNode: Node;
    constructor() {
        this.dicPanels = {};
        this.initUIRootNode();
    }

    public setRootNode(panelLayer: Node, maskNode: Node) {
        this.panelRoot = panelLayer;
        this.maskNode = maskNode;
    }

    public release() {
        this.removeAllPopUpView();
    }
    // 保留UICanvas
    private initUIRootNode() {
        // this.node.zIndex = 10000;
    }
    private dicPanels: { [key: string]: Node } = null;

    private waitPopupQueue: Array<string> = [];
    public addPopUpView(
        panelName: string,
        data: any = null,
        isUseAni: boolean = false,
        nowPopup: boolean = true,
        resetOpacity: boolean = false
    ) {
        // if (CC_PREVIEW) {
        //     console.log("addPopUpView" + panelName);
        // }

        let info = { name: panelName, data: data, isUseAni: isUseAni, resetOpacity: resetOpacity };
        if (nowPopup) {
            this.loadUI(info);
        } else {
            this.mQueuePanels.push(info);
            this.checkQueue();
        }
    }

    private loadUI(info: any) {
        //this.mIsShowing ++;
        //let url = "prefabs/"+ info.name;
        let url = info.name;
        let cachePanel = this.dicPanels[url];
        if (cachePanel && cachePanel.isValid) {
            if (cachePanel.active) {
                console.log("重复打开存在的面板:" + url);
            } else {
                cachePanel.active = true;
                let component = cachePanel.getComponent(PanelBase);
                if (component == null) {
                    console.error("加载面板失败：" + url);
                    return;
                }
                // if (CC_PREVIEW) {
                //     console.log("重新打开隐藏的面板:" + url);
                // }
                component.panelName = info.name;
                component.parentManager = this;
                component.setData(info.data);
                component.willShow(info.isUseAni, this.getMaskLayerNode());
                this.dicPanels[info.name] = cachePanel;
            }
            return;
        }
        if (this.waitPopupQueue.indexOf(url) > -1) {
            return;
        }
        this.waitPopupQueue.push(url);
        ResManager.getInstance()
            .loadAsset<Prefab>(url, "block")
            .then((rootPrefab) => {
                if (rootPrefab) {
                    let rootNode = instantiate(rootPrefab);
                    if (rootNode && rootNode.isValid && this.panelRoot.isValid) {
                        rootNode.setParent(this.panelRoot);
                        rootNode.position = Vec3.ZERO;
                        let component = rootNode.getComponent(PanelBase);
                        if (component == null) {
                            console.error("加载面板失败：" + url);
                            return;
                        }
                        component.panelName = info.name;
                        component.parentManager = this;
                        component.setData(info.data);
                        component.willShow(info.isUseAni, this.getMaskLayerNode());
                        this.dicPanels[info.name] = rootNode;

                        let index = this.waitPopupQueue.indexOf(info.name);
                        if (index > -1) {
                            this.waitPopupQueue.splice(index, 1);
                        }
                        //this.mIsShowing--;
                    }
                }
            })
            .catch((error) => {console.error("load error: " + error)});
        //let self = this;
    }
    /**
     * todo 换成池对象缓存
     * @returns
     */
    public getMaskLayerNode(): Node {
        if (!this.maskNode) {
            console.error("instantiate maskNode error", " null maskNode");
        }
        return instantiate(this.maskNode);
    }

    public removeView(panelName: string) {
        let panel = this.dicPanels[panelName];
        if (panel == null || panel == undefined || !panel.isValid) {
            return false;
        }
        let pnl = panel.getComponent(PanelBase);
        if (pnl) {
            pnl.closeSelf();
        } else {
            panel.destroy();
        }
        return true;
    }
    onClosePanel(panelName: string) {
        //不能直接设置为空 有缓存的界面
        //this.dicPanels[panelName]=null;
    }

    // 移除所有子节点
    public removeAllPopUpView() {
        for (let index = 0; index < this.panelRoot.children.length; index++) {
            const element: Node = this.panelRoot.children[index];
            if (!element.active) {
                continue;
            }
            let component = element.getComponent(PanelBase);
            if (component == null) {
                continue;
            }
            if (component.panelType != emPanelType.Popup) {
                continue;
            }

            this.onClosePanel(component.panelName);
            component.closeSelf();
        }
    }

    // 检查弹出队列
    public checkQueue() {
        if (this.mQueuePanels.length != 0) {
            //&& this.mIsShowing<=0)
            let info = this.mQueuePanels.shift();
            this.loadUI(info);
        }
    }
}
