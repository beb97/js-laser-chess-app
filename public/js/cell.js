class Cell {

    constructor(id) {
        this.id = id;
        this.piece = null;
        this.player = null;
    }

    draw() {
        this.drawBackGround();
    }

    drawBackGround() {
        const corner = this.getTopLeftCorner();
        const backGroundColor = this.getBackgroundColor();
        fill(backGroundColor);
        const borderColor = (this === game.board.getCurrentCell()) ? settings.cellStrokeColorHover: settings.cellStrokeColor;
        const borderWeight = (this === game.board.getCurrentCell()) ? settings.cellStrokeHover : settings.cellStroke;
        stroke(borderColor);
        strokeWeight(borderWeight);
        rect(corner.x, corner.y, settings.cellSize, settings.cellSize);
    }

    getBackgroundColor() {
        let backgroundColor = (this.player !== null) ? this.player.getColorAlpha(settings.cellColorPlayerAlpha) : settings.cellColor;
        let movingPiece = game.board.commands.getCurrentPiece();
        if(movingPiece && this.isValidMove(movingPiece)) {
            backgroundColor = settings.cellColorTarget;
        }
        return backgroundColor;
    }

    drawPiece() {
        if (  this.hasPiece() ) {
            this.piece.drawClassic(this.getCenter());
        }
    }

    getTopLeftCorner() {
        return createVector(this.x() * settings.cellSize, this.y() * settings.cellSize);
    }

    getCenter() {
        const corner = this.getTopLeftCorner();
        return createVector(corner.x + settings.cellSize / 2, corner.y + settings.cellSize / 2);
    }

    react(ray) {
        if(this.hasPiece()) {
            return this.piece.react(ray);
        } else {
            return ray;
        }
    }

    x() {
        return this.id % settings.boardwidth;
    }

    y() {
        return Math.trunc( this.id / settings.boardwidth);
    }

    getCoord() {
        return createVector(this.x(), this.y());
    }

    hasPiece() {
        return this.piece !== null;
    }

    isNeighboor(cell, distance = 1) {
        if (cell === this) {return false}
        return ( distance >= this.getCoord().dist( cell.getCoord())  );
    }

    direct () {
        return 1;
    }

    diagonal() {
        return 1.5;
    }

    isValidGenerique(piece) {
        if(!piece.player.isCurrent()) {return false;}
        if(game.multi.isActive && (!game.multi.player.isCurrent())) {return false;}

        return true;
    }



    isValidMove(piece) {
        if(!this.isValidGenerique(piece)) {return false;}
        if(!piece.isMovable()) {return false;}
        if(!piece.cell.isNeighboor(this, 1.5)) {return false;}
        if(!piece.canSwap() && this.hasPiece()) {return false;}
        if(piece.canSwap() && this.hasPiece() && !this.piece.isSwapable()) {return false;}
        if(this.player !== null && this.player !== piece.player) {return false;}

        return true;
    }

    isValidRotation(piece) {
        if(!this.isValidGenerique(piece)) {return false;}
        if(!piece.isTurnable()) {return false;}

        return true;
    }

}
