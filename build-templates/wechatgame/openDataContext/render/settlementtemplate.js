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
//     <view class="rankList">
//         <scrollview class="settlementList">
//             {{~it.data :item}}
//                     {{? item.rank == 1 }}
//                          <image class="settlementavater1" src="{{= item.avatarUrl }}"></image>
//                          <image class="settlementheadbg1" src="{{= item.headbg }}"></image>
//                          <text class="settlement1str" value="{{= item.value}}"></text>
//                     {{?}}
//                     {{? item.rank == 2 }}
//                          <image class="settlementavater2" src="{{= item.avatarUrl }}"></image>
//                          <image class="settlementheadbg2" src="{{= item.headbg }}"></image>
//                          <text class="settlement2str" value="{{= item.value}}"></text>
//                     {{?}}
//                     {{? item.rank == 3 }}
//                          <image class="settlementavater3" src="{{= item.avatarUrl }}"></image>
//                          <image class="settlementheadbg3" src="{{= item.headbg }}"></image>
//                          <text class="settlement3str" value="{{= item.value}}"></text>
//                     {{?}}
//             {{~}}
//         </scrollview>
//     </view>
// </view>
// `;

module.exports = function anonymous(it) { var out = '<view class="container" id="main"> <view class="rankList"> <scrollview class="settlementList"> '; var arr1 = it.data; if (arr1) { var item, i1 = -1, l1 = arr1.length - 1; while (i1 < l1) { item = arr1[i1 += 1]; out += ' '; if (item.rank == 1) { out += ' <image class="settlementavater1" src="' + (item.avatarUrl) + '"></image> <image class="settlementheadbg1" src="' + (item.headbg) + '"></image> <text class="settlement1str" value="' + (item.value) + '"></text> '; } out += ' '; if (item.rank == 2) { out += ' <image class="settlementavater2" src="' + (item.avatarUrl) + '"></image> <image class="settlementheadbg2" src="' + (item.headbg) + '"></image> <text class="settlement2str" value="' + (item.value) + '"></text> '; } out += ' '; if (item.rank == 3) { out += ' <image class="settlementavater3" src="' + (item.avatarUrl) + '"></image> <image class="settlementheadbg3" src="' + (item.headbg) + '"></image> <text class="settlement3str" value="' + (item.value) + '"></text> '; } out += ' '; } } out += ' </scrollview> </view></view>'; return out; }