import { _decorator, Component, Node } from 'cc';
import { SdkManager } from '../SdkManager';
import { mk } from '../../../MK';
const { ccclass, property } = _decorator;

let friend_path ="firend"
@ccclass('friend')
export class friend extends Component {
    stop:boolean
    scroe:number
    ifShowRankList:boolean
    onLoad(): void {
        mk.regEvent(50108,this.setScore,this )
    }
    start(): void {
        let settings = SdkManager.getInstance().channel.settings
        if(!(settings&&settings.WxFriendInteraction)) return
        SdkManager.getInstance().channel.sendMsg({
            method:"load_data"
        })
        
    }
    setStop(stop:boolean){
        this.stop = stop;
        if(!stop){
            SdkManager.getInstance().channel.sendMsg({
                method:9
            })
        }
         
             
     }
     setScore(score: number){
        this.scroe = score
        this.updateFriendCanvas();
     }
    updateFriendCanvas(){
        let settings = SdkManager.getInstance().channel.settings
        if(!settings) return;
        if(settings.WxFriendInteraction==null){
            SdkManager.getInstance().channel.getUserSettings()
            return;
        }else if(settings.WxFriendInteraction==false) return
        if(this.ifShowRankList) return
        SdkManager.getInstance().channel.sendMsg({
            method: 5,
            score: this.scroe
         });
     }
     showRankList(){
        
     }
}

