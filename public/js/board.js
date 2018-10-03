class Board {

    constructor(widht, height) {
        this.width = widht;
        this.height = height;
        this.clickedCell = undefined;
        this.gameIsOver = false;
        this.gameIsWon = false;
        this.text = '';
        this.cells = new Array(this.width * this.height).fill().map( (item, index) => new Cell(index) );
        this.players = new Players();
        this.player = this.players[0];
        this.layout = new Layout(this).classic().import();
        this.rayPather = new RayPather();
        this.commands = new CommandManager();
        this.actions = new ActionManager();
    }

    draw() {
        const backgroundColor = settings.boardColor;
        background(backgroundColor);

        this.playersColorDraw();

        for( let [index, cell] of this.cells.entries() ){
            cell.draw(index);
        }

        for( let cell of this.cells ){

            cell.drawPiece();
        }
        this.rayPather.draw();

        const current = game.board.commands.getCurrentPiece();
        if(current && current.cell.isValidRotation(current)) {
            current.drawRotationTarget();
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

    checkStatus() {
        if (this.isLost()) {
            this.gameIsOver = true;
            this.text='oh no :( you died x_x';
        } else if (this.isWon()) {
            this.gameIsWon = true;
            this.text="Good job ! You got'em all :D";
        }
    }

    isLost() {
        const isLost = false;
        return isLost;
    }

    isWon() {
        const isWon = false;
        return isWon;
    }

    isGameStoped() {
        return this.gameIsWon || this.gameIsOver;
    }
}
