import { _decorator, Component, Node, Animation, Sprite, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ShaderFrame')
export class ShaderFrame extends Component {
    onShaderFrame() {

    }
    public static playAnimShaderFrame(node: Node) {
        let ani = node.getComponent(Animation);
        const clip = ani.clips[0];
        const time = clip.duration;
        const events = clip.events.filter((ev) => ev.func === 'onShaderFrame');
        if (events.length > 0) {
            const sf = node.getComponentInChildren(ShaderFrame);
            if (sf) {
                const sp = sf.node.getComponent(Sprite);
                let curFrame = 0;
                const call = () => {
                    if (!sf) return;
                    if (!sp) return;
                    const es = events[curFrame];
                    if (!es) return;
                    if (es.frame >= time) return;
                    const ee = events[curFrame + 1];
                    if (!ee) return;

                    const [vs] = (es.params) as any;
                    const [ve] = ee.params as any;
                    const d = ee.frame - es.frame;
                    tween(node).to(d, {}, {
                        onUpdate(_, ratio?) {
                            const v = vs * (1 - ratio) + ve * ratio;
                            const material = sp.getMaterial(0);
                            if(material){
                                material.setProperty("ColorAlpha", v);
                                sp.setMaterial(material, 0);
                            }
                        }
                    }).call(() => {
                        call();
                    }).start();
                    curFrame++;
                }
                call();
            }
        }
        return { ani, time };
    }
}

