/*
 * @Author: eycode
 * @Date: 2021-10-25 07:53:34
 * @LastEditTime: 2024-06-25 14:36:33
 * @Description: 先写好htlm代码，然后通过：http://olado.github.io/doT/index.html  网站将代码转换成doT.template 格式代码
 * @Other: 
 */

// html代码
// const template = `
// <view class="container" id="main">
//     <view class="reviveView">
//         <scrollview class="reviveViewList">
//             {{~it.data :item}}
//                 <view class="reviveListItem">
//                     <image class="reviveavatar" src="{{= item.avatarUrl }}"></image>
//                     <image class="reviveheadbg" src="{{= item.headbg }}"></image>                        
//                 </view>
//             {{~}}
//         </scrollview>
//         <view class="reviveListItem2">
//             <text class="str1style" value="{{= it.self.str1}}"></text>
//             <text class="str2style" value="{{= it.self.str2}}"></text>
//         </view>
//     </view>
// </view>
// `;

module.exports = function anonymous(it) { var out = '<view class="container" id="main"> <view class="reviveView"> <scrollview class="reviveViewList"> '; var arr1 = it.data; if (arr1) { var item, i1 = -1, l1 = arr1.length - 1; while (i1 < l1) { item = arr1[i1 += 1]; out += ' <view class="reviveListItem"> <image class="reviveavatar" src="' + (item.avatarUrl) + '"></image> <image class="reviveheadbg" src="' + (item.headbg) + '"></image> </view> '; } } out += ' </scrollview> <view class="reviveListItem2"> <text class="str1style" value="' + (it.self.str1) + '"></text> <text class="str2style" value="' + (it.self.str2) + '"></text> </view> </view></view>'; return out; }