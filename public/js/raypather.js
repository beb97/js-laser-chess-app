class RayPather {

    constructor() {
        this.rayPaths = [];
    }

    draw() {
        for( let rayPath of this.rayPaths ){
            if(rayPath.laser.on) {
                rayPath.draw();
            }
        }
    }

    getLasers() {
        return game.board.players.current.laser.cell;
    }

    generateAllRayPaths(laserCell) {
        let rayPaths = [];
        rayPaths.push(new RayPath(laserCell));
        return rayPaths;
    }

    update() {
        this.rayPaths = this.generateAllRayPaths(this.getLasers());
    }

}

class RayPath {
    constructor(cell) {
        this.laser = cell.piece;
        this.rayPath = [];
        this.build();
    }

    addRay(ray) {
        this.rayPath.push(ray);
    }

    build() {
        this.addRay(this.laser.initRay());
        while(this.hasNextCell()) {
            this.addRay(this.generateRay());
        }
    }

    generateRay() {
        return new Ray(
            this.nextCell(),
            this.rayPath.last().to.getOpposite(),
            this.rayPath.last().to.copy()
        ).react();
    }

    hasNextCell() {
        return this.rayPath.last()
            && !this.rayPath.last().isBlocked()
            && this.nextCell() !== undefined;
    }

    nextCell() {
        const currentRay = this.rayPath.last();
        return game.board.get(
            currentRay.cell.x() + currentRay.to.x(),
            currentRay.cell.y() + currentRay.to.y());
    }


    draw() {
        for( let ray of this.rayPath ){
            ray.draw();
        }
    }
}
