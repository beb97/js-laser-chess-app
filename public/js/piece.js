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

    kill(ray) {
        game.board.actions.addAction(new ActionKill(this.cell, null));
        ray.block();
        game.board.effects.push(new Effect(this.cell, 3*fps, this.player.color));
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
        let center = this.cell.getCenter();
        return center;
    }

    setDrawAttributes() {
        const center = this.getPieceCenter();
        const borderColor = (this.cell === game.board.getCurrentCell() ) ? settings.pieceStrokeColorHover : settings.pieceStrokeColor;
        translate(center.x, center.y);

        strokeWeight(settings.pieceStroke);
        stroke(borderColor);
        fill(this.cell.piece.player.color);
        rotate(this.orientation.value);
    }

    drawClassic() {
        push();
        this.setDrawAttributes();
        this.draw();
        pop();
    }


    drawRotationTarget() {
        const top = game.board.get( this.cell.x(), this.cell.y() - 2 );
        const bot = game.board.get( this.cell.x(), this.cell.y() + 2 );
        const left = game.board.get( this.cell.x() - 2, this.cell.y() );
        const right = game.board.get( this.cell.x() + 2, this.cell.y() );

        const cells = [top, left, bot, right];

        let angle = 90;
        for (let cell of cells) {;
            if(cell) {

                push();
                cell.drawMoveTarget();
                const center = cell.getCenter();
                stroke('red');
                strokeWeight(3);
                translate(center.x, center.y);
                rotate(this.orientation.value + angle);
                this.draw()
                pop();
            }
            angle +=180;
        }
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
        this.on = true;
    }

    react() {
        this.kill(ray);
    }

    draw() {
        let size = settings.cellSize;
        ellipse(0,0, size);
        line(0, 0, (size/3), 0);
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

    // switch() {
    //     this.on = !this.on;
    // }

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
                this.kill(ray);
        }
    }

    draw() {
        let length = settings.cellSize/ 1.2 / 2;
        triangle( - length, - length, -length, length, length, length);
    }

}

class King extends Piece {

    constructor(cell, orientation = new Orientation(), player) {
        super(cell, orientation, player);
    }

    react(ray) {
        switch (this.touchedFrom(ray)) {
            default:
                this.kill(ray);
        }
    }

    kill(ray) {
        super.kill(ray);
        this.player.lost = true;
        game.board.isOver();
    }

    draw() {
        let size = settings.cellSize;
        this.star(0,0, size/3, size/2.1, 6);
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
                this.kill(ray);
        }
        return ray;
    }

    draw() {
        let size = settings.cellSize / 1.2;
        rectMode(CENTER);
        const angleSize = size/2;
        rect( 0, 0, size, size,angleSize , 0, 0, angleSize);
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
        rectMode(CENTER);
        rotate(45);
        rect( 0,0, size, size/4);
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