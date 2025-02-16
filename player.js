class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 6;
        this.jumpForce = -15;
        this.gravity = 0.6;
        this.isJumping = false;
        this.isRunning = false;
        this.facing = 'right';
        
        // Animation properties
        this.frameCount = 0;
        this.animationSpeed = 5;
    }

    update() {
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Animation
        if (this.isRunning) {
            this.frameCount = (this.frameCount + 1) % (4 * this.animationSpeed);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y);
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
        }
        
        // Draw stickman
        const frame = Math.floor(this.frameCount / this.animationSpeed);
        
        // Head
        ctx.beginPath();
        ctx.arc(0, 5, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(0, 13);
        ctx.lineTo(0, 30);
        ctx.stroke();
        
        // Arms
        if (this.isRunning) {
            // Running animation
            const armAngle = Math.sin(frame * Math.PI / 2) * 45;
            ctx.save();
            ctx.translate(0, 15);
            ctx.rotate(armAngle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(10, 0);
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.translate(0, 15);
            ctx.rotate(-armAngle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, 0);
            ctx.stroke();
            ctx.restore();
        } else {
            // Standing position
            ctx.moveTo(0, 15);
            ctx.lineTo(10, 20);
            ctx.moveTo(0, 15);
            ctx.lineTo(-10, 20);
            ctx.stroke();
        }
        
        // Legs
        if (this.isRunning) {
            // Running animation
            const legAngle = Math.sin(frame * Math.PI / 2) * 30;
            ctx.save();
            ctx.translate(0, 30);
            ctx.rotate(legAngle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 10);
            ctx.stroke();
            ctx.restore();
            
            ctx.save();
            ctx.translate(0, 30);
            ctx.rotate(-legAngle * Math.PI / 180);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 10);
            ctx.stroke();
            ctx.restore();
        } else {
            // Standing position
            ctx.moveTo(0, 30);
            ctx.lineTo(-5, 40);
            ctx.moveTo(0, 30);
            ctx.lineTo(5, 40);
            ctx.stroke();
        }
        
        ctx.restore();
    }
} 