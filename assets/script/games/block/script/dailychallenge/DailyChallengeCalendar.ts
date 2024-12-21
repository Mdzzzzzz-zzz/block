import { _decorator, Button, Color, EventHandler, instantiate, Label, Sprite, UIOpacity } from "cc";
import { Calendar } from "../../../../third/SignCalender/assets/calendar2/scripts/Calendar";
import { UserDailyChallengeData } from "../../../../data/UserDailyChallengeData";
import { ResManager } from "../../../../resource/ResManager";

const { ccclass, property } = _decorator;

@ccclass('DailyChallengeCalender')
export class DailyChallengeCalender extends Calendar {

    @property(Label)
    titleYearLabel: Label = null;

    @property(Sprite)
    titleMonthSprite: Sprite = null;

    onLoad() {

    }

    start() {
        //UserDailyChallengeData.inst.setChallengeProgress(7, 1, 1);
        this.setDateLabel(UserDailyChallengeData.inst.getDate());
        this.currentDate = UserDailyChallengeData.inst.getDate();
        this.changedDate = UserDailyChallengeData.inst.getDate();
        this.setDays()
    }

    setDateLabel(date: Date) {
        this.titleYearLabel.string = `${date.getFullYear()}`;
        let month = date.getMonth() + 1;
        ResManager.getInstance().
            loadSpriteFrame("res/texture/dailyChallengeCalender/Text/Month" + month.toString(), "block").
            then((sprite => {
                this.titleMonthSprite.spriteFrame = sprite;
            }))
    }

    setDays() {
        // 设置天数
        // 从Calendar2/Body/Day节点可以知道该节点下一共可以放置6行*7列，即42个天数
        let days_array = []                // 该数组中存放是的各个天数，Date类型

        // 清空原有的天数预制
        this.dayLayoutNode.removeAllChildren()
        let totalDays = this.getMonthLength(this.changedDate)

        // 先将本月的天数集齐
        for (let i = 0; i < totalDays; i++) {
            let tempDate = new Date(this.changedDate)
            tempDate.setDate(i + 1)
            days_array.push(new Date(tempDate))
        }

        // 计算出本月第一天是星期几，这样就可以知道开头要包含多少上月的天数了
        let tempDate = new Date(this.changedDate)
        tempDate.setDate(1)
        let dayInWeek = tempDate.getDay()
        dayInWeek = dayInWeek == 0? 7: dayInWeek; //周一开始，但是js接口是周六，所以要转换一下后边减1
        // 收集上月的最后几天的天数
        let lastMonthDate = new Date(tempDate.setMonth(this.changedDate.getMonth() - 1))
        let lastMonthLength = this.getMonthLength(lastMonthDate)
        for (let i = 0; i < dayInWeek-1; i++) {
            lastMonthDate.setDate(lastMonthLength - i)
            days_array.unshift(new Date(lastMonthDate))
        }

        // // 剩余部分添加下月的天数
        // let remainDays = 42 - days_array.length
        // let nextMonthDate = new Date(tempDate.setMonth(this.changedDate.getMonth()+1))
        // for (let i=0; i<remainDays; i++) {
        //     nextMonthDate.setDate(i+1)
        //     days_array.push(new Date(nextMonthDate))
        // }

        // 天数收集完毕后，生成对应的预制体
        for (let i = 0; i < days_array.length; i++) {
            let item = this.spawnItem(days_array[i])
            if (days_array[i].getMonth() != this.currentDate.getMonth()) {
                item.getComponent(UIOpacity).opacity = 0;
            } else {
                item.getComponent(UIOpacity).opacity = 255;
            }
            this.dayLayoutNode.addChild(item)
        }
    }

    spawnItem(date: Date) {
        // 生成天数预制体
        let item = instantiate(this.dayItem)

        // 设置预制上的文本内容及颜色
        item.children[0].getComponent(Label).string = date.getDate().toString()
        if (date.getMonth() != this.changedDate.getMonth()) {
            // 如果不是该月的天数，则用灰色显示
            // item.children[0].getComponent(Label).color = new Color(182, 182, 182, 255)
        }
        else if (date.getFullYear() == this.currentDate.getFullYear() && date.getMonth() == this.currentDate.getMonth() && date.getDate() == this.currentDate.getDate()) {
            // 如果是当前日期，则显示为蓝色
            // item.children[0].getComponent(Label).color = new Color(58, 122, 255, 255)
            item.getChildByName("circle").active = true;
        } else {
            item.getChildByName("circle").active = false;
        }

        let finishState = UserDailyChallengeData.inst.getChallengeProgressByDay(date.getDate());
        if (finishState === 1) {
            item.getChildByName("Star").active = true;
            item.children[0].active = false;
        } else {
            item.getChildByName("Star").active = false;
            item.children[0].active = true;
        }
        // 添加按钮回调函数
        let clickEventHandler = new EventHandler()
        clickEventHandler.target = this.node
        clickEventHandler.component = 'Calendar'
        clickEventHandler.handler = 'callback'
        clickEventHandler.customEventData = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

        let button = item.getComponent(Button)
        button.clickEvents.push(clickEventHandler)

        return item
    }
}
