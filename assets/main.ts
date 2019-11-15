import { ToolsManager } from './script/manager/ToolsManager';

import { NPC_TYPE } from "./script/cfg/const";
import { MapTable } from "./script/cfg/map";
import { TableManager } from "./script/manager/TableManager";
import { AstarManager, GRID_TYPE, Grid } from "./script/manager/AstarManager";
import { Tb_Npc } from './script/cfg/npc';

const {ccclass, property, executeInEditMode} = cc._decorator;

export const NPC_NODE_NAME = [
    '',
    'farmer', // 1 农民
    'monster', // 2 妖怪
    'mouse', // 3 老鼠
    'sprite', // 4 精灵
    'corpse', // 5 僵尸
    'mummy', // 6 木乃伊
    'soldier', // 7 士兵
    'sniper', // 8 狙击手
]

export const ROLE_NODE_NAME = [
    '',
    'role1',
    'role2',
    'role3',
]

/*  FLOOR = 1, //地板
    WALL = 2, //墙
    RIVER = 3, //河
    SAND = 4, //沙 */
export const GRID_NODE_NAME = [
    '',
    'floor',
    'wall',
    'river',
    'sand',
]


@ccclass
// @executeInEditMode
export default class name extends cc.Component {
    static res = '';
    @property(cc.Node)
    modelList:cc.Node;
    @property(cc.Node)
    map:cc.Node;
    @property(cc.Node)
    npcList:cc.Node;
    @property(cc.Node)
    role:cc.Node;
    @property(cc.Node)
    end:cc.Node;
    @property(cc.Graphics)
    graphics :cc.Graphics;


    side = 50
    side2 = this.side - 2;

    roleOldPosition:cc.Vec2;
    roleOldGrid;

    roleSpeed = 100; //移动速度
    curMapId = 1; //当前地图 ID
    npcInfoMap : {[key:string] : NpcInfo} = {}; 
    npcMoveRoute = {}; // npc 移动路线
    
    onLoad () {
        // this.showBindNodes();
        this.role.on(cc.Node.EventType.TOUCH_START, (e:cc.Event.EventTouch)=>{
            this.roleOldPosition = this.role.position;
        })
        this.role.on(cc.Node.EventType.TOUCH_MOVE, (e:cc.Event.EventTouch)=>{
            // this.role.x = this.role.x + e.getDeltaX();
            // this.role.y = this.role.y + e.getDeltaY();

            let location = e.getLocation();
            let mapPos = this.map.convertToNodeSpaceAR(location);
            let grid = this.getMapGrid(mapPos.x, mapPos.y);
            let gridPos = this.getMapPosition(grid.x, grid.y);
            if (grid != this.roleOldGrid) {
                
                this.updateRoleGrid(grid.x,grid.y);
                this.roleOldGrid = grid;
                let wGridPos = this.map.convertToWorldSpaceAR(gridPos);
                this.role.position = this.role.parent.convertToNodeSpaceAR(wGridPos);
            }
            // let wGridPos = this.map.convertToWorldSpaceAR(gridPos);
            // this.role.position = this.role.parent.convertToNodeSpaceAR(wGridPos);

        })
        this.role.on(cc.Node.EventType.TOUCH_END, (e:cc.Event.EventTouch)=>{
            let location = e.getLocation();
            let mapPos = this.map.convertToNodeSpaceAR(location);
            let grid = this.getMapGrid(mapPos.x, mapPos.y);
            let gridPos = this.getMapPosition(grid.x, grid.y);
            this.updateRoleGrid(grid.x,grid.y);
            let wGridPos = this.map.convertToWorldSpaceAR(gridPos);
            this.role.position = this.role.parent.convertToNodeSpaceAR(wGridPos);
        })
        this.role.on(cc.Node.EventType.TOUCH_CANCEL, (e:cc.Event.EventTouch)=>{
            this.role.x = this.roleOldPosition.x;
            this.role.y = this.roleOldPosition.y;
        })
    }

    updateRoleGrid(x,y){
        let start = AstarManager.createGrid(x,y);
        let end = AstarManager.createGrid(3, 3);
        AstarManager.CheckLine(start, end);
        let road = AstarManager.search(start, end);
        this.drawRoad(road);
    }

    /**
     * 绘制路线
     * @param road 起点格子;
     */
    drawRoad(road){
        this.graphics.clear();
        this.graphics.lineWidth = 2;
        this.graphics.fillColor.fromHEX('#ff0000');
        if (road) {
            let i = 0;
            while(road) {
                let npos = this.getMapPosition(road.x, road.y);
                let wpos = this.map.convertToWorldSpaceAR(npos);
                // console.log(road.key);
                // console.log('n:',npos);
                // console.log('w:',wpos);
                if (i == 0) {
                    this.graphics.moveTo(wpos.x,wpos.y);
                }else {
                    this.graphics.lineTo(wpos.x,wpos.y);
                    this.graphics.moveTo(wpos.x,wpos.y);
                }
                road = road.parent;
                i++;
            }
            this.graphics.close();
            this.graphics.stroke();
            // this.graphics.fill();
        }
    }
    

    onButon(e,d){
       /*  let map = {
            '0*0':GRID_TYPE.WALL,
            '0*1':GRID_TYPE.WALL,
            '0*2':GRID_TYPE.RIVER,
            '0*3':GRID_TYPE.RIVER,
            '1*0':GRID_TYPE.RIVER,
            '1*1':GRID_TYPE.WALL,
            '1*2':GRID_TYPE.FLOOR,
            '1*3':GRID_TYPE.RIVER,
            '8*6':GRID_TYPE.RIVER,
            '7*7':GRID_TYPE.RIVER,
            '7*8':GRID_TYPE.WALL,
            '7*9':GRID_TYPE.FLOOR,
            '7*10':GRID_TYPE.RIVER,
        }
        let npc = {
            '5*5': NPC_TYPE.FARMER,
            '5*6':NPC_TYPE.CORPSE,
            '5*7':NPC_TYPE.MOUSE,
        } */
      /*   // 初始配置数据
        let cfgData = {
            map:map,
            npc:npc,
        } */
        if (this.curMapId >= 3) {
            this.curMapId = 0;
        }
        this.curMapId ++;
        let mapConf:MapTable =  TableManager.getTableInfo(MapTable, this.curMapId);
        
        // 初始化 映射地图
        AstarManager.init(this.map.width, this.map.height, this.side, mapConf);
        // 初始化地图
        this.initMap(mapConf);
        // this.map.active = false;
        
    }

    getGridNode(type:GRID_TYPE){
        let model = this.modelList.getChildByName(GRID_NODE_NAME[type]);
        let bg:cc.Node = cc.instantiate(model);
        return bg;
    }
    getNpcNode(type:NPC_TYPE){
        let model = this.modelList.getChildByName(NPC_NODE_NAME[type]);
        let bg:cc.Node = cc.instantiate(model);
        return bg;
    }

    initNpc(cfg:MapTable){
        this.npcList.removeAllChildren();
        if (cfg.npc) {
            this.npcInfoMap = this.npcInfoMap || {};
            let npcArr = cfg.npc.split(',');
            for (const pt of npcArr) {
                let [pos,npcId] = pt.split(':');
                let [x,y] = pos.split('*');
                let tbNpc:Tb_Npc = TableManager.getTableInfo(Tb_Npc, npcId);
                let wpos =  this.map.convertToWorldSpaceAR(this.getMapPosition(x, y));
                let npc = this.getNpcNode(npcId);
                npc.parent = this.npcList;
                npc.position = npc.parent.convertToNodeSpaceAR(wpos);
                npc.width = this.side2 * 0.9;
                npc.height = this.side2 * 0.9;
                let npcInfo = new NpcInfo();
                npcInfo.table = tbNpc;
                npcInfo.start = new Grid(x,y);
                npcInfo.isMoving = false;
                npcInfo.npcNode = npc;
                this.npcInfoMap[npc.uuid] = npcInfo;
            }
        }
    }
    
    
    initMap(cfg){
        /* let floor = this.modelList.getChildByName('floor');
        let river = this.modelList.getChildByName('river');
        let wall = this.modelList.getChildByName('wall');
        let start = this.modelList.getChildByName('start');
        let end = this.modelList.getChildByName('end');
        start.width = this.side2 * 0.9
        start.height = this.side2 * 0.9
        end.width = this.side2 * 0.9
        end.height = this.side2 * 0.9 
        floor.width = this.side2
        floor.height = this.side2
        river.width = this.side2
        river.height = this.side2
        wall.width = this.side2
        wall.height = this.side2
        */
        this.map.removeAllChildren();
        let bg:cc.Node;
        for (const key in AstarManager.map){
            let [x,y] = key.split('*');
            let type = AstarManager.map[key];
            let position = this.getMapPosition(x, y);
            bg = this.getGridNode(type);
            bg.width = this.side2
            bg.height = this.side2
            /* if (type == GRID_TYPE.FLOOR) {
                bg = cc.instantiate(floor);
            }else if (type == GRID_TYPE.RIVER) {
                bg = cc.instantiate(river);
            }else if (type == GRID_TYPE.WALL) {
                bg = cc.instantiate(wall);
            } */
            bg.name = key;
            bg.position = position;
            // cc.log(key,bg.position);
            bg.parent = this.map;
        }
        let nodes = this.map.children;
        for (const child of nodes) {
            // cc.log(child.name,child);
        }

        this.initNpc(cfg);
        // 位置标记
        /* let s = AstarManager.start;
        if (s) {
            let wSpos =  this.map.convertToWorldSpaceAR(this.getMapPosition(s.x, s.y));
            start.position = start.parent.convertToNodeSpaceAR(wSpos);
        }
        let e = AstarManager.end;
        if (e) {
            let wEpos = this.map.convertToWorldSpaceAR(this.getMapPosition(e.x, e.y));
            end.position = start.parent.convertToNodeSpaceAR(wEpos);
        } */
        this.npcAutoMove();
        this.map.getChildByName('0*5').color = cc.Color.RED;
    }

    /**
     * 地图映射转 实际坐标
     * @param x 地图映射 x
     * @param y 地图映射 y
     */
    getMapPosition(x,y){
        return cc.v2((parseInt(x) + 0.5)*this.side, (parseInt(y) + 0.5)*this.side);
    }

    /**
     * 真实坐标 转 地图映射
     * @param x  实际坐标 x
     * @param y  实际坐标 y
     */
    getMapGrid(x,y){
        return cc.v2(Math.floor(x / this.side),Math.floor(y / this.side));
    }
    /**
     * 更新 role 位置
     */
    updateRolePosition(){

    }
    // 更新 npc 查询到的玩家位置记录
    updateRecordPosition(){

    }

    npcAutoMove(){
        for (let i = 0; i < this.npcList.childrenCount; i++) {
            let node = this.npcList.children[i];
            if (!this.npcInfoMap[node.uuid].route) {
                // let wpos = this.npcList.convertToWorldSpaceAR(node.position);
                // let mpos = this.map.parent.convertToNodeSpaceAR(wpos); 
                // let curGrid = this.getMapGrid(mpos.x,mpos.y);
                // let npcGrid = AstarManager.createGrid(curGrid.x, curGrid.y)
                let curNpcInfo = this.getNpcInfo(node.uuid);
                // if (!curNpcInfo.isMoving) {
                //     grid = curNpcInfo.start;
                // }
                let rdmGrid:Grid;
                let route = [];
                while(route.length == 0){
                    let rdmx = ToolsManager.random(0, AstarManager.col);
                    let rdmy = ToolsManager.random(0, AstarManager.cell);
                    rdmGrid = AstarManager.createGrid(rdmx,rdmy);
                    if (rdmGrid.canPass()) {
                        route = AstarManager.searchRoute(curNpcInfo.start, rdmGrid);
                    }
                }
                this.npcInfoMap[node.uuid].route = route;
            }
        }
    }


    //更新 NPC 位置
    updateNpcPosition(dt){
        for (const uuid in this.npcInfoMap) {
            if (this.npcInfoMap.hasOwnProperty(uuid)) {
                let info:NpcInfo = this.npcInfoMap[uuid];
                let node = info.npcNode;
                if (info.route && info.route.length > 0) {
                    let nextGrid:Grid = info.route[0];
                    let curNpcInfo = this.getNpcInfo(uuid);
                    if (!curNpcInfo.isMoving) {
                        nextGrid = curNpcInfo.start;
                        curNpcInfo.isMoving = true;
                    }
                    let nextPos = this.getMapPosition(nextGrid.x, nextGrid.y);
                    let nextwpos = this.map.parent.convertToWorldSpaceAR(nextPos);
                    let nextNpcPos = this.npcList.convertToNodeSpaceAR(nextwpos);
                    let lenNext = nextNpcPos.sub(node.position).mag();
                    let lenDt = dt * info.table.speed;
                    //三角函数 lenDt / lenNext =( x3-x1) / (x2 - x1) = (y3 - y1) / (y2 -y1)
                    // 下了个 dt 时间 , x y 移动的坐标
                   

                    if (lenDt > lenNext) {
                        info.route.shift();
                        // let oldGrid = nextGrid;
                        let oldNpcPos = nextNpcPos
                        if (info.route.length == 0) {
                            curNpcInfo.isMoving = false;
                        }else{
                            nextGrid = info.route[0];
                        }
                        let diff = lenDt - lenNext;

                        if (curNpcInfo.isMoving) {
                            let nextPos = this.getMapPosition(nextGrid.x, nextGrid.y);
                            let nextwpos = this.map.parent.convertToWorldSpaceAR(nextPos);
                            let nextNpcPos = this.npcList.convertToNodeSpaceAR(nextwpos);
                            let lenNext = nextNpcPos.sub(oldNpcPos).mag();
                            
                            let dt_x = diff / lenNext  *  (nextNpcPos.x - oldNpcPos.x) + oldNpcPos.x;
                            let dt_y = diff / lenNext  *  (nextNpcPos.y - oldNpcPos.y) + oldNpcPos.y;
                            
                            node.position = cc.v2(dt_x, dt_y);
                        }
                    }else{
                        let dt_x = lenDt / lenNext  *  (nextNpcPos.x - node.x) + node.x;
                        let dt_y = lenDt / lenNext  *  (nextNpcPos.y - node.y) + node.y;
                        node.position = cc.v2(dt_x, dt_y);
                    }
                }
            }
        }
    }

    getNpcInfo(uuid):NpcInfo{
        return this.npcInfoMap[uuid];
    }

    update (dt) {
        this.updateNpcPosition(dt);
    }
}


class NpcInfo {
    isMoving:boolean;
    start:Grid;
    table:Tb_Npc;
    route : Array<Grid>;
    npcNode:cc.Node;
}