function createConnection(e){
    e.preventDefault();
    const inputPositions = document.getElementById("startingPlaces").value;
    const socket = new WebSocket('ws://localhost:8080');
    let enemyPositions = "";
    let gameStarted = false;
    let inputValues = [];
    let regex = /^(?=.*\bP1\b)(?=.*\bP2\b)(?=.*\bP3\b)(?=.*\bH1\b)(?=.*\bH2\b)(?:P[1-3]\s|H[1-3]\s){4}(P[1-3]|H[1-3])$|^(?=.*\bP1\b)(?=.*\bP2\b)(?=.*\bH1\b)(?=.*\bH2\b)(?=.*\bH3\b)(?:P[1-3]\s|H[1-3]\s){4}(P[1-3]|H[1-3])$/;
    if (regex.test(inputPositions) == false) {
        alert("Please enter a valid input");
        return;
    }
    inputValues = inputPositions.split(' ');
    let enemyValues = [];

    socket.addEventListener('open', function (event) {
        document.getElementById('status').textContent = 'Connected!';
        // Send the user's positions to the server
        socket.send(JSON.stringify({ type: 'userMessage', message: inputPositions }));
    });

    socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data.message);

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
    });

    

}
function startGame(inputValues, enemyValues) {
    console.log("Game has started.");
    console.log("Input Values:", inputValues);
    console.log("Enemy Values:", enemyValues);
    createBoard(inputValues, enemyValues);
}

function createBoard(inputValues, enemyValues) {
    
    const buttons = [
        { label: 'Button 1', class: 'button button1' },
        { label: 'Button 2', class: 'button button2' },
        { label: 'Button 3', class: 'button button3' },
        { label: 'Button 4', class: 'button button4' }
    ];

    const buttonContainer = document.getElementById('button-container');

    let rows = 5;
    let cols = 5;
    let matrix = [];

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
                // console.log(`You clicked on grid item: ${matrix[i][j]}`);
                if (gridItem.innerText == "A-H1" || gridItem.innerText == "A-H2" || gridItem.innerText == "A-H3" || gridItem.innerText == "A-P1" || gridItem.innerText == "A-P2" || gridItem.innerText == "A-P3") {
                    // console.log("You clicked "+matrix[i][j]);
                    document.getElementById(`${i}${j}`).style.backgroundColor = "red"
                    if (matrix[i][j].substring(2, 4) == 'H1') {
                        buttonContainer.innerHTML = ''
                        buttons.forEach((button, ind) => {
                            const moves = ["L", "R", "F", "B"]
                            const btn = document.createElement('button');
                            btn.textContent = moves[ind];
                            btn.className = button.class;
                            btn.addEventListener('click', function () {
                                let move = btn.innerText;
                                if (move == 'L') {
                                    if (j - 2 >= 0 && matrix[i][j - 2][0] != "A") {
                                        console.log("you can move");
                                        matrix[i][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j - 2}`).innerText = matrix[i][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'R') {
                                    if (j + 2 < matrix.length && matrix[i][j + 2][0] != "A") {
                                        console.log("you can move");
                                        matrix[i][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i}${j + 2}`).innerText = matrix[i][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'F') {
                                    if (i - 2 >= 0 && matrix[i - 2][j][0] != "A") {
                                        console.log("you can move");
                                        matrix[i - 2][j] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j}`).innerText = matrix[i - 2][j]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'B') {
                                    if (i + 2 < matrix.length && matrix[i + 2][j][0] != "A") {
                                        console.log("you can move");
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
                                    if (j - 2 >= 0 && i - 2 >= 0 && matrix[i - 2][j - 2][0] != "A") {
                                        console.log("you can move");
                                        matrix[i - 2][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j - 2}`).innerText = matrix[i - 2][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'FR') {
                                    if (j + 2 < matrix.length && i - 2 >= 0 && matrix[i - 2][j + 2] != "A") {
                                        console.log("you can move");
                                        matrix[i - 2][j + 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i - 2}${j + 2}`).innerText = matrix[i - 2][j + 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BL') {
                                    if (i + 2 < matrix.length && j - 2 >= 0 && matrix[i + 2][j - 2][0] != "A") {
                                        console.log("you can move");
                                        matrix[i + 2][j - 2] = matrix[i][j]
                                        matrix[i][j] = ""
                                        document.getElementById(`${i}${j}`).innerText = matrix[i][j]
                                        document.getElementById(`${i + 2}${j - 2}`).innerText = matrix[i + 2][j - 2]
                                    } else {
                                        alert("Invalid Move");
                                    }
                                }
                                if (move == 'BR') {
                                    if (i + 2 < matrix.length && j + 2 < matrix.length && matrix[i + 2][j + 2][0] != "A") {
                                        console.log("you can move");
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
                                        console.log("you can move");
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
                                        console.log("you can move");
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
                                        console.log("you can move");
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
                                        console.log("you can move");
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
    document.getElementById("status").style.display = "none";
    document.getElementsByClassName("start")[0].style.display = "none";
}

