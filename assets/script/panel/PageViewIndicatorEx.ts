/*
 * @Date: 2023-05-25 19:25:30
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-05-25 20:25:00
 */
import { _decorator, Component, instantiate, Node, PageViewIndicator } from 'cc';
import { PageViewIndicatorItem } from './PageViewIndicatorItem';
const { ccclass, property } = _decorator;

@ccclass('PageViewIndicator')
export class PageViewIndicatorEx extends PageViewIndicator {

    @property({ type: [Node] })
    pageIndicatorItems: Array<Node> = new Array<Node>();
    _updateLayout() {

    }
    createIndicator(index: number): Node {
        let node = this.pageIndicatorItems[index];
        // node.setParent(this.node);
        let item = node.getComponent(PageViewIndicatorItem);
        if (item) {
            item.index = index;
            item.pageView = this._pageView;
        }
        return node;
    }
    _refresh() {
        if (!this._pageView) { return; }
        var indicators = this._indicators;
        var pages = this._pageView.getPages();
        if (pages.length === indicators.length) {
            return;
        }
        var i = 0;
        if (pages.length > indicators.length) {
            for (i = 0; i < pages.length; ++i) {
                if (!indicators[i]) {
                    indicators[i] = this.createIndicator(i);
                }
            }
        }
        else {
            var count = indicators.length - pages.length;
            for (i = count; i > 0; --i) {
                var node = indicators[i - 1];
                this.node.removeChild(node);
                indicators.splice(i - 1, 1);
            }
        }
        if (this._layout && this._layout.enabledInHierarchy) {
            this._layout.updateLayout();
        }
        this.changedState();
    }
    changedState() {
        var indicators = this._indicators;
        if (indicators.length === 0) return;
        //@ts-ignore
        var idx = this._pageView._curPageIdx;
        if (idx >= indicators.length) return;
        for (var i = 0; i < indicators.length; ++i) {
            var node = indicators[i];
            node.getComponent(PageViewIndicatorItem).setDisable();
        }
        indicators[idx].getComponent(PageViewIndicatorItem).setEnable();
    }
}

