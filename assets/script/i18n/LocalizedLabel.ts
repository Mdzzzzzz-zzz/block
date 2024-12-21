/*
 * @Date: 2023-02-09 15:20:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-14 10:51:19
 */

import * as i18n from './LanguageData';

import { _decorator, Component, Label } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LocalizedLabel')
@executeInEditMode
export class LocalizedLabel extends Component {
    label: Label | null = null;

    @property({ visible: false })
    key: string = '';

    @property({ displayName: 'Key', visible: true })
    get _key() {
        return this.key;
    }
    set _key(str: string) {
        this.updateLabel();
        this.key = str;
    }

    onLoad() {
        // if (!i18n.ready) {
        //     i18n.init('zh');
        // }
        this.fetchRender();
    }

    fetchRender () {
        let label = this.node.getComponent(Label);
        if (label) {
            this.label = label;
            this.updateLabel();
            return;
        } 
    }
    updateLabel () {
        this.label && (this.label.string = i18n.t(this.key));
    }
}
