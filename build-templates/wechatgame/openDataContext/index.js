const style = require("./render/style"),
    Template = require("./render/template"),
    Layout = require("./engine").default,
    Data = require("./data"),
    loadingStyle = require("./render/loadingStyle"),
    scoreAnimStyle = require("./render/scoreProgressAnimStyle"),
    loadingTemplate = require("./render/loadingtemplate"),
    scoreAnimTemplate = require("./render/scoreProgressAnim"),
    ReviveTemplate = require("./render/revivetemplate"),
    ReviveTemplate3 = require("./render/revivetemplate3"),
    SettlementTemplate = require("./render/settlementtemplate"),
    ScoreProgressTemplate = require("./render/scoreProgressTemplate"),
    nextFriendScore = require("./render/nextFriendScore"),
    ScoreProgressWithAnimTemplate = require("./render/scoreProgressWithAnimTemplate")

let __env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan,
    sharedCanvas = __env.getSharedCanvas(),
    sharedContext = sharedCanvas.getContext("2d"),
    eventName = "",
    cacheRankData = {};
const resPath = "openDataContext/res";

let scoreProgressAnimData = [];
let scoreProgressAnimStatus = [0, 0, 0, 0];

function showLoading() {
    Layout.init(loadingTemplate, loadingStyle), Layout.layout(sharedContext);
    const e = Layout.getElementById("loading");
    let a = 0;
    Layout.ticker.add((() => {
        a = (a + 2) % 360, e.style.transform = `rotate(${a}deg)`
    }))
}

function mergeStyles(style1, style2) {
    // 合并两个样式
    const mergedStyle = {
        ...style1,
        ...style2,
    };

    return mergedStyle;
}

function playScoreProgressAnim(eData) {

    // let mergedStyle = mergeStyles(style, scoreAnimStyle);
    // let t = ScoreProgressWithAnimTemplate({
    //     data: eData,
    // })
    // Layout.init(t, mergedStyle), Layout.layout(sharedContext);
    Layout.init(scoreAnimTemplate, scoreAnimStyle), Layout.layout(sharedContext);
    const e = Layout.getElementById("scoreProgressAnim");
    let s = 0.3;
    const tickerFunction = () => {
        s += 0.05;
        let rs = s;
        if (rs > 1) {
            rs = 1;
        }
        e.style.transform = `scale(${rs})`; // Apply the scale transformation to the element 'e'
    };
    
    Layout.ticker.add(tickerFunction);
    
    // 在一秒后清除 layout
    setTimeout(() => {
        Layout.ticker.remove(tickerFunction);
        e.style.transform = `scale(${0})`

    }, 1000); // 1000毫秒 = 1秒
}

function draw(e, a) {
    let t = Template({
        data: e,
        self: a
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function drawrevive(e, a, isfirst) {
    let t = ReviveTemplate({
        data: e,
        self: a
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function drawrevive3(e, a, isfirst) {
    let t = ReviveTemplate3({
        data: e,
        self: a
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function drawNextFriendScore(e, a) {
    let t = nextFriendScore({
        data: e,
        self: a
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function drawsettlement(e, a) {
    let t = SettlementTemplate({
        data: e,
        self: a
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function drawScoreProgress(e) {
    let t = ScoreProgressTemplate({
        data: e
    });
    Layout.clear(), Layout.init(t, style), Layout.layout(sharedContext)
}

function changeData(e, a = !1) {
    if (!e) return;
    e.headbg = resPath + "/headbg.png", e.maxtime = resPath + "/maxtime.png";
    e.nextfriendbg = resPath + "/nextfriendbg.png";
    const t = e.rank.toString().split("");
    e.ranknumimages = [];
    for (var n = 0; n < t.length; n++) {
        const a = t[n];
        e.ranknumimages.push(resPath + "/num_" + a + ".png")
    }
    if (a ? e.slefboardbg = resPath + "/slefboardbg.png" : e.boardbg = resPath + "/boardbg.png", "score" === eventName || "world" === eventName) {
        e.scorenumimages = [], e.scoreStr = e.value.toString();
        const a = e.value.toString().split("");
        for (n = 0; n < a.length; n++) {
            const t = a[n];
            e.scorenumimages.push(resPath + "/num_" + t + ".png")
        }
    }
    if ("time" === eventName) {
        e.timenumimages = [];
        const a = formatSeconds(e.value).split("");
        for (let t = 0; t < a.length; t++) ":" === a[t] ? e.timenumimages.push(resPath + "/num_mh.png") : e.timenumimages.push(resPath + "/num_" + a[t] + ".png")
    }
}

function changeDataSettlement(e, num, a = !1) {
    if (!e) return;
    e.headbg = resPath + "/settlementheadbg" + num + ".png";
    const t = e.rank.toString().split("");
    e.ranknumimages = [];
    for (var n = 0; n < t.length; n++) {
        const a = t[n];
        e.ranknumimages.push(resPath + "/num_" + a + ".png")
    }
    if (a ? e.slefboardbg = resPath + "/slefboardbg.png" : e.boardbg = resPath + "/boardbg.png", "score" === eventName || "world" === eventName) {
        e.scorenumimages = [], e.scoreStr = e.value.toString();
        const a = e.value.toString().split("");
        for (n = 0; n < a.length; n++) {
            const t = a[n];
            e.scorenumimages.push(resPath + "/num_" + t + ".png")
        }
    }
    if ("time" === eventName) {
        e.timenumimages = [];
        const a = formatSeconds(e.value).split("");
        for (let t = 0; t < a.length; t++) ":" === a[t] ? e.timenumimages.push(resPath + "/num_mh.png") : e.timenumimages.push(resPath + "/num_" + a[t] + ".png")
    }
}

function changeDataScoreProgress(data) {
    if (!data) return;
    data.headbg = resPath + "/headbg.png"
    if (data.rank == 1) {
        style.scoreProgress1.left = data.left;
        style.scoreProgressBg1.left = data.left;
    } else if (data.rank == 2) {
        style.scoreProgress2.left = data.left;
        style.scoreProgressBg2.left = data.left;
    } else if (data.rank == 3) {
        style.scoreProgress3.left = data.left;
        style.scoreProgressBg3.left = data.left;
    } else if (data.rank == 4) {
        style.scoreProgress4.left = data.left;
        style.scoreProgressBg4.left = data.left;
    } else if (data.rank == 5) {
        style.scoreProgress5.left = data.left;
        style.scoreProgressBg5.left = data.left;
    }

}

function loadWorldDataAndRender(e, a = !0) {
    if (0 !== e.data.length) {
        for (let a = 0; a < e.data.length; a++) changeData(e.data[a]);
        changeData(e.userInfo, !0), a && draw(e.data, e.userInfo)
    }
}

function loadFriendDataAndRender(e, a, t = !0) {
    if (a.userInfo) {
        const e = a.data,
            n = a.userInfo;
        for (let a = 0; a < e.length; a++) changeData(e[a]);
        changeData(n, !0), t && draw(e, n)
    } else Data.getFriendData(e, a, ((e, a) => {
        for (let a = 0; a < e.length; a++) changeData(e[a]);
        changeData(a, !0), t && draw(e, a), cacheRankData[eventName] = {
            data: e,
            userInfo: a
        }
    }))
}

function reviveRender(e, a, t = !0) {
    Data.getReviveViewData(e, a, ((e, a, isfirst) => {
        for (let a = 0; a < e.length; a++) changeData(e[a]);
        changeData(a, !0), t && drawrevive(e, a, isfirst)
    }))
}

function reviveRender3(e, a, t = !0) {
    Data.getReviveView3Data(e, a, ((e, a, isfirst) => {
        for (let a = 0; a < e.length; a++) changeData(e[a]);
        changeData(a, !0), t && drawrevive3(e, a, isfirst)
    }))
}

function settlementRender(e, a, t = !0) {
    Data.getSettlementData(e, a, ((e, a, isfirst) => {
        for (let a = 0; a < e.length; a++) changeDataSettlement(e[a], (a + 1));
        changeData(a, 1, !0), t && drawsettlement(e, a)
    }))
}

function nextFriendScoreRender(e, a, t = !0) {
    Data.getNextFriendScore(e, a, ((e, a,) => {
        for (let a = 0; a < e.length; a++) changeData(e[a]);
        
        changeData(a, !0), 
        t && drawNextFriendScore(e, a)
    }))
}

function scoreProgressRender(e, a) {
    Data.getscoreProgressData(e, a, ((e, a) => {
        for (let a = 0; a < e.length; a++) {
            changeDataScoreProgress(e[a]);
        }
        drawScoreProgress(e);
    }))
}

function scoreProgressRenderAnimation(e, a) {
    Data.getscoreProgressAnimData(e, a, ((e, a) => {
        scoreProgressAnimData = [];
        for (let a = 0; a < e.length; a++) {
            scoreProgressAnimData.push(e[a]);
        }
    }))
}

function updateViewPort(e) {
    console.log("shared update view port");
    Layout.updateViewPort({
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height
    })
}

function init() {
    //Layout.init(loadingTemplate, loadingStyle);
    //Layout.layout(sharedContext);
    __env.onMessage((a => {
        //console.log("shared xxxxxx ", JSON.stringify(a));
        switch ("engine" === a.type && "viewport" === a.event && updateViewPort(a), a.event) {
            case "score":
                const e = (e, a) => {
                    cacheRankData.hasOwnProperty(a) ? loadFriendDataAndRender(e, cacheRankData[a]) : __env.getUserInfo ? Data.getUserInfo((a => {
                        loadFriendDataAndRender(e, a)
                    })) : loadFriendDataAndRender(e, {})
                };
                eventName = "score", e(a, eventName);
                break;
            // case "time":
            //     eventName = "time", e(a, eventName);
            //     break;
            case "friend":
                const e2 = (e, a) => {
                }
                eventName = "friend", e2(a, eventName);
                break;
            case "updata":
                eventName = "updata", Data.getUserInfo((e => {
                    Data.upFriendRankData(a, e)
                }));
                break;
            case "check":
                eventName = "check", Data.getUserCloudStorageKeys((() => { }));
                break;
            case "world":
                eventName = "world", loadWorldDataAndRender(a);
                break;
            case "clear":
                eventName = "clear", Layout.clearAll(),  sharedCanvas = __env.getSharedCanvas(),
                sharedContext = sharedCanvas.getContext("2d"), cacheRankData = {};
                break;
            case "removeUserCloudStorage":
                Layout.clear(), eventName = "removeUserCloudStorage", Data.removeUserCloudStorage(a.key), cacheRankData = {};
                break;
            // 复活界面
            case "revive":
                Layout.clear();
                const e3 = (e, a) => {
                    Data.getUserInfo((a => {
                        reviveRender(e, a)
                    }));
                };
                eventName = "revive", e3(a, eventName);
                break;
            // 结算界面好友排行 (新纪录界面，失败界面通用)
            case "settlement":
                Layout.clear();
                const settlement = (e, a) => {
                    Data.getUserInfo((a => {
                        settlementRender(e, a)
                    }));
                };
                eventName = "settlement", settlement(a, eventName);
                break;
            case "nextFriendScore":
                //console.log("sharedCanvas", sharedCanvas);
                //console.log("sharedContext", sharedContext);
                const nextFriendScore = (e, a) => {
                    Data.getUserInfo((a => {                     
                        nextFriendScoreRender(e, a)
                    }));
                };
                eventName = "nextFriendScore", nextFriendScore(a, eventName);
                break;
                // 阶段性目标
            case "scoreProgress":
                // 好友位置
                const scoreProgress = (e, a) => {
                    Data.getUserInfo((a => {
                        scoreProgressRender(e, a)
                    }));
                };
                eventName = "scoreProgress", scoreProgress(a, eventName);


                // let userScore = 0;
                // let userAvatarUrl = "";
                // //拿哪些好友需要播动画
                // const scoreProgressAnim = async (e, a) => {
                //     userScore = e.data;
                //     const userInfo = await new Promise((resolve, reject) => {
                //         Data.getUserInfo((a) => {
                //             scoreProgressRenderAnimation(e, a);
                //             userAvatarUrl = a.avatarUrl;
                //             resolve(a);
                //         });
                //     });
                //     return userInfo.avatarUrl;
                // };

                // eventName = "scoreProgressAnim";
                // const myPromise = new Promise(async (resolve, reject) => {
                //     try {
                //         const result = await scoreProgressAnim(a, eventName);
                //         resolve(result);
                //     } catch (error) {
                //         reject(error);
                //     }
                // });

                // myPromise.then((retUserAvatarUrl) => {
                //     if (userScore < 30) {
                //         scoreProgressAnimStatus = [0, 0, 0, 0];
                //         Data.upLoadAnimationStatus(scoreProgressAnimStatus);
                //     }
                //     Data.getAnimStatus((resArr) => {
                //         console.log("Data.getAnimStatus ===>", resArr)
                //         for (let index = 0; index < scoreProgressAnimData.length; index++) {

                //             let category = scoreProgressAnimData[0].animIndex;

                //             if (resArr[category] <= index) {
                //                 if (userScore > scoreProgressAnimData[index].value) {
                //                     resArr[category] = index + 1;
                //                     // Layout.clear();
                //                     // playScoreProgressAnim(a);
                //                     console.log("Data.upLoadAnimationStatus ===>", resArr)
                //                     Data.upLoadAnimationStatus(resArr);
                //                 }
                //             }
                //         }
                //     }, retUserAvatarUrl);
                // });

                // console.log("===== scoreProgressAnimData ", scoreProgressAnimData);
                // console.log("===== scoreProgressAnimStatus", scoreProgressAnimStatus);
                // if (userScore < 90) {
                //     scoreProgressAnimStatus = [0, 0, 0, 0];
                //     Data.upLoadAnimationStatus(scoreProgressAnimStatus);
                // }

                // for (let index = 0; index < scoreProgressAnimData.length; index++) {
                //     let category = scoreProgressAnimData[0].animIndex;
                //     if (scoreProgressAnimStatus[category] <= index) {
                //         if (userScore > scoreProgressAnimData[index].value) {
                //             scoreProgressAnimStatus[category] = index + 1;
                //             Layout.clear();
                //             playScoreProgressAnim();
                //         }
                //     }
                // }

                // 改好友动画完成状态
                // myPromise.then((retUserAvatarUrl) => {
                //     if (userScore < 90) {
                //         scoreProgressAnimStatus = [0, 0, 0, 0];
                //         Data.upLoadAnimationStatus(scoreProgressAnimStatus);
                //     }
                //     console.log("===== inside mypromise then", retUserAvatarUrl);
                //     Data.getAnimStatus((resArr) => {
                //         for (let index = 0; index < scoreProgressAnimData.length; index++) {

                //             let category = scoreProgressAnimData[0].animIndex;

                //             if (resArr[category] <= index) {
                //                 if (userScore > scoreProgressAnimData[index].value) {
                //                     resArr[category] = index + 1;
                //                     Layout.clear();
                //                     playScoreProgressAnim();
                //                     Data.upLoadAnimationStatus(resArr);
                //                 }
                //             }
                //         }
                //     }, retUserAvatarUrl);
                // })



                break;

            case "clearlayout":
                Layout.clear();
                break;
                // 复活界面
            case "revive3":
                Layout.clear();
                const e4 = (e, a) => {
                    Data.getUserInfo((a => {
                        reviveRender3(e, a)
                    }));
                };
                eventName = "revive3", e4(a, eventName);
                break;

        }
    }))
}

function formatSeconds(e) {
    let a = Math.floor(e / 86400),
        t = Math.floor((e - 86400 * a) / 3600),
        n = Math.floor((e - 86400 * a - 3600 * t) / 60),
        r = Math.floor(e) % 60;
    return appendZero(60 * a * 24 + 60 * t + n) + ":" + appendZero(r)
}

function appendZero(e) {
    return e < 10 ? "0" + e : e
}
init();