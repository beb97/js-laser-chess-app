class Ray {

    constructor(cell, from = new Orientation(null), to = new Orientation()) {
        this.cell = cell;
        this.from = from;
        this.to = to;
    }

    draw() {
        const size = game.settings.cellSize;
        const center = this.cell.getCenter();
        push();
        stroke(settings.laserColor);
        strokeWeight(settings.laserStroke);
        translate(center.x, center.y);

        if( this.from.value != null) {
            line(0 + (size/2) * this.from.x(),
                 0 + (size/2) * this.from.y(),
                0, 0);
        }

        if( this.to.value != null) {
            line(0, 0,
                0 + size/2 * this.to.x(),
                0 + size/2 * this.to.y());
            pop();
        }
    }

    react() {
        this.cell.react(this);
        return this;
    }

    block() {
        this.to = new Orientation(null);
    }

    isBlocked() {
        return this.to.value === null;
    }

}
