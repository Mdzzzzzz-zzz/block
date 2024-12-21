/*
 * @Date: 2023-06-14 11:16:59
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-03-15 15:03:02
 */
import { sys } from "cc";
import { _decorator, Component } from "cc";
import { LanguageManager } from "../data/LanguageManager";
import { Toggle } from "cc";
import { mk } from "../MK";
import { ToggleContainer } from "cc";
import { Label } from "cc";
import { Color } from "cc";
const { ccclass, property } = _decorator;

@ccclass("LanguageToggle")
export class LanguageToggle extends Component {
    @property(Toggle)
    toggle: Toggle | null = null;
    private lab: Label = null;
    protected onLoad(): void {
        let current = sys.localStorage.getItem("local_language");
        if (current == this.node.name) {
            this.toggle.isChecked = true;
            this.node.parent.getComponent(ToggleContainer).allowSwitchOff = false;
        } else {
            this.toggle.setIsCheckedWithoutNotify(false);
        }
        let tagNode = this.node.getChildByName("Tag");
        if (tagNode) {
            this.lab = tagNode.getComponent(Label);
        }
        this.onChangeLabelColor();
    }
    onToggleChange(toggle: Toggle) {
        mk.audio.playBtnEffect();
        if (toggle && toggle.isChecked) {
            let localLanguage = this.node.name;
            let current = sys.localStorage.getItem("local_language");
            if (localLanguage == current) {
                return;
            }
            sys.localStorage.setItem("local_language", localLanguage);
            LanguageManager.setLocalLanguage(localLanguage);
        }
        this.onChangeLabelColor();
    }
    protected onChangeLabelColor() {
        if (this.lab) {
            //this.lab.color = this.toggle.isChecked ? Color.WHITE : Color.GRAY;
        }
    }
}
