
{/* <view>
  <view class="container" id="main">
    <view class="scoreList">
        <scrollview class="scoreProgressList">
            {{~it.data :item}}
                    {{? item.rank == 1 }}
                         <image class="scoreProgress{{=1}}" src="{{= item.avatarUrl }}"></image>
                         <image class="scoreProgressBg{{=1}}" src="{{= item.headbg }}"></image>
                    {{?}}
                    {{? item.rank == 2 }}
                         <image class="scoreProgress{{=2}}" src="{{= item.avatarUrl }}"></image>
                         <image class="scoreProgressBg{{=2}}" src="{{= item.headbg }}"></image>
                    {{?}}
                    {{? item.rank == 3 }}
                         <image class="scoreProgress{{=3}}" src="{{= item.avatarUrl }}"></image>
                         <image class="scoreProgressBg{{=3}}" src="{{= item.headbg }}"></image>
                    {{?}}
                    {{? item.rank == 4 }}
                         <image class="scoreProgress{{=4}}" src="{{= item.avatarUrl }}"></image>
                         <image class="scoreProgressBg{{=4}}" src="{{= item.headbg }}"></image>
                    {{?}}
                    {{? item.rank == 5 }}
                         <image class="scoreProgress{{=5}}" src="{{= item.avatarUrl }}"></image>
                         <image class="scoreProgressBg{{=5}}" src="{{= item.headbg }}"></image>
                    {{?}}
            {{~}}
        </scrollview>
    </view>
</view>
  <view id="container">
  <image src="openDataContext/res/chaoyuehaoyou.png" id="scoreProgressAnim"></image>
</view>
</view> */}

module.exports = function anonymous(it ) { var out='<view> <view class="container" id="main"> <view class="scoreList"> <scrollview class="scoreProgressList"> ';var arr1=it.data;if(arr1){var item,i1=-1,l1=arr1.length-1;while(i1<l1){item=arr1[i1+=1];out+=' ';if(item.rank == 1){out+=' <image class="scoreProgress'+(1)+'" src="'+( item.avatarUrl )+'"></image> <image class="scoreProgressBg'+(1)+'" src="'+( item.headbg )+'"></image> ';}out+=' ';if(item.rank == 2){out+=' <image class="scoreProgress'+(2)+'" src="'+( item.avatarUrl )+'"></image> <image class="scoreProgressBg'+(2)+'" src="'+( item.headbg )+'"></image> ';}out+=' ';if(item.rank == 3){out+=' <image class="scoreProgress'+(3)+'" src="'+( item.avatarUrl )+'"></image> <image class="scoreProgressBg'+(3)+'" src="'+( item.headbg )+'"></image> ';}out+=' ';if(item.rank == 4){out+=' <image class="scoreProgress'+(4)+'" src="'+( item.avatarUrl )+'"></image> <image class="scoreProgressBg'+(4)+'" src="'+( item.headbg )+'"></image> ';}out+=' ';if(item.rank == 5){out+=' <image class="scoreProgress'+(5)+'" src="'+( item.avatarUrl )+'"></image> <image class="scoreProgressBg'+(5)+'" src="'+( item.headbg )+'"></image> ';}out+=' ';} } out+=' </scrollview> </view></view> <view id="container"> <image src="openDataContext/res/chaoyuehaoyou.png" id="scoreProgressAnim"></image></view></view>';return out; }