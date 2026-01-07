import { GameState, Tree, Position } from './CarGame.js';


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
    initialMapSize: number = 200;
    FPS: number = 120;

    gameState: GameState;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    constructor(gameState: GameState, canvas: HTMLCanvasElement) {
        this.gameState = gameState;
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2d context from canvas");
        }
        this.ctx = context;

        // set width and height to initial map-size
        this.canvas = canvas; // used for clearing
        this.canvas.width = this.initialMapSize;
        this.canvas.height = this.initialMapSize;

        setInterval(() => {
            this.render();
        }, this.FPS / 1000);
    }

    render(): void {
        this.clearCanvas();
        // Render the world from 0 to 100 on x and y
        // TBC

        // Debugging - print the position every second
        // const unixTimestamp = Date.now();
        // if (unixTimestamp % 1000 == 0) { // every second
        //     console.log("rendering!", this.gameState.player)
        // }

        this.drawRoad();

        // Draw trees off the road
        this.renderTrees();

        // Draw the car at it's position as a box
        this.drawCar(this.player());
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


    translateWorldToCanvas(worldPosition: Position): Position {
        return {
            // X should be centered on the canvas
            // World X: -10 .. 10 => 0 .. 20 => 0..10 //assumption is that the world x is only between -10 and 10
            // Canvas X: 0..MapWidth
            x: (worldPosition.x + 10) / 20 * this.initialMapSize,

            // World Y: 0..inf
            // Canvas X: 0..MapWidth
            // Y should be at the bottom of the canvas
            y: (this.initialMapSize - worldPosition.y),
        };
    }

    player(): CanvasPlayer {
        return {
            x: this.translateWorldToCanvas(this.gameState.player).x,
            y: this.translateWorldToCanvas(this.gameState.player).y,
            steeringAngle: this.gameState.player.steeringAngle,
            width: this.gameState.player.width,
            length: this.gameState.player.length,
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

    clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderTrees(): void {
        // Render all trees in the game state
        for (const tree of this.gameState.trees) {
            const canvasPos = this.translateWorldToCanvas({ x: tree.x, y: tree.y });
            // console.log('🌳🌳 renderTrees🌳', tree, "@:", canvasPos);

            // Tree foliage
            this.drawCircle(
                canvasPos.x,
                canvasPos.y,
                tree.size * 0.5, // Foliage radius
                '#228B22' // Forest green color
            );
        }
    }
}

