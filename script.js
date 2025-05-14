/* ============================================================================== variable */
const music = document.querySelector('#backgroundMusic');
let level = document.querySelector('#level');
let higher = document.querySelector('#higher');
let gameContainer = document.querySelector('.game-container');
let openGame = document.querySelector('.openGame');
const dropBtn = document.querySelector('#dropBtn');
const rightBtn = document.querySelector('#rightBtn');
const leftBtn = document.querySelector('#leftBtn');
const nextPieceCanvas = document.querySelector('#next-piece');
const canvas = document.querySelector('#tetris');
const pauseBtnDiv = document.querySelector('.pauseBtnDiv')
const downCross = document.querySelector('#downCross')
const settingDiv = document.querySelector('.settingDiv')
const closeSettingDivBtn = document.querySelector('#closeSettingDivBtn')
const openSettingDivBtn = document.querySelector('#openSettingDivBtn')
const pauseBtnDivH2 = document.querySelector('#pauseBtnDivH2')
const continueBtn = document.querySelector('#continueBtn')
const dropBtnKAimg = document.querySelector('#dropBtn img')
const joystick = document.querySelector('.joystick-handle');
const joystickContainer = document.querySelector('.joystick-container')
const challengeDivLevel = document.querySelector('#challengeDivLevel')
const challengeDivLevelScoro = document.querySelector('#challengeDivLevelScoro')
const backgroundMusic = document.querySelector('#Music');
const vibrationBtn =
document.querySelector('#vibrationBtn');
const developerBtn = document.querySelector('#developerBtn');
const musicBtn = document.querySelector('#musicBtn');

/* ============================================================================== canvases */
const context = canvas.getContext('2d');

const nextPieceContext = nextPieceCanvas.getContext('2d');

context.scale(20, 20);
nextPieceContext.scale(20, 20);

/* ============================================================================ start game */
function startGame() {
    gameContainer.style.display = 'flex';
    openGame.style.display = 'none';
    lastTime = performance.now(); // Initialize the time
    music.play();
    backgroundMusic.play();
    update();
}

function restartGame() {
    // Clear the arena
    arena.forEach(row => row.fill(0));
    
    backgroundMusic.play();
    // Reset player stats
    player.level = 0;
    player.pos = { x: 0, y: 0 };
    player.matrix = null;
    player.nextMatrix = createPiece('T'); // Reset to a default piece

    // Reset score or levels displayed
    updatelevel();

    // Reset any other game-related variables
    dropCounter = 0;
    dropInterval = 500;
    lastTime = 0;
    paused = false;

    // Reset UI elements if necessary
    dropBtn.style.pointerEvents = 'auto';
    rightBtn.style.pointerEvents = 'auto';
    leftBtn.style.pointerEvents = 'auto';
    pauseBtnDiv.style.display = 'none';

    // Reset joystick position
    resetJoystick();

    // Reinitialize player and game elements
    playerReset();
    drawNextPiece();
    updatelevel();

    // Restart the game loop
    update();
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.level += 1;

        // Play the background music
        music.play();
    }
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 0, 0, 0],
            [5, 5, 5, 5],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === '.') {
        return [
            [0, 0, 0],
            [0, 7, 0],
            [0, 0, 0],
        ];
    } else if (type === '-') {
        return [
            [0, 0, 0],
            [7, 7, 0],
            [0, 0, 0],
        ];
    } else if (type === 'U') {
        return [
            [0, 0, 0],
            [4, 0, 4],
            [4, 4, 4],
        ];
    }
}

function drawMatrix(matrix, offset, context) {
    if (!matrix) {
        console.error('Matrix is null or undefined');
        return;
    }

    const colorMap = {
        1: 'purple',  // T piece
        2: 'yellow',  // O piece
        3: 'orange',  // L piece
        4: 'blue',    // J piece
        5: 'cyan',    // I piece
        6: 'green',   // S piece
        7: 'red',     // Z piece
        8: 'white',   // . piece
        9: 'pink'     // U piece
    };

    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const color = colorMap[value] || 'white'; // Get the color of the block

                // Draw block shadow for 3D effect
                context.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Darker shadow
                context.fillRect(x + offset.x + 0.05, y + offset.y + 0.05, 1, 1);

                // Draw block background
                context.fillStyle = color;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);

                // Draw block border for definition
                context.strokeStyle = 'transparent'; // Border color
                context.lineWidth = 0.05; // Border thickness
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);

                // Optional: Add a gradient effect for a more 3D look
                const gradient = context.createLinearGradient(
                    x + offset.x, y + offset.y,
                    x + offset.x + 1, y + offset.y + 1
                );
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)'); // Lighter top-left
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)'); // Darker bottom-right

                context.fillStyle = gradient;
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}
/* ================================================================================== draw */
function drawBackground() {
    const cols = arena[0].length;
    const rows = arena.length;
    context.fillStyle = 'rgba(200, 200, 200, 0.01)'; // Light gray with transparency

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            context.fillRect(x, y, 1, 1); // Draw the background box
            context.strokeStyle = '#000'; // Subtle grid lines
            context.lineWidth = 0.01;
            context.strokeRect(x, y, 1, 1);
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
    drawBackground(); // Draw the background grid
    drawMatrix(arena, { x: 0, y: 0 }, context); // Draw the arena
    drawMatrix(player.matrix, player.pos, context); // Draw the current piece
}

/* ======================================================================= draw next piece */
function drawNextPiece() {
    nextPieceContext.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    nextPieceContext.fillStyle = 'transparent';
    nextPieceContext.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    drawMatrix(player.nextMatrix, {x: 0, y: 0}, nextPieceContext);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
/* ================================================================================ rotate */
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

/* ================================================================================= droop */
function playerDrop() {
    player.pos.y = player.pos.y + 1;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updatelevel();
    }
    dropCounter = 0;
    drawNextPiece(); // Update next piece display
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}
/* ============================================================================= game over */
function gameover() {
    pauseGame()
    backgroundMusic.pause();
    continueBtn.style.display = 'none';
    pauseBtnDivH2.innerText = "game over";
}

function playerReset() {
    const pieces = 'ILJOTSZ.-U';
    player.matrix = player.nextMatrix || createPiece(pieces[pieces.length * Math.random() | 0]);
    player.nextMatrix = createPiece(pieces[pieces.length * Math.random() | 0]); // Set next piece
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        // If collision happens right after reset, it's game over
        gameover();  // Call the gameover function
        arena.forEach(row => row.fill(0)); // Clear the arena
        player.level = 0;  // Reset level
        updatelevel();  // Update the level display
    }
    drawNextPiece(); // Draw the next piece
}
/* ================================================================================ rotate */
function playerRotate(dir) { 
dropBtnKAimg.style.display = 'flex'
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
/* ================================================================================== drop */
let dropCounter = 0;
let dropInterval = 500;
let lastTime = 0;
let paused = false;  // Flag to track the paused state

function pauseGame() {
    continueBtn.style.display = 'flex';
    backgroundMusic.pause();
    paused = !paused;
    if (!paused) {
        // Game is unpaused
        lastTime = performance.now();
        update(); // Continue game loop when unpaused
        dropBtn.style.pointerEvents = 'auto'; // Enable Btn 
        backgroundMusic.play();
        rightBtn.style.pointerEvents = 'auto';
        leftBtn.style.pointerEvents = 'auto'; 
        pauseBtnDiv.style.display = 'none'
        
    } else {
        // Game is paused
        dropBtn.style.pointerEvents = 'none'; // Enable Btn 
        rightBtn.style.pointerEvents = 'none'; 
        leftBtn.style.pointerEvents = 'none'; // Disable Btn
        pauseBtnDiv.style.display = 'flex'
        pauseBtnDivH2.innerText = "pause game";
    }
}
/* ================================================================================ update */
function update(time = 0) {
    if (paused) {
        return;  // Stop updating if the game is paused
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}
/* ================================================================================= scoro */
let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;

// Display the stored high score when the game starts
higher.innerText = `${highScore}`;

function updatelevel() {
    // Update the current level display
    const currentLevel = player.level;
    level.innerText = `${currentLevel}`;
    
    // Check if the current level is higher than the high score
    if (currentLevel > highScore) {
        highScore = currentLevel; // Update the high score
        higher.innerText = `${highScore}`; // Display the new high score
        localStorage.setItem('highScore', highScore); // Save the new high score to localStorage
    }
}

    challengeDivLevel.innerText = 
  parseInt(higher.innerText[0]) + 1;
  
challengeDivLevelScoro.innerText = challengeDivLevel.innerText * 10;


/* adjustment main canvas arena */
const arena = createMatrix(13, 23);

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    nextMatrix: createPiece('T'), // Initialize with a default piece
    level: 0,
};

let isLeftPressed = false;
let isRightPressed = false;
let isRotatePressed = false;
let isDropPressed = false;

// Add event listeners to the left Btn
leftBtn.addEventListener('touchstart', () => { isLeftPressed = true; });

leftBtn.addEventListener('touchend', () => { isLeftPressed = false; });


// Add event listeners to the right Btn
rightBtn.addEventListener('touchstart', () => { isRightPressed = true; });

rightBtn.addEventListener('touchend', () => { isRightPressed = false; });


// Add event listeners to the drop Btn
dropBtn.addEventListener('touchstart', () => { isDropPressed = true;
    downCross.style.display = 'flex' 
    dropBtnKAimg.style.display = 'none' 
     });

dropBtn.addEventListener('touchend', () => { isDropPressed = false;
    downCross.style.display = 'none'
     });

function openSetting() {
    
document.querySelectorAll('#vibrationBtn,#developerBtn,#musicBtn,#closeSettingDivBtn').forEach(button => {
        button.style.display = 'flex';
      });
      openSettingDivBtn.style.display = 'none'
}
function closeSetting() {
     document.querySelectorAll('#vibrationBtn,#developerBtn,#musicBtn,#closeSettingDivBtn').forEach(button => {
        button.style.display = 'none';
      });
      openSettingDivBtn.style.display = 'flex'
}
/* ============================================================================= joy stick */

let startX = 0, startY = 0;
let currentX = 0, currentY = 0;

const containerSize = 100; // Joystick container size
const handleSize = 40; // Joystick handle size
const maxMovement = (containerSize - handleSize) / 2; // Max joystick movement from center
const deadZone = 10; // Small movements are ignored (dead zone)

function resetJoystick() {
    joystick.style.top = '50%';
    joystick.style.left = '50%';
}

joystickContainer.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
});

joystickContainer.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    currentX = touch.clientX;
    currentY = touch.clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // Limit movement within joystick boundaries
    const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), maxMovement);
    const angle = Math.atan2(deltaY, deltaX);

    const limitedX = distance * Math.cos(angle);
    const limitedY = distance * Math.sin(angle);

    joystick.style.left = `${10  + limitedX}px`;
    joystick.style.top = `${10 + limitedY}px`;

    // Handle horizontal movement
    if (Math.abs(limitedX) > deadZone) {
        if (limitedX > 0) {
            playerMove(1);
            isDropPressed = false; // Move right
        } else {
            playerMove(-1);
            isDropPressed = false; // Move left
        }
        startX = currentX; // Reset start position to prevent continuous moves
    }

});

joystickContainer.addEventListener('touchend', () => {
    resetJoystick(); // Reset joystick handle to the center when touch ends
});

joystickContainer.addEventListener('touchstart', () => { isDropPressed = true; })
    
    joystickContainer.addEventListener('touchend', () => { isDropPressed = false; })
        
        
// Add the handling logic for the Btn states in the game loop
function handleBtnState() {
    if (isLeftPressed) {
        playerMove(-1);
    }
    if (isRightPressed) {
        playerMove(1);
    }
    if (isRotatePressed) {
        playerRotate(1); // Rotate clockwise
    }
    if (isDropPressed) {
        playerDrop(); // Drop the piece
    }
}

function gameLoop(time) {
    updateGameInput(); // Handle player input
    update(time);
    requestAnimationFrame(gameLoop);
}

// Call the handleBtnState function regularly
setInterval(handleBtnState, 75); // Check Btn state every 75ms
playerReset();
drawNextPiece(); // Draw the initial next piece
updatelevel();
