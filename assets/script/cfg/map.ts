import { TableManager } from './../manager/TableManager';
import Table from "./table";

export class MapTable extends Table {
    map;
    npc;
    static tableName = ['map','npc'];
    static tableData = {
        1:[1,2],
        2:[21,22],
    }
}

let tableData = {
    1:['0*0:1, 0*1:2, 0*3:4','1*3:4'],
    2:['0*0:1, 0*1:2, 0*3:4','1*3:4'],
    3:['0*0:1, 0*1:2, 0*3:4','1*3:4'],
}

 TableManager.getTableInfo(MapTable, 1);

let map = {
    '0*0':2,
    '0*1':2,
    '0*2':2,
    '0*3':2,
    '1*0':1,
    '1*1':2,
    '1*2':3,
    '1*3':4,
    '8*6':2,
    '7*7':2,
    '7*8':2,
    '7*9':2,
    '7*10':3,
}

let npc = {
    '5*5': 1,
    '5*6': 2,
    '5*7': 3,
}