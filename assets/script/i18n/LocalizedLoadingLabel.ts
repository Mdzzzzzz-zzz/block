/*
 * @Date: 2023-02-09 15:20:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-04-02 18:23:54
 */

import * as i18n from './LanguageData';

import { _decorator, Component, Label } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LocalizedLoadingLabel')
@executeInEditMode
export class LocalizedLoadingLabel extends Component {
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
        this.label && (this.label.string = i18n.ti(this.key));
    }
}
