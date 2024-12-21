import { _decorator, Component, Button, Node } from 'cc';

const {ccclass, property} = _decorator;

@ccclass('TopBar')
export class TopBar extends Component {

    onLoad () {
        // this.node.getChildByName("pause").on(Button.EventType.CLICK, this.onBtnPause, this);
    }

    private onBtnPause (button: Button) {
        // console.log("暂停按钮");
    }
}

