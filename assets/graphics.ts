// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class graphics extends cc.Component {

    @property(cc.Node)
    draw:cc.Node;

    onLoad () {
        let drawCmpt = this.draw.getComponent(cc.Graphics);
        if (!drawCmpt) {
            drawCmpt = this.draw.addComponent(cc.Graphics);
        }
        drawCmpt.lineWidth = 2;
        drawCmpt.fillColor.fromHEX('#ff0000');
        drawCmpt.moveTo(0,0);
        drawCmpt.lineTo(500,300);
        drawCmpt.lineTo(200,300);
        // drawCmpt.close();
        drawCmpt.stroke();
    }

    start () {

    }

    // update (dt) {}
}
