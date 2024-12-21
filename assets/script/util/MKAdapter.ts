import { _decorator, Component, screen, view, ResolutionPolicy } from 'cc';

const {ccclass, property} = _decorator;

@ccclass('MKAdapter')
export class MKAdapter extends Component {

    onLoad () {
        let designSize = view.getDesignResolutionSize();
        let deviceSize = screen.windowSize;

        if (deviceSize.height / deviceSize.width > designSize.height / designSize.width) {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}