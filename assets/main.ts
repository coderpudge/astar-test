import { ToolsManager } from './script/manager/ToolsManager';

import { NPC_TYPE } from "./script/cfg/const";
import { MapTable } from "./script/cfg/map";
import { TableManager } from "./script/manager/TableManager";
import { AstarManager, GRID_TYPE, Grid } from "./script/manager/AstarManager";
import { Tb_Npc } from './script/cfg/npc';
import { DebugManager } from './script/manager/DebugManager';

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
export default class Main extends cc.Component {
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

    roleSpeed = 300; //移动速度
    curMapId = 1; //当前地图 ID
    npcInfoMap : {[key:string] : NpcInfo} = {}; 
    npcMoveRoute = {}; // npc 移动路线
    runing: any = false;
    
    onLoad () {
        
        DebugManager.init();
        DebugManager.setGolbalKey('Main', this);
        // this.showBindNodes();
        this.role.on(cc.Node.EventType.TOUCH_START, (e:cc.Event.EventTouch)=>{
            this.roleOldPosition = this.role.position;
        })
        this.role.on(cc.Node.EventType.TOUCH_MOVE, (e:cc.Event.EventTouch)=>{
            // 世界坐标
            let location = e.getLocation();
            // 地图坐标
            let mapPos = this.map.convertToNodeSpaceAR(location);
            // 获取格子
            let grid = AstarManager.getGridByPosition(mapPos.x, mapPos.y);
            if (grid != this.roleOldGrid) {
                this.updateRoleGrid(grid);
                this.roleOldGrid = grid;
            }
        })
        this.role.on(cc.Node.EventType.TOUCH_END, (e:cc.Event.EventTouch)=>{
            let location = e.getLocation();
            let mapPos = this.map.convertToNodeSpaceAR(location);
            let grid = AstarManager.getGridByPosition(mapPos.x, mapPos.y);
            this.updateRoleGrid(grid);
        })
        this.role.on(cc.Node.EventType.TOUCH_CANCEL, (e:cc.Event.EventTouch)=>{
            this.role.x = this.roleOldPosition.x;
            this.role.y = this.roleOldPosition.y;
        })
    }

    
    updateRoleGrid(start:Grid){
        if (!start) {
            return;
        }
        let wGridPos = this.map.convertToWorldSpaceAR(start.getPosition());
        this.role.position = this.role.parent.convertToNodeSpaceAR(wGridPos);
        
        let end = AstarManager.getGrid(6,6);

        // AstarManager.CheckLine(start, end);
        let road = AstarManager.search(start, end);
        this.drawRoad(road);
    }

    /**
     * 绘制路线
     * @param road 起点格子;
     */
    drawRoad(road){
        cc.log('drawing')
        this.graphics.clear();
        if (road) {
            let i = 0;
            while(road) {
                let npos = road.getPosition();
                cc.log(road.key,i)
                if (i == 0) {
                    this.graphics.moveTo(npos.x,npos.y);
                }else {
                    this.graphics.lineTo(npos.x,npos.y);
                    // this.graphics.moveTo(npos.x,npos.y);
                }
                road = road.parent;
                i++;
            }
            this.graphics.stroke();
        }
        cc.log('draw end')
    }
    

    onButon(e,d){
      
        switch (d) {
            case 'init':
                {
                    if (this.curMapId >= 3) {
                        this.curMapId = 0;
                    }
                    this.curMapId ++;
                    
                    // 初始化地图
                    this.init(this.curMapId);
                    break;
                }
            case 'startOrStop':
            {
                this.runing = !this.runing
                let btn = cc.find('Canvas/btn_stop/Background/Label')
                btn.getComponent(cc.Label).string = this.runing ? 'stop' : 'start'
                break;
            }
        
            default:
                break;
        }
        
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

    
    
    // convertToNpcZonePosition(npc:cc.Node,row,col){
    //     // 父节点  this.npcList;
    //     let wpos =  this.map.convertToWorldSpaceAR(this.getMapPosition(row, col));
    //     npc.position = npc.parent.convertToNodeSpaceAR(wpos);
    // }
    
    init(mapId){
        // 初始化 A星映射地图
        let cfg:MapTable =  TableManager.getTableInfo(MapTable, mapId);
        AstarManager.init(this.map.width, this.map.height, this.side, cfg);
        this.initMap(cfg);
        this.initNpc(cfg);
        this.initRole(cfg);
        this.npcAutoMove();
    }
    /**
     * 初始化 地图节点
     * @param cfg 
     */
    initMap(cfg){
        this.map.removeAllChildren();
        let bg:cc.Node;
        for (const key in AstarManager.gridList){
            let grid = AstarManager.getGridByKey(key)
            bg = this.getGridNode(grid.type);
            bg.width = this.side2
            bg.height = this.side2
            bg.name = key;
            bg.position = grid.getPosition();
            bg.parent = this.map;
        }
    }
    /**
     * 初始化 NPC节点
     * @param cfg 
     */
    initNpc(cfg:MapTable){
        this.npcList.removeAllChildren();
        if (cfg.npc) {
            this.npcInfoMap = /* this.npcInfoMap || */ {};
            let npcArr = cfg.npc.split(',');
            for (const pt of npcArr) {
                let [pos,npcId] = pt.split(':');
                let [row,col] = pos.split('*');
                let grid = AstarManager.getGrid(parseInt(row),parseInt(col));
                let flag = AstarManager.verifyGrid(grid);
                if (!flag) {
                    continue;
                }
                let tbNpc:Tb_Npc = TableManager.getTableInfo(Tb_Npc, npcId);
                let wpos =  this.map.convertToWorldSpaceAR(grid.getPosition());
                let npc = this.getNpcNode(npcId);
                npc.parent = this.npcList;
                npc.position = npc.parent.convertToNodeSpaceAR(wpos);
                npc.width = this.side2 * 0.9;
                npc.height = this.side2 * 0.9;
                let npcInfo = new NpcInfo();
                npcInfo.table = tbNpc;
                npcInfo.start = grid;
                npcInfo.isMoving = false;
                npcInfo.npcNode = npc;
                this.npcInfoMap[npc.uuid] = npcInfo;
            }
        }
    }

    /**
     * 初始化 玩家节点
     * @param cfg 
     */
    initRole(cfg){
        let [col,row] = cfg.start.split('*');
        let roleType = cfg.roleType;
        let roleMapPos = AstarManager.getGrid(col, row).getPosition();
        this.role.position = roleMapPos;
    }


    npcAutoMove(){
        for (let i = 0; i < this.npcList.childrenCount; i++) {
            let node = this.npcList.children[i];
            if (!this.npcInfoMap[node.uuid].route || this.npcInfoMap[node.uuid].route.length == 0) {
                this.setCanPassRoad(node);
            }
        }
    }

    setCanPassRoad(npcNode:cc.Node){
        let curNpcInfo = this.getNpcInfo(npcNode.uuid);
        let rdmGrid:Grid;
        let route = [];
        while(route.length == 0){
            let rdmrow = ToolsManager.random(0, AstarManager.row-1);
            let rdmcol = ToolsManager.random(0, AstarManager.col-1);
            rdmGrid = AstarManager.getGrid(rdmcol,rdmrow);
            let curGrid = AstarManager.getGridByPosition(npcNode.x, npcNode.y);
            curNpcInfo.start = curGrid;
            if (rdmGrid.canPass()) {
                route = AstarManager.searchRoute(curNpcInfo.start, rdmGrid);
            }
        }
        // 抛出起始节点
        route.pop();
        this.npcInfoMap[npcNode.uuid].route = route;
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
                    if (!curNpcInfo.isMoving){
                        // nextGrid = curNpcInfo.start;
                        curNpcInfo.isMoving = true;
                    }
                    let nextPos = nextGrid.getPosition();
                    let nextwpos = this.map.convertToWorldSpaceAR(nextPos);
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
                            this.scheduleOnce(()=>{
                                this.setCanPassRoad(node);
                            },3);
                        }else{
                            nextGrid = info.route[0];
                        }
                        let diff = lenDt - lenNext;

                        if (curNpcInfo.isMoving) {
                            let nextPos = nextGrid.getPosition()
                            let nextwpos = this.map.convertToWorldSpaceAR(nextPos);
                            let nextNpcPos = this.npcList.convertToNodeSpaceAR(nextwpos);
                            let lenNext = nextNpcPos.sub(oldNpcPos).mag();
                            let dir = nextNpcPos.sub(oldNpcPos).normalize();
                            let newpos = dir.mul(diff).add(oldNpcPos);
                            node.position = newpos;

                            // let dt_x = diff / lenNext  *  (nextNpcPos.x - oldNpcPos.x) + oldNpcPos.x;
                            // let dt_y = diff / lenNext  *  (nextNpcPos.y - oldNpcPos.y) + oldNpcPos.y;
                            
                            // node.position = cc.v2(dt_x, dt_y);
                        }
                    }else{
                        let dir = nextNpcPos.sub(node.position).normalize();
                        let newpos = dir.mul(lenDt).add(node.position);

                        /* let dt_x = lenDt / lenNext  *  (nextNpcPos.x - node.x) + node.x;
                        let dt_y = lenDt / lenNext  *  (nextNpcPos.y - node.y) + node.y;
                        node.position = cc.v2(dt_x, dt_y); */
                        node.position = newpos;
                    }
                }else{
                    
                }
            }
        }
    }

    getNpcInfo(uuid):NpcInfo{
        return this.npcInfoMap[uuid];
    }

    update (dt) {
        if (this.runing) {
            this.updateNpcPosition(dt);
        }
    }
}


class NpcInfo {
    isMoving:boolean;
    start:Grid;
    table:Tb_Npc;
    route : Array<Grid>;
    npcNode:cc.Node;
}