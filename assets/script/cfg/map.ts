import BaseTable from "./BaseTable";


export class MapTable extends BaseTable {
    id; //唯一标识 地图ID
    start; //起点
    end; //终点
    roleType; //玩家形象
    defType; //默认格子类型
    markType; // 指定格子位置和类型
    npc; // npc 位置和类型
    static tableName = ['id','start','end', 'roleType', 'defType', 'markType', 'npc']; // 表结构
    static tableData = {
        1:[1, '7*7', '0*10', 1, 2, '1*0:1, 4*4:2, 0*3:3, 6*6:4',  '8*8:4,10*10:1,11*11:2'],
        2:[2, '7*7', '0*10', 1, 3, '2*0:1, 5*5:2, 0*3:4',  '8*8:4,10*10:1,11*11:2'],
        3:[3, '7*7', '0*10', 1, 1, '3*0:1, 6*6:2, 0*3:4',  '8*8:4,10*10:1,11*11:2'],
    } // 数据记录结构 {id:tableName};
    
}
