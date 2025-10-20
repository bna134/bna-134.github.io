const {ccclass, property} = cc._decorator;

enum GameResultType {
    win='win',
    lose='lose'
}

@ccclass
export default class ScoreComponents extends cc.Component {

    @property
    currentScore: number;

    @property
    neccessaryScore: number;

    @property()
    turns: number;

    onLoad () {
        const score =  this.node.getChildByName('Score').getComponent(cc.Label).string.slice(6).split('/')
        this.currentScore = +(score[0]);
        this.neccessaryScore = +(score[1]);
        this.turns = +(this.node.getChildByName('TurnCountContainer').getChildByName('TurnCount').getComponent(cc.Label).string);
    }

    start () {
        cc.game.on('incrementScore', data => {
            this.currentScore+=data;
            this.addScore();
        })
        cc.game.on('decrementTurns', data => {
            if(this.turns>0){
                this.turns-=data;
                this.decrementTurn();
            }
        })
        cc.game.on('CallLose', ()=> {
            this.getGameResult(GameResultType.lose);
        })
    }

    addScore(){
        if(this.turns> 0 && this.currentScore>=this.neccessaryScore){
           this.getGameResult(GameResultType.win)
        }
        if(this.turns === 0 && this.currentScore < this.neccessaryScore){
            this.getGameResult(GameResultType.lose)
        }
        const value = +this.node.getChildByName('Score').getComponent(cc.Label).string.slice(6).split('/')[0];
        this.node.getChildByName('Score').getComponent(cc.Label).string=
        this.node.getChildByName('Score').getComponent(cc.Label).string.replace(`${value}/`, `${this.currentScore}/`)
    }

    private getGameResult(type: GameResultType){
        const screen = this.node.getParent();
        const canvas = screen.getParent();
        screen.opacity = 50;
        screen.getChildByName('GameField').active = false;
        let message;
        if(type === GameResultType.win) {
            message = `Win!!! Reload page to try again`
        } else {
            message = `Lose!!! Reload page to try again`
        }
        canvas.getChildByName('Result').getComponent(cc.Label).string = message;
    }

    private decrementTurn() {
        this.node.getChildByName('TurnCountContainer').getChildByName('TurnCount').getComponent(cc.Label).string = `${this.turns}`;
    }

    // update (dt) {}
}
