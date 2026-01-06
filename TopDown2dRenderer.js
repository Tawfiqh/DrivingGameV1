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
        const unixTimestamp = Date.now();
        if (unixTimestamp % 1000 == 0) { // every second
            console.log("rendering!", this.gameState.player)
        }
        // Draw the car at it's position as a box
        this.drawCircle(this.gameState.player.x,
            this.gameState.player.y,
            this.gameState.player.width,
            this.gameState.player.color
        );

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