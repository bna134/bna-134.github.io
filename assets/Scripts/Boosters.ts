const {ccclass, property} = cc._decorator;

@ccclass
export default class BoosterComponents extends cc.Component {
    
    @property()
    bombCount: number = 0;

    @property()
    mashCount: number = 0;

    onLoad () {
       this.bombCount = +(this.node.getChildByName('BombsContainer')
       .getChildByName('BombCountContainer')
       .getChildByName('BombCount').getComponent(cc.Label).string)

       this.mashCount = +(this.node.getChildByName('MashContainer')
       .getChildByName('MashCountContainer')
       .getChildByName('MashCount').getComponent(cc.Label).string)
    }

    start () {
        this.node.getChildByName('BombsContainer').on(cc.Node.EventType.MOUSE_DOWN, this.clickBomb, this)
        this.node.getChildByName('MashContainer').on(cc.Node.EventType.MOUSE_DOWN, this.clickMash, this)
        this.node.getChildByName('BombsContainer').on(cc.Node.EventType.TOUCH_END, this.clickBomb, this)
        this.node.getChildByName('MashContainer').on(cc.Node.EventType.TOUCH_END, this.clickMash, this)
        cc.game.on('lockOrUnlockBomb', data=>{
            if(data){
               this.node.getChildByName('BombsContainer').off(cc.Node.EventType.MOUSE_DOWN, this.clickBomb, this) 
               this.node.getChildByName('BombsContainer').off(cc.Node.EventType.TOUCH_END, this.clickBomb, this) 
            } else {
                this.node.getChildByName('BombsContainer').on(cc.Node.EventType.MOUSE_DOWN, this.clickBomb, this)
                this.node.getChildByName('BombsContainer').on(cc.Node.EventType.TOUCH_END, this.clickBomb, this)
            }
        })
        cc.game.on('decrementBombs', data => {
            if(this.bombCount>0){
                this.bombCount-=data;
                this.decrementBomb()
            }
        })
        cc.game.on('decrementMash', data => {
            if(this.mashCount>0){
            this.mashCount-=data;
            this.decrementMash()
            }
        })
    }

    clickBomb(){
        if(this.bombCount>0){
            cc.game.emit('clickBomb', true);
        }
    }

    clickMash(){
        if(this.mashCount>0){
            cc.game.emit('clickMash');
        }
    }

    decrementBomb() {
        this.node.getChildByName('BombsContainer')
       .getChildByName('BombCountContainer')
       .getChildByName('BombCount').getComponent(cc.Label).string = `${this.bombCount}`;
    }

    decrementMash() {
        this.node.getChildByName('MashContainer')
       .getChildByName('MashCountContainer')
       .getChildByName('MashCount').getComponent(cc.Label).string = `${this.mashCount}`;
    }

    // update (dt) {}
}
