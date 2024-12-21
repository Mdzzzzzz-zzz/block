import { _decorator, Component, Node } from 'cc';
import { BlockConstData } from '../define/BlockConstData';
import { Label } from 'cc';
import { Toggle } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpeedTest')
export class SpeedTest extends Component {

    @property(Label)
    labSpeed: Label = null;
    @property(Toggle)
    toggleMove: Toggle = null;
    start() {

    }
    onClickAdd() {
        BlockConstData.BlockMoveLerpSpeed += 0.5;
        this.labSpeed.string = BlockConstData.BlockMoveLerpSpeed.toString();
    }
    onClickPlus() {
        BlockConstData.BlockMoveLerpSpeed -= 0.5;
        this.labSpeed.string = BlockConstData.BlockMoveLerpSpeed.toString();
    }

    onToggleChange() {
        BlockConstData.BlockMoveOpenDrag = this.toggleMove.isChecked;
    }

}

