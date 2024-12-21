const style = require("./render/style");

const Data = {};
let index1 = 0;
let index2 = 0;

const Layout = require("./engine").default,
    loadingStyle = require("./render/loadingStyle"),
    loadingTemplate = require("./render/loadingtemplate")
let __env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan,
    sharedCanvas = __env.getSharedCanvas(),
    sharedContext = sharedCanvas.getContext("2d")

function shuffleArrayWithSeed(array, seed) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // Initialize seeded random number generator
    function seededRandom() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // While there remain elements to shuffle
    while (currentIndex !== 0) {
        // Pick a remaining element
        randomIndex = Math.floor(seededRandom() * currentIndex);
        currentIndex -= 1;

        // Swap it with the current element
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function substringWithUnitLimit(str, maxUnits = 6) {
    let unitsCount = 0;
    let result = '';

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        // 判断是否是中文、日语、韩语字符
        if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(char)) {
            unitsCount += 2;  // 中文、日语、韩语字符占两个单位
        } else {
            unitsCount += 1;  // 其他字符（假设为英文或其他）占一个单位
        }

        if (unitsCount > maxUnits) {
            result += '...';
            break;  // 如果超过了最大单位数，停止截取
        }

        result += char;  // 添加字符到结果字符串中
    }

    return result;
}
Data.userRes, Data.__env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan, Data.removeUserCloudStorage = a => {
    Data.__env.removeUserCloudStorage({
        keyList: [a],
        success: a => { },
        fail: a => { }
    })
}, Data.getUserInfo = a => {
    Data.userRes ? a(Data.userRes.data[0] || {}) : Data.__env.getUserInfo({
        openIdList: ["selfOpenId"],
        success: e => {
            Data.userRes = e, a(Data.userRes.data[0] || {})
        },
        fail: a => { }
    })
}, Data.upFriendRankData = (a, e) => {
    (Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage)({
        type: "friend",
        keyList: [a.key],
        success: t => {
            let l = !0;
            for (let r = 0; r < t.data.length; r++)
                if (t.data[r].isMe || e.avatarUrl == t.data[r].avatarUrl) {
                    if (l = !1, 0 === t.data[r].KVDataList.length) return void Data.setNewCloudValue([{
                        key: a.key,
                        value: String(a.data)
                    }]);
                    let e = +t.data[r].KVDataList[0].value,
                        s = e;
                    a.data > e && (s = a.data, Data.setNewCloudValue([{
                        key: a.key,
                        value: String(s)
                    }]))
                } l && Data.setNewCloudValue([{
                    key: a.key,
                    value: String(a.data)
                }])
        }
    })
}, Data.setNewCloudValue = a => {
    Data.__env.setUserCloudStorage({
        KVDataList: a,
        success: a => { "setNewCloudValue success" },
        fail: a => { "setNewCloudValue fail" }
    })
}, Data.getUserCloudStorageKeys = a => {
    Data.__env.getUserCloudStorageKeys({
        success: e => {
            let t = e.keys || [];
            if (t.length >= 128) {
                let e = [];
                for (let a = 0; a < t.length; a++) "score" == t[a] || e.push(t[a]);
                Data.__env.removeUserCloudStorage({
                    keyList: e,
                    success: e => {
                        a && a()
                    },
                    fail: a => { }
                })
            } else a && a()
        },
        fail: a => { }
    })
}, Data.getFriendData = (a, e, t = null) => {
    let l = [];
    console.log("=====getFriendData", a.key);
    (Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage)({
        type: "friend",
        keyList: [a.key],
        fail: a => { },
        success: r => {
            let s, n = !0;
            for (let t = 0; t < r.data.length; t++) {
                let s = 0,
                    u = !1;
                if (r.data[t].KVDataList.length && (s = +r.data[t].KVDataList[0].value), r.data[t].isMe || e.avatarUrl == r.data[t].avatarUrl) {
                    if (n = !1, u = !0, 0 === r.data[t].KVDataList.length) {
                        if (Data.setNewCloudValue([{
                            key: a.key,
                            value: String(a.data)
                        }]), 0 == s) continue;
                        l.push({
                            nickName: r.data[t].nickname,
                            avatarUrl: r.data[t].avatarUrl,
                            openid: r.data[t].openid,
                            rank: 999,
                            value: s,
                            isMe: u
                        });
                        continue
                    }
                    let e = +r.data[t].KVDataList[0].value;
                    a.data > e && (e = a.data, Data.setNewCloudValue([{
                        key: a.key,
                        value: "" + e
                    }])), s = e
                }
                0 != s && l.push({
                    nickName: r.data[t].nickname,
                    avatarUrl: r.data[t].avatarUrl,
                    openid: r.data[t].openid,
                    rank: 999,
                    value: s,
                    isMe: u
                })
            }
            if (n) return Data.setNewCloudValue([{
                key: a.key,
                value: String(a.data)
            }]), void Data.getFriendData(a, e, t);
            l.sort(((a, e) => e.value - a.value));
            for (let a = 0; a < l.length; a++) l[a].rank = a + 1, l[a].isMe && (s = {
                nickName: l[a].nickName,
                avatarUrl: l[a].avatarUrl,
                value: Number(l[a].value),
                rank: a + 1,
                isMe: !0
            });
            l = l.filter((function (a) {
                return a.rank < 51
            })), t(l, s)
        }
    })
}, Data.getReviveViewData = (data, info, callback = null) => {
    let allInfoList = [];
    let isfirst = false;
    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }

                allInfoList.push({
                    nickName: res.data[i].nickname,
                    avatarUrl: res.data[i].avatarUrl,
                    openid: res.data[i].openid,
                    rank: 999,
                    value,
                    isMe
                });
            }
            let myrankonLeaderboard = allInfoList.filter(function (item) {
                return item.isMe == true;
            });


            // console.log("myrankonLeaderboard===>", myrankonLeaderboard);
            for (let i = 0; i < allInfoList.length; i++) {
                if (allInfoList[i]['isMe']) {
                    allInfoList[i].value = data.data;      //data.data is the score pass in
                }
            }
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return b['value'] - a['value'];
            });
            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;

                if (allInfoList[i]['isMe']) {
                    userinfoData = {
                        "nickName": allInfoList[i].nickName,
                        "avatarUrl": allInfoList[i].avatarUrl,
                        "value": Number(allInfoList[i].value),
                        "rank": i + 1,
                        "isMe": true
                    };
                    console.log("获取个人的排名", userinfoData);
                    if (i == 0) {
                        isfirst = true;
                    }
                }
            };
            let nearestTarget = [];
            if (isfirst == true) {
                if (data.data >= myrankonLeaderboard[0].value) {
                    userinfoData.str2 = '';
                    userinfoData.str1 = '冲击历史最高分吧！';
                    style.str1style.right = 250;
                } else {
                    let diff = myrankonLeaderboard[0].value - data.data;
                    userinfoData.str2 = '还差' + diff.toString() + '分可以打破纪录，别放弃！';
                    userinfoData.str1 = '';
                    style.str1style.right = 363;
                }
            } else {
                nearestTarget = allInfoList.filter(function (item) {
                    return item.rank == (userinfoData.rank - 1);
                });
                if (nearestTarget[0]) {
                    let diff = nearestTarget[0].value - userinfoData.value;
                    userinfoData.str1 = '还差' + diff.toString() + '分可以超越';
                    userinfoData.str2 = ', 别放弃!';
                    style.str1style.right = 363;
                }
            }
            //nearestTarget = [];
            console.log('allInfoList===>', allInfoList);
            console.log('userinfoData===>', userinfoData);
            callback(nearestTarget, userinfoData, isfirst);
        }
    })
}, Data.getSettlementData = (data, info, callback = null) => {
    let allInfoList = [];
    let isfirst = false;
    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }

                allInfoList.push({
                    nickName: res.data[i].nickname,
                    avatarUrl: res.data[i].avatarUrl,
                    openid: res.data[i].openid,
                    rank: 999,
                    value,
                    isMe
                });
            }
            let myrankonLeaderboard = allInfoList.filter(function (item) {
                return item.isMe == true;
            });


            // console.log("myrankonLeaderboard===>", myrankonLeaderboard);
            for (let i = 0; i < allInfoList.length; i++) {
                if (allInfoList[i]['isMe']) {
                    allInfoList[i].value = data.data;      //data.data is the score pass in
                }
            }
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return b['value'] - a['value'];
            });
            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;

                if (allInfoList[i]['isMe']) {
                    userinfoData = {
                        "nickName": allInfoList[i].nickName,
                        "avatarUrl": allInfoList[i].avatarUrl,
                        "value": Number(allInfoList[i].value),
                        "rank": i + 1,
                        "isMe": true
                    };
                    console.log("获取个人的排名", userinfoData);
                    if (i == 0) {
                        isfirst = true;
                    }
                }
            };
            let nearestTarget = [];
            if (isfirst == true) {
                if (data.data >= myrankonLeaderboard[0].value) {
                    userinfoData.str2 = '抓住机会，冲击历史最高分吧！';
                    userinfoData.str1 = '';
                } else {
                    let diff = myrankonLeaderboard[0].value - data.data;
                    userinfoData.str2 = '还差' + diff.toString() + '分可以打破纪录，别放弃！';
                    userinfoData.str1 = '';
                }
            } else {
                nearestTarget = allInfoList.filter(function (item) {
                    return item.rank == (userinfoData.rank - 1);
                });
                if (nearestTarget[0]) {
                    let diff = nearestTarget[0].value - userinfoData.value;
                    userinfoData.str1 = '还差' + diff.toString() + '分可以超越';
                    userinfoData.str2 = ', 别放弃!';
                }
            }
            //nearestTarget = [];
            console.log('allInfoList===>', allInfoList);
            console.log('userinfoData===>', userinfoData);
            let infolist = allInfoList.filter(function (item) {
                return item.rank <= 3;
            });
            callback(infolist, userinfoData, isfirst);
        }
    })
}, Data.getscoreProgressData = (data, info, callback = null) => {
    let allInfoList = [];
    let isfirst = false;


    // const e = Layout.getElementById("loading");
    // let s = 0.2;
    // Layout.ticker.add(() => {
    //     // Assuming 'a' is defined somewhere outside this function
    //     s += 0.03;
    //     if (s > 1) {
    //         s = 1;
    //     }
    //     e.style.transform = `scale(${s})`; // Apply the scale transformation to the element 'e'
    // });
    //let a = 0;
    // Layout.ticker.add(() => {
    //     // Assuming 'a' is defined somewhere outside this function
    //     a = (a + 2) % 360; // Increment 'a' by 2 degrees and ensure it wraps around 0 to 359
    //     let scale = 1 + a / 360; // Calculate scale factor based on 'a'
    //     e.style.transform = `scale(${scale})`; // Apply the scale transformation to the element 'e'
    // });


    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            // console.log("self max score =========>", Number(data.selfMaxScore))
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }

                allInfoList.push({
                    nickName: res.data[i].nickname,
                    avatarUrl: res.data[i].avatarUrl,
                    openid: res.data[i].openid,
                    rank: 999,
                    left: 999,
                    value,
                    isMe
                });
            }
            allInfoList = allInfoList.filter(function (item) {
                return item.isMe == false;
            });

            let pos = [0, 135, 285, 435, 585];
            let score = [];
            let score1 = [0, 250, 500, 750, 1000];
            let score2 = [1000, 2000, 3000, 4000, 5000];
            let score3 = [5000, 6000, 7000, 8000, 10000];
            let score4 = [10000, 12000, 14000, 16000, 20000];
            let score5 = [20000, 22000, 24000, 26000, 30000];
            if (data.data > 20000) {
                score = score5;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 20000;
                });
            } else if (data.data > 10000) {
                score = score4;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 10000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 20000;
                });
            } else if (data.data > 5000) {
                score = score3;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 5000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 10000;
                });
            } else if (data.data > 1000) {
                score = score2;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 1000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 5000;
                });
            } else {
                score = score1;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 1000
                });
            }
            // for (let i = 0; i < allInfoList.length; i++) {
            //     if (allInfoList[i]['isMe']) {
            //         allInfoList[i].value = data.data;      //data.data is the score pass in
            //     }
            // }

            allInfoList = allInfoList.filter(function (item) {
                return item.value > 0;
            });
            allInfoList = allInfoList.filter(function (item) {
                return item.isMe == false;
            });
            if (isNaN(data.selfMaxScore) == false) {
                let selfmaxScore = Number(data.selfMaxScore);
                allInfoList = allInfoList.filter(function (item) {
                    return item.value != selfmaxScore;
                });
            }
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return a['value'] - b['value'];
            });
            console.log("====== data.seed", data.seed);
            allInfoList = shuffleArrayWithSeed(allInfoList, data.seed);


            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;
                let posIndex = 0;
                for (let index = 0; index < score.length; index++) {
                    if (allInfoList[i].value > score[index]) {
                        posIndex = index;
                    }
                }
                // console.log('allInfoList[i].value===>', allInfoList[i].value);
                // console.log('posIndex===>', posIndex);
                let startIndex = posIndex;
                let endIndex = startIndex + 1;
                let start = score[startIndex];
                let end = score[endIndex];
                let percentage = (allInfoList[i].value - start) / (end - start);
                //console.log('percentage===>', percentage);
                let left = (pos[endIndex] - pos[startIndex]) * percentage + pos[startIndex];
                //console.log('left===>', left);
                allInfoList[i]['left'] = left;
            };
            allInfoList = allInfoList.filter(function (item) {
                return item.rank <= 5;
            });
            //nearestTarget = [];
            // console.log('allInfoList===>', allInfoList);
            // console.log('userinfoData===>', userinfoData);
            let infolist = allInfoList.filter(function (item) {
                return item.value > data.data;
            });
            callback(infolist, userinfoData);
        }
    })
}, Data.getscoreProgressAnimData = (data, info, callback = null) => {
    let allInfoList = [];

    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }

                allInfoList.push({
                    nickName: res.data[i].nickname,
                    avatarUrl: res.data[i].avatarUrl,
                    openid: res.data[i].openid,
                    rank: 999,
                    left: 999,
                    animIndex: -1,
                    value,
                    isMe
                });
            }
            allInfoList = allInfoList.filter(function (item) {
                return item.isMe == false;
            });

            let pos = [0, 135, 285, 435, 585];
            let score = [];
            let score1 = [0, 250, 500, 750, 1000];
            let score2 = [1000, 2000, 3000, 4000, 5000];
            let score3 = [5000, 6000, 7000, 8000, 10000];
            let score4 = [10000, 12000, 14000, 16000, 20000];
            let score5 = [20000, 22000, 24000, 26000, 30000];
            if (data.data > 20000) {
                score = score5;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 20000;
                });
                for (let index = 0; index < allInfoList.length; index++) {
                    allInfoList[index].animIndex = 4;
                }
            } else if (data.data > 10000) {
                score = score4;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 10000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 20000;
                });
                for (let index = 0; index < allInfoList.length; index++) {
                    allInfoList[index].animIndex = 3;
                }
            } else if (data.data > 5000) {
                score = score3;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 5000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 10000;
                });
                for (let index = 0; index < allInfoList.length; index++) {
                    allInfoList[index].animIndex = 2;
                }
            } else if (data.data > 1000) {
                score = score2;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value > 1000;
                });
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 5000;
                });
                for (let index = 0; index < allInfoList.length; index++) {
                    allInfoList[index].animIndex = 1;
                }
            } else {
                score = score1;
                allInfoList = allInfoList.filter(function (item) {
                    return item.value < 1000;
                });
                for (let index = 0; index < allInfoList.length; index++) {
                    allInfoList[index].animIndex = 0;
                }
            }
            // for (let i = 0; i < allInfoList.length; i++) {
            //     if (allInfoList[i]['isMe']) {
            //         allInfoList[i].value = data.data;      //data.data is the score pass in
            //     }
            // }

            allInfoList = allInfoList.filter(function (item) {
                return item.value > 0;
            });
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return a['value'] - b['value'];
            });

            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;
                let posIndex = 0;
                for (let index = 0; index < score.length; index++) {
                    if (allInfoList[i].value > score[index]) {
                        posIndex = index;
                    }
                }
                // console.log('allInfoList[i].value===>', allInfoList[i].value);
                // console.log('posIndex===>', posIndex);
                let startIndex = posIndex;
                let endIndex = startIndex + 1;
                let start = score[startIndex];
                let end = score[endIndex];
                let percentage = (allInfoList[i].value - start) / (end - start);
                //console.log('percentage===>', percentage);
                let left = (pos[endIndex] - pos[startIndex]) * percentage + pos[startIndex];
                //console.log('left===>', left);
                allInfoList[i]['left'] = left;
            };
            allInfoList = allInfoList.filter(function (item) {
                return item.rank <= 5;
            });
            let infolist = allInfoList.filter(function (item) {
                return item.value > 0;
            });
            callback(infolist, userinfoData);
        }
    })
}, Data.upLoadAnimationStatus = (arr) => {
    Data.setNewCloudValue([{
        key: "progressAnimStatus0",
        value: String(arr[0])
    },
    {
        key: "progressAnimStatus1",
        value: String(arr[1])
    },
    {
        key: "progressAnimStatus2",
        value: String(arr[2])
    },
    {
        key: "progressAnimStatus3",
        value: String(arr[3])
    }
    ])
}, Data.getAnimStatus = (fn, userAvatarUrl) => {
    Data.__env.getFriendCloudStorage({
        type: "friend",
        keyList: ["progressAnimStatus0", "progressAnimStatus1", "progressAnimStatus2", "progressAnimStatus3"],
        success: res => {
            let KVDataList = [0, 0, 0, 0];
            for (let i = 0; i < res.data.length; i++) {
                if (res.data[i].avatarUrl == userAvatarUrl) {
                    KVDataList = res.data[i].KVDataList;
                    console.log("=====getAnimStatus inside userAvatarUrl", KVDataList);
                }
            }
            let arr = [-1, -1, -1, -1];

            for (let index = 0; index < 4; index++) {
                arr[index] = Number(KVDataList[index].value);
            }
            console.log("=====getAnimStatus arr", arr);
            fn(arr);
        },
        fail: a => { console.log("=====getAnimStatus fail", a); },
    })
}, Data.getReviveView3Data = (data, info, callback = null) => {
    let allInfoList = [];
    let isfirst = false;
    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }

                if (value > 0) {
                    let newNickName = substringWithUnitLimit(res.data[i].nickname);
                    allInfoList.push({
                        nickName: newNickName,
                        avatarUrl: res.data[i].avatarUrl,
                        openid: res.data[i].openid,
                        rank: 999,
                        value,
                        isMe
                    });
                }
  
            }
            let myrankonLeaderboard = allInfoList.filter(function (item) {
                return item.isMe == true;
            });


            // console.log("myrankonLeaderboard===>", myrankonLeaderboard);
            for (let i = 0; i < allInfoList.length; i++) {
                if (allInfoList[i]['isMe']) {
                    allInfoList[i].value = data.data;      //data.data is the score pass in
                }
            }
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return b['value'] - a['value'];
            });
            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;

                if (allInfoList[i]['isMe']) {
                    userinfoData = {
                        "nickName": allInfoList[i].nickName,
                        "avatarUrl": allInfoList[i].avatarUrl,
                        "value": Number(allInfoList[i].value),
                        "rank": i + 1,
                        "isMe": true
                    };
                    console.log("获取个人的排名", userinfoData);
                    if (i == 0) {
                        isfirst = true;
                    }
                }
            };
            let nearestTarget = [];
            if (isfirst == true) {
                if (data.data >= myrankonLeaderboard[0].value) {
                    userinfoData.str2 = '';
                    userinfoData.str1 = '冲击历史最高分吧！';
                    style.str1style3.right = 180;
                } else {
                    let diff = myrankonLeaderboard[0].value - data.data;
                    userinfoData.str2 = '还差' + diff.toString() + '分打破纪录';
                    userinfoData.str1 = '';
                    style.str1style.right = 363;
                }
            } else {
                nearestTarget = allInfoList.filter(function (item) {
                    return item.rank == (userinfoData.rank - 1);
                });
                if (nearestTarget[0]) {
                    let diff = nearestTarget[0].value - userinfoData.value;
                    userinfoData.str1 = '还差' + diff.toString() + '分超越';
                    userinfoData.str2 = '';
                    style.str1style.right = 363;
                }
            }
            //nearestTarget = [];
            // console.log('allInfoList===>', allInfoList);
            // console.log('userinfoData===>', userinfoData);
            callback(nearestTarget, userinfoData, isfirst);
        }
    })
},  Data.getNextFriendScore = (data, info, callback = null) => {
    let allInfoList = [];
    let isfirst = false;
    // 拉取指定key列表，所以KVDataList同时有多个key列表存在时，只会显示指定key列表
    const getCloudStorage = Data.__env.getCloudStorageByRelation || Data.__env.getFriendCloudStorage;
    getCloudStorage({
        type: "friend",
        keyList: [data.key],
        success: res => {
            // console.log("res===>", res);
            // console.log("info===>", info);
            
            for (let i = 0; i < res.data.length; i++) {
                let value = 0; let isMe = false;
                if (res.data[i].KVDataList.length) value = +res.data[i].KVDataList[0]['value'];

                // 字节回调有isMe字段，然后微信没有，通过微信头像地址判断是否是自己
                if (res.data[i].isMe || info.avatarUrl == res.data[i].avatarUrl) {
                    // console.log("自己数据", res.data[i]);
                    // 好友数据中有自己
                    isMe = true;
                }
                if (value > 0) {
                    let newNickName = substringWithUnitLimit(res.data[i].nickname);
                    // console.log("res.data[i]===>", JSON.stringify(res.data[i]));
                    // console.log("res.data[i].nickname===>", newNickName);
                    // console.log("value===>", value);
                    allInfoList.push({
                        nickName: newNickName,
                        avatarUrl: res.data[i].avatarUrl,
                        openid: res.data[i].openid,
                        rank: 999,
                        value,
                        isMe
                    });
                }
  
            }
            let myrankonLeaderboard = allInfoList.filter(function (item) {
                return item.isMe == true;
            });


            // console.log("myrankonLeaderboard===>", myrankonLeaderboard);
            for (let i = 0; i < allInfoList.length; i++) {
                if (allInfoList[i]['isMe']) {
                    allInfoList[i].value = data.data;      //data.data is the score pass in
                }
            }
            // 首先将allInfoList内部元素进行排序，根据分数来降序排列
            allInfoList.sort((a, b) => {
                return b['value'] - a['value'];
            });
            let userinfoData;
            for (let i = 0; i < allInfoList.length; i++) {
                allInfoList[i]['rank'] = i + 1;

                if (allInfoList[i]['isMe']) {
                    userinfoData = {
                        "nickName": allInfoList[i].nickName,
                        "avatarUrl": allInfoList[i].avatarUrl,
                        "value": Number(allInfoList[i].value),
                        "rank": i + 1,
                        "isMe": true
                    };
                    //console.log("获取个人的排名", userinfoData);
                    if (i == 0) {
                        isfirst = true;
                    }
                }
            };
            let nearestTarget = [];
            if (isfirst == true) {
                //style.nextfriendbg.left = 3000;
                Layout.clear();
                if (data.data >= myrankonLeaderboard[0].value) {
                    userinfoData.str2 = '';
                    userinfoData.str1 = '冲击历史最高分吧！';
                    style.str1style3.right = 180;
                } else {
                    let diff = myrankonLeaderboard[0].value - data.data;
                    userinfoData.str2 = '还差' + diff.toString() + '分打破纪录';
                    userinfoData.str1 = '';
                    style.str1style.right = 363;
                }
            } else {
                nearestTarget = allInfoList.filter(function (item) {
                    return item.rank == (userinfoData.rank - 1);
                });
                if (nearestTarget[0]) {
                    let diff = nearestTarget[0].value - userinfoData.value;
                    userinfoData.str1 = '还差' + diff.toString() + '分超越';
                    userinfoData.str2 = '';
                    style.str1style.right = 363;
                }
            }
            //nearestTarget = [];
            // console.log('allInfoList===>', allInfoList);
            // console.log('userinfoData===>', userinfoData);
            callback(nearestTarget, userinfoData);
        }
    })
}, module.exports = Data;