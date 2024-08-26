let socket;
let count = 5
let isMyTurn
function createConnection(e) {
    e.preventDefault();
    const inputPositions = document.getElementById("startingPlaces").value;
    //socket initialization and server declaration to declare which server the client will make requests
    socket = new WebSocket('ws://localhost:3000');
    let enemyPositions = "";
    let gameStarted = false;
    let inputValues = [];

    //regex to check that the positions entered by the user are valid
    let regex = /^(?=.*\bP1\b)(?=.*\bP2\b)(?=.*\bP3\b)(?=.*\bH1\b)(?=.*\bH2\b)(?:P[1-3]\s|H[1-3]\s){4}(P[1-3]|H[1-3])$|^(?=.*\bP1\b)(?=.*\bP2\b)(?=.*\bH1\b)(?=.*\bH2\b)(?=.*\bH3\b)(?:P[1-3]\s|H[1-3]\s){4}(P[1-3]|H[1-3])$/;
    if (regex.test(inputPositions) == false) {
        alert("Please enter a valid input");
        return;
    }
    inputValues = inputPositions.split(' ');
    let enemyValues = [];

    // open method of socket to create a new socket connection
    socket.addEventListener('open', function (event) {
        document.getElementById('status').textContent = 'Waiting for Opponent...';
        socket.send(JSON.stringify({ type: 'userMessage', message: inputPositions }));
    });

    // message method to check for different message requests
    socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);

        if (data.type === 'enemyPositions') {
            enemyPositions = data.message;
            enemyValues = enemyPositions.split(' ');
            if (gameStarted) {
                startGame(inputValues, enemyValues);
            }
        }

        if (data.type === 'gameStart') {
            gameStarted = true;
            if (enemyPositions) {
                startGame(inputValues, enemyValues);
            }
        }
        if (data.type === 'move') {
            makeMove(data.index, false);
        }
        if (data.type === 'gameResult') {
            document.getElementById("status").style.display = "block";
            document.getElementById('status').textContent = data.message;
            disableGameBoard();
        }
        if (data.type === 'yourTurn') {
            isMyTurn = true;
            document.getElementById("status").innerText = "Your Turn";
            enableGameBoard();
        } else if (data.type === 'waitTurn') {
            document.getElementById("status").innerText = "Waiting for Opponent's Turn";
            isMyTurn = false;
            disableGameBoard();
        }
    });
}

//disable board on opponent's turn and on game over
function disableGameBoard() {
    document.getElementById('grid-container').style.pointerEvents = 'none';
    document.getElementById('grid-container').style.opacity = '0.5';
    document.getElementById('button-container').style.pointerEvents = 'none';
    document.getElementById('button-container').style.opacity = '0.5';
}
//enable board on player's turn
function enableGameBoard() {
    document.getElementById('grid-container').style.pointerEvents = 'auto';
    document.getElementById('grid-container').style.opacity = '1';
    document.getElementById('button-container').style.pointerEvents = 'auto';
    document.getElementById('button-container').style.opacity = '1';
}

function sendMove(index) {
    socket.send(JSON.stringify({ type: 'move', index: index }));
}
function startGame(inputValues, enemyValues) {
    createBoard(inputValues, enemyValues);
}

let matrix
function makeMove(indexes) {
    console.log("enemy made the following move: " + indexes);
    let idiff = indexes[0] - indexes[2];
    let jdiff = indexes[1] - indexes[3];
    if (idiff === 2 && jdiff === 2) {
        matrix[Number(indexes[2]) + 1][Number(indexes[3] + 1)] = "";
        document.getElementById(`${Number(indexes[2]) + 1}${Number(indexes[3]) + 1}`).innerText = ""
    } else if (idiff === 2 && jdiff === -2) {
        matrix[Number(indexes[2]) + 1][indexes[3] - 1] = "";
        document.getElementById(`${Number(indexes[2]) + 1}${indexes[3] - 1}`).innerText = ""
    } else if (idiff === -2 && jdiff === -2) {
        matrix[indexes[2] - 1][indexes[3] - 1] = "";
        document.getElementById(`${indexes[2] - 1}${indexes[3] - 1}`).innerText = ""
    } else if (idiff === -2 && jdiff === 2) {
        matrix[indexes[2] - 1][Number(indexes[3]) + 1] = "";
        document.getElementById(`${indexes[2] - 1}${Number(indexes[3]) + 1}`).innerText = ""
    } else if (idiff === 2 && jdiff === 0) {
        matrix[Number(indexes[2]) + 1][indexes[3]] = "";
        document.getElementById(`${Number(indexes[2]) + 1}${indexes[3]}`).innerText = ""
    } else if (idiff === -2 && jdiff === 0) {
        matrix[indexes[2] - 1][indexes[3]] = "";
        document.getElementById(`${indexes[2] - 1}${indexes[3]}`).innerText = ""
    } else if (idiff === 0 && jdiff === 2) {
        matrix[indexes[2]][Number(indexes[3]) + 1] = "";
        document.getElementById(`${indexes[2]}${indexes[3] - 1}`).innerText = ""
    } else if (idiff === 0 && jdiff === -2) {
        matrix[indexes[2]][indexes[3] - 1] = "";
        document.getElementById(`${indexes[2]}${indexes[3] - 1}`).innerText = ""
    }
    matrix[indexes[2]][indexes[3]] = matrix[indexes[0]][indexes[1]];
    matrix[indexes[0]][indexes[1]] = "";
    document.getElementById(`${indexes[0]}${indexes[1]}`).innerText = ""
    document.getElementById(`${indexes[2]}${indexes[3]}`).innerText = matrix[indexes[2]][indexes[3]]
}

function winCall() {
    socket.send(JSON.stringify({ type: 'gameOver', winner: true }));
}

//function called after successful connection to create the board using opponent's input and player inputs
function createBoard(inputValues, enemyValues) {

    const buttons = [
        { label: 'Button 1', class: 'button button1' },
        { label: 'Button 2', class: 'button button2' },
        { label: 'Button 3', class: 'button button3' },
        { label: 'Button 4', class: 'button button4' }
    ];
    const h3buttons = [
        { label: 'Button 1', class: 'button button1' },
        { label: 'Button 2', class: 'button button2' },
        { label: 'Button 3', class: 'button button3' },
        { label: 'Button 4', class: 'button button4' },
        { label: 'Button 5', class: 'button button5' },
        { label: 'Button 6', class: 'button button6' },
        { label: 'Button 7', class: 'button button7' },
        { label: 'Button 8', class: 'button button8' }
    ];

    const buttonContainer = document.getElementById('button-container');

    let rows = 5;
    let cols = 5;
    matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            matrix[i][j] = "";
        }
    }

    const gridContainer = document.getElementById('grid-container');

    gridContainer.style.gridTemplateColumns = `repeat(${matrix[0].length}, 100px)`;
    gridContainer.style.gridTemplateRows = `repeat(${matrix.length}, 100px)`;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.id = `${i}${j}`
            if (i == 0) {
                matrix[i][j] = "B-" + enemyValues[j];
            }
            if (i == matrix.length - 1) {
                matrix[i][j] = "A-" + inputValues[j];
            }
            gridItem.textContent = matrix[i][j];
            gridContainer.appendChild(gridItem);
            gridItem.addEventListener('click', function () {
                if (gridItem.innerText == "A-H1" || gridItem.innerText == "A-H2" || gridItem.innerText == "A-H3" || gridItem.innerText == "A-P1" || gridItem.innerText == "A-P2" || gridItem.innerText == "A-P3") {
                    document.querySelectorAll(".grid-item").forEach(ele => {
                        ele.style.backgroundColor = "#070707";
                    })
                    document.getElementById(`${i}${j}`).style.backgroundColor = "red"
                    if (matrix[i][j].substring(2, 4) == 'H3') {
                        buttonContainer.innerHTML = ''
                        h3buttons.forEach((button, ind) => {
                            const moves = ["FL", "FR", "BL", "BR", "RF", "RB", "LF", "LB"]
                            const btn = document.createElement('button');
                            btn.textContent = moves[ind];
                            btn.className = button.class;
                            btn.addEventListener('click', function () {
                                let move = btn.innerText;
                                if (move == 'FL') {
                                    if (i - 2 >= 0 && j - 1 >= 0 && matrix[i - 2][j - 1][0] != "A" && matrix[i - 2][j][0] != "A" && matrix[i - 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 2}${j - 1}`);
                                        if (matrix[i - 2][j - 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 2][j - 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j - 1}`).innerText = matrix[i - 2][j - 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'FR') {
                                    if (i - 2 >= 0 && j + 1 < matrix.length && matrix[i - 2][j + 1][0] != "A" && matrix[i - 2][j][0] != "A" && matrix[i - 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 2}${j + 1}`);
                                        if (matrix[i - 2][j + 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 2][j + 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j + 1}`).innerText = matrix[i - 2][j + 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BL') {
                                    if (i + 2 < matrix.length && j - 1 >= 0 && matrix[i + 2][j - 1][0] != "A" && matrix[i + 2][j][0] != "A" && matrix[i + 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 2}${j - 1}`);
                                        if (matrix[i + 2][j - 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 2][j - 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j - 1}`).innerText = matrix[i + 2][j - 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BR') {
                                    if (i + 2 < matrix.length && j + 1 < matrix.length && matrix[i + 2][j + 1][0] != "A" && matrix[i + 2][j][0] != "A" && matrix[i + 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 2}${j + 1}`);
                                        if (matrix[i + 2][j + 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 2][j + 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j + 1}`).innerText = matrix[i + 2][j + 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'RF') {
                                    if (i - 1 >= 0 && j + 2 < matrix.length && matrix[i - 1][j + 2][0] != "A" && matrix[i][j + 2][0] != "A" && matrix[i][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 1}${j + 2}`);
                                        if (matrix[i - 1][j + 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 1][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 1}${j + 2}`).innerText = matrix[i - 1][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'RB') {
                                    if (i + 1 < matrix.length && j + 2 < matrix.length && matrix[i + 1][j + 2][0] != "A" && matrix[i][j + 2][0] != "A" && matrix[i][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 1}${j + 2}`);
                                        if (matrix[i + 1][j + 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 1][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 1}${j + 2}`).innerText = matrix[i + 1][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'LF') {
                                    if (i - 1 >= 0 && j - 2 >= 0 && matrix[i - 1][j - 2][0] != "A" && matrix[i][j - 2][0] != "A" && matrix[i][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 1}${j - 2}`);
                                        if (matrix[i - 1][j - 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 1][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 1}${j - 2}`).innerText = matrix[i - 1][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'LB') {
                                    if (i + 1 < matrix.length && j - 2 >= 0 && matrix[i + 1][j - 2][0] != "A" && matrix[i][j - 2][0] != "A" && matrix[i][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 1}${j - 2}`);
                                        if (matrix[i + 1][j - 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 1][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 1}${j - 2}`).innerText = matrix[i + 1][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                document.getElementById(`${i}${j}`).style.backgroundColor = "#070707"
                            });
                            buttonContainer.appendChild(btn);
                        });
                    }
                    else if (matrix[i][j].substring(2, 4) == 'H1') {
                        buttonContainer.innerHTML = ''
                        buttons.forEach((button, ind) => {
                            const moves = ["L", "R", "F", "B"]
                            const btn = document.createElement('button');
                            btn.textContent = moves[ind];
                            btn.className = button.class;
                            btn.addEventListener('click', function () {
                                let move = btn.innerText;
                                if (move == 'L') {
                                    if (j - 2 >= 0 && matrix[i][j - 2][0] != "A" && matrix[i][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i}${j - 2}`);
                                        if (matrix[i][j - 1][0] == "B") {
                                            matrix[i][j - 1] = "";
                                            document.getElementById(`${i}${j - 1}`).innerText = "";
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i][j - 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j - 2}`).innerText = matrix[i][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'R') {
                                    if (j + 2 < matrix.length && matrix[i][j + 2][0] != "A" && matrix[i][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i}${j + 2}`)
                                        if (matrix[i][j + 1][0] == "B") {
                                            matrix[i][j + 1] = "";
                                            document.getElementById(`${i}${j + 1}`).innerText = "";
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i][j + 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j + 2}`).innerText = matrix[i][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'F') {
                                    if (i - 2 >= 0 && matrix[i - 2][j][0] != "A" && matrix[i - 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 2}${j}`)
                                        if (matrix[i - 1][j][0] == "B") {
                                            matrix[i - 1][j] = "";
                                            document.getElementById(`${i - 1}${j}`).innerText = "";
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i - 2][j][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 2][j] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j}`).innerText = matrix[i - 2][j]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'B') {
                                    if (i + 2 < matrix.length && matrix[i + 2][j][0] != "A" && matrix[i + 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 2}${j}`)
                                        if (matrix[i + 1][j][0] == "B") {
                                            matrix[i + 1][j] = "";
                                            document.getElementById(`${i + 1}${j}`).innerText = "";
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i + 2][j][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 2][j] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j}`).innerText = matrix[i + 2][j]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                document.getElementById(`${i}${j}`).style.backgroundColor = "#070707"
                            });
                            buttonContainer.appendChild(btn);
                        });
                    }
                    else if (matrix[i][j].substring(2, 4) == 'H2') {
                        buttonContainer.innerHTML = ''
                        buttons.forEach((button, ind) => {
                            const moves = ["FL", "FR", "BL", "BR"]
                            const btn = document.createElement('button');
                            btn.textContent = moves[ind];
                            btn.className = button.class;
                            btn.addEventListener('click', function () {
                                let move = btn.innerText;
                                if (move == 'FL') {
                                    if (j - 2 >= 0 && i - 2 >= 0 && matrix[i - 2][j - 2][0] != "A" && matrix[i - 1][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 2}${j - 2}`);
                                        if (matrix[i - 1][j - 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i - 2][j - 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 2][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j - 2}`).innerText = matrix[i - 2][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'FR') {
                                    if (j + 2 < matrix.length && i - 2 >= 0 && matrix[i - 2][j + 2] != "A" && matrix[i - 1][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 2}${j + 2}`)
                                        if (matrix[i - 1][j + 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i - 2][j + 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 2][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j + 2}`).innerText = matrix[i - 2][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BL') {
                                    if (i + 2 < matrix.length && j - 2 >= 0 && matrix[i + 2][j - 2][0] != "A" && matrix[i + 1][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 2}${j - 2}`)
                                        if (matrix[i + 1][j - 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i + 2][j - 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 2][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j - 2}`).innerText = matrix[i + 2][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BR') {
                                    if (i + 2 < matrix.length && j + 2 < matrix.length && matrix[i + 2][j + 2][0] != "A" && matrix[i + 1][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 2}${j + 2}`)
                                        if (matrix[i + 1][j + 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        if (matrix[i + 2][j + 2][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 2][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j + 2}`).innerText = matrix[i + 2][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                document.getElementById(`${i}${j}`).style.backgroundColor = "#070707"

                            });
                            buttonContainer.appendChild(btn);
                        });
                    }
                    else if (matrix[i][j].substring(2, 4) == 'P1' || matrix[i][j].substring(2, 4) == 'P2' || matrix[i][j].substring(2, 4) == 'P3') {
                        buttonContainer.innerHTML = ''
                        buttons.forEach((button, ind) => {
                            const moves = ["L", "R", "F", "B"]
                            const btn = document.createElement('button');
                            btn.textContent = moves[ind];
                            btn.className = button.class;
                            btn.addEventListener('click', function () {
                                let move = btn.innerText;
                                if (move == 'L') {
                                    if (j - 1 >= 0 && matrix[i][j - 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i}${j - 1}`);
                                        if (matrix[i][j - 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i][j - 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j - 1}`).innerText = matrix[i][j - 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'R') {
                                    if (j + 1 < matrix.length && matrix[i][j + 1][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i}${j + 1}`)
                                        if (matrix[i][j + 1][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i][j + 1] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j + 1}`).innerText = matrix[i][j + 1]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'F') {
                                    if (i - 1 >= 0 && matrix[i - 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i + 1}${j}`)
                                        if (matrix[i - 1][j][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i - 1][j] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 1}${j}`).innerText = matrix[i - 1][j]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'B') {
                                    if (i + 1 < matrix.length && matrix[i + 1][j][0] != "A") {
                                        sendMove(`${matrix.length - 1 - i}${j}${matrix.length - 1 - i - 1}${j}`)
                                        if (matrix[i + 1][j][0] == "B") {
                                            count--;
                                            if (count == 0) {
                                                winCall()
                                            }
                                        }
                                        matrix[i + 1][j] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 1}${j}`).innerText = matrix[i + 1][j]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                document.getElementById(`${i}${j}`).style.backgroundColor = "#070707"
                            });
                            buttonContainer.appendChild(btn);
                        });
                    }
                }
            });
        }
    }
    document.getElementsByClassName("start")[0].style.display = "none";
}

