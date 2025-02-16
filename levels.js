const LEVELS = [
    // Level 1 - Tutorial
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 },  // Ground
            { x: 300, y: 400, width: 200, height: 20 },  // Platform
            { x: 500, y: 300, width: 200, height: 20 }   // Higher platform
        ],
        spikes: [],
        start: { x: 50, y: 500 },
        goal: { x: 700, y: 250, width: 30, height: 30 }
    }
];

// Level generation function
function generateLevels() {
    for (let i = 1; i < 25; i++) {
        LEVELS.push(generateLevel(i));
    }
}

function generateLevel(difficulty) {
    const level = {
        platforms: [
            { x: 0, y: 550, width: 800, height: 50 }  // Ground
        ],
        spikes: [],
        start: { x: 50, y: 500 },
        goal: { x: 700, y: 250, width: 30, height: 30 }
    };

    let lastX = 100;
    let lastY = 450;

    // Calculate max jump distance based on player physics
    const maxJumpHeight = 150;  // Player can jump this high
    const maxJumpDistance = 180; // Player can jump this far

    // Create a path of platforms
    for (let i = 0; i < 5; i++) {
        const platform = {
            x: lastX + 120,  // Fixed distance that's always reachable
            y: lastY - 80,   // Fixed height difference that's always reachable
            width: 120,      // Wider platforms
            height: 20
        };

        // If platform would go off screen, start a new row
        if (platform.x + platform.width > 750) {
            lastX = 100;
            platform.x = lastX;
            lastY = lastY - 100;  // Go up by a reachable amount
            platform.y = lastY;
        }

        level.platforms.push(platform);
        lastX = platform.x;
        lastY = platform.y;
    }

    // Make sure goal is reachable
    const lastPlatform = level.platforms[level.platforms.length - 1];
    level.goal = {
        x: lastPlatform.x + lastPlatform.width/2 - 15,
        y: lastPlatform.y - 40,  // Always reachable
        width: 30,
        height: 30
    };

    return level;
} 