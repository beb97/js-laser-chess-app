class Layout {
    constructor(board) {
        this.board = board;
    }

    import() {
        for (let player of this.board.players.list) {
            for (let currentPiece of player.pieces) {
                currentPiece.cell.piece = currentPiece;
            }

            this.setPlayerCells();
            for (let currentCell of player.cells) {
                this.board.cells[currentCell].player = player;
            }

        }
        return this;
    }

    setPlayerCells() {
        let player = this.board.players.list[0];
        player.cells = [0, 8, 10,20,30,40,50,60,70,78];

        player = this.board.players.list[1];
        player.cells = [1, 9,19,29,39,49,59,69,71,79];

    }

    classic() {
        this.reset();
        const cells = this.board.cells;
        let player = this.board.players.list[0];

        player.addPiece(new Laser(cells[0], new Orientation(90) ));
        player.addPiece(new Guard(cells[4], new Orientation(90) ));
        player.addPiece(new King(cells[5], new Orientation(90) ));
        player.addPiece(new Guard(cells[6], new Orientation(90) ));
        player.addPiece(new Mirror(cells[7], new Orientation(90) ));

        player.addPiece(new Mirror(cells[12], new Orientation(180) ));

        player.addPiece(new Mirror(cells[30], new Orientation(0) ));
        player.addPiece(new DoubleMirror(cells[34], new Orientation(0) ));
        player.addPiece(new DoubleMirror(cells[35], new Orientation(90) ));
        player.addPiece(new Mirror(cells[37], new Orientation(90) ));

        player.addPiece(new Mirror(cells[40], new Orientation(90) ));
        player.addPiece(new Mirror(cells[47], new Orientation(0) ));

        player.addPiece(new Mirror(cells[56], new Orientation(90) ));


        player = this.board.players.list[1];

        player.addPiece(new Mirror(cells[23], new Orientation(-90) ));

        player.addPiece(new Mirror(cells[39], new Orientation(-90) ));
        player.addPiece(new Mirror(cells[32], new Orientation(180) ));

        player.addPiece(new Mirror(cells[49], new Orientation(180) ));
        player.addPiece(new DoubleMirror(cells[45], new Orientation(0) ));
        player.addPiece(new DoubleMirror(cells[44], new Orientation(90) ));
        player.addPiece(new Mirror(cells[42], new Orientation(-90) ));

        player.addPiece(new Mirror(cells[67], new Orientation(0) ));

        player.addPiece(new Laser(cells[79], new Orientation(-90) ));
        player.addPiece(new Guard(cells[75], new Orientation(-90) ));
        player.addPiece(new King(cells[74], new Orientation(-90) ));
        player.addPiece(new Guard(cells[73], new Orientation(-90) ));
        player.addPiece(new Mirror(cells[72], new Orientation(-90) ));

        return this;
    }

    clear() {
        for (let cell of this.board.cells) {
            cell.piece = null;
        }
    }

    reset() {
        this.map = [];
        this.clear();
        return this;
    }
}
