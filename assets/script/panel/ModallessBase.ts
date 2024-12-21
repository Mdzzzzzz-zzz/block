import { _decorator } from 'cc';
import PanelBaseNoMask from './PanelBaseNoMask';

/**
 * 非模态 不需要强制聚焦
 */
const {ccclass, property} = _decorator;

@ccclass
export class ModallessBase<T> extends PanelBaseNoMask<T>{
    
}