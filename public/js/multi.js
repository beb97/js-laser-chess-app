class Multi {
    constructor() {
        this.isActive = false;
        this.player = null;
        this.undo = false;
        this.socket = io();
        this.socketInit();
    }

    allowUndo() {
        return (!this.isActive) || (this.isActive && this.undo);
    }

    sendGameName(action) {
        this.socket.emit(action,{
            name:$("#gameName").val()
        });
    }

    sendAction(action) {
            this.socket.emit('sendAction',{
                action:action
            });
            // console.log("action sent", action);
    }

    socketInit() {
            this.socket.emit('join',{
                name:$("#gameName").val()
            });

        this.socket.on("game", function(data){
            console.log('serv : ', data.status);
            if(data.status === 'ready') {
                game.reset();
                game.multi.isActive = true;
            } else if (data.status === 'over') {
                game.multi.isActive = false;
                game.reset();
            } else if (data.status === 'created') {
                game.multi.player = game.board.players.list[0];
            } else if (data.status === 'joined') {
                game.multi.player = game.board.players.list[1];
            }
        });

        this.socket.on("addAction", function (data) {
            // console.log('action received: ', data.action.action);
            game.board.actions.addAction(
                game.board.actions.jsonToAction(data.action.action)
            );
        })
    }
}