import { MapTable } from "../cfg/map";
import Table from "../cfg/table";



/**
 * 表格配置文件管理
 */
class TableManagerClass {
    static readonly instance = new TableManagerClass();
    getTableInfo<T extends Table>(table:constructor,id) : T {
        let obj:Table = new Table();
        
        let record = table.tableData[id];
        for (let i = 0; i < record.length; i++) {
            obj[table.tableName[i]] = record[i];
        }
        return <T>obj;
    }
    /**
     * 多个参数组合查询
     * @param table 表 class
     * @param names 需要查询的表字段
     * @param values 需要查询的条件
     */
    getTableInfoByCombId<T extends Table>(table:constructor, nameIdxs:[],  condition:[]) : T {
        let obj:Table = new Table();

        for (const key in table.tableData) {
            const record = table.tableData[key];
            let passCount = 0;//匹配成功的条件个数
            for (let n = 0; n < nameIdxs.length; n++) {
                const nidx = nameIdxs[n]; // table name idx
                //  tableData 中 name 索引所在的值 ==  参数值
                if (table.tableData[nidx] == condition[n]) {
                    passCount ++;
                    if (passCount == nameIdxs.length) {
                        for (let i = 0; i < record.length; i++) {
                            obj[table.tableName[i]] = record[i];
                            return <T>obj;
                        }
                    }
                }
            }
        }
        
    }

    
}
export const TableManager = TableManagerClass.instance;
let a:MapTable =  TableManager.getTableInfo(MapTable, 1);

