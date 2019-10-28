import { AstarManager, GRID_TYPE } from "./AstarManager";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
// @executeInEditMode
export default class name extends cc.Component {
    static res = '';
    @property(cc.Node)
    tile:cc.Node;
    @property(cc.Node)
    map:cc.Node;
    @property(cc.Node)
    role:cc.Node;
    @property(cc.Node)
    end:cc.Node;
    side = 50
    side2 = this.side - 2;

    roleOldPosition:cc.Vec2;
    roleOldGrid;
    @property(cc.Graphics)
    graphics :cc.Graphics;


    onLoad () {
        // this.showBindNodes();
        this.role.on(cc.Node.EventType.TOUCH_START, (e:cc.Event.EventTouch)=>{
            this.roleOldPosition = this.role.position;
        })
        this.role.on(cc.Node.EventType.TOUCH_MOVE, (e:cc.Event.EventTouch)=>{
            this.role.x = this.role.x + e.getDeltaX();
            this.role.y = this.role.y + e.getDeltaY();

            let location = e.getLocation();
            let mapPos = this.map.convertToNodeSpaceAR(location);
            let grid = this.getMapGrid(mapPos.x, mapPos.y);
            let gridPos = this.getMapPosition(grid.x, grid.y);
            if (grid != this.roleOldGrid) {
                
                this.updateRoleGrid(grid.x,grid.y);
                this.roleOldGrid = grid;
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
        let road = AstarManager.search(start, end);
        this.graphics.clear();
        this.graphics.lineWidth = 10;
        this.graphics.fillColor.fromHEX('#ff0000');
        if (road) {
            // let npos = this.getMapPosition(road.x, road.y);
            // let wpos = this.map.convertToWorldSpaceAR(npos);
            // this.graphics.moveTo(wpos.x,wpos.y);
            let i = 0;
            while(road) {
                let npos = this.getMapPosition(road.x, road.y);
                let wpos = this.map.convertToWorldSpaceAR(npos);
                console.log(road.key);
                console.log('n:',npos);
                console.log('w:',wpos);
                if (i == 0 || (road.parent && road.x != road.parent.x && road.y != road.parent.y) {
                    this.graphics.moveTo(wpos.x,wpos.y);
                }else {
                    this.graphics.lineTo(wpos.x,wpos.y);
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
        let map = {
            '0*0':GRID_TYPE.WALL,
            '0*1':GRID_TYPE.WALL,
            '0*2':GRID_TYPE.RIVER,
            '0*3':GRID_TYPE.RIVER,
            '1*0':GRID_TYPE.RIVER,
            '1*1':GRID_TYPE.WALL,
            '1*2':GRID_TYPE.FLOOR,
            '1*3':GRID_TYPE.RIVER,
        }
        AstarManager.init(this.map.width, this.map.height, this.side,map);
        let start = AstarManager.createGrid(0,0);
        let end = AstarManager.createGrid(3, 3);
        let road = AstarManager.search(start, end);
        if (road) {
            while(road.parent) {
                console.log(road.key);
                road = road.parent;
            }
        }
        this.initMap();
        // this.map.active = false;
    }

    initMap(){
        let floor = this.tile.getChildByName('floor');
        let river = this.tile.getChildByName('river');
        let wall = this.tile.getChildByName('wall');
        let start = this.tile.getChildByName('start');
        let end = this.tile.getChildByName('end');
        floor.width = this.side2
        floor.height = this.side2
        river.width = this.side2
        river.height = this.side2
        wall.width = this.side2
        wall.height = this.side2
        start.width = this.side2 * 0.9
        start.height = this.side2 * 0.9
        end.width = this.side2 * 0.9
        end.height = this.side2 * 0.9

        let bg:cc.Node;
        for (const key in AstarManager.map){
            let [x,y] = key.split('*');
            let type = AstarManager.map[key];
            let position = this.getMapPosition(x, y);
            if (type == GRID_TYPE.FLOOR) {
                bg = cc.instantiate(floor);
            }else if (type == GRID_TYPE.RIVER) {
                bg = cc.instantiate(river);
            }else if (type == GRID_TYPE.WALL) {
                bg = cc.instantiate(wall);
            }
            bg.name = key;
            bg.position = position;
            cc.log(key,bg.position);
            bg.parent = this.map;
        }
        let nodes = this.map.children;
        for (const child of nodes) {
            cc.log(child.name,child);
        }

        // 位置标记
        let s = AstarManager.start;
        let e = AstarManager.end;
        let wSpos =  this.map.convertToWorldSpaceAR(this.getMapPosition(s.x, s.y));
        let wEpos = this.map.convertToWorldSpaceAR(this.getMapPosition(e.x, e.y));
        start.position = start.parent.convertToNodeSpaceAR(wSpos);
        end.position = start.parent.convertToNodeSpaceAR(wEpos);

        this.map.getChildByName('0*5').color = cc.Color.RED;
    }

    getMapPosition(x,y){
        return cc.v2((parseInt(x) + 0.5)*this.side, (parseInt(y) + 0.5)*this.side);
    }
    getMapGrid(x,y){
        return cc.v2(Math.floor(x / this.side),Math.floor(y / this.side));
    }
    
    update (dt) {

    }
}
