console.log('ts');

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
}
export enum DIRECT_TYPE{
    FOUR = 1,//四向
    EIGHT = 2,//八向
}

class Grid {
    key=''; //唯一标识符
    x=0; // 行
    y=0; // 列
    f=0; // g + h (起点->当前 + 当前->终点)
    g=0; // 起点->当前
    h=0; // 当前->终点
    type=GRID_TYPE.FLOOR; //格子类型
    parent:Grid;
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.key = this.x + '*' + this.y;
    }
    equals(grid:Grid){
        return this.key == grid.key;
    }
    updateFGH(start:Grid,end:Grid){
        this.g = Math.abs(this.x - start.x ) + Math.abs(this.y - start.y);
        this.h = Math.abs(this.x - end.x ) + Math.abs(this.y - end.y);
        this.f = this.g + this.h;
    }
}
class AstarManagerClass {
    cell=0; //行
    col=0; //列
    side=10;//边长
    openList:Grid[] = []; //可到达的格子
    closeList:Grid[] = []; // 已到达的格子
    start:Grid;
    end:Grid;
    directType=DIRECT_TYPE.FOUR; //寻路方式 (四向 / 八向);
    map={};
    static readonly instance = new AstarManagerClass();

    constructor() {
        
    }
    init(width,height,side,map?){
        this.side = side;
        this.cell = Math.floor(height / this.side);
        this.col = Math.floor(width / this.side);
        cc.log('astar init:','cell(行):',this.cell,'col(列):',this.col,'side(边长):',this.side);
        // 初始地图
        this.map = [];
        for (let i = 0; i < this.cell; i++) {
            for (let j = 0; j < this.col; j++) {
                let type = GRID_TYPE.FLOOR;
                this.map[i+'*'+j] = type;
            }
        }
        if (map) {
            for (const key in map) {
                this.map[key] = map[key];
            }
        }

    }
    search(start:Grid, end:Grid) {
        this.start = start;
        this.end = end;
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
            cc.log('neighbor:',neighborList);
            for (const grid of neighborList) {
                this.markAndInvolve(current, grid);
            }
            //如果终点在openList中，直接返回终点格子
            let og = this.openList.find(ogrid=>ogrid.equals(this.end));
            if (og) {
                return og;
            }
        }
        //OpenList用尽，仍然找不到终点，说明终点不可到达，返回空
        return null;
    }
    findMinOpenGrid():Grid {
        let gird:Grid;
        if (this.openList.length == 0) {
            return;
        }
        this.openList.sort((a,b)=>{
            if (a.f == b.f) {
                return a.h - b.h
            }else{
                return a.f - b.f;
            }
        })
        return this.openList[0];
    }
    removeOpenGrid(grid){
        let idx = this.openList.findIndex(g=>g.equals(grid));
        if (idx != -1) {
            this.openList.splice(idx);
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
        if (grid.y < this.cell - 1) {
            up = new Grid(grid.x,grid.y + 1);
            // up.updateFGH(this.start, this.end); //推迟更新 fgh , 验证障碍后再通过
            list.push(up);
        }
        if (grid.y > 0) {
            down = new Grid(grid.x,grid.y - 1);
            // down.updateFGH(this.start, this.end);
            list.push(down);
        }
        if (grid.x > 0) {
            left = new Grid(grid.x - 1,grid.y);
            // left.updateFGH(this.start, this.end);
            list.push(left);
        }
        if (grid.x < this.col - 1) {
            right = new Grid(grid.x + 1,grid.y);
            // right.updateFGH(this.start, this.end);
            list.push(right);
        }
        if (this.directType == DIRECT_TYPE.EIGHT) {
            if (grid.y < this.cell - 1 && grid.x > 0) {
                leftUp = new Grid(grid.x - 1, grid.y + 1);
                list.push(leftUp);
            }
            if (grid.y < this.cell - 1 && grid.x < this.col - 1) {
                rightUp = new Grid(grid.x + 1, grid.y + 1);
                list.push(rightUp);
            }
            if (grid.y > 0 && grid.x > 0) {
                leftDown = new Grid(grid.x - 1, grid.y - 1);
                list.push(leftDown);
            }
            if (grid.y > 0 && grid.x < this.col - 1) {
                rightDown = new Grid(grid.x + 1, grid.y - 1);
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
                    cc.log('filter opend:',list[idx].x,list[idx].y)
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
                    cc.log('filter closed:',list[idx].x,list[idx].y)
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
                let type = this.map[list[i].key];
                if (type == GRID_TYPE.RIVER) {
                    list.splice(i,1);
                }else if (type == GRID_TYPE.WALL) {
                    list.splice(i,1);
                }
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
        openGrid.updateFGH(this.start, this.end);
        this.openList.push(openGrid);
    }

    createGrid(x,y){
        return new Grid(x,y);
    }
}

export const AstarManager = AstarManagerClass.instance;

