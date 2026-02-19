import { GameState, Position } from './CarGame.js';
import { Vehicle } from './Vehicle.js';
import { BaseRenderer } from './BaseRenderer.js';

export interface CanvasVehicle {
    x: number;
    y: number;
    steeringAngle: number;
    width: number;
    length: number;
    color: string;
    lighterColor: string;
}

// initialise the renderer
export class TopDown2dRenderer extends BaseRenderer {

    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly roadColor = 'gray';
    readonly roadMarkingsColor = '#ededed';

    readonly treeColor = '#535e3b';
    readonly backgroundColor = '#7a8a26';
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    canvasCenterInWorldY: number = 0  // Y will adjust to the player's y position

    constructor(gameState: GameState, canvas: HTMLCanvasElement, gameOver: HTMLDivElement) {
        super(gameState, canvas, gameOver);
    }

    render(): void {
        if (this.gameState.gameOver) {
            this.endGame(this.gameState.score);
            return
        }

        this.canvas.clearCanvas(this.backgroundColor);

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



    updateCanvasCenterInWorld(playerY: number): void {
        const yOffset = this.gameState.player.length; // yOffset is to adjust for the player being at the bottom centre of the screen
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
        this.drawRoadSegmentRoad(segmentStart, segmentEnd);
        this.drawRoadSegmentMarkings(segmentStart, segmentEnd);
    }

    drawRoadSegmentRoad(segmentStart: [Position, Position], segmentEnd: [Position, Position]): void {



        // Draw the road segment as a polygon
        //   c          d
        //   se.0       se.1
        //   +-----------+
        //   |           |
        //   +-----------+
        //   ss.0       ss.1
        //   a          b
        this.canvas.drawQuadrilateral(segmentStart[0], segmentStart[1], segmentEnd[1], segmentEnd[0], this.roadColor);
    }


    drawRoadSegmentMarkings(segmentStart: [Position, Position], segmentEnd: [Position, Position]): void {

        // draw Road Segment Lanes
        this.drawRoadSegmentBoundaries(segmentStart, segmentEnd, 1 / 3, this.roadMarkingsColor, 0.75, true)

        // draw road boundary on the far side of the road
        this.drawRoadSegmentBoundaries(segmentStart, segmentEnd, 0.99, this.roadMarkingsColor, 0.25)

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
        this.canvas.drawLine(ms1, me1, color, strokeWidth, dashed);

        //second line - at (end - percentage) of segment
        this.canvas.drawLine(ms2, me2, color, strokeWidth, dashed);
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

            // World Y: 0..10 (displayed on screen)
            // Canvas Y: 0..MapHeight
            // Y should be at the bottom of the canvas
            y: (this.initialMapSize - (((worldPosition.y - this.canvasCenterInWorldY) / 10) * this.initialMapSize)),
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
        this.canvas.drawRect(
            canvasPlayer.x,
            canvasPlayer.y,
            canvasPlayer.steeringAngle,
            canvasPlayer.width,
            canvasPlayer.length,
            canvasPlayer.color
        );

        // Draw the roof of the car
        const roofScale = 0.67;
        this.canvas.drawRect(
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
            this.canvas.drawRect(
                headlightX,
                headlightY,
                canvasPlayer.steeringAngle,
                canvasPlayer.width / 5,
                canvasPlayer.length / 10,
                'yellow'
            );
        }


    }


    renderTrees(): void {
        // Render all trees in the game state
        // let i = 0
        for (const tree of this.gameState.trees) {
            const canvasPos = this.translateWorldToCanvas({ x: tree.x, y: tree.y });

            // Tree foliage
            this.canvas.drawEllipse(
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


