import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ChangeCalendar')
export class ChangeCalendar extends Component {
    @property(Node)
    calendar1: Node = new Node()

    @property(Node)
    calendar2: Node = new Node()

    start() {

    }

    showCalendar1() {
        this.calendar1.active = true
        this.calendar2.active = false
    }

    showCalendar2() {
        this.calendar1.active = false
        this.calendar2.active = true
    }
}


