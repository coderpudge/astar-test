import { Grid } from "../manager/AstarManager";
import { Tb_Npc } from "../cfg/npc";

const {ccclass, property} = cc._decorator;


export class NpcInfo {
    isMoving:boolean;
    start:Grid;
    table:Tb_Npc;
    route : Array<Grid>;
    npcNode:cc.Node;
}
