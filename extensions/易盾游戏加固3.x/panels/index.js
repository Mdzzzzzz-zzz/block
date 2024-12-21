"use strict";
var Fs = require('fs');
var Path = require('path');

exports.template = Fs.readFileSync(Path.join(__dirname, 'index.html'), 'utf-8');
exports.style = Fs.readFileSync(Path.join(__dirname, 'index.css'), 'utf-8');
exports.$ = {
    buildTypeSelect: "#buildTypeSelect",
    buildDir: "#buildDir",
    engineDir: "#engineDir",
    neteaseKey: "#neteaseKey",
    excludeExt: "#excludeExt",
    onDoEncrypt: "#onDoEncrypt"
};

const LOG = '[netease-yidun-encrypt-3d]';

exports.ready = async function ()  {
    let config = await Editor.Message.request('netease-yidun-encrypt-3d', 'read');
    if (config) {
        this.$.buildDir.value = config.buildDir || '';
        this.$.engineDir.value = config.engineDir || '';
        this.$.neteaseKey.value = config.neteaseKey || '';
        this.$.excludeExt.value = config.excludeExt || '';
        this.$.buildTypeSelect.value = config.buildTypeSelect;
    }

    this.$.onDoEncrypt.addEventListener('confirm', () => {
        try {
            let buildDir = this.$.buildDir.value;
            let engineDir = this.$.engineDir.value;
            let neteaseKey = this.$.neteaseKey.value;
            let stat = Fs.lstatSync(buildDir);
            if (!stat.isDirectory()) {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.buildDirError'));
                return;
            }
            if (buildDir[buildDir.length - 1] == '/' || buildDir[buildDir.length - 1] == '\\') {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.buildDirError'));
                return;
            }
            stat = Fs.lstatSync(engineDir);
            if (!stat.isDirectory()) {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.engineDirError'));
                return;
            }
            if (engineDir[engineDir.length - 1] == '/' || engineDir[engineDir.length - 1] == '\\') {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.engineDirError'));
                return;
            }
            let pattern = new RegExp("[/|\\][0-9]\.[0-9]\.[0-9]$");
            if (!pattern.test(engineDir)) {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.engineDirError'));
                return;
            }
            pattern = new RegExp("^[A-Za-z0-9]+$");
            if (!pattern.test(neteaseKey)) {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.keyError'));
                return;
            }
            if (neteaseKey.length != 16) {
                console.error(LOG, Editor.I18n.t('netease-yidun-encrypt-3d.keyError'));
                return;
            }
        } catch(err) {
            console.error(LOG, err);
            return;
        }
        config = {
            buildDir: this.$.buildDir.value,
            engineDir: this.$.engineDir.value,
            neteaseKey: this.$.neteaseKey.value,
            excludeExt: this.$.excludeExt.value,
            buildTypeSelect: this.$.buildTypeSelect.value,
        }
        console.log(LOG, "buildDir = " + this.$.buildDir.value);
        Editor.Message.send('netease-yidun-encrypt-3d', 'save', config);
    });

}