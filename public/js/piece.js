class Piece {

    constructor(cell, orientation = new Orientation(), player = null) {
        this.cell = cell;
        this.orientation = orientation;
        this.player = player;
    }

    react(ray) {
        return ray;
    }

    die() {
        this.cell.piece = null;
        this.cell = null;
    }

    revive(newCell) {
        this.cell = newCell;
        this.cell.piece = this;
    }

    kill() {
        game.board.actions.addAction(new ActionKill(this.cell, null));
    }

    touchedFrom(ray) {
        return this.orientation.sub(ray.from);
    }

    move(newCell) {
        if(newCell.hasPiece()) {
            newCell.piece.cell = this.cell;
            this.cell.piece = newCell.piece;
        } else {
            this.cell.piece = null;
        }
        this.cell = newCell;
        this.cell.piece = this;
    }

    getPieceCenter() {
        let center;
        if(this.isMoving() && game.board.currentAction == 'MOVE' && this.belongToCurrentPlayer() ) {
            center = this.snap(settings.cellSize / 3);
        } else {
            center = this.cell.getCenter()
        }
        return center;
    }

    snap(distanceRequired) {
        let center = createVector(mouseX, mouseY);
        const closestCell = game.board.getCurrentCell();
        if (closestCell) {
            const distanceFromClosestCell = closestCell.getCenter().dist(createVector(mouseX, mouseY));
            if( distanceFromClosestCell < distanceRequired ) {
                center = closestCell.getCenter();
            }

        }
        return center;
    }

    isMoving() {
        return this === game.board.movingPiece;
    }

    setDrawAttributes() {
        const center = this.getPieceCenter();
        const borderColor = (this.cell === game.board.getCurrentCell() ) ? settings.pieceStrokeColorHover : settings.pieceStrokeColor;
        let extraAngle = 0;
        translate(center.x, center.y);
        // if(this.isMoving() && game.board.currentAction == 'ROTATE' && this.cell !== game.board.getCurrentCell()) {
        //     extraAngle = game.mouseCoord().sub(this.cell.getCenter()).heading();
        //     console.log(extraAngle);
        // }
        strokeWeight(settings.pieceStroke);
        stroke(borderColor);
        fill(this.cell.piece.player.color);
        rotate(this.orientation.value);
        // rotate(this.orientation.value + extraAngle);


    }

    isMovable() {
        return true;
    }

    isSwapable() {
        return true;
    }

    isTurnable() {
        return true;
    }

    canSwap() {
        return false;
    }

    belongToCurrentPlayer() {
        return this.player === game.board.players.current;
    }
}

class Laser extends Piece {

    constructor(cell, orientation = new Orientation()) {
        super(cell, orientation);
    }

    react() {
        this.kill();
    }

    draw() {
        let size = settings.cellSize;

        push();
        this.setDrawAttributes();
        ellipse(0,0, size);
        line(0, 0, (size/3), 0);
        pop();
    }

    initRay() {
        return new Ray(this.cell, new Orientation(null), this.orientation.copy());
    }

    isMovable() {
        return false;
    }

    isSwapable() {
        return false;
    }

}

class Mirror extends Piece {

    constructor(cell, orientation = new Orientation()) {
        super(cell, orientation);
    }

    react(ray) {
        switch (this.touchedFrom(ray)) {
        case 0:
            ray.to.rotateClock();
            break;
        case 90:
            ray.to.rotateAntiClock();
            break;
        default:
            this.kill();
        }
    }

    draw() {
        let size = settings.cellSize / 1.2;
        let length = size / 2;
        push();
        this.setDrawAttributes();
        triangle( - length, - length, -length, length, length, length);
        pop();

    }
}

class King extends Piece {

    constructor(cell, orientation = new Orientation(), player) {
        super(cell, orientation, player);
    }

    react(ray) {
        switch (this.touchedFrom(ray)) {
            default:
                this.kill();
        }
    }

    draw() {
        let size = settings.cellSize;
        push();
        this.setDrawAttributes();
        this.star(0,0, size/3, size/2.1, 6);

        pop();
    }

    star(x, y, radius1, radius2, npoints) {
        angleMode(RADIANS);
        let angle = TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let a = 0; a < TWO_PI; a += angle) {
            let sx = x + cos(a) * radius2;
            let sy = y + sin(a) * radius2;
            vertex(sx, sy);
            sx = x + cos(a + halfAngle) * radius1;
            sy = y + sin(a + halfAngle) * radius1;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        angleMode(DEGREES);
    }
}

class Guard extends Piece {

    constructor(cell, orientation = new Orientation()) {
        super(cell, orientation);
    }

    react(ray) {

        switch (this.touchedFrom(ray)) {
            case 0:
                ray.block();
                break;
            default:
                this.kill();
        }
        return ray;
    }

    draw() {
        let size = settings.cellSize / 1.2;
        push();
        this.setDrawAttributes();
        rectMode(CENTER);
        const angleSize = size/2;
        rect( 0, 0, size, size,angleSize , 0, 0, angleSize);

        pop();
    }
}


class DoubleMirror extends Piece {

    constructor(cell, orientation = new Orientation()) {
        super(cell, orientation);
    }

    react(ray) {

        switch (this.touchedFrom(ray)) {
            case 0:
            case 180:
                ray.to.rotateClock();
                break;
            case 90:
            case 270:
                ray.to.rotateAntiClock();
                break;
            default:
                ray.block();

        }
        return ray;
    }

    draw() {
        let size = settings.cellSize;
        push();
        this.setDrawAttributes();
        rectMode(CENTER);
        rotate(45);
        rect( 0,0, size, size/4);
        pop();
    }

    canSwap() {
        return true;
    }

}

class Orientation {

    constructor(value) {
        value = typeof value !== 'undefined' ? value : 0;
        this.values = { "TOP":90, "RIGHT":0, "BOT":270, "LEFT":180 };
        this.value = this.setValue(value);
    }

    getOpposite() {
        return new Orientation(this.value + 180);
    }

    rotateClock(angle = 90) {
        this.setValue( this.value + angle );
        return this;
    }

    rotateAntiClock(angle = 90) {
        this.rotateClock(-angle);
        return this;
    }

    x() {
        return round( cos(this.value), 2 );
    }

    y() {
        return round( sin(this.value), 2 );
    }

    copy() {
        return new Orientation(this.value);
    }

    setValue(newValue) {
        this.value = this.moduloValue(newValue);
        return this.value;
    }

    moduloValue(newValue) {
        if (newValue !== null ) {
            newValue = newValue % 360;
            if (newValue < 0) {
                newValue = 360 + newValue;
            }
        }
        return newValue;
    }

    sub(pOrientation) {
        return this.moduloValue(this.value - pOrientation.value);
    }
}