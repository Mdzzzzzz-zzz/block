/*
 * @Date: 2023-07-16 11:31:45
 * @LastEditors: Zhaozhenguo zhaozhenguoxyz@163.com
 * @LastEditTime: 2023-07-16 12:40:42
 */
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelTheme')
export class LevelTheme extends Component {

    items: Array<Node> = [];
    itemLables: Array<Node> = [];

    public addItems(item: Node, lable: Node) {
        this.itemLables.push(lable);
        this.items.push(item);
    }
    public clearItems() {
        this.items.length = 0;
        this.itemLables.length = 0;
    }

}

