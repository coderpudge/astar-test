import { AstarManager } from "./manager/AstarManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapEditor extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        AstarManager.defGridType
    }

    // update (dt) {}
}
