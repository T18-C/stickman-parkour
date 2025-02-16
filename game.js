let currentCharacter = 'classic';
let unlockedLevels = 1;
let highestLevel = 1;

function selectCharacter(character) {
    if (character === 'classic' || unlockedLevels >= 10) { // Ninja unlocks at level 10
        currentCharacter = character;
        // Update character preview highlighting
        document.querySelectorAll('.character-option').forEach(opt => {
            opt.style.border = opt.querySelector('.character-name').textContent.toLowerCase() === character
                ? '2px solid gold'
                : 'none';
        });
    }
}

function startGame(level) {
    if (level <= unlockedLevels) {
        // Hide menu elements
        document.getElementById('titleScreen').style.display = 'none';
        
        // Show game elements
        document.getElementById('gameCanvas').style.display = 'block';
        document.getElementById('settingsButton').style.display = 'block';
        
        // Initialize game
        gameInstance.currentLevel = level - 1;
        gameInstance.initLevel();
        
        // Make sure settings is hidden
        document.getElementById('settingsScreen').style.display = 'none';
    }
}

// Initialize level select
function initializeLevelSelect() {
    const levelSelect = document.getElementById('levelSelect');
    for (let i = 1; i <= 25; i++) {
        const button = document.createElement('button');
        button.className = `level-button ${i > unlockedLevels ? 'locked' : ''}`;
        button.textContent = `Level ${i}`;
        button.onclick = () => startGame(i);
        levelSelect.appendChild(button);
    }
}

// Draw character previews
function drawCharacterPreview() {
    // Classic preview
    const classicCtx = document.getElementById('previewClassic').getContext('2d');
    classicCtx.strokeStyle = 'white';
    drawStickman(classicCtx, 40, 60);

    // Ninja preview
    const ninjaCtx = document.getElementById('previewNinja').getContext('2d');
    ninjaCtx.strokeStyle = 'white';
    drawStickman(ninjaCtx, 40, 60, true);
}

function drawStickman(ctx, x, y, isNinja = false) {
    ctx.beginPath();
    // Head
    ctx.arc(x, y - 20, 8, 0, Math.PI * 2);
    // Body
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x, y + 5);
    // Arms
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x - 10, y);
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x + 10, y);
    // Legs
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x - 5, y + 15);
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x + 5, y + 15);
    
    if (isNinja) {
        // Ninja headband
        ctx.moveTo(x - 10, y - 25);
        ctx.lineTo(x + 10, y - 25);
        // Ninja scarf
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x + 15, y - 8);
    }
    
    ctx.stroke();
}

// Initialize everything
window.onload = () => {
    initializeLevelSelect();
    drawCharacterPreview();
    selectCharacter('classic');
    backToMain(); // Make sure we start at the main menu
};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 0;
        this.player = null;
        this.gameState = 'playing';
        
        this.initLevel();
        this.setupInputs();
        this.gameLoop();
    }

    initLevel() {
        const level = LEVELS[this.currentLevel];
        this.player = new Player(level.start.x, level.start.y);
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    this.player.velocityX = -this.player.speed;
                    this.player.isRunning = true;
                    this.player.facing = 'left';
                    break;
                case 'arrowright':
                case 'd':
                    this.player.velocityX = this.player.speed;
                    this.player.isRunning = true;
                    this.player.facing = 'right';
                    break;
                case 'arrowup':
                case 'w':
                case ' ':    // Space bar
                case 'spacebar':  // For some browsers
                    if (!this.player.isJumping) {
                        this.player.velocityY = this.player.jumpForce;
                        this.player.isJumping = true;
                    }
                    e.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'arrowleft':
                case 'a':
                    if (this.player.velocityX < 0) {
                        this.player.velocityX = 0;
                        this.player.isRunning = false;
                    }
                    break;
                case 'arrowright':
                case 'd':
                    if (this.player.velocityX > 0) {
                        this.player.velocityX = 0;
                        this.player.isRunning = false;
                    }
                    break;
            }
        });
    }

    checkCollisions() {
        const level = LEVELS[this.currentLevel];
        
        // Platform collisions
        let onPlatform = false;
        for (const platform of level.platforms) {
            if (this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y < platform.y + platform.height &&
                this.player.y + this.player.height > platform.y) {
                
                // Collision from above
                if (this.player.velocityY > 0 && 
                    this.player.y + this.player.height - this.player.velocityY <= platform.y + 15) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    onPlatform = true;
                }
                // Side collisions
                else if (this.player.velocityY > 0) {
                    if (this.player.x + this.player.width - this.player.velocityX <= platform.x) {
                        this.player.x = platform.x - this.player.width;
                    } else if (this.player.x - this.player.velocityX >= platform.x + platform.width) {
                        this.player.x = platform.x + platform.width;
                    }
                }
            }
        }
        this.player.isJumping = !onPlatform;

        // Spike collisions
        for (const spike of level.spikes) {
            if (this.player.x < spike.x + spike.width &&
                this.player.x + this.player.width > spike.x &&
                this.player.y < spike.y + spike.height &&
                this.player.y + this.player.height > spike.y) {
                this.initLevel(); // Reset level
            }
        }

        // Goal collision
        const goal = level.goal;
        if (this.player.x < goal.x + goal.width &&
            this.player.x + this.player.width > goal.x &&
            this.player.y < goal.y + goal.height &&
            this.player.y + this.player.height > goal.y) {
            this.currentLevel++;
            if (this.currentLevel >= LEVELS.length) {
                this.gameState = 'won';
            } else {
                unlockedLevels = Math.max(unlockedLevels, this.currentLevel + 1);
                highestLevel = Math.max(highestLevel, this.currentLevel + 1);
                
                // Check if we should unlock ninja
                if (highestLevel >= 10) {
                    document.querySelector('.character-option.locked').classList.remove('locked');
                    document.querySelector('.character-option.locked').onclick = () => selectCharacter('ninja');
                    showUnlockPopup();
                }
                
                this.initLevel();
                // Update level buttons
                document.querySelectorAll('.level-button').forEach((button, index) => {
                    button.className = `level-button ${index + 1 > unlockedLevels ? 'locked' : ''}`;
                });
            }
        }

        // Screen boundaries
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocityY = 0;
        }
        if (this.player.y > this.canvas.height) {
            this.initLevel(); // Reset level if fallen
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const level = LEVELS[this.currentLevel];

        // Draw platforms
        this.ctx.fillStyle = '#4a4a4a';
        for (const platform of level.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }

        // Draw spikes
        this.ctx.fillStyle = '#ff0000';
        for (const spike of level.spikes) {
            this.ctx.beginPath();
            this.ctx.moveTo(spike.x, spike.y + spike.height);
            this.ctx.lineTo(spike.x + spike.width / 2, spike.y);
            this.ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Draw goal
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(level.goal.x, level.goal.y, level.goal.width, level.goal.height);

        // Draw player
        this.player.draw(this.ctx);

        // Draw level number
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Level ${this.currentLevel + 1}`, 20, 30);
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.player.update();
            this.checkCollisions();
            this.draw();
        } else if (this.gameState === 'won') {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.fillText('Congratulations! You won!', 200, 300);
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

// After the Game class definition but before creating the instance
let gameInstance;

// Replace the game creation line with:
generateLevels();
gameInstance = new Game();

// Add the restart function
function restartLevel() {
    if (gameInstance) {
        gameInstance.initLevel();
    }
}

// Add these at the end of the file
const bgMusic = document.getElementById('bgMusic');
const volumeSlider = document.getElementById('volumeSlider');
const musicButton = document.getElementById('musicButton');
let isMusicPlaying = false;

function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicButton.textContent = 'Music Off';
    } else {
        bgMusic.play();
        musicButton.textContent = 'Music On';
    }
    isMusicPlaying = !isMusicPlaying;
}

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
});

// Set initial volume
bgMusic.volume = volumeSlider.value / 100;

// Mobile controls
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const jumpButton = document.getElementById('jumpButton');

// Touch handlers for left button
leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameInstance && gameInstance.player) {
        gameInstance.player.velocityX = -gameInstance.player.speed;
        gameInstance.player.isRunning = true;
        gameInstance.player.facing = 'left';
    }
});

leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameInstance && gameInstance.player) {
        if (gameInstance.player.velocityX < 0) {
            gameInstance.player.velocityX = 0;
            gameInstance.player.isRunning = false;
        }
    }
});

// Touch handlers for right button
rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameInstance && gameInstance.player) {
        gameInstance.player.velocityX = gameInstance.player.speed;
        gameInstance.player.isRunning = true;
        gameInstance.player.facing = 'right';
    }
});

rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameInstance && gameInstance.player) {
        if (gameInstance.player.velocityX > 0) {
            gameInstance.player.velocityX = 0;
            gameInstance.player.isRunning = false;
        }
    }
});

// Touch handler for jump button
jumpButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameInstance && gameInstance.player && !gameInstance.player.isJumping) {
        gameInstance.player.velocityY = gameInstance.player.jumpForce;
        gameInstance.player.isJumping = true;
    }
});

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Add these functions at the end of the file
function showCharacters() {
    document.querySelector('.main-menu').style.display = 'none';
    document.getElementById('characterScreen').style.display = 'flex';
    document.getElementById('levelScreen').style.display = 'none';
}

function showLevels() {
    document.querySelector('.main-menu').style.display = 'none';
    document.getElementById('characterScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'flex';
}

function showLevelSelect() {
    // Start the game at level 1
    startGame(1);
}

function backToMain() {
    document.querySelector('.main-menu').style.display = 'flex';
    document.getElementById('characterScreen').style.display = 'none';
    document.getElementById('levelScreen').style.display = 'none';
}

// Add these functions
function toggleSettings() {
    const settingsScreen = document.getElementById('settingsScreen');
    settingsScreen.style.display = settingsScreen.style.display === 'none' ? 'block' : 'none';
}

function backToMenu() {
    // Hide game elements
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('settingsButton').style.display = 'none';
    document.getElementById('settingsScreen').style.display = 'none';
    document.getElementById('mobileControls').style.display = 'none';
    
    // Show menu
    document.getElementById('titleScreen').style.display = 'flex';
    backToMain();
}

function showUnlockPopup() {
    // Only show if we haven't shown it before
    if (!localStorage.getItem('ninjaUnlocked')) {
        document.getElementById('unlockPopup').style.display = 'block';
        localStorage.setItem('ninjaUnlocked', 'true');
    }
}

function hideUnlockPopup() {
    document.getElementById('unlockPopup').style.display = 'none';
} 