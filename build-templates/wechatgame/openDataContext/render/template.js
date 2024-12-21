/*
 * @Author: eycode
 * @Date: 2021-10-25 07:53:34
 * @LastEditTime: 2024-07-16 11:23:42
 * @Description: 先写好htlm代码，然后通过：http://olado.github.io/doT/index.html  网站将代码转换成doT.template 格式代码
 * @Other: 
 */

// html代码
// const template = `
{/* <view class="container" id="main">
    <view class="rankList">
        <scrollview class="list" scrollY="true">
            {{~it.data :item}}
            <view class="listItem">
                <image class="boardbg" src="{{= item.boardbg }}"></image>
                {{? item.rank > 0 }}
                <view class="rankimages">
                    {{~item.ranknumimages :images}}
                    <image class="ranknumimage" src="{{= images }}"></image>
                    {{~}}
                </view>
                {{?}}
                {{? item.timenumimages }}
                <image class="avatar" src="{{= item.avatarUrl }}"></image>
                <image class="headbg" src="{{= item.headbg }}"></image>
                <text class="nickname" value="{{= item.nickName }}"></text>
                <image class="maxtime" src="{{= item.maxtime }}"></image>
                <view class="numimages">
                    {{~item.timenumimages :images}}
                    <image class="timenumimage" src="{{= images }}"></image>
                    {{~}}
                </view>
                {{??}}
                <image class="avatar" src="{{= item.avatarUrl }}"></image>
                <image class="headbg" src="{{= item.headbg }}"></image>
                <text class="nickname" value="{{= item.nickName }}"></text>
                <view class="numimages">
                    {{~item.scorenumimages :images}}
                    <image class="scorenumimage" src="{{= images }}"></image>
                    {{~}}
                </view>
                {{?}}
            </view>
            {{~}}
        </scrollview>
        <view class="listItem selfListItem">
            <image class="boardbg2" src="{{= it.self.slefboardbg }}"></image>
            {{? it.self.rank > 0 }}
            <view class="rankimages">
                {{~it.self.ranknumimages :images}}
                <image class="ranknumimage2" src="{{= images }}"></image>
                {{~}}
            </view>
            {{?? it.self.rank > 30000000}}
            <image class="norank" src="{{= it.self.norank }}"></image>
            {{?}}
            {{? it.self.timenumimages }}
            <image class="avatar2" src="{{= it.self.avatarUrl }}"></image>
            <image class="headbg2" src="{{= it.self.headbg }}"></image>
            <text class="nickname2" value="{{= it.self.nickName }}"></text>
            <image class="maxtime" src="{{= it.self.maxtime }}"></image>
            <view class="numimages">
                {{~it.self.timenumimages :images}}
                <image class="timenumimage" src="{{= images }}"></image>
                {{~}}
            </view>
            {{??}}
            <image class="avatar2" src="{{= it.self.avatarUrl }}"></image>
            <image class="headbg2" src="{{= it.self.headbg }}"></image>
            <text class="nickname2" value="{{= it.self.nickName }}"></text>
            <view class="numimages">
                {{~it.self.scorenumimages :images}}
                <image class="scorenumimage2" src="{{= images }}"></image>
                {{~}}
            </view>
            {{?}}
        </view>
    </view>
</view> */}
// `;

module.exports = function anonymous(it ) { var out='<view class="container" id="main"> <view class="rankList"> <scrollview class="list" scrollY="true"> ';var arr1=it.data;if(arr1){var item,i1=-1,l1=arr1.length-1;while(i1<l1){item=arr1[i1+=1];out+=' <view class="listItem"> <image class="boardbg" src="'+( item.boardbg )+'"></image> ';if(item.rank > 0){out+=' <view class="rankimages"> ';var arr2=item.ranknumimages;if(arr2){var images,i2=-1,l2=arr2.length-1;while(i2<l2){images=arr2[i2+=1];out+=' <image class="ranknumimage" src="'+( images )+'"></image> ';} } out+=' </view> ';}out+=' ';if(item.timenumimages){out+=' <image class="avatar" src="'+( item.avatarUrl )+'"></image> <image class="headbg" src="'+( item.headbg )+'"></image> <text class="nickname" value="'+( item.nickName )+'"></text> <image class="maxtime" src="'+( item.maxtime )+'"></image> <view class="numimages"> ';var arr3=item.timenumimages;if(arr3){var images,i3=-1,l3=arr3.length-1;while(i3<l3){images=arr3[i3+=1];out+=' <image class="timenumimage" src="'+( images )+'"></image> ';} } out+=' </view> ';}else{out+=' <image class="avatar" src="'+( item.avatarUrl )+'"></image> <image class="headbg" src="'+( item.headbg )+'"></image> <text class="nickname" value="'+( item.nickName )+'"></text> <view class="numimages"> ';var arr4=item.scorenumimages;if(arr4){var images,i4=-1,l4=arr4.length-1;while(i4<l4){images=arr4[i4+=1];out+=' <image class="scorenumimage" src="'+( images )+'"></image> ';} } out+=' </view> ';}out+=' </view> ';} } out+=' </scrollview> <view class="listItem selfListItem"> <image class="boardbg2" src="'+( it.self.slefboardbg )+'"></image> ';if(it.self.rank > 0){out+=' <view class="rankimages"> ';var arr5=it.self.ranknumimages;if(arr5){var images,i5=-1,l5=arr5.length-1;while(i5<l5){images=arr5[i5+=1];out+=' <image class="ranknumimage2" src="'+( images )+'"></image> ';} } out+=' </view> ';}else if(it.self.rank > 30000000){out+=' <image class="norank" src="'+( it.self.norank )+'"></image> ';}out+=' ';if(it.self.timenumimages){out+=' <image class="avatar2" src="'+( it.self.avatarUrl )+'"></image> <image class="headbg2" src="'+( it.self.headbg )+'"></image> <text class="nickname2" value="'+( it.self.nickName )+'"></text> <image class="maxtime" src="'+( it.self.maxtime )+'"></image> <view class="numimages"> ';var arr6=it.self.timenumimages;if(arr6){var images,i6=-1,l6=arr6.length-1;while(i6<l6){images=arr6[i6+=1];out+=' <image class="timenumimage" src="'+( images )+'"></image> ';} } out+=' </view> ';}else{out+=' <image class="avatar2" src="'+( it.self.avatarUrl )+'"></image> <image class="headbg2" src="'+( it.self.headbg )+'"></image> <text class="nickname2" value="'+( it.self.nickName )+'"></text> <view class="numimages"> ';var arr7=it.self.scorenumimages;if(arr7){var images,i7=-1,l7=arr7.length-1;while(i7<l7){images=arr7[i7+=1];out+=' <image class="scorenumimage2" src="'+( images )+'"></image> ';} } out+=' </view> ';}out+=' </view> </view></view>';return out; }