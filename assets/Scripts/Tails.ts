const {ccclass, property} = cc._decorator;

@ccclass
export default class TailsComponent extends cc.Component {
    
    @property({
        type:[cc.SpriteFrame]
    })
    tailSpriteFrames: cc.SpriteFrame[] = []

    @property({
        type:[cc.SpriteFrame]
    })
    abilitiesTailSpriteFrames: cc.SpriteFrame[] = []

    @property
    isBombClicked: boolean = false;
    @property
    invalidFieldMashes: number = 3;
    @property
    canClick: boolean =true;
    @property
    clickThrottle = 0.3;

    onLoad () {
       const colorList: string[] = ['block_purpure', 'block_blue', 'block_red', 'block_yellow', 'block_green'];
       const abilitiesColorList = ['bomb']
        for(let diffColor of [...colorList, ...abilitiesColorList]){
                cc.resources.load(diffColor, cc.SpriteFrame, (err, spriteFrame)=>{
                    if(diffColor === 'bomb') {
                    this.abilitiesTailSpriteFrames.push(spriteFrame)
                } else {
                    this.tailSpriteFrames.push(spriteFrame);
                }
            })
       }

       for(let x=0; x<5; x++) {
            for(let y=0; y<5; y++){
                const newNode = new cc.Node(`${x}${y}`)
                this.node.addChild(newNode)
                const icon = newNode.addComponent(cc.Sprite);
                newNode.setAnchorPoint(0,0)
                newNode.setPosition(new cc.Vec3(x*58, y*58));
                const tailColorVariant = colorList[Math.floor(Math.random() * 5)]
                cc.resources.load(tailColorVariant, cc.SpriteFrame, (err, spriteFrame)=> {
                    icon.spriteFrame = spriteFrame
                })
            }
            for(let tail of this.node.children){
                cc.instantiate(tail)
            }
        }
    }

    start () {
        for(let tail of this.node.children) {
            tail.on(cc.Node.EventType.MOUSE_DOWN, this.clickTail, this)
        }
        cc.game.on('clickBomb', data=> {
            this.isBombClicked = data;
            cc.game.emit('decrementBombs', 1)
            cc.game.emit('lockOrUnlockBomb', true)
        })

        cc.game.on('clickMash', data=> {
            this.mashTails()
        })
    }

    private clickTail(event: cc.Event.EventMouse) {
        if(!this.canClick){
            return
        }
        this.canClick = false;
        this.scheduleOnce(()=> {
            this.canClick = true
        }, this.clickThrottle)

        this.node.children.sort(item=>+item.name)
        const clickedNode: cc.Node = event.target;
        if(this.isBombClicked) {
            this.replaceWithBomb(clickedNode);
            this.isBombClicked = false;
            return;
        }     
        const numCol = +clickedNode.name[0];
        const numRow = +clickedNode.name[1];
        const color = clickedNode.getComponent(cc.Sprite).spriteFrame.name;
        let type: string;
        let selectedTails: cc.Node[];
        if(color === 'bomb') {
            const result = this.getCellsBombQd(numCol,numRow)
            selectedTails = result[0];
            type=result[1]
            cc.game.emit('lockOrUnlockBomb', false)
        } else {
            selectedTails = this.getSelectedCells(numCol, numRow, color, this.node.children);
        }
        const arrCells = [];
        for(let tail of selectedTails){
            arrCells.push(tail.name)
        }
        this.updateCellsPositions(arrCells, type);
        if(selectedTails.length>1){
            cc.game.emit('incrementScore', selectedTails.length*5);
            cc.game.emit('decrementTurns', 1);
        }
        if(!this.checkLinesExists()) {
            if(this.invalidFieldMashes > 0){
                this.invalidFieldMashes--;
                this.mashTails();
            } else {
                cc.game.emit('CallLose')
            }
        }
    }

    private checkLinesExists(){
        for(let child of this.node.children){
            if(this.checkNeighbourTails(child)){
                return true
            }
        }
        return false;
    }

    private checkNeighbourTails(tail: cc.Node): boolean{
        const neighbours = []
        const tailColor = tail.getComponent(cc.Sprite).spriteFrame.name;
        const right = this.node.getChildByName(`${+tail.name[0] + 1}${tail.name[0]}`);
        const left =  this.node.getChildByName(`${+tail.name[0] - 1}${tail.name[0]}`);
        const up =  this.node.getChildByName(`${tail.name[0]}${+tail.name[0] +1 }`);
        const down = this.node.getChildByName(`${tail.name[0]}${+tail.name[0] - 1}`);
        neighbours.push(right, left, up, down);

        for(let item of neighbours){
            if(item){
                if(item.getComponent(cc.Sprite).spriteFrame.name === tailColor){
                    return true;
                }
            }
        }
        return false;
    }

    private getSelectedCells(numCol, numRow, color, arrCells): cc.Node[]{
        let elem = arrCells.find(item => item.name === (`${numCol}${numRow}`));
        let selectedCell = [elem];

        function checking(numCol, numRow, color, arrCells) {
            if (numRow >= 1) {
            let rowUp = numRow - 1;
            let newElem =  arrCells.find(item => item.name === (`${numCol}${rowUp}`));
            let included = selectedCell.includes(newElem)

            if (newElem.getComponent(cc.Sprite).spriteFrame.name === color && !included) {
                selectedCell.push(newElem);
                checking(numCol, rowUp, color, arrCells);
            }
            }
            if (numRow <= 3) {
            let rowDown = numRow + 1;
            let newElem = arrCells.find(item => item.name === (`${numCol}${rowDown}`));
            let included = selectedCell.includes(newElem)
            if (newElem.getComponent(cc.Sprite).spriteFrame.name === color && !included) {
                selectedCell.push(newElem);
                checking(numCol, rowDown, color, arrCells);
            }
            }
            if (numCol <= 3) {
            let colRight = numCol + 1;
            let newElem = arrCells.find(item => item.name === (`${colRight}${numRow}`));
            let included = selectedCell.includes(newElem)
            if (newElem.getComponent(cc.Sprite).spriteFrame.name === color && !included) {
                selectedCell.push(newElem);
                checking(colRight, numRow, color, arrCells);
            }
            }
            if (numCol >= 1) {
            let colLeft = numCol - 1;
            let newElem = arrCells.find(item => item.name === (`${colLeft}${numRow}`));
            let included = selectedCell.includes(newElem)
            if (newElem.getComponent(cc.Sprite).spriteFrame.name === color && !included) {
                selectedCell.push(newElem);
                checking(colLeft, numRow, color, arrCells);
            }
            }
        }
        checking(numCol, numRow, color, arrCells);
        selectedCell.sort(item=>item.name);
        return selectedCell;
    }

    private replaceWithBomb(tail: cc.Node): void {
        tail.getComponent(cc.Sprite).spriteFrame = this.abilitiesTailSpriteFrames[0];
    }

    private mashTails(): void {
        const arr = [];
        for(let child of this.node.children){
            const item = cc.instantiate(child);
            arr.push(item)
        }
        const names = this.node.children.map(item => {return item.name})
        arr.sort(()=> Math.random() - 0.5);
        this.node.removeAllChildren(false)
            for(let item of arr){
                item.name = names[arr.indexOf(item)]
                this.node.addChild(item)
                item.setPosition((+item.name[0])*58, (+item.name[1])*58)
            }
        for(let tail of this.node.children) {
            cc.instantiate(tail)
            tail.on(cc.Node.EventType.MOUSE_DOWN, this.clickTail, this)
        }
        cc.game.emit('decrementMash', 1)
    }

    private getCellsBombQd(numCol: number, numRow: number):[cc.Node[], string]{
        let selectedCell = [];
        let minCol = numCol - 1 < 0 ? numCol : numCol - 1;
        let maxCol = numCol + 1 > 4 ? numCol : numCol + 1;
        let minRow = numRow - 1 < 0 ? numRow : numRow - 1;
        let maxRow = numRow + 1 > 4 ? numRow : numRow + 1;

        for (let i = minCol; i <= maxCol; i++) {
            for (let j = minRow; j <= maxRow; j++) {
            let elem = this.node.children.find(item => item.name === `${i}${j}`);
            selectedCell.push(elem);
            }
        }
        return [selectedCell, 'qd'];
    }

    private updateCellsPositions(arrCells: cc.Node[], type?: string): void{
        if(arrCells.length==1 &&!type){
            return
        }

        let newArrCells =[];
        for(let cell of this.node.children){
            newArrCells.push(cc.instantiate(cell))
        }

        let sortArrays = [];
        let sortWithoutColumns = [];
        

        for (let i = 0; i < 5; i++) {
            let results = arrCells.sort().filter(item => +item[0] === i);
            if (results.length > 0) {
            sortArrays.push(results);
            }
        }
        for(let cell of arrCells){
            sortWithoutColumns.push(cell);
        }

        for(let item of sortWithoutColumns) {          
            const elem = this.node.children.find(i=>i.name===item)
                elem.needDestroy = true;
            }

        for(let item of sortArrays) {
            let arr = [...item];
            let col = +item[0][0];
            let row = +item[0][1];

            let iter = 5 - (+item[0][1]);

            while (iter > 0) {
                let newRow = row + 1;
                let count=1;
                while (arr.includes('' + col + newRow)) {
                    newRow++;
                    count++;
                }


                if (newRow > 4) {
                    console.log('newRow>4')
                    const newNode = new cc.Node(''+col+(newRow-count))
                    this.node.addChild(newNode)
                    newNode.setAnchorPoint(0,0)
                    newNode.setPosition(col*58, newRow*58);
                    let tailColorVariant = this.tailSpriteFrames[Math.floor(Math.random() * 5)]
                    const icon = newNode.addComponent(cc.Sprite)
                    icon.spriteFrame = tailColorVariant
                    newNode.on(cc.Node.EventType.MOUSE_DOWN, this.clickTail, this)

                    cc.tween(newNode).by(0.3, { y: 0 - 58*count}, { easing: 'sineIn' }).start();
                    
                } else {
                    const elem = this.node.children.find(item=>item.name===(''+col+newRow))
                    cc.tween(elem).by(0.3, { y: 0 - 58*count}, { easing: 'sineIn' }).start();
                    elem.name=''+col+(newRow-count);

                }

                if (arr.length < 5) {
                    arr.push('' + col + newRow);
                }

                row++;
                iter--;
            }
        }

        for(let child of this.node.children){
            if(child.needDestroy){
                child.destroy()
            }
        }
        }}