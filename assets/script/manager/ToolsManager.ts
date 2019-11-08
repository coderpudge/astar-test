const {ccclass, property, executeInEditMode} = cc._decorator;


 class ToolsManagerClass{
    static readonly instance = new ToolsManagerClass();
    /**
    * 获取随机整数(闭区间)
    @param min  最小值
    @param max  最大值
    **/
   public random(min: number, max: number): number {
        let num = Math.random() * (max - min + 1) + min;
        return Math.floor(num);
    };

    /**
    * 将对象列表转换成数组形式
    @param obj
    **/
    public objToArray(obj: object): any[] {
        if (!obj) {
            return [];
        }

        let list = [];
        for (let key in obj) {
            if (obj[key]) {
                list.push(obj[key]);
            }
        }

        return list;
    };
}
export const ToolsManager = ToolsManagerClass.instance;
