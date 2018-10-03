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
            game:$("#gameName").val(),
            player:$("#playerName").val()
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
            name:$("#gameName").val(),
            player:$("#playerName").val()
        });

        socket.on('connect_error', () => {
            console.log('connection_error');
            socket.disconnect();
        });

        socket.on('disconnect', () => {
            console.log('Disconnect from server');
        });

        socket.on("game", (data) => {
            console.log('serv : ', data);
            if(data.status === 'ready') {
                game.reset();
                game.multi.isActive = true;
                $('#pname1').text(data.p1);
                $('#pname2').text(data.p2);
                game.board.players.list[0].name = data.p1;
                game.board.players.list[1].name = data.p2;
            } else if (data.status === 'over') {
                game.multi.isActive = false;
                $('#pname1').text('');
                $('#pname2').text('');
                game.reset();
            } else if (data.status === 'created') {
                game.multi.player = game.board.players.list[0];
                $('#pname1').text(data.p1);
            } else if (data.status === 'joined') {
                game.multi.player = game.board.players.list[1];
                $('#pname1').text(data.p1);
                $('#pname2').text(data.p2);
                game.board.players.list[0].name = data.p1;
                game.board.players.list[1].name = data.p2;
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