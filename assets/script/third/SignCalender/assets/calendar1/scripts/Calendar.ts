import { _decorator, AudioClip, AudioSource, Button, Component, instantiate, Label, Layout, Node, Prefab, resources, Sprite, SpriteFrame, UITransform } from "cc";
const { ccclass, property } = _decorator;

@ccclass('Calendar')
export class Calendar extends Component {
    // 活动时间文本
    @property(Label)
    timeLabel: Label = new Label()

    // 奖品项预制
    @property(Prefab)
    itemPrefab: Prefab = new Prefab()
    @property(Prefab)
    addedUpItemPrefab: Prefab = new Prefab()

    // 滚动框内容节点
    @property(Node)
    contentLayoutNode: Node = new Node()
    @property(Node)
    addedUpContentLayoutNode: Node = new Node()

    // 提示板节点和文本
    @property(Node)
    noticeBoardNode: Node = new Node()
    @property(Label)
    noticeLabel: Label = new Label()

    // 开始时间和结束时间
    startTime = new Date('2024-08-01');
    endTime = new Date('2024-08-31');

    // 奖品图片路径和内容（奖品图片需要放在resources文件夹中）
    // 实际游戏中，应该准备足够数量的奖品图片
    // 以下两个数组长度必须一样
    prizeSpritePathArray = []
    prizeContentArray = []

    // 累计奖品图片和内容
    // 以下三个数组长度必须一样
    addedUpConditionArray = []
    addedUpPrizeSpritePathArray = []
    addedUpPrizeContentArray = []

    // 签到数据
    signData = []
    addedUpSignData = []

    // 音频
    audioSource: AudioSource = new AudioSource()

    @property(AudioClip)
    clickAudio: AudioClip = new AudioClip()
    @property(AudioClip)
    signAudio: AudioClip = new AudioClip()
    @property(AudioClip)
    closeAudio: AudioClip = new AudioClip()

    start() {
        // 清空缓存
        // localStorage.clear()

        // 获取音频组件
        this.audioSource = this.node.getComponent(AudioSource)

        // 初始化奖品图片路径（目前只准备了31张）和奖品内容
        for (let i=0; i<31; i++) {
            this.prizeSpritePathArray.push(`${i+1}/spriteFrame`)
            this.prizeContentArray.push("xxx")
        }

        // 初始化累计奖品领取条件、图片和内容
        this.addedUpConditionArray = [1, 3, 5, 7, 9]
        this.addedUpPrizeSpritePathArray = ['8/spriteFrame', '12/spriteFrame', '21/spriteFrame', '25/spriteFrame', '31/spriteFrame']
        this.addedUpPrizeContentArray = ['xxx', 'xxx', 'xxx', 'xxx', 'xxx']

        // 获取签到数据
        this.getSignDataFromLocalStorage()
        
        // 设置日历内容
        this.setCalendar()

        // 判断活动是否开始或结束
        this.checkActivityTime()
    }

    initSignDataLocalStorge() {
        // 初始化签到数据的本地存储键值
        localStorage.setItem('SIGN', JSON.stringify([]))
    }
    
    initAddedUpSignDataLocalStorage() {
        // 初始化累计签到数据的本地存储键值
        localStorage.setItem('ADDED-UP-SIGN', JSON.stringify([]))
    }

    getSignDataFromLocalStorage() {
        // 从本地存储中获取用户签到数据
        // 在生产环境中，应该从服务器获取签到数据
        if (!localStorage.getItem('SIGN')) {
            this.initSignDataLocalStorge()
        }
        else {
            this.signData = JSON.parse(localStorage.getItem('SIGN'))
        }

        if (!localStorage.getItem('ADDED-UP-SIGN')) {
            this.initAddedUpSignDataLocalStorage()
        }
        else {
            this.addedUpSignData = JSON.parse(localStorage.getItem('ADDED-UP-SIGN'))
        }
    }

    setSignDataToLocalStorage() {
        // 用户签到的数据保存在本地中
        // 在生产环境下，应该将数据保存在服务器
        localStorage.setItem('SIGN', JSON.stringify(this.signData))
    }

    setAddedUpSignDataToLocalStorage() {
        // 用户累计签到的数据保存在本地中
        // 在生产环境下，应该将数据保存在服务器
        localStorage.setItem('ADDED-UP-SIGN', JSON.stringify(this.addedUpSignData))
    }

    setCalendar() {
        // 设置日历内容

        // 设置活动时间文本
        this.timeLabel.string = `${this.startTime.getMonth()+1}月${this.startTime.getDate()}日—${this.endTime.getMonth()+1}月${this.endTime.getDate()}日`

        // 生成奖品项
        let days = (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60 * 24) + 1
        for (let i=0; i<days; i++) {
            // 如果签到数组中包含这个天数数字，则表示已签到
            let isSigned = this.signData.indexOf(i+1) > -1 ? true : false
            let item = this.spawnItem(i+1, isSigned)
            this.contentLayoutNode.addChild(item)            
        }

        // 根据item数量更新contentLayoutNode的高度，否则滚动视图无滚动效果
        let rows = Math.ceil(this.contentLayoutNode.children.length / 7)
        let spacingY = this.contentLayoutNode.getComponent(Layout).spacingY
        let rowHeight = this.contentLayoutNode.getComponent(Layout).cellSize.height + spacingY
        this.contentLayoutNode.getComponent(UITransform).height = rows * rowHeight

        // 生成累计奖品项文本和内容
        for (let i=0; i<this.addedUpConditionArray.length; i++) {
            // 如果累计签到数组中包含这个天数数字，则表示已签到
            let isSigned = this.addedUpSignData.indexOf(this.addedUpConditionArray[i]) > -1 ? true : false
            let addedUpItem = this.spawnAddUpItem(i, isSigned)
            this.addedUpContentLayoutNode.addChild(addedUpItem)
        }
        
        // 因为addedUpContentLayoutNode采用的Resize Mode是Container类型，会自动调整高度
        // 所以我们不必再给它设置高度
    }

    spawnItem(day: number, isSigned: boolean) {
        // 生成日历中的各个奖品项
        let item = instantiate(this.itemPrefab)

        // 如果该奖项已被签到，则打勾，且无法点击
        // 否则设置奖品被点击后的回调函数（可被点击）
        if (isSigned) {
            item.getComponent(Button).interactable = false
            let checkNode = item.children[1].children[0]
            checkNode.active = true
        }
        else {
            // 给没被点击过的奖品添加按钮回调函数
            item.on(Button.EventType.CLICK, this.itemCallback, this)

            // 如果是当前日期该领取的奖励，则显示一个红框提示用户
            // 这里的自由性很高，你也可以通过判断日期来决定按钮是否可以点击
            // 如果是当天该领取的日期，该按钮就可以点击，如果不是则不可点击
            // 当前程序的逻辑是：如果已经签到过，则无法点击；如果未签到，就可以点击
            let signDate = new Date(this.startTime.getTime() + (day-1) * 60 * 60 * 24 * 1000)
            let currentDate = new Date(new Date().toLocaleDateString())
            if (signDate.getTime() == currentDate.getTime()) {
                item.children[0].children[0].active = true
            }
        }

        // 设置日期文本
        item.children[0].getComponent(Label).string = day.toString()

        // 设置奖品图片
        // day是日期编号，从1开始
        let index = day - 1
        let spritePath = this.prizeSpritePathArray[index]
        resources.load(spritePath, SpriteFrame, (err, asset)=>{
            // 获取item下的Sprite节点
            let spritNode = item.children[1]
            spritNode.getComponent(Sprite).spriteFrame = asset

            // 需要设置这里的图片大小，否则节点会变成真实图片大小
            spritNode.getComponent(UITransform).width = 30
            spritNode.getComponent(UITransform).height = 30
        })

        return item
    }

    spawnAddUpItem(index: number, isSigned: boolean) {
        // 生成累计奖品项
        let addedUpItem = instantiate(this.addedUpItemPrefab)

        // 如果该奖项已被签到，则打勾，且无法点击
        // 否则设置奖品被点击后的回调函数（可被点击）
        if (isSigned) {
            addedUpItem.getComponent(Button).interactable = false
            let checkNode = addedUpItem.children[1].children[0]
            checkNode.active = true
        }
        else {
            // 给没被点击过的奖品添加按钮回调函数
            addedUpItem.on(Button.EventType.CLICK, this.addUpItemCallback, this)
        }

        // 设置日期文本
        addedUpItem.children[0].getComponent(Label).string = `签到${this.addedUpConditionArray[index].toString()}天`

        // 设置奖品图片
        let spritePath = this.addedUpPrizeSpritePathArray[index]
        resources.load(spritePath, SpriteFrame, (err, asset)=>{
            // 获取addedUpItem下的Sprite节点
            let spritNode = addedUpItem.children[1]
            spritNode.getComponent(Sprite).spriteFrame = asset

            // 需要设置这里的图片大小，否则节点会变成真实图片大小
            spritNode.getComponent(UITransform).width = 45
            spritNode.getComponent(UITransform).height = 45
        })

        return addedUpItem
    }

    itemCallback (button: Button) {
        // 奖品项点击后的回调函数
        // 播放点击音效
        this.audioSource.playOneShot(this.clickAudio)

        // 判断是否可以签到
        let day = parseInt(button.node.children[0].getComponent(Label).string)
        let isSignable = this.isSignable(day)
        if (!isSignable) {
            return
        }

        // 打勾
        let checkNode = button.node.children[1].children[0]
        checkNode.active = true

        // 将按钮天数编号添加到signData中
        this.signData.push(day)
        this.setSignDataToLocalStorage()

        // 禁用按钮，隐藏红框
        button.interactable = false
        button.node.children[0].children[0].active = false

        // 提示签到成功
        this.showNotice(`签到成功（累计${this.signData.length}天）\n恭喜你获得了${this.prizeContentArray[day-1]}`)
        this.audioSource.playOneShot(this.signAudio)
    }

    addUpItemCallback(button: Button) {
        // 累计奖品项点击后的回调函数
        // 播放点击音效
        this.audioSource.playOneShot(this.clickAudio)

        // 判断是否可以签到
        let day = parseInt(button.node.children[0].getComponent(Label).string.replace('签到', '').replace('天', ''))
        let isSignable = this.isAddedUpSignable(day)
        if (!isSignable) {
            return
        }

        // 打勾
        let checkNode = button.node.children[1].children[0]
        checkNode.active = true

        // 将累计天数编号添加到addedUpSignData中
        this.addedUpSignData.push(day)
        this.setAddedUpSignDataToLocalStorage()

        // 禁用按钮
        button.interactable = false

        // 提示签到成功
        let prizeContent = this.addedUpPrizeContentArray[this.addedUpConditionArray.indexOf(day)]
        this.showNotice(`恭喜你获得了${prizeContent}`)
        this.audioSource.playOneShot(this.signAudio)
    }

    isSignable(day: number) {
        // 获取被点击按钮天数编号，计算出日期，然后与当前日期比较，如果相同则可以签到
        // 在生产环境下，应该在服务器验证时间并返回验证结果
        let signDate = new Date(this.startTime.getTime() + (day-1) * 60 * 60 * 24 * 1000)
        let currentDate = new Date(new Date().toLocaleDateString())
        if (signDate < currentDate) {
            this.showNotice('签到日期已过')
            return false
        }
        else if (signDate > currentDate) {
            this.showNotice('未到签到日期')
            return false
        }
        return true
    }

    isAddedUpSignable(day: number) {
        // 判断签到天数是否足够
        if (this.signData.length < day) {
            this.showNotice('签到天数不够')
            return false
        }
        return true
    }

    checkActivityTime() {
        // 判断活动是否开始或结束
        // 在生产环境下，应该在服务器验证时间并返回验证结果
        let currentDate = new Date(new Date().toLocaleDateString())
        if (currentDate < this.startTime) {
            this.showNotice('活动未开始')
        }
        else if (currentDate > this.endTime) {
            this.showNotice('活动已结束')
        }
    }

    showNotice(notice: string) {
        // 显示提示版
        this.noticeBoardNode.active = true
        this.noticeLabel.string = notice

        // 所有奖品无法点击，防止误点
        this.contentLayoutNode.children.forEach((node)=>{
            node.getComponent(Button).interactable = false
        })
    }

    closeNoticeBoard() {
        // 关闭提示板
        this.noticeBoardNode.active = false
        this.audioSource.playOneShot(this.closeAudio, 0.3)

        // 恢复按钮点击（只给没有打勾的恢复）
        this.contentLayoutNode.children.forEach((node)=>{
            let checkNode = node.children[1].children[0]
            if (!checkNode.active) {
                node.getComponent(Button).interactable = true
            }
        })
    }
}