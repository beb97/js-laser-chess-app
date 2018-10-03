class Multi {
    constructor() {
        this.isActive = false;
        this.player = null;
        this.undo = false;
        // this.socket = io.connect('http://localhost:3000');
        this.socket = io();
        this.socketInit(this.socket);
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

    socketInit(socket) {
        socket.emit('join',{
            name:$("#gameName").val()
        });

        socket.on('connect_error', () => {
            console.log('connection_error');
            socket.disconnect();
        });

        socket.on('disconnect', () => {
            console.log('Disconnect from server');
        });

        socket.on("game", (data) => {
            console.log('serv : ', data.status);
            if(data.status === 'ready') {
                game.reset();
                game.multi.isActive = true;
            } else if (data.status === 'over') {
                game.multi.isActive = false;
                game.reset();
            } else if (data.status === 'created') {
                game.multi.player = game.board.players.list[0];
                $('#pname1').text(' (me)');
                $('#pname2').text('');
            } else if (data.status === 'joined') {
                game.multi.player = game.board.players.list[1];
                $('#pname2').text(' (me)');
                $('#pname1').text('');
            }
            game.prompt('game '+data.status);
        });

        socket.on("addAction", function (data) {
            // console.log('action received: ', data.action.action);
            game.board.actions.addAction(
                game.board.actions.jsonToAction(data.action.action)
            );
        })
    }
}