import { GameState, Position } from './CarGame.js';
import { lightenColor } from './Helpers.js';
import { Vehicle } from './Vehicle.js';

interface CanvasVehicle {
    x: number;
    y: number;
    steeringAngle: number;
    width: number;
    length: number;
    color: string;
    lighterColor: string;
}

// initialise the renderer
export class TopDown2dRenderer {

    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly initialMapSize: number = 200;
    readonly FPS: number = 120;
    readonly roadColor = 'gray';
    readonly roadMarkingsColor = '#ededed';

    readonly treeColor = '#535e3b';
    readonly backgroundColor = '#7a8a26';


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
                <button id="refreshButton" onclick="location.reload()">Refresh</button>
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

        // Draw vehicles on the road
        this.renderVehicles();

        // Draw trees off the road
        this.renderTrees();

        // Draw the car at it's position as a box
        this.drawCar(this.translatedVehicle(this.gameState.player));
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

        ctx.strokeStyle = this.roadColor;
        ctx.fillStyle = this.roadColor;

        // Draw the road segment as a polygon
        //   c          d
        //   se.0       se.1
        //   +-----------+
        //   |           |
        //   +-----------+
        //   ss.0       ss.1
        //   a          b

        ctx.lineTo(segmentStart[0].x, segmentStart[0].y); // a 
        ctx.lineTo(segmentStart[1].x, segmentStart[1].y); // b


        ctx.lineTo(segmentEnd[1].x, segmentEnd[1].y); // d
        ctx.lineTo(segmentEnd[0].x, segmentEnd[0].y); // c

        ctx.closePath();

        ctx.stroke();
        ctx.fill();

        this.drawRoadSegmentMarkings(segmentStart, segmentEnd)
    }

    drawRoadSegmentMarkings(segmentStart: [Position, Position], segmentEnd: [Position, Position]): void {

        // draw Road Segment Lanes
        this.drawRoadSegmentBoundaries(segmentStart, segmentEnd, 1 / 3, this.roadMarkingsColor, 1, true)

        // draw road boundary on the far side of the road
        this.drawRoadSegmentBoundaries(segmentStart, segmentEnd, 0.99, this.roadMarkingsColor, 0.5)

    }

    drawRoadSegmentBoundaries(
        segmentStart: [Position, Position],
        segmentEnd: [Position, Position],
        percentageOfSegment: number,
        color: string,
        strokeWidth: number,
        dashed: boolean = false): void {
        // Draw the road markings at thirds across the segment
        //   c                d
        //   se.0            se.1
        //   +-me1-------me2-+
        //   |               |
        //   +-ms1-------ms2-+
        //   ss.0           ss.1
        //   a               b


        const msPercetangeChunkX = ((segmentStart[1].x - segmentStart[0].x) * percentageOfSegment)
        const msPercetangeChunkY = ((segmentStart[1].y - segmentStart[0].y) * percentageOfSegment)
        const ms1: Position = {
            x: segmentStart[0].x + msPercetangeChunkX,
            y: segmentStart[0].y + msPercetangeChunkY
        }

        const ms2: Position = {
            x: segmentStart[1].x - msPercetangeChunkX,
            y: segmentStart[1].y - msPercetangeChunkY
        }


        const mePercetangeChunkX = ((segmentEnd[1].x - segmentEnd[0].x) * percentageOfSegment)
        const mePercetangeChunkY = ((segmentEnd[1].y - segmentEnd[0].y) * percentageOfSegment)
        const me1: Position = {
            x: segmentEnd[0].x + mePercetangeChunkX,
            y: segmentEnd[0].y + mePercetangeChunkY
        }
        const me2: Position = {
            x: segmentEnd[1].x - mePercetangeChunkX,
            y: segmentEnd[1].y - mePercetangeChunkY
        }

        //first line - at start + percentage of segment
        this.drawLine(ms1, me1, color, strokeWidth, dashed);

        //second line - at (end - percentage) of segment
        this.drawLine(ms2, me2, color, strokeWidth, dashed);
    }


    drawLine(start: Position, end: Position, color: string, strokeWidth: number, dashed: boolean = false): void {
        const ctx = this.ctx;

        if (dashed) {
            const mainLineLength = 25;
            const gapLength = 10;
            const shortLineLength = 1.5;
            ctx.setLineDash([mainLineLength, gapLength, shortLineLength, gapLength]);
        }
        else {
            ctx.setLineDash([]);
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.beginPath();
        ctx.lineTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
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
    translatedVehicle(vehicle: Vehicle): CanvasVehicle {

        let translatedCenter = this.translateWorldToCanvas(vehicle)

        return {
            x: translatedCenter.x,
            y: translatedCenter.y,
            steeringAngle: vehicle.steeringAngle,
            width: this.translateLengthOnXAxisToCanvas(vehicle.width),
            length: this.translateLengthOnYAxisToCanvas(vehicle.length),
            color: vehicle.color,
            lighterColor: vehicle.lighterColor
        };

    }

    drawCar(canvasPlayer: CanvasVehicle): void {
        //Draw main body box
        this.drawRect(
            canvasPlayer.x,
            canvasPlayer.y,
            canvasPlayer.steeringAngle,
            canvasPlayer.width,
            canvasPlayer.length,
            canvasPlayer.color
        );

        // Draw the roof of the car
        const roofScale = 0.67;
        this.drawRect(
            canvasPlayer.x,
            canvasPlayer.y,
            canvasPlayer.steeringAngle,
            canvasPlayer.width * roofScale,
            canvasPlayer.length * roofScale,
            canvasPlayer.lighterColor
        );



        // Draw headlights positioned at the front of the car, rotated with the car
        const cos = Math.cos(canvasPlayer.steeringAngle * Math.PI / 180);
        const sin = Math.sin(canvasPlayer.steeringAngle * Math.PI / 180);

        // One headlight at -1, and one at +1 - so we get a left and right headlight
        for (let i = -1; i <= 1; i += 2) {

            // Headlight positions in car's local coordinate system (before rotation)
            // Front of car is at -length/2 in local Y, headlights are at ±width/4 in local X
            const headlightLocalX = i * canvasPlayer.width / 4;
            const headlightLocalY = - canvasPlayer.length / 2;

            // Rotate and translate headlight positions to canvas coordinates
            const headlightX = canvasPlayer.x + (headlightLocalX * cos) - (headlightLocalY * sin);
            const headlightY = canvasPlayer.y + (headlightLocalX * sin) + (headlightLocalY * cos);

            // Draw headlights rotated to face the car's direction
            this.drawRect(
                headlightX,
                headlightY,
                canvasPlayer.steeringAngle,
                canvasPlayer.width / 5,
                canvasPlayer.length / 10,
                'yellow'
            );
        }


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

        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
                this.treeColor // Forest green color
            );
        }
    }

    renderVehicles(): void {
        // Render all vehicles in the game state
        for (const vehicle of this.gameState.vehicles) {
            this.drawCar(this.translatedVehicle(vehicle));
        }
    }

}


