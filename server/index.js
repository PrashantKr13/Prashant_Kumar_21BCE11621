const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let players = [];
let playerPositions = [];
let currentPlayerIndex = 0;

//connection method which is called when a new connection connects to the server
server.on('connection', (ws) => {
    console.log(`A player connected`);
    players.push(ws);

    if (players.length === 2) {
        players[currentPlayerIndex].send(JSON.stringify({ type: 'yourTurn', message: 'It\'s your turn' }));
        players[1 - currentPlayerIndex].send(JSON.stringify({ type: 'waitTurn', message: 'Waiting for opponent\'s move' }));
    }

    ws.on('message', (message, isBinary) => {
        const parsedMessage = isBinary ? message : message.toString();
        const data = JSON.parse(parsedMessage);
        console.log('Received:', data);

        if (data.type === 'userMessage') {
            playerPositions.push(data.message);
            if (playerPositions.length === 2) {
                players[0].send(JSON.stringify({
                    type: 'enemyPositions',
                    message: playerPositions[1]
                }));
                players[1].send(JSON.stringify({
                    type: 'enemyPositions',
                    message: playerPositions[0]
                }));
                
                //As soon as the two players are connected and the data is shared, it starts the game for both the players
                players.forEach(player => {
                    player.send(JSON.stringify({
                        type: 'gameStart',
                        message: 'Game started!'
                    }));
                });
            }
        } if (data.type === 'move') {
            players.forEach(player => {
                if (player !== ws) {
                    player.send(JSON.stringify({
                        type: 'move',
                        index: data.index
                    }));
                }
            });
            currentPlayerIndex = 1 - currentPlayerIndex;
            players[currentPlayerIndex].send(JSON.stringify({ type: 'yourTurn', message: 'It\'s your turn' }));
            players[1 - currentPlayerIndex].send(JSON.stringify({ type: 'waitTurn', message: 'Waiting for opponent\'s move' }));
        }
        if (data.type === 'gameOver') {
            const winnerMessage = 'YOU WON';
            const loserMessage = 'YOU LOSE';
            console.log("Game Over")
            players.forEach((player, index) => {
                if (player === ws) {
                    player.send(JSON.stringify({ type: 'gameResult', message: winnerMessage }));
                } else {
                    player.send(JSON.stringify({ type: 'gameResult', message: loserMessage }));
                }
            });
        }
    });

    //for handling disconnection requests
    ws.on('close', () => {
        console.log('A player disconnected');
        const playerIndex = players.indexOf(ws);
        players.splice(playerIndex, 1);
        playerPositions.splice(playerIndex, 1);
        players.forEach(player => {
            player.send(JSON.stringify({ type: 'end', message: 'The other player disconnected. Game over.' }));
        });
    });
});

console.log('Server is running');
