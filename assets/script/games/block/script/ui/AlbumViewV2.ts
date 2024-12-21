import { _decorator, Component, Node, Prefab, director } from 'cc';
import { IPageViewModel, pageView } from '../../../../third/scrollview/example/pageView/pageView';
import { Holder, WrapMode } from '../../../../third/scrollview/adapter';
import { pageView_item } from '../../../../third/scrollview/example/pageView/pageView_item';
import { AlbumItem } from './AlbumItem';

const { ccclass, property } = _decorator;

const itemPerPage = 6;
@ccclass('albumViewV2')
export class albumViewV2 extends pageView_item {
    private pageViewData: any
    show(holder: Holder) {
        this._holder = holder
        // this.label.string = this._holder.data.name

    }

    setPageViewData(data: IAlbumPage) {
        console.log("[setPageViewData] data = ", data);
        this.pageViewData = data;
        this.label.string = "页数 " + data.page

        if (!data || data.childItemSeq.length == 0) {
            console.error("[setPageViewData] page view data is null");
        }

        var list = []
        for (let i = 0; i < itemPerPage; i++) {
            var elementData: IPageViewModel = { name: i + "", type: 0 }//i % 2 }
            // if (this._holder.data.type == 0) {
            elementData.wrapAfter = WrapMode.Nowrap
            elementData.wrapBefore = i % 2 == 1 ? WrapMode.Auto : WrapMode.Wrap
            //}
            list.push(elementData)
        }

        this.modelManager.insert(list)

        let itemElementNode = this.scrollManager.content.node.getChildByName('_layerLowest');
        let i = 0;
        console.log("itemElementNode.children = ", itemElementNode.children)
        itemElementNode.children.forEach((item) => {
            if (i < data.childItemSeq.length) {
                item.getComponent(AlbumItem).setItemData({ season: data.childItemSeq[i], isShown: true });
            } else {
                item.getComponent(AlbumItem).setItemData({ season: data.childItemSeq[0], isShown: false });
                item.active = false;
            }
            i++;
        })


        // data.childItemSeq.forEach((num)=> {
        //     //this.node.
        // });
    }

}