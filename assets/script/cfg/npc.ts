import BaseTable from "./BaseTable";


export class Tb_Npc extends BaseTable {
    id; //唯一标识 地图ID
    name; //名称
    speed; //移动速度
    skill; //技能
    static tableName = ['id','name','type','speed','skill']; // 表结构
    static tableData = {
        1:[1, 'npc1', 50, 1],
        2:[2, 'npc2', 60, 1],
        3:[3, 'npc3', 70, 1],
        4:[4, 'npc4', 80, 1],
        5:[5, 'npc5', 90, 1],
       
    } // 数据记录结构 {id:tableName};
    
}
