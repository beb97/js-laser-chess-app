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
        // return this.command(1).piece;
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

            } else if( this.command(1).isMouse(RIGHT) && this.command(1).hasPiece()) {

                game.board.actions.addAction(new ActionRotate(this.command(1).cell, this.command(1).cell));
                this.clear();

            } else if( !this.command(1).hasCell() ) {
                this.clear();
            } else if ( !this.command(1).hasPiece() ) {
                this.clear();
            }

        } else if(this.hasCommands(2)) {

            if( this.command(1).isMouse(LEFT) && this.command(1).hasPiece()
                && this.command(2).isMouse(LEFT) && this.command(2).hasCell() ) {

                game.board.actions.addAction( new ActionMove(this.command(1).cell,this.command(2).cell) );
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
        return this.hasCell() && this.cell.hasPiece();
    }

}

class ActionManager {
    constructor() {
        this.actions = [];
        this.current = 0;
    }

    addAction(action) {
        if (action.execute()) {
            console.log('Action executed');
            // On supprime toutes les actions "UNDO"
            // Pour reprendre la ligne d'action a partir d'ici
            this.actions.length = this.current;
            this.actions.push(action);
            this.current = this.current+1;

            if(action.canSend()) {
                // console.log('sending this action', action.type())
                game.multi.sendAction(action.json());
            }
        }
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
        const source = cells[json.action.source];
        const target = cells[json.action.target];
        let action = null;
        switch (json.action.type) {
            case 'rotate' :
                action = new ActionRotate(source,target);
                break;
            case 'move' :
                action = new ActionMove(source,target);
                break;
            default:
                new Action(source,target);
        }
        action.isChain = json.action.chain;
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
    }

    json () {
        // console.log("JSONING");
        return {
            source:this.source.index || '',
            target:this.target.index || '' ,
            chain:this.isChain,
            type:this.type()
        }
    }

    nextPlayer() {
        game.board.players.nextPlayer();
    }

    canSend() {
        // console.log('can send ? multi = ',game.multi.isActive, 'action sent', this.sent)
        return game.multi.isActive && !this.sent;
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
        this.nextPlayer();
    }

    undo() {
        this.target.piece.move(this.source);
        this.nextPlayer();
    }


    isValide() {
        return this.target.isValidMove(this.source.piece);
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
        this.source.piece.orientation.rotateClock();
        this.nextPlayer();
    }

    undo() {
        this.source.piece.orientation.rotateAntiClock();
        this.nextPlayer();
    }

    isValide() {
        return this.source.isValidRotation(this.source.piece);
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