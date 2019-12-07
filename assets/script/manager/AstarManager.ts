import { MapTable } from "../cfg/map";


// A 星寻路算法 F = G + H;
// G 代表从起点走到当前格子的成本
// H 代表从当前格子走到目标格子的距离(无视障碍物)


/**
 * 格子类型
 */
export enum GRID_TYPE {
    FLOOR = 1, //地板
    WALL = 2, //墙
    RIVER = 3, //河
    SAND = 4, //沙
}
/**
 * 不可穿过的类型
 */
let NOT_PASS_TYPES = [
    GRID_TYPE.WALL,
    GRID_TYPE.RIVER,
]
export enum DIRECT_TYPE{
    FOUR = 1,//四向
    EIGHT = 2,//八向
}

export class Grid{
    static separatorKey = '*'; //key 的分隔符
    key=''; //唯一标识符
    col:number=0; // 列
    row:number=0; // 行
    f:number=0; // g + h (起点->当前 + 当前->终点)
    g:number=0; // 起点->当前
    h:number=0; // 当前->终点
    type:number=GRID_TYPE.FLOOR; //格子类型
    parent:Grid;
    /**
     * 构造  (行,列)
     * @param 行 
     * @param 列 
     */ 
    constructor(col:number,row:number) {
        this.col = col;
        this.row = row;
        this.key = this.col + Grid.separatorKey + this.row;
    }
    /**
     * 判断同一个格子
     * @param grid 
     */
    equals(grid:Grid){
        return this.key == grid.key;
    }
    /**
     * 更新 价值
     * @param start 
     * @param end 
     */
    updateFGH(start:Grid,end:Grid,parent?){
        if (!parent) {
            parent = this.parent;
        }
        let diffColG = Math.abs(parent.col - this.col);
        let diffRowG = Math.abs(parent.row - this.row);

        if (diffColG == diffRowG) {
            this.g = Math.abs(this.col - parent.col ) * 14;
        }else{
            this.g = (Math.abs(this.col - parent.col ) + Math.abs(this.row - parent.row)) * 10;
        }
        this.h = (Math.abs(this.col - end.col ) + Math.abs(this.row - end.row)) * 10;
        this.f = this.g + this.h;
    }
    /**
     * 获取 实际坐标 (锚点:左下(0,0))
     * @param row 
     * @param y 
     */
    getPosition(){
        return cc.v2((this.col + 0.5) * AstarManager.side, (this.row + 0.5) * AstarManager.side);
    }

    /**
     * 格式是否可通过;
     */
    canPass(){
        let idx = NOT_PASS_TYPES.indexOf(this.type);
        return idx == -1;
    }
}
class AstarManagerClass {
    col=0; //列 (宽度决定)
    row=0; //行 (高度决定)
    side=10;//边长
    openList:Grid[] = []; //可到达的格子
    closeList:Grid[] = []; // 已到达的格子
    start:Grid;
    end:Grid;
    directType=DIRECT_TYPE.FOUR; //寻路方式 (四向 / 八向);
    // map={};
    gridList:Map<string,Grid> = new Map();
    defGridType = GRID_TYPE.FLOOR;
    static readonly instance = new AstarManagerClass();


    /**
     * 初始化 A星寻路
     * @param width 宽度
     * @param height 高度
     * @param side 边长
     * @param conf 差异配置
     */
    init(width,height,side,conf?:MapTable){
        this.side = side;
        this.col = Math.floor(width / this.side);
        this.row = Math.floor(height / this.side);
        cc.log('astar init:','col(列):',this.col,' row(行):',this.row,' side(边长):',this.side);
        // 初始地图
        // this.map = {};
        // 读取配置文件中默认地板的类型
        if (conf && conf.defType) {
            this.defGridType = conf.defType;
        }
        // 初始化 地板默认类型
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                // this.map[i+Grid.separatorKey+j] = this.defGridType;
                this.gridList[j+Grid.separatorKey+i] = new Grid(j, i);
            }
        }
        // 初始化 特殊地板的类型
        if (conf && conf.markType) {
            // 格式 : '1*0:1, 4*4:2, 0*3:4'
            let arr = conf.markType.split(',');
            for (const pt of arr) {
                let [pos,type] = pt.trim().split(':');
                // this.map[pos] = parseInt(type);
                this.gridList[pos].type = parseInt(type);
            }
        }
    }

    /**
     * 通过key(col*row) 获取<格子>
     * @param key 
     */
    getGridByKey(key):Grid{
        return this.gridList[key];
    }
    /**
     * 通过行列 获取<格子>
     * @param col 
     * @param row 
     */
    getGrid(col,row):Grid{
        return this.gridList[col+Grid.separatorKey+row];
    }
    /**
     * 通过真实坐标 获取<格子>
     * @param x 
     * @param y 
     */
    getGridByPosition(x,y):Grid{
        let col = Math.floor(x / this.side)
        let row = Math.floor(y / this.side);
        return this.getGrid(col, row);
    }


    // getPosition():cc.Vec2{
    //     return cc.v2(this.col + 0.5 * AstarManager.side, (this.row + 0.5) * AstarManager.side);
    // }

    /**
     * 查找路线
     * @param start 起点
     * @param end 终点
     * return 终点对象
     */
    search(start:Grid, end:Grid):Grid {
        cc.log('start:',start,' end:',end);
        this.start = start;
        this.end = end;
        start.parent = null;
        end.parent = null;
        this.closeList = [];
        this.openList = [];
        // 把起点加入 open list  
        this.openList.push(start);
        //主循环，每一轮检查一个当前方格节点
        let i = 0;
        while (this.openList.length > 0) {
            i++;
            cc.log('round:',i);
            // 在this.openList中查找 F值最小的节点作为当前方格节点
            let current:Grid = this.findMinOpenGrid();
            cc.log('curent:',current);
            // 当前方格节点从open list中移除
            this.removeOpenGrid(current)
            // 当前方格节点进入 close list
            this.closeList.push(current);
            // 找到所有邻近节点
            let neighborList:Grid[] = this.findNeighborList(current);
            for (const grid of neighborList) {
                this.markAndInvolve(current, grid);
            }
            cc.log('neighbor:',neighborList);
            //如果终点在openList中，直接返回终点格子
            let og = this.openList.find(ogrid=>ogrid.equals(this.end));
            if (og) {
                this.openList = [];
                this.closeList = [];
                return og;
            }
        }
        //OpenList用尽，仍然找不到终点，说明终点不可到达，返回空
        return null;
    }

    searchRoute(start:Grid, end:Grid):Grid[] {
        cc.log('search: start',start, 'end:',end);
        let road = this.search(start, end);
        let route = [];
        if (road) {
            while(road) {
                route.unshift(road);
                road = road.parent;
            }
        }
        return route;
    }

    /**
     * 获得最小 F 值的节点
     */
    findMinOpenGrid():Grid {
        let gird:Grid;
        if (this.openList.length == 0) {
            return;
        }
        this.openList.sort((a,b)=>{
            // if (a.f == b.f) {
            //     return a.h - b.h
            // }else{
                return a.f - b.f;
            // }
        })
        return this.openList[0];
    }
    /**
     *删除可通行节点
     */
    removeOpenGrid(grid){
        let idx = this.openList.findIndex(g=>g.equals(grid));
        if (idx != -1) {
            this.openList.splice(idx,1);
        }
    }
    /**
     * 查找邻接点
     * @param grid 
     */
    findNeighborList(grid:Grid):Grid[]{
        let list:Grid[] = [];
        if (!grid) {
            return list;
        }
        // openGL 坐标系 左下 (0,0)
        let up:Grid,down:Grid,left:Grid,right:Grid, leftUp:Grid,leftDown:Grid,rightUp:Grid,rightDown:Grid;
        // 边界控制
        if (grid.row < this.row - 1) {
            up = this.getGrid(grid.col,grid.row + 1);
            // up.updateFGH(this.start, this.end); //推迟更新 fgh , 验证障碍后再通过
            list.push(up);
        }
        if (grid.row > 0) {
            down = this.getGrid(grid.col,grid.row - 1);
            // down.updateFGH(this.start, this.end);
            list.push(down);
        }
        if (grid.col > 0) {
            left = this.getGrid(grid.col - 1,grid.row);
            // left.updateFGH(this.start, this.end);
            list.push(left);
        }
        if (grid.col < this.col - 1) {
            right = this.getGrid(grid.col + 1,grid.row);
            // right.updateFGH(this.start, this.end);
            list.push(right);
        }
        if (this.directType == DIRECT_TYPE.EIGHT) {
            if (grid.row < this.row - 1 && grid.col > 0) {
                leftUp = this.getGrid(grid.col - 1, grid.row + 1);
                list.push(leftUp);
            }
            if (grid.row < this.row - 1 && grid.col < this.col - 1) {
                rightUp = this.getGrid(grid.col + 1, grid.row + 1);
                list.push(rightUp);
            }
            if (grid.row > 0 && grid.col > 0) {
                leftDown = this.getGrid(grid.col - 1, grid.row - 1);
                list.push(leftDown);
            }
            if (grid.row > 0 && grid.col < this.col - 1) {
                rightDown = this.getGrid(grid.col + 1, grid.row - 1);
                list.push(rightDown);
            }
        }
        this.filterObstacle(list);
        this.filterOpen(list);
        this.filterClose(list);
        return list;
    }
    /**
     * 过滤掉 可到达的格子
     * @param list 
     */
    filterOpen(list:Grid[]){
        for (const openGrid of this.openList) {
            if (list.length > 0) {
                let idx = list.findIndex(grid=>grid.equals(openGrid));
                if (idx != -1) {
                    cc.log('filter opend:',list[idx].col,list[idx].row)
                    list.splice(idx,1);
                }
            }
        }
    }
    /**
     * 过滤掉 已到达的格子
     * @param list 
     */
    filterClose(list:Grid[]){
        for (const closeGrid of this.closeList) {
            if (list.length > 0) {
                let idx = list.findIndex(grid=>grid.equals(closeGrid));
                if (idx != -1) {
                    cc.log('filter closed:',list[idx].col,list[idx].row)
                    list.splice(idx,1);
                }
            }
        }
    }
    /**
     * 过滤掉 不能到达的格子(障碍物);
     * @param list 
     */
    filterObstacle(list:Grid[]){
        if (list.length > 0) {
            for (let i = list.length - 1; i >= 0; i--) {
                let grid = this.gridList[list[i].key];
                if (!grid) {
                    cc.error('not found:',list[i].key)
                    continue;
                }
                let idx = NOT_PASS_TYPES.indexOf(grid.type);
                if (idx != -1) {
                    list.splice(i,1);
                }
                
                /* let flag = NOT_PASS_TYPES.find(notpass=>notpass == type);
                if (flag) {
                    list.splice(i,1);
                }
                if (type == GRID_TYPE.RIVER) {
                    list.splice(i,1);
                }else if (type == GRID_TYPE.WALL) {
                    list.splice(i,1);
                } */
            }
        }
    }

    /**
     * 邻近节点不在openList中，标记父亲、G、H、F，并放入this.openList
     * @param current 
     * @param end 
     * @param grid 
     */
    markAndInvolve(parent:Grid, openGrid:Grid){
        openGrid.parent = parent;
        openGrid.updateFGH(this.start, this.end, parent);
        this.openList.push(openGrid);
    }

    
    /**
     * 是否可直达
     * @param start 
     * @param end 
     */
    canSee(start:Grid,end:Grid){
        let minx = start.col < end.col ? start.col : end.col;
        let maxx = start.col > end.col ? start.col : end.col;
        let miny = start.row < end.row ? start.row : end.row;
        let maxy = start.row > end.row ? start.row : end.row;
        for (let minx = 0; minx <= maxx; minx++) {
            for (let miny = 0; miny <= maxy; miny++) {
                
            
            }
            
        }
    }
    CheckLineTest( A:Grid, B:Grid)
    {
        let re = 0;          
        let Dx = Math.abs(B.col - A.col);
        let Dy = Math.abs(B.row - A.row);
        while (Dx >= 0)
        {
            let YY = 0;
            let x = A.col + Dx * Math.sign(B.col - A.col);
            while (Dy >= 0)
            {
                let y = A.row + Dx * Math.sign(B.row - A.row);
                //输出结果
                cc.log("格子"+x+","+y+"命中");

                let IsFinish =false;
                if (A.col != B.col)
                {
                    IsFinish = Math.abs(YY) > Math.abs((A.row - B.row) / (A.col - B.col));
                    if (IsFinish)
                    {
                        break;
                    }
                }
                YY++;
                Dy--;
            }
            Dx --;
        }
        return re;
    }
    /**
     * A B两点间穿过的格子
     * @param A 
     * @param B 
     */
    CheckLine(A:Grid, B:Grid)
    {
        let array = [];
        let x1 = A.col; 
        let y1 = A.row; 
        let x2 = B.col; 
        let y2 = B.row; 
        let re = 0;
        let increx = 0; 
        let increy = 0; 
        let x = 0; 
        let y = 0;
        let steps = 0; 
        let i = 0;

        if (Math.abs(x2 - x1) > Math.abs(y2 - y1))
        {
            steps = Math.abs(x2 - x1);
        }
        else
        {
            steps = Math.abs(y2 - y1);
        }

        increx = (x2 - x1) / steps;
        increy = (y2 - y1) / steps;
        x = x1;
        y = y1;

        for (i = 1; i <= steps; i++)
        {
            //putpixel(x，y，color); //在(x，y)处，以color色画点
            // if (!CheckMap(map, x, y))
            // { 
            //     re++; 
            // }
            if (re > 0) {
                cc.log(Math.ceil(x),Math.ceil(y));
                array.push(cc.v2(x,y));
            }
            
            x += increx;
            y += increy;
            re++;
        }
        return array;
    }
    verifyGrid(grid:Grid){
        if (grid.row > this.row - 1 || grid.col > this.col -1) {
            cc.error('超出越界:',grid);
            return false;
        }
        return true;
    }

}

export const AstarManager = AstarManagerClass.instance;


