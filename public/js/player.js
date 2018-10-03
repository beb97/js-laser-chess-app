class Player {

    constructor(name, pColor = 100) {
        this.id = name;
        this.slider = null;
        this.pieces = [];
        this.cells = [];
        this.laser = null;
        this.initialColor = pColor;
        this.lost = false;
        this.createSlider();
        this.setSliderSize();
    }

    addPiece(piece) {
        piece.player = this;
        if(piece instanceof Laser) {
            this.laser = piece;
        }
        this.pieces.push(piece);
    }

    get color() {
        return color('hsl('+this.getSliderColor()+',100%,35%)')
    }

    getColorAlpha(alpha = 255) {
        let newColor = color(this.color.toString());
        newColor.setAlpha(alpha);
        return newColor;
    }

    createSlider() {
        this.slider = createSlider(0, 255, this.initialColor);
        this.slider.parent('slider'+ (1+this.id));
        return this;
    }

    getSliderColor() {
        return this.slider.value();
    }

    setSliderSize() {
        this.slider.size( $('#p'+ (1+this.id) ).width() - 40 );
    }

    isCurrent() {
        return this.id === game.board.players.current.id;
    }

}

class Players {
    constructor() {
        this.list = [new Player(0, 100),
            new Player(1, 0)];
        this.current = this.list[0];
    }

    nextPlayer() {
        this.current = (this.current.id === 0) ? this.list[1] : this.list[0];
        return this;
    }

}