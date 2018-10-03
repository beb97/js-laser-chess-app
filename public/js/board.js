class Board {

    constructor(widht, height) {
        this.over = false;
        this.width = widht;
        this.height = height;
        this.clickedCell = undefined;
        this.gameIsOver = false;
        this.gameIsWon = false;
        this.text = '';
        // this.clock = new Clock();
        this.cells = new Array(this.width * this.height).fill().map( (item, index) => new Cell(index) );
        this.players = new Players();
        this.player = this.players[0];
        this.layout = new Layout(this).classic().import();
        this.rayPather = new RayPather();
        this.commands = new CommandManager();
        this.actions = new ActionManager();
        this.effects = [];
    }

    draw() {
        const backgroundColor = settings.boardColor;
        background(backgroundColor);

        const current = game.board.commands.getCurrentPiece();
        this.playersColorDraw();

        for( let [index, cell] of this.cells.entries() ){
            cell.draw(index);
        }

        if(current) {
            for( let cell of this.cells ){
                if(cell.isValidMove(current)) {
                    cell.drawMoveTarget();
                }
            }
        }

        this.rayPather.draw();

        for( let cell of this.cells ){
            cell.drawPiece();
        }

        for( let [index, effect] of this.effects.entries() ){
            effect.draw();
            if(effect.isOver()) {
                this.effects.splice(index,1);
            }
        }



        if(current && current.cell.isValidRotation(current)) {
            current.drawRotationTarget();
        }
    }

    update() {
        if(!this.over) {

            const action = this.actions.execute();
            if(action && !action.isChain) {
                // this draw laser
                this.rayPather.update();
                this.players.nextPlayer();
            }
        }
    }

    playersColorDraw() {

        $('#logo').css('color', this.players.current.color.toString());
        $('#title').css('color', this.players.current.color.toString());

        if(this.players.current === this.players.list[0]) {
            $('#p1').css('background-color', this.players.list[0].color.toString());
            $('#p2').css('background-color',  this.players.list[1].getColorAlpha(50));
        } else {
            $('#p2').css('background-color', this.players.list[1].color.toString());
            $('#p1').css('background-color',  this.players.list[0].getColorAlpha(50));
        }
    }

    get(x,y) {
        if (this.xIsValide(x) && this.yIsValide(y)) {
            return this.cells[x + y*this.width];
        } else {
            return undefined;
        }
    }

    xIsValide(x) {
        return x>=0 && x<this.width;
    }

    yIsValide(y) {
        return y>=0 && y<this.height;
    }

    getCurrentCell() {
        return  this.getCellFromCoord(game.mouseCoord());
    }

    getCellFromCoord(coord) {
        const x = Math.floor((coord.x) / game.settings.cellSize);
        const y = Math.floor((coord.y) / game.settings.cellSize);
        return  this.get(x, y);
    }

    isOver() {
        this.over = true;
        for (let player of this.players.list) {
            if(player.lost) {
                for (let piece of player.pieces) {
                    if(piece.cell) {
                        game.board.effects.push(new Effect(piece.cell, fps*5, piece.player.color));
                        piece.cell.piece = null;
                    }
                }
                player.laser.on = false;
                player.pieces.length = 0;
                game.prompt(player.name + ' DEFETEAD');
            }
        }
    }
}

class Effect {
    constructor(cell, duration = 2*fps, color) {
        this.cell = cell;
        this.duration = duration;
        this.points = [];
        this.initPoint();
        this.color = color;

    }

    initPoint() {
        var x;
        var y;
        var z;
        var c;
        for(var i=0; i<40; i++) {
            x = random(-1,1);
            y = random(-1,1);
            z = random(0.1,10);
            c = random(20,2);
            this.points.push(new Point(x,y,z,c));
        }
    }

    draw() {
        const center = this.cell.getCenter();
        push();
        translate(center.x, center.y);
        for(let point of this.points) {
            fill(this.color);
            ellipse(point.x, point.y, point.size);
            point.update();

        }
        pop();
        this.update();
    }

    update() {
        this.duration--;
    }

    isOver() {
        return this.duration < 0;
    }
}


class Point {
    constructor(x,y,z,s) {
        this.vector = createVector(x,y);
        this.velocity = z;
        this.size = s;
    }

    get x() {
        return this.vector.x;
    }

    get y() {
        return this.vector.y;
    }

    update() {
        this.vector.setMag(this.vector.mag() + this.velocity);
        this.velocity+=0.1;
        if (this.size > 0) {
            this.size-= 0.2;
        }
    }
}