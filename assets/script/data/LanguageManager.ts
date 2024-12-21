/*
 * @Date: 2023-02-09 15:20:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-04-10 20:07:25
 */
import { _decorator, sys } from "cc";
import * as i18n from "../i18n/LanguageData";
import * as env from "cc/env";

/**语言类型 */
export const LANGUAGE_TYPE = {
    CHINESE: "zh",
    ENGLISH: "en",
    SPANISH: "es",
    PORTUGUESE: "pt",
};

export class LanguageManager {
    /**
     * 初始化游戏语言
     */
    public static initLocalLanguage() {
        let localLanguage = sys.localStorage.getItem("local_language");
        if (localLanguage === null || localLanguage == "") {
            //默认用英语
            localLanguage = LANGUAGE_TYPE.CHINESE;
            i18n.init(localLanguage);
            sys.localStorage.setItem("local_language", localLanguage);
        } else {
            i18n.init(localLanguage);
        }
        i18n.updateSceneRenderers();
    }

    /**
     * 设置游戏语言
     *  @param language 语言类型LANGUAGE_TYPE
     */
    public static setLocalLanguage(language: string) {
        i18n.init(language);
        i18n.updateSceneRenderers();
        sys.localStorage.setItem("local_language", language);
    }

    /**
     * 翻译文字
     *  @param dataID 文字dataID
     */
    public static translateText(dataID: string) {
        const text = i18n.t(dataID);
        return text;
    }

    public static updateRenders() {
        i18n.updateSceneRenderers();
    }
}
