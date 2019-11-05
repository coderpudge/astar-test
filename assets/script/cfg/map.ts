import BaseTable from "./BaseTable";


export class MapTable extends BaseTable {
    id; //唯一标识 地图ID
    markType; // 指定格子位置和类型
    otherType; //其它格子类型
    npc; // npc 位置和类型
    static tableName = ['id', 'markGrid', 'otherType', 'npc']; // 表结构
    static tableData = {
        1:[1,'1*0:1, 4*4:2, 0*3:4', 1, '1*3:4'],
        2:[2,'2*0:1, 5*5:2, 0*3:4', 2, '2*3:4'],
        3:[2,'3*0:1, 6*6:2, 0*3:4', 2, '3*3:4'],
    } // 数据记录结构 {id:tableName};
    
}
