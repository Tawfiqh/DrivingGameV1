// initialise the renderer
class TopDown2dRenderer {

    scaleFactor = 2.0; // this is the number of pixels per game unit
    initialMapSize = 100;

    FPS = 120

    constructor(gameState, canvas) {
        this.gameState = gameState;
        this.ctx = canvas.getContext("2d");

        // set width and height to initial map-size
        this.canvas = canvas // used for clearing
        this.canvas.width = this.initialMapSize * this.scaleFactor;
        this.canvas.height = this.initialMapSize * this.scaleFactor;

        setInterval(() => {
            this.render();
        }, this.FPS / 1000);
    }

    render() {
        this.clearCanvas()
        // Render the world from 0 to 100 on x and y
        // TBC

        // Debugging - print the position every second
        // const unixTimestamp = Date.now();
        // if (unixTimestamp % 1000 == 0) { // every second
        //     console.log("rendering!", this.gameState.player)
        // }

        // Draw the car at it's position as a box
        this.drawCar(this.player());

    }

    translateWorldToCanvas() {
        return {
            // X should be centered on the canvas
            // World X: -1 .. 1 => 0 .. 2 => 0..1
            // Canvas X: 0..MapWidth
            x: (this.gameState.player.x + 1) / 2 * this.initialMapSize,

            // World Y: 0..inf
            // Canvas X: 0..MapWidth
            // Y should be at the bottom of the canvas
            y: (this.initialMapSize - this.gameState.player.y),
        }
    }

    player() {
        return {
            x: this.translateWorldToCanvas(this.gameState.player.x).x,
            y: this.translateWorldToCanvas(this.gameState.player.y).y,
            steeringAngle: this.gameState.player.steeringAngle,
            width: this.gameState.player.width,
            length: this.gameState.player.length,
            color: this.gameState.player.color
        }
    }

    drawCar(canvasPlayer) {
        //Draw box
        this.drawRect(
            canvasPlayer.x,
            canvasPlayer.y,
            canvasPlayer.steeringAngle,
            canvasPlayer.width,
            canvasPlayer.length,
            canvasPlayer.color
        );

        //TBC - Rotate headlights to face the direction of the car properly
        this.drawRect(
            canvasPlayer.x + canvasPlayer.width / 4,
            canvasPlayer.y - canvasPlayer.length / 2,
            canvasPlayer.steeringAngle,
            canvasPlayer.width / 5,
            canvasPlayer.length / 10,
            'yellow'
        );

        this.drawRect(
            canvasPlayer.x - canvasPlayer.width / 4,
            canvasPlayer.y - canvasPlayer.length / 2,
            canvasPlayer.steeringAngle,
            canvasPlayer.width / 5,
            canvasPlayer.length / 10,
            'yellow'
        );

    }


    // Rotate with player direction
    drawRect(x, y, rotation, width, length, color) {
        // Save the current canvas state - e.g the state it uses to draw
        this.ctx.save();

        // Scale coordinates to canvas pixels
        const scaledWidth = width * this.scaleFactor;
        const scaledLength = length * this.scaleFactor;

        // Translate to the center point of the rectangle
        this.ctx.translate(x * this.scaleFactor, y * this.scaleFactor);

        // Rotate around the center
        this.ctx.rotate(rotation * Math.PI / 180);// Convert rotation from degrees to radians 

        // Set fill style
        this.ctx.fillStyle = color;

        // Draw rectangle centered at (0, 0) relative to the center point
        this.ctx.fillRect(
            -scaledWidth / 2,
            -scaledLength / 2,
            scaledWidth,
            scaledLength
        );

        // Restore the canvas state to prevent transformations from accumulating
        this.ctx.restore();
    }

    drawCircle(x, y, radius, color) {
        const ctx = this.ctx
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.arc(
            x * this.scaleFactor,
            y * this.scaleFactor,
            radius * this.scaleFactor,
            0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();

    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export { TopDown2dRenderer };