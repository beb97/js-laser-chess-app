class CommandManager {
    constructor() {
        this.commands = [];
    }

    addCommand(command) {
        this.commands.push(command);
        return this;
    }

    handleClick() {
        // console.log(game.mouseCoord());
        if ( game.withinCanevas(mouseX, mouseY) ) {
            this.addCommand( new Command(mouseButton, null) );
            this.interpret();
        }
    }

    handleKey() {
        // console.log(keyCode);
        this.addCommand( new Command(null,keyCode) );
        this.interpret();
    }

    hasCommands(number) {
        return this.commands.length === number;
    }

    command(number) {
        return this.commands[number-1];
    }

    getCurrentPiece() {
        return (this.command(1) && this.command(1).hasPiece()) ? this.command(1).cell.piece : null;
    }

    interpret() {
        if(this.hasCommands(1)) {

            if(this.command(1).isKey(90)) {

                game.board.actions.undo();
                this.clear();

            }  else if(this.command(1).isKey(69)) {

                game.board.actions.redo();
                this.clear();

            } else if( !this.command(1).hasCell() ) {
                this.clear();
            } else if ( !this.command(1).hasPiece() ) {
                this.clear();
            }

        } else if(this.hasCommands(2)) {

            if( this.command(1).isMouse(LEFT) && this.command(1).hasPiece()
                && this.command(2).isMouse(LEFT) && this.command(2).hasCell() ) {

                if( this.command(1).cell.isNeighboor(this.command(2).cell, 1.5) ) {
                    game.board.actions.addAction( new ActionMove(this.command(1).cell,this.command(2).cell) );
                } else if (this.command(1).cell.isNeighboor(this.command(2).cell, 2)) {

                    game.board.actions.addAction( new ActionRotate(this.command(1).cell,this.command(2).cell) );
                }
                this.clear();

            }

            else {
                this.clear();
            }
        } else {
            this.clear();
        }
    }

    clear() {
        this.commands = [];
    }

}

class Command {
    constructor(button, key) {
        this.mouseCoord = game.mouseCoord();
        this.cell = game.board.getCellFromCoord(this.mouseCoord);
        this.button = button;
        this.key = key;
    }

    isMouse(button) {
        return this.button === button;
    }

    isKey(key) {
        return this.key === key;
    }

    hasCell() {
        return this.cell !== undefined;
    }

    hasPiece() {
        return this.hasCell() && this.cell.hasPiece() && this.cell.piece.belongToCurrentPlayer();
    }

}

class ActionManager {
    constructor() {
        this.actions = [];
        this.current = 0;
        this.last = null;
    }

    execute() {
        if (this.last && this.last.execute()) {
            console.log('Action executed');
            // On supprime toutes les actions "UNDO"
            // Pour reprendre la ligne d'action a partir d'ici
            this.actions.length = this.current;
            this.last.executed = true;
            this.actions.push(this.last);
            this.current = this.current+1;

            if(this.last.canSend()) {
                game.multi.sendAction(this.last.json());
            }
            // On vide l'action pour finir
            this.last = null;
            return this.actions.last();
        }
        return false;
    }

    addAction(action) {
        console.log('Action to add', action);
        this.last = action;
        return this;
    }

    hasNext() {
        return this.current < this.actions.length;
    }

    hasPrevious() {
        return this.current > 0;
    }

    currentAction() {
        return this.actions[this.current - 1];
    }

    startedChain() {
        return this.actions[this.current] && this.actions[this.current].isChain;
    }

    canUndo() {
        return this.currentAction() && this.hasPrevious();
    }

    undo() {
        if (game.multi.allowUndo() &&  this.canUndo()) {
            this.currentAction().undo();
            this.current = this.current - 1;

            if (this.hasPrevious() && this.currentAction().isChain || this.startedChain() ){
                this.undo();
            }
        }
    }

    canRedo() {
        return this.hasNext();
    }

    redo() {
        if(game.multi.allowUndo() && this.canRedo()) {
            this.current = this.current+1;
            this.currentAction().do();

            if (this.hasNext() && this.currentAction().isChain ){
                this.redo();
            }
        }
    }

    jsonToAction (json) {
        const cells = game.board.cells;
        const source = cells[json.source];
        const target = cells[json.target];
        let action = null;
        switch (json.type) {
            case 'rotate' :
                action = new ActionRotate(source,target);
                break;
            case 'move' :
                action = new ActionMove(source,target);
                break;
            default:
                new Action(source,target);
        }
        action.isChain = json.chain;
        action.sent = true;
        return action;
    }

}

class Action {
    constructor(source = null, target = null) {
        this.source = source;
        this.target = target;
        this.isChain = false;
        this.sent = false;
        this.executed = false;
    }

    json () {
        console.log("JSONING", this);
        return {
            source:this.source.id,
            target:this.target.id,
            chain:this.isChain,
            type:this.type()
        }
    }

    canSend() {
        // console.log('can send ? multi = ',game.multi.isActive, 'action sent', this.sent)
        return game.multi.isActive && !this.sent && !this.isChain;
    }

}

class ActionMove extends Action {

    constructor(source, target) {
        super(source, target);
    }

    execute() {
       if( this.isValide() ) {
            this.do();
            return true;
        } else {
            return false;
        }
    }

    do() {
        this.source.piece.move(this.target);
    }

    undo() {
        this.target.piece.move(this.source);
    }


    isValide() {
        return this.sent || this.target.isValidMove(this.source.piece);
    }

    type() {
        return 'move';
    }
}

class ActionRotate extends Action{

    constructor(source, target) {
        super(source, target);
    }

    execute() {
        if (this.isValide()) {
            this.do();
            return true;
        } else {
            return false;
        }
    }

    do() {
        if(this.source.x() == this.target.x()) {
            this.source.piece.orientation.rotateClock();
        } else {
            this.source.piece.orientation.rotateAntiClock();
        }
    }

    undo() {
        if(this.source.x() == this.target.x()) {
            this.source.piece.orientation.rotateAntiClock();
        } else {
            this.source.piece.orientation.rotateClock();
        }
    }

    isValide() {
        return  this.sent || this.source.isValidRotation(this.source.piece);
    }

    type() {
        return 'rotate';
    }
}

class ActionKill extends Action{
    constructor(source, target) {
        super(source, target);
        this.isChain = true;
        this.piece = source.piece;
    }

    execute() {
        if (this.isValide()) {
            this.do();
            return true;
        } else {
            return false;
        }
    }

    do() {
        this.piece.die();
    }

    undo() {
        this.piece.revive(this.source);
    }

    isValide() {
        return this.source.hasPiece();
    }

    type() {
        return 'kill';
    }
}


// class ActionSwitch extends Action{
//     constructor(source, target) {
//         super(source, target);
//         this.isChain = true;
//     }
//
//     execute() {
//         if (this.isValide()) {
//             this.do();
//             return true;
//         } else {
//             return false;
//         }
//     }
//
//     do() {
//         this.source.piece.switch();
//     }
//
//     undo() {
//         this.source.piece.switch();
//     }
//
//     isValide() {
//         return this.source.hasPiece() && this.piece instanceof Laser;
//     }
//
//     type() {
//         return 'switch';
//     }
// }