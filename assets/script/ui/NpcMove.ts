import { Grid, AstarManager } from "../manager/AstarManager";
import { NpcInfo } from "./NpcModel";
import { ToolsManager } from "../manager/ToolsManager";
import { SceneManager } from "../manager/SceneManager";
import { onfire } from "../tools/onfire/onfire";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NpcMove extends cc.Component {

    npcInfo: NpcInfo;
    target:cc.Node;
    roleGrid:Grid;
    lastRoleGrid:Grid;
    curGrid:Grid;

    onLoad() {
        onfire.on('F_TARGET_UPDATE', this.onUpdateTarget, this);
    }


    setInfo(npcInfo) {
        this.npcInfo = npcInfo;
        this.npcAutoMove();
    }

    onUpdateTarget(target?){
        this.target = target;
        if (this.target) {
            this.npcAutoMove();
        }
    }

    start() {

    }

    npcAutoMove() {
        if (this.target) {
            let roleGrid = AstarManager.getGridByPosition(this.target.x, this.target.y);
            if (this.lastRoleGrid != roleGrid) {
                let route = AstarManager.searchRoute(this.curGrid, roleGrid);
                route.pop();
                let lastRoute = this.npcInfo.route.shift();
                if (lastRoute) {
                    route.unshift(lastRoute);
                }
                this.npcInfo.route = route;
            }
            this.lastRoleGrid = roleGrid;
        }else{
            if (this.npcInfo && (!this.npcInfo.route || this.npcInfo.route.length == 0)) {
                this.setCanPassRoad();
            }
        }
    }


    setCanPassRoad() {
        let rdmGrid: Grid;
        let route = [];
        while (route.length == 0) {
            let rdmrow = ToolsManager.random(0, AstarManager.row - 1);
            let rdmcol = ToolsManager.random(0, AstarManager.col - 1);
            rdmGrid = AstarManager.getGrid(rdmcol, rdmrow);
            let curGrid = AstarManager.getGridByPosition(this.node.x, this.node.y);
            this.npcInfo.start = curGrid;
            if (rdmGrid.canPass()) {
                route = AstarManager.searchRoute(this.npcInfo.start, rdmGrid);
            }
        }
        // 抛出起始节点
        route.pop();
        this.npcInfo.route = route;
    }

    //更新 NPC 位置
    updateNpcPosition(dt) {
        if (this.npcInfo && this.npcInfo.route && this.npcInfo.route.length > 0) {
            let node = this.npcInfo.npcNode;
            let nextGrid: Grid = this.npcInfo.route[0];
            if (!this.npcInfo.isMoving) {
                this.npcInfo.isMoving = true;
            }
            let nextPos = nextGrid.getPosition();
            let nextwpos = SceneManager.mapNode.convertToWorldSpaceAR(nextPos);
            let nextNpcPos = SceneManager.npcNode.convertToNodeSpaceAR(nextwpos);
            let lenNext = nextNpcPos.sub(node.position).mag();


            let lenDt = dt * this.npcInfo.table.speed;
            //三角函数 lenDt / lenNext =( x3-x1) / (x2 - x1) = (y3 - y1) / (y2 -y1)
            // 下了个 dt 时间 , x y 移动的坐标


            if (lenDt > lenNext) {
                this.npcInfo.route.shift();
                // let oldGrid = nextGrid;
                let oldNpcPos = nextNpcPos
                if (this.npcInfo.route.length == 0) {
                    this.npcInfo.isMoving = false;
                    this.target = null;
                    let delay = ToolsManager.random(0, 5);
                    this.scheduleOnce(() => {
                        this.setCanPassRoad();
                    }, delay);
                } else {
                    nextGrid = this.npcInfo.route[0];
                }
                let diff = lenDt - lenNext;

                if (this.npcInfo.isMoving) {
                    let nextPos = nextGrid.getPosition()
                    let nextwpos = SceneManager.mapNode.convertToWorldSpaceAR(nextPos);
                    let nextNpcPos = SceneManager.npcNode.convertToNodeSpaceAR(nextwpos);
                    let lenNext = nextNpcPos.sub(oldNpcPos).mag();
                    let dir = nextNpcPos.sub(oldNpcPos).normalize();
                    let newpos = dir.mul(diff).add(oldNpcPos);
                    node.position = newpos;
                }
            } else {
                let dir = nextNpcPos.sub(node.position).normalize();
                let newpos = dir.mul(lenDt).add(node.position);
                node.position = newpos;
            }
        }
    }

    update(dt) {
        this.updateNpcPosition(dt);
        this.curGrid = AstarManager.getGridByPosition(this.node.x, this.node.y);
        let arr = [];
        if (SceneManager.roleNode && this.npcInfo) {
            let roleGrid = AstarManager.getGridByPosition(SceneManager.roleNode.x, SceneManager.roleNode.y);
            arr = AstarManager.CheckLine(this.curGrid, roleGrid);
            
        }
        if (arr.length > 0) {
            this.onUpdateTarget(SceneManager.roleNode)
        }/* else{
            this.onUpdateTarget();
        } */
    }
}
