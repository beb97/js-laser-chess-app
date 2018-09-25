class RayPather {

    constructor() {
        this.rayPaths = [];
    }

    draw() {
        this.rayPaths = this.generateAllRayPaths(this.getLasers());
        for( let rayPath of this.rayPaths ){
            rayPath.draw();
        }
    }

    getLasers() {
        let laserCells = [];
        const cells = game.board.cells;
        for( let cell of cells ){
            if(cell.piece && cell.piece instanceof Laser) {
                laserCells.push(cell);
            }
        }
        return laserCells;
    }

    generateAllRayPaths(laserCells) {
        let rayPaths = [];
        for( let laserCell of laserCells ){
            rayPaths.push(new RayPath(laserCell));
        }
        return rayPaths;
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
