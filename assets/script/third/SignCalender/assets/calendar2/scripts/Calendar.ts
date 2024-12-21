import { _decorator, AudioClip, AudioSource, Button, Color, Component, EventHandheld, EventHandler, instantiate, Label, Node, NodePool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Calendar')
export class Calendar extends Component {
    // 日期标签
    @property(Label)
    dateLabel: Label = new Label()

    // 显示被点击的日期
    @property(Label)
    noticeLabel: Label = new Label()

    // 天数布局节点
    @property(Node)
    dayLayoutNode: Node = new Node()

    // 当前年月日期和改变后的新日期
    currentDate = new Date()
    changedDate = new Date()

    // 更改的月份数
    changedMonthCount = 0

    // 天数预制体
    @property(Prefab)
    dayItem: Prefab = new Prefab

    // 音频
    audioSource: AudioSource = new AudioSource()
    @property(AudioClip)
    clickAudio: AudioClip = new AudioClip()
    @property(AudioClip)
    changeAudio: AudioClip = new AudioClip()
    
    start() {
        // 初始化音频组件
        this.audioSource = this.node.getComponent(AudioSource)

        // 初始化时间
        this.setDateLabel(this.currentDate)
        this.setDays()
    }

    setDateLabel(date: Date) {
        // 设置日期文本
        // this.dateLabel.string = `${date.getFullYear()} 年 ${date.getMonth()+1} 月`
    }

    addMonth(event:Event, data: string) {
        // 加减月份
        // 加一年就是加数字12
        // 减一个月就是加上-1
        this.changedMonthCount += parseInt(data)
        this.changedDate = new Date(new Date().setMonth(this.currentDate.getMonth() + this.changedMonthCount))
        this.setDateLabel(this.changedDate)
        this.setDays()

        // 播放音频
        this.audioSource.playOneShot(this.changeAudio)
    }

    getMonthLength(date: Date): number {
        // 获取当前月份和年份
        const year = date.getFullYear();
        const month = date.getMonth();
    
        // 创建一个新的 Date 对象，表示下个月的第一天
        const nextMonthFirstDay = new Date(year, month + 1, 1);
    
        // 将日期向前推一天，得到本月的最后一天
        nextMonthFirstDay.setDate(0);
    
        // 返回这个日期的天数，即本月的天数
        return nextMonthFirstDay.getDate();
    }

    setDays() {
        // 设置天数
        // 从Calendar2/Body/Day节点可以知道该节点下一共可以放置6行*7列，即42个天数
        let days_array = []                // 该数组中存放是的各个天数，Date类型
        
        // 清空原有的天数预制
        this.dayLayoutNode.removeAllChildren()

        // 先将本月的天数集齐
        for (let i=0; i<this.getMonthLength(this.changedDate); i++) {
            let tempDate = new Date(this.changedDate)
            tempDate.setDate(i+1)
            days_array.push(new Date(tempDate))
        }

        // 计算出本月第一天是星期几，这样就可以知道开头要包含多少上月的天数了
        let tempDate = new Date(this.changedDate)
        tempDate.setDate(1)
        let dayInWeek = tempDate.getDay()

        // 收集上月的最后几天的天数
        let lastMonthDate = new Date(tempDate.setMonth(this.changedDate.getMonth()-1))
        let lastMonthLength = this.getMonthLength(lastMonthDate)
        for (let i=0; i<dayInWeek; i++) {
            lastMonthDate.setDate(lastMonthLength-i)
            days_array.unshift(new Date(lastMonthDate))
        }

        // 剩余部分添加下月的天数
        let remainDays = 42 - days_array.length
        let nextMonthDate = new Date(tempDate.setMonth(this.changedDate.getMonth()+1))
        for (let i=0; i<remainDays; i++) {
            nextMonthDate.setDate(i+1)
            days_array.push(new Date(nextMonthDate))
        }

        // 天数收集完毕后，生成对应的预制体
        for (let i=0; i<days_array.length; i++) {
            let item = this.spawnItem(days_array[i])
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
            item.children[0].getComponent(Label).color = new Color(182, 182, 182, 255)
        }
        else if (date.getFullYear()==this.currentDate.getFullYear() && date.getMonth()==this.currentDate.getMonth() && date.getDate()==this.currentDate.getDate()) {
            // 如果是当前日期，则显示为蓝色
            item.children[0].getComponent(Label).color = new Color(58, 122, 255, 255)
        }

        // 添加按钮回调函数
        let clickEventHandler = new EventHandler()
        clickEventHandler.target = this.node
        clickEventHandler.component = 'Calendar'
        clickEventHandler.handler = 'callback'
        clickEventHandler.customEventData = `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`
        
        let button = item.getComponent(Button)
        button.clickEvents.push(clickEventHandler)

        return item
    }

    callback(event: Event, customEventData: string) {
        this.noticeLabel.string = customEventData
        this.audioSource.playOneShot(this.clickAudio)
    }
}


