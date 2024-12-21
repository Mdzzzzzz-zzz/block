/**
 * 音乐音效
 */

import { AudioSource, Scheduler, clamp01 } from "cc";
import { getItem, setItem } from "./MKLocalStorage";
import { AudioKey } from "../define/AudioDefine";
import { SettingData } from "../data/SettingData";
import { ResManager } from "../resource/ResManager";
import { PREVIEW } from "cc/env";

const KEY_VOLUME = "key_volume";

export class audioManager {
    private static _instance: audioManager;
    private static _audioSource?: AudioSource;

    private res: ResManager;

    private musicName: string = "";

    static get instance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new audioManager();
        return this._instance;
    }

    /**管理器初始化*/
    init(audioSource: AudioSource) {
        this.res = ResManager.getInstance();
        audioManager._audioSource = audioSource;
        this.setMusicVolume(this.getMusicVolume());
    }

    /**
     * 播放音乐
     * @param {Boolean} loop 是否循环播放
     */
    playMusic(loop: boolean) {
        const audioSource = audioManager._audioSource!;

        if (!this.res) {
            return;
        }

        if (SettingData.inst.isMuteMusic == 1) {
            audioManager._audioSource.stop();
            return;
        }
        // assert(audioSource, 'AudioManager not inited!');

        audioSource.loop = loop;
        if (!audioSource.playing) {
            audioSource.play();
        }
    }

    stopMusic() {
        const audioSource = audioManager._audioSource!;
        audioSource.stop();
    }

    /**
     * 播放音效
     * @param {String} name 音效名称
     * @param {Number} volumeScale 播放音量倍数
     */
    playSound(name: string, volumeScale: number = 1) {
        if (SettingData.inst.isMuteEffect) {
            return;
        }
        const audioSource = audioManager._audioSource!;
        // assert(audioSource, 'AudioManager not inited!');
        // 注意：第二个参数 “volumeScale” 是指播放音量的倍数，最终播放的音量为 “audioSource.volume * volumeScale”
        if (!this.res) {
            return;
        }
        this.res
            .loadAudio(name)
            .then((audioClip) => {
                audioSource.playOneShot(audioClip, volumeScale);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    playSoundWithCallback(name: string, callback: Function, volumeScale: number = 1) {
        if (SettingData.inst.isMuteEffect == 1) {
            return;
        }
        const audioSource = audioManager._audioSource!;
        if (!this.res) {
            return;
        }
        this.res
            .loadAudio(name)
            .then((audioClip) => {
                audioSource.playOneShot(audioClip, volumeScale);
                setTimeout(callback, audioClip.getDuration() * 1000);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    playSubSound(name: string, volumeScale: number = 1) {
        if (SettingData.inst.isMuteEffect) {
            return;
        }
        const audioSource = audioManager._audioSource!;
        // assert(audioSource, 'AudioManager not inited!');
        // 注意：第二个参数 “volumeScale” 是指播放音量的倍数，最终播放的音量为 “audioSource.volume * volumeScale”
        this.res
            .loadAudio(name)
            .then((audioClip) => {
                audioSource.playOneShot(audioClip, volumeScale);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    setMusicVolume(flag: number) {
        const audioSource = audioManager._audioSource!;
        // assert(audioSource, 'AudioManager not inited!');

        flag = clamp01(flag);
        audioSource.volume = flag;
        setItem(KEY_VOLUME, flag);
    }

    getMusicVolume() {
        const audioSource = audioManager._audioSource!;
        // assert(audioSource, 'AudioManager not inited!');
        const volume = Number(getItem(KEY_VOLUME, 1));
        return volume;
    }

    playBtnEffect() {
        if (SettingData.inst.isMuteEffect) {
            return;
        }
        this.playSound(AudioKey.BTN_CLICK_EFFECT);
    }

    changeMusic(musicName: string, loop: boolean = true) {
        const audioSource = audioManager._audioSource!;
        if (SettingData.inst.isMuteMusic == 1) {
            audioSource.stop();
            return;
        }
        // 停止当前正在播放的音乐
        if (audioSource.playing && this.musicName != musicName) {
            audioSource.stop();
        }
        // 加载新的音乐文件
        this.res
            .loadAudio(musicName)
            .then((audioClip) => {
                if (PREVIEW) {
                    console.log("changeMusic musicName:", musicName);
                }
                audioSource.clip = audioClip; // 设置新的音频剪辑
                if (this.musicName != musicName) {
                    audioSource.loop = loop; // 设置是否循环
                    audioSource.play(); // 播放新音乐
                }
                this.musicName = musicName;
            })
            .catch((err) => {
                console.error("加载音乐失败:", err);
            });
    }
}
