import { GameState, Position } from './CarGame.js';
import { Tree } from './TreeManager.js';


interface CanvasPlayer {
    x: number;
    y: number;
    steeringAngle: number;
    width: number;
    length: number;
    color: string;
}

// initialise the renderer
export class TopDown2dRenderer {

    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly initialMapSize: number = 200;
    readonly FPS: number = 120;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    gameState: GameState;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    canvasCenterInWorldY: number = 0  // Y will adjust to the player's y position
    gameOver: HTMLDivElement;
    renderLoopInterval: ReturnType<typeof setInterval>;

    constructor(gameState: GameState, canvas: HTMLCanvasElement, gameOver: HTMLDivElement) {
        this.gameState = gameState;
        this.gameOver = gameOver;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2d context from canvas");
        }
        this.ctx = context;

        // set width and height to initial map-size
        this.canvas = canvas; // used for clearing
        this.canvas.width = this.initialMapSize;
        this.canvas.height = this.initialMapSize;

        this.renderLoopInterval = setInterval(() => {
            this.render();
        }, this.FPS / 1000);
    }

    endGame(score: number): void {
        this.gameOver.style.display = 'block';
        this.gameOver.innerHTML = `
            <h1> Score: <span id="finalScore" > ${score} </span> </h1>
                <h1>Game Over - refresh to play again </h1>
        `
        clearInterval(this.renderLoopInterval) // Cancel the run loop - stop it from updating
    }

    render(): void {
        if (this.gameState.gameOver) {
            this.endGame(this.gameState.score);
            return
        }


        this.clearCanvas();

        this.updateCanvasCenterInWorld(this.gameState.player.y);
        this.drawRoad();

        // Draw trees off the road
        this.renderTrees();

        // Draw the car at it's position as a box
        this.drawCar(this.translatedPlayer());
        this.renderScore(this.gameState.score);

    }

    renderScore(score: number): void {
        this.ctx.font = "24px 'Courier New', Courier, monospace";
        this.ctx.fillStyle = "greenyellow";
        this.ctx.fillText("Score: " + score, 10, 30);
    }

    updateCanvasCenterInWorld(playerY: number): void {
        const yOffset = this.gameState.player.length;
        this.canvasCenterInWorldY = playerY - yOffset
    }

    drawRoad(): void { //TBC - this could be simpler if we don't constantly redraw

        for (let i = 0; i < this.gameState.road.length - 1; i++) {

            const segmentStart: [Position, Position] = this.gameState.road[i]
            const segmentEnd: [Position, Position] = this.gameState.road[i + 1]

            this.drawRoadSegment(this.translateWorldSegmentToCanvas(segmentStart), this.translateWorldSegmentToCanvas(segmentEnd))

        }

    }

    drawRoadSegment(segmentStart: [Position, Position], segmentEnd: [Position, Position]): void {
        const ctx = this.ctx;
        ctx.beginPath();

        const roadColor = 'gray';
        ctx.strokeStyle = roadColor;
        ctx.fillStyle = roadColor;

        ctx.lineTo(segmentStart[0].x, segmentStart[0].y);
        ctx.lineTo(segmentStart[1].x, segmentStart[1].y);


        ctx.lineTo(segmentEnd[1].x, segmentEnd[1].y);
        ctx.lineTo(segmentEnd[0].x, segmentEnd[0].y);

        ctx.closePath();

        ctx.stroke();
        ctx.fill();

    }
    translateWorldSegmentToCanvas(worldSegment: [Position, Position]): [Position, Position] {
        return [
            this.translateWorldToCanvas(worldSegment[0]),
            this.translateWorldToCanvas(worldSegment[1])
        ];
    }

    translateLengthOnYAxisToCanvas(length: number): number {
        return this.translateWorldToCanvas({ x: 0, y: 0 }).y - this.translateWorldToCanvas({ x: 0, y: length }).y
    }

    translateLengthOnXAxisToCanvas(length: number): number {
        return this.translateWorldToCanvas({ x: length, y: 0 }).x - this.translateWorldToCanvas({ x: 0, y: 0 }).x
    }

    translateWorldToCanvas(worldPosition: Position): Position {
        return {
            // X=0 should be centered on the canvas
            // World X: -10 .. 10 => 0 .. 20 => 0..10 //assumption is that the world x is only between -10 and 10
            // Canvas X: 0..MapWidth
            x: (worldPosition.x + 10) / 20 * this.initialMapSize,

            // World Y: 0..10
            // Canvas Y: 0..MapHeight
            // Y should be at the bottom of the canvas
            y: this.initialMapSize - (((worldPosition.y - this.canvasCenterInWorldY) / 10) * this.initialMapSize),
        };
    }

    // Translate the player to the canvas coordinates
    // This is because the player is in world coordinates, but the canvas is in canvas coordinates
    translatedPlayer(): CanvasPlayer {

        let translatedWidth = this.translateLengthOnXAxisToCanvas(this.gameState.player.width)
        let translatedLength = this.translateLengthOnYAxisToCanvas(this.gameState.player.length)
        let translatedCenter = this.translateWorldToCanvas(this.gameState.player)


        return {
            x: translatedCenter.x,
            y: translatedCenter.y,
            steeringAngle: this.gameState.player.steeringAngle,
            width: translatedWidth,
            length: translatedLength,
            color: this.gameState.player.color
        };
    }

    drawCar(canvasPlayer: CanvasPlayer): void {
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
            canvasPlayer.y - (canvasPlayer.length / 2),
            canvasPlayer.steeringAngle,
            canvasPlayer.width / 5,
            canvasPlayer.length / 10,
            'yellow'
        );

        this.drawRect(
            canvasPlayer.x - canvasPlayer.width / 4,
            canvasPlayer.y - (canvasPlayer.length / 2),
            canvasPlayer.steeringAngle,
            canvasPlayer.width / 5,
            canvasPlayer.length / 10,
            'yellow'
        );
    }

    // Rotate with player direction
    drawRect(x: number, y: number, rotation: number, width: number, length: number, color: string): void {
        // Save the current canvas state - e.g the state it uses to draw
        this.ctx.save();


        // Translate to the center point of the rectangle
        this.ctx.translate(x, y);

        // Rotate around the center
        this.ctx.rotate(rotation * Math.PI / 180); // Convert rotation from degrees to radians 

        // Set fill style
        this.ctx.fillStyle = color;

        // Draw rectangle centered at (0, 0) relative to the center point
        this.ctx.fillRect(
            -width / 2,
            -length / 2,
            width,
            length
        );

        // Restore the canvas state to prevent transformations from accumulating
        this.ctx.restore();
    }

    drawCircle(x: number, y: number, radius: number, color: string): void {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.arc(
            x,
            y,
            radius,
            0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    }

    drawEllipse(x: number, y: number, radiusX: number, radiusY: number, color: string): void {
        const ctx = this.ctx;
        ctx.beginPath();

        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);

        ctx.stroke();
        ctx.fill();
    }

    clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderTrees(): void {
        // Render all trees in the game state
        // let i = 0
        for (const tree of this.gameState.trees) {
            const canvasPos = this.translateWorldToCanvas({ x: tree.x, y: tree.y });
            // console.log('🌳🌳 renderTrees🌳', tree, "@:", canvasPos);

            // if (i ==0 ){
            //    console.log('🌳🌳 drawEllipse🌳',
            //      this.translateLengthOnXAxisToCanvas(tree.radius), 
            //      this.translateLengthOnYAxisToCanvas(tree.radius)
            //      , canvasPos.x, canvasPos.y
            //     );
            //    i++;
            // }


            // Tree foliage
            this.drawEllipse(
                canvasPos.x,
                canvasPos.y,
                this.translateLengthOnXAxisToCanvas(tree.radius),
                this.translateLengthOnYAxisToCanvas(tree.radius),
                '#228B22' // Forest green color
            );
        }
    }
}

