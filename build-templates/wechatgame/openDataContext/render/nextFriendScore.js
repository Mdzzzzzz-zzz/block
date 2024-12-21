/*
 * @Author: eycode
 * @Date: 2021-10-25 07:53:34
 * @LastEditTime: 2024-06-25 14:36:33
 * @Description: 先写好htlm代码，然后通过：http://olado.github.io/doT/index.html  网站将代码转换成doT.template 格式代码
 * @Other: 
 */

// html代码
// const template = `
{/* <view class="container" id="main">
    <view class="nextFriendScoreView">
        {{~it.data :item}}
            <view class="nextFriendScoreView">
                <image class="nextfriendbg" src="{{= item.nextfriendbg }}"></image>
                <image class="nextFriendScoreAvatar" src="{{= item.avatarUrl }}"></image>
                <image class="nextFriendScoreAvatarFrame" src="{{= item.headbg }}"></image>    
                <text class="nextFriendNickName"  value="{{= item.nickName }}"></text> 
                <text class="nextFriendHisScore"  value="{{= item.value }}分"></text>                   
            </view>
        {{~}}
    </view>
</view> */}
// `;

module.exports = function anonymous(it ) { var out='<view class="container" id="main"> <view class="nextFriendScoreView"> ';var arr1=it.data;if(arr1){var item,i1=-1,l1=arr1.length-1;while(i1<l1){item=arr1[i1+=1];out+=' <view class="nextFriendScoreView"> <image class="nextfriendbg" src="'+( item.nextfriendbg )+'"></image><image class="nextFriendScoreAvatar" src="'+( item.avatarUrl )+'"></image> <image class="nextFriendScoreAvatarFrame" src="'+( item.headbg )+'"></image> <text class="nextFriendNickName" value="'+( item.nickName )+'"></text> <text class="nextFriendHisScore" value="'+( item.value)+'分'+'"></text> </view> ';} } out+=' </view></view>';return out; }