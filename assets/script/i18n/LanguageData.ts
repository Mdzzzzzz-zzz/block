/*
 * @Date: 2023-02-09 15:20:39
 * @LastEditors: zhaozhenguo zhaozhenguo@tuyoogame.com
 * @LastEditTime: 2024-04-10 20:09:02
 */
import { director } from "cc";
import { sys } from "cc";
import * as env from "cc/env";

export let _language = "zh";

export let ready: boolean = false;

/**
 * 初始化
 * @param language
 */
export function init(language: string) {
    ready = true;
    _language = language;
}

/**
 * 翻译数据
 * @param key
 */
export function t(key: string): string {
    const win: any = window;

    if (!win.languages) {
        return key;
    }
    let data = win.languages[key];
    if (!data) {
        return key;
    }
    return data[_language] || key;
}
export const languageInnerText = {
    privacy_policy_tip: {
        zh: "继续即表示您同意",
        en: "By continuing you agree to",
        es: "Al continuar, aceptas",
        pt: "Ao continuar, você concorda com",
    },
    privacy_policy: {
        zh: "隐私政策",
        en: "Privacy Policy",
        es: "Política de privacidad",
        pt: "Política de Privacidade",
    },
    terms_of_service_tip: {
        zh: "并确认您已阅读",
        en: "and confirm that you have read the",
        es: "y confirmar que has leído el",
        pt: "e confirma que você leu o",
    },
    terms_of_service: {
        zh: "服务条款",
        en: "Terms of Service",
        es: "Términos de servicio",
        pt: "Termos de Serviço",
    },
};
export function ti(key: string) {
    let data = languageInnerText[key];
    if (!data) {
        return key;
    }
    let localLanguage = sys.localStorage.getItem("local_language");
    if (localLanguage === null || localLanguage == "") {
        localLanguage = env.NATIVE ? "en" : "zh";
    }
    return data[localLanguage] || key;
}
export function updateSceneRenderers() {
    // very costly iterations
    const rootNodes = director.getScene()!.children;
    // walk all nodes with localize label and update
    const allLocalizedLabels: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let labels = rootNodes[i].getComponentsInChildren("LocalizedLabel");
        Array.prototype.push.apply(allLocalizedLabels, labels);
    }
    for (let i = 0; i < allLocalizedLabels.length; ++i) {
        let label = allLocalizedLabels[i];
        if (!label.node.active) continue;
        label.updateLabel();
    }
    // walk all nodes with localize sprite and update
    const allLocalizedSprites: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let sprites = rootNodes[i].getComponentsInChildren("LocalizedSprite");
        Array.prototype.push.apply(allLocalizedSprites, sprites);
    }
    for (let i = 0; i < allLocalizedSprites.length; ++i) {
        let sprite = allLocalizedSprites[i];
        if (!sprite.node.active) continue;
        sprite.updateSprite();
    }
}

// 供插件查询当前语言使用
const win = window as any;
win._languageData = {
    get language() {
        return _language;
    },
    init(lang: string) {
        init(lang);
    },
    updateSceneRenderers() {
        updateSceneRenderers();
    },
};
