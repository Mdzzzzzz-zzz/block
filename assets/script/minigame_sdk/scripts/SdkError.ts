export interface dtSdkError {
    errMsg: string;//emSdkErrorCode
    errData: any;
    errCode?:number;
    errInfo?:string;
}
export enum emSdkErrorCode {
    None,
    SDK_Net_Error = "e_10",
    SDK_INIT_Error = "e_11",
    SDK_INIT_Account_Error = "e_12",
    Net_Post_Req_Error = "e_101",
    Net_Post_Res_Error = "e_102",
    Net_Get_Req_Error = "e_103",
    Net_Get_Res_Error = "e_104",
    //#region 100-199 登录相关
    /**
     * 用户未授权情况下请求用户信息
     */
    Not_Auth = "e_wx_101",
    /**
     * 请求渠道用户信息失败
     */
    Req_GetUserInfo_Fail = "e_wx_102",
    /**
     * 请求隐私数据失败 结果中用户信息不包含隐私信息
     */
    No_EncryptedData_IV = "e_wx_103",
    /**
     * 获取用户设置失败
     */
    Req_GetSettingFail = "e_wx_104",
    /**
     * 获取用户设置失败
     */
    Req_LoginFail = "e_wx_105",


    //#endregion
    //#region 请求平台api错误提示
    /**
     * 请求setWxEncryptedData异常 api:open/v6/user/setWxEncryptedData
     */
    Req_pf_SetWxEncryptedDataFail = "e_pf_1001",
    Req_pf_SetWxEncryptedDataError = "e_pf_1002",
    /**
     * 请求LoginBySnsIdNoVerify异常 api:open/v6/user/LoginBySnsIdNoVerify
     */
    Req_pf_LoginBySnsIdNoVerifyFail = "e_pf_1003",
    Req_pf_LoginBySnsIdNoVerifyError = "e_pf_1004",
    /**
     * 请求 https://iploc.ywdier.com/api/iploc5/search/city 异常
     */
    Req_pf_PLocInfoFail = "e_pf_1005",
    Req_pf_PLocInfoError = "e_pf_1006",

    //#endregion

    //#region 广告sdk错误提示
    /**
     * 广告组件没有初始化
     */
    Sdk_Ad_Not_Init = "e_ad_2001",
    /**
     * 不支持的广告类型
     */
    Sdk_Ad_Not_Support = "e_ad_2002",
    /**
     * 广告加载失败
     */
    Sdk_Ad_Load_Error = "e_ad_2003",
    /**
     * 广告展示失败
     */
    Sdk_Ad_Show_Error = "e_ad_2004",
    /**
     * 广告实例化对象不可用
     */
    Sdk_Ad_Not_Instantiate = "e_ad_2005",
    /**
     *  广告实例的onError事件
     */
    Sdk_Ad_On_Error = "e_ad_2006",
    /**
         *  有相同广告正在展示
         */
    Sdk_Ad_Show_Repeat_Error = "e_ad_2007",
    /**
     * 广告展示时间间隔异常
     */
    Sdk_Ad_Time_Error = "e_ad_2008",
    Sdk_Ad_Close_Reward = "e_ad_2009",
    /**
     * 广告展示失败
     */
    Sdk_Ad_Show__Conflicts = "e_ad_2010",
    //#endregion
}
//#region wx广告接口错误码
// 1000 	后端接口调用失败
// 1001 	参数错误
// 1002 	广告单元无效
// 1003 	内部错误
// 1004 	无合适的广告
// 1005 	广告组件审核中
// 1006 	广告组件被驳回
// 1007 	广告组件被封禁
// 1008 	广告单元已关闭
// 2001 	模板渲染错误
// 2002 	模板为空
// 2003 	模板解析失败
// 2004 	触发频率限制
// 2005 	触发频率限制
//#endregion