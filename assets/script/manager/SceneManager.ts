
const {ccclass, property} = cc._decorator;

@ccclass
class SceneManagerClass{

    public static readonly Instance: SceneManagerClass = new SceneManagerClass();

    @property(cc.Node)
    public mapNode: cc.Node = null;
    @property(cc.Node)
    public npcNode: cc.Node = null;
    @property(cc.Node)
    public roleNode: cc.Node = null;
    
    init(mapNode,npcNode,roleNode){
        this.mapNode = mapNode;
        this.npcNode = npcNode;
        this.roleNode = roleNode;
    }

    
}
export const SceneManager = SceneManagerClass.Instance;
