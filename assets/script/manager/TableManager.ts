import BaseTable from "../cfg/BaseTable";

/**
 * 表格配置文件管理
 */
class TableManagerClass {
    static readonly instance = new TableManagerClass();
    private _cache = {};
    /**
     * 根据 表名和 Id 查询表记录
     * @param table 
     * @param id 
     */

    _getCacheTableInfo(table,id){
        if (!this._cache[table.name]) {
            return;
        }
        // if (!this._cache[table.name][id]) {
        //     return;
        // }
        return this._cache[table.name][id];
    }
    _setCacheTableInfo(table,id, data:BaseTable){
        if (!this._cache[table.name]) {
            this._cache[table.name] = {};
        }
        if (!this._cache[table.name][id]) {
            this._cache[table.name] = {};
        }
        this._cache[table.name][id] = data;
    }

    getTableInfo<T extends BaseTable>(table ,id) : T {
        let cache = this._getCacheTableInfo(table, id);
        if (cache) {
            return cache;
        }
        let obj:BaseTable = new BaseTable();
        let record = table.tableData[id];
        for (let i = 0; i < record.length; i++) {
            obj[table.tableName[i]] = record[i];
        }
        return <T>obj;
    }
    /**
     * 根据表名 和多个参数 组合查询表记录
     * @param table 表 class
     * @param names 需要查询的表字段
     * @param condition 需要查询的条件
     * @param isSingle 是否只返回一条数据
     */
    getTableInfoByCombId(table, nameIdxs:Array<string>,  condition:Array<string|number>, isSingle = true) : BaseTable[] {
        let list:BaseTable[] = [];
        for (const id in table.tableData) {
            const record = table.tableData[id];
            let passCount = 0;//匹配成功的条件个数
            for (let n = 0; n < nameIdxs.length; n++) {
                const colName = nameIdxs[n]; // table name
                //  tableData 中 name 索引所在的值 ==  参数值
                let idx = table.tableName.indexOf(colName);
                if (idx == -1) {
                    cc.log('search condition error:',colName);
                    break
                }
                if (record[idx] == condition[n]) {
                    passCount ++;
                    if (passCount == nameIdxs.length) {
                        list.push(this.getTableInfo(table, id));
                        if (isSingle) {
                            return list;
                        }
                    }
                }else{
                    break;
                }
            }
        }
        return list;
    }
    /**
     * 表记录数
     * @param table 
     */
    getLen(table){
        if (table.len) {
            return table.len;
        }
        let num = 0;
        for (const key in table.tableData) {
            if (table.tableData.hasOwnProperty(key) &&  table.tableData[key]) {
                num ++;    
            }
        }
        table.len = num;
        return num;
    }
    
}
export const TableManager = TableManagerClass.instance;


