import { _decorator, Component, Node } from 'cc';
import { BlockEventType } from '../define/Event';
import { mk } from '../../../../MK';

const { ccclass, property } = _decorator;

@ccclass('fangge_kaichang_ani')
export class fangge_kaichang_ani extends Component {
    start() {

    }

    // update(deltaTime: number) {
        
    // }

    onBlockShow(){
        mk.sendEvent(BlockEventType.EVENT_START_ANI_END);
    }

    onBottomShow(){
        mk.sendEvent(BlockEventType.EVENT_BOTTOM_SHOW);
    }
}

