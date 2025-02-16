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

    // Make jumps easier for early levels
    const jumpDistance = difficulty < 5 ? 100 : 120;  // Shorter jumps in early levels
    const heightDiff = difficulty < 5 ? 60 : 80;     // Smaller height differences in early levels

    // Create a path of platforms
    for (let i = 0; i < 5; i++) {
        const platform = {
            x: lastX + jumpDistance,
            y: lastY - heightDiff,
            width: 130,      // Wider platforms for easier landing
            height: 20
        };

        // If platform would go off screen, start a new row
        if (platform.x + platform.width > 750) {
            lastX = 100;
            platform.x = lastX;
            lastY = lastY - heightDiff;
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
        y: lastPlatform.y - 40,
        width: 30,
        height: 30
    };

    return level;
}
