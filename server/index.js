const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let players = [];
let playerPositions = [];

server.on('connection', (ws) => {
    console.log(`A player connected`);
    players.push(ws);

    if (players.length === 2) {
        players[0].send(JSON.stringify({ type: 'start', message: 'Player 1 connected. Waiting for Player 2...' }));
        players[1].send(JSON.stringify({ type: 'start', message: 'Player 2 connected. Game starting...' }));
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

                players.forEach(player => {
                    player.send(JSON.stringify({
                        type: 'gameStart',
                        message: 'Game started!'
                    }));
                });
            }
        }
    });

    ws.on('close', () => {
        console.log('A player disconnected');
        players = players.filter(player => player !== ws);
        playerPositions = playerPositions.slice(0, players.length);
        players.forEach(player => {
            player.send(JSON.stringify({ type: 'end', message: 'The other player disconnected. Game over.' }));
        });
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
