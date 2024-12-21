/*
 * @Date: 2023-06-14 17:09:57
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2023-06-14 17:10:18
 */
import { ChannelBase } from "./ChannelBase";

export class GooglePlayChannel extends ChannelBase{
    public isSupportShare(){
        return false;
    }
}