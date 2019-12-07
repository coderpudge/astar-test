import Main from "../../main";
import { TableManager } from "./TableManager";
import { ToolsManager } from "./ToolsManager";
import { AstarManager } from "./AstarManager";

const {ccclass, property, executeInEditMode} = cc._decorator;


 class DebugManagerClass{
    static readonly instance = new DebugManagerClass();
    init(){
        // window['Main'] = new Main();
        window['TableManager'] = TableManager;
        window['DebugManager'] = DebugManager;
        window['ToolsManager'] = ToolsManager;
        window['AstarManager'] = AstarManager;
    }
    setGolbalKey(key,target){
        window[key] = target;
    }

}
export const DebugManager = DebugManagerClass.instance;
