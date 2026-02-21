import { GameState, Position } from './CarGame.js';
import { Vehicle } from './Vehicle.js';
import { BaseRenderer } from './BaseRenderer.js';
import { degreesToRadians, lightenColor } from './Helpers.js';
import { CanvasVehicle } from './TopDown2dRenderer.js';

export interface Position3d extends Position {
    z: number;
}

// initialise the renderer
export class Chase3dRenderer extends BaseRenderer {

    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly roadColor = 'gray';
    readonly roadMarkingsColor = '#ededed';
    readonly roadMarkingsLightColor = '#8d8d8d'


    readonly treeColor = '#535e3b';
    readonly treeTopColor = '#6b7a4e';
    readonly backgroundColor = '#7a8a26';


    readonly tiltAngle: number = degreesToRadians(55);
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    // x and y position of the camera are 0
    screenY: number = 0  // Y will adjust to the player's y position 
    cameraY: number = 0  // Y will adjust to the player's y position 



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
        this.drawCar(this.gameState.player);
        this.renderScore(this.gameState.score);

    }



    updateCanvasCenterInWorld(playerY: number): void {
        const yOffset = this.gameState.player.length * 2; // yOffset is to adjust for the player being at the bottom centre of the screen

        this.cameraY = playerY - (2 * yOffset) // Eye of the camera in world space
        this.screenY = playerY - yOffset //Near clipping plane of the frustum in world space
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

    // TBC - if this works -- as the line stripes may get weird with perspective - iDK
    drawRoadSegmentMarkings(segmentStart: [Position, Position], segmentEnd: [Position, Position]): void {

        // draw Road Segment Lanes
        this.drawRoadSegmentBoundaries(segmentStart, segmentEnd, 1 / 3, this.roadMarkingsLightColor, 0.4)

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


    tiltBoardUpwards(position: Position3d, pivotPoint: number, tiltAngle: number): Position3d {

        // If you wanted to rotate the point around something other than the origin (e.g. the camera)
        // you need to first translate the whole system so that the point of rotation is at the origin.
        //  Then perform the rotation. And finally, undo the translation
        // 1. Translate the system so that the pivot point is at the origin
        const zInit = position.z - pivotPoint;
        const yInit = position.y - pivotPoint;

        // 2. Perform the rotation
        //https://academo.org/demos/rotation-about-point/ - this is the formula for rotation about a point
        // x (web) is z therefore x' = xcos(angle) - ysin(angle) (web form but we replace x with z )=> z' = zcos(angle) - ysin(angle)
        // y (web) is y therefore y' = ycos(angle) + xsin(angle) (web form but we replace x with z) => y' = ycos(angle) + zsin(angle)
        const zAfterTilt = zInit * Math.cos(tiltAngle) - yInit * Math.sin(tiltAngle) // z' = zcos(angle) - ysin(angle)
        const yAfterTilt = yInit * Math.cos(tiltAngle) + zInit * Math.sin(tiltAngle) //  ycos(angle) + zsin(angle)


        // 3. Undo the translation so that the pivot point is at the original position
        const zOriginalCoordinateSpace = zAfterTilt + pivotPoint;
        const yOriginalCoordinateSpace = yAfterTilt + pivotPoint;

        return {
            x: position.x, // x is unchanged by the tilt of the game board around the x axis
            y: yOriginalCoordinateSpace,
            z: zOriginalCoordinateSpace
        };
    }


    // Pulls everything towards the camera on the y axis
    // && Sets z as the depth of the world position from the camera 
    // (as is normal in 3D graphics and perspective projection)
    convertWorldToViewSpace(worldPosition: Position3d): Position3d {
        return {
            x: - worldPosition.x, // not sure why this needs to be negative - but otherwise steering is reversed
            y: worldPosition.z,
            z: -(worldPosition.y - this.cameraY)
        }
    }


    translateWorldToCanvas(worldPosition: Position, projectionObjectName: string | null = null): Position {
        return this.translateWorldToCanvas3d({ x: worldPosition.x, y: worldPosition.y, z: 0 }, projectionObjectName);
    }


    translateWorldToCanvas3d(worldPosition: Position3d, projectionObjectName: string | null = null): Position {
        // if (projectionObjectName == 'playerName' /*&& worldPosition.y >= this.cameraY*/) {
        //     console.log(`\n\n 🅰️💡 - Projection object name: ${projectionObjectName} -- World position: ${worldPosition.x}, ${worldPosition.y} -- current camera y: ${this.cameraY}`);
        // }
        // 1. World spcae -> View space
        // Pull everything toward the camera on the y axis
        const viewSpaceBeforeTilit: Position3d = this.convertWorldToViewSpace(worldPosition)
        // if (projectionObjectName == 'playerName' /*&& worldPosition.y >= this.cameraY*/) {
        //     console.log(`🅱️💡 - View space before tilt: ${viewSpaceBeforeTilit.x}, ${viewSpaceBeforeTilit.y} ${viewSpaceBeforeTilit.z}`);
        // }


        // 2. Tilt the "board" around the pivot point on the view-space z-axis
        // This gives it some height on the view-space y-axis (otherwise view-space y would be 0 for everything)
        const pivotPoint = this.convertWorldToViewSpace(
            { x: 0, y: this.gameState.player.y, z: 0 }
        ).z;

        const viewSpace: Position3d = this.tiltBoardUpwards(viewSpaceBeforeTilit, pivotPoint, this.tiltAngle) // Rotates around the x-axis ona point on the y-axis
        // if (projectionObjectName == 'playerName' /*&& worldPosition.y >= this.cameraY*/) {
        //     console.log(`🅱️💡 - View space after tilt: ${viewSpace.x}, ${viewSpace.y} ${viewSpace.z}`);
        // }


        //3 . Convert the camera space -> to the virtual image plane
        const screenDistanceInViewSpace = this.convertWorldToViewSpace({ x: 0, y: this.screenY, z: 0 }).z
        const psy = (screenDistanceInViewSpace / -viewSpace.z) * viewSpace.y
        const psx = (screenDistanceInViewSpace / -viewSpace.z) * viewSpace.x
        // if (projectionObjectName == 'playerName' /*&& worldPosition.y >= this.cameraY*/) {
        //     console.log(`🅲️💡 - Virtual Image Plane: ${psx}, ${psy}  -- n: ${screenDistanceInViewSpace}`);
        // }


        // 4. Convert the virtual image plane to the HTMLcanvas space (normalised to htmlCanvasSize)
        const xMax = 2
        const yScale = 12 // lower is more zoomed in
        return {
            // X=0 should be centered on the canvas
            // World X: -10 .. 10 => 0 .. 20 => 0..1 //assumption is that the world x is only between -10 and 10
            // Canvas X: 0..MapWidth
            x: (psx + xMax) / (xMax * 2) * this.htmlCanvasSize,

            // World Y: 0..10 (displayed on screen)
            // Canvas Y: 0..MapHeight
            // Y should be at the bottom of the canvas
            y: this.htmlCanvasSize - ((psy / yScale) * this.htmlCanvasSize),
        };
    }


    drawCar(car: Vehicle): void {

        if car.y <= this.cameraY {
            return
        }
        const halfWidth = car.width / 2;
        const halfLength = car.length / 2;

        const roofScale = 0.6;
        const roofScaleWidth = halfWidth * roofScale;
        const roofScaleLength = halfLength * roofScale * 0.5;
        const roofHeight = roofScaleWidth;

        const bottomLeft = this.translateWorldToCanvas({ x: car.x - halfWidth, y: car.y - halfLength })
        const bottomRight = this.translateWorldToCanvas({ x: car.x + halfWidth, y: car.y - halfLength })
        const topRight = this.translateWorldToCanvas({ x: car.x + halfWidth, y: car.y + halfLength })
        const topLeft = this.translateWorldToCanvas({ x: car.x - halfWidth, y: car.y + halfLength })



        const bottomLeftHigher = this.translateWorldToCanvas3d({ x: car.x - halfWidth, y: car.y - halfLength, z: roofHeight })
        const bottomRightHigher = this.translateWorldToCanvas3d({ x: car.x + halfWidth, y: car.y - halfLength, z: roofHeight })
        const topRightHigher = this.translateWorldToCanvas3d({ x: car.x + halfWidth, y: car.y + halfLength, z: roofHeight })
        const topLeftHigher = this.translateWorldToCanvas3d({ x: car.x - halfWidth, y: car.y + halfLength, z: roofHeight })


        //Draw main body box - bottom layer
        this.canvas.drawQuadrilateral(bottomLeft, bottomRight, topRight, topLeft, car.color);


        //Draw main body box - upper layer
        // lines to connect the bottom layer to the upper layer
        this.canvas.drawLine(bottomLeft, bottomLeftHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(bottomRight, bottomRightHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(topRight, topRightHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(topLeft, topLeftHigher, car.lighterColor, 0.5);

        // lines to connect the upper layer to each other -- like a wireframe
        this.canvas.drawQuadrilateral(bottomLeftHigher, bottomRightHigher, topRightHigher, topLeftHigher, car.color);

        this.canvas.drawLine(bottomLeftHigher, bottomRightHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(bottomRightHigher, topRightHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(topRightHigher, topLeftHigher, car.lighterColor, 0.5);
        this.canvas.drawLine(topLeftHigher, bottomLeftHigher, car.lighterColor, 0.5);



        // // Draw the roof of the car
        const roofBottomLeft = this.translateWorldToCanvas3d({ x: car.x - roofScaleWidth, y: car.y - roofScaleLength, z: -roofHeight })
        const roofBottomRight = this.translateWorldToCanvas3d({ x: car.x + roofScaleWidth, y: car.y - roofScaleLength, z: -roofHeight })
        const roofTopRight = this.translateWorldToCanvas3d({ x: car.x + roofScaleWidth, y: car.y + roofScaleLength, z: -roofHeight })
        const roofTopLeft = this.translateWorldToCanvas3d({ x: car.x - roofScaleWidth, y: car.y + roofScaleLength, z: -roofHeight })


        const quarterWidth = halfWidth / 1.1;
        const quarterLength = halfLength / 2;
        const bottomLeftHigherMid = this.translateWorldToCanvas3d({ x: car.x - quarterWidth, y: car.y - quarterLength, z: roofHeight / 2 })
        const bottomRightHigherMid = this.translateWorldToCanvas3d({ x: car.x + quarterWidth, y: car.y - quarterLength, z: roofHeight / 2 })
        const topRightHigherMid = this.translateWorldToCanvas3d({ x: car.x + quarterWidth, y: car.y + quarterLength, z: roofHeight / 2 })
        const topLeftHigherMid = this.translateWorldToCanvas3d({ x: car.x - quarterWidth, y: car.y + quarterLength, z: roofHeight / 2 })



        this.canvas.drawLine(bottomLeftHigherMid, roofBottomLeft, car.lighterColor, 0.5);
        this.canvas.drawLine(bottomRightHigherMid, roofBottomRight, car.lighterColor, 0.5);
        this.canvas.drawLine(topRightHigherMid, roofTopRight, car.lighterColor, 0.5);
        this.canvas.drawLine(topLeftHigherMid, roofTopLeft, car.lighterColor, 0.5);

        //Draw roof box
        this.canvas.drawQuadrilateral(roofBottomLeft, roofBottomRight, roofTopRight, roofTopLeft, car.lighterColor);



        // const roofScale = 0.67;
        // this.canvas.drawRect(
        //     car.x,
        //     car.y,
        //     car.steeringAngle,
        //     car.width * roofScale,
        //     car.length * roofScale,
        //     car.lighterColor
        // );



        // Draw headlights positioned at the front of the car, rotated with the car
        // const cos = Math.cos(car.steeringAngle * Math.PI / 180);
        // const sin = Math.sin(car.steeringAngle * Math.PI / 180);

        // // One headlight at -1, and one at +1 - so we get a left and right headlight
        // for (let i = -1; i <= 1; i += 2) {

        //     // Headlight positions in car's local coordinate system (before rotation)
        //     // Front of car is at -length/2 in local Y, headlights are at ±width/4 in local X
        //     const headlightLocalX = i * car.width / 4;
        //     const headlightLocalY = - car.length / 2;

        //     // Rotate and translate headlight positions to canvas coordinates
        //     const headlightX = car.x + (headlightLocalX * cos) - (headlightLocalY * sin);
        //     const headlightY = car.y + (headlightLocalX * sin) + (headlightLocalY * cos);

        //     // Draw headlights rotated to face the car's direction
        //     this.canvas.drawRect(
        //         headlightX,
        //         headlightY,
        //         car.steeringAngle,
        //         car.width / 5,
        //         car.length / 10,
        //         'yellow'
        //     );
        // }


    }


    renderTrees(): void {
        for (const tree of this.gameState.trees) {
            const treeHeight = tree.radius * 3;

            // Bottom face (z=0)
            const bBL = this.translateWorldToCanvas3d({ x: tree.x - tree.radius, y: tree.y - tree.radius, z: 0 })
            const bBR = this.translateWorldToCanvas3d({ x: tree.x + tree.radius, y: tree.y - tree.radius, z: 0 })
            const bTR = this.translateWorldToCanvas3d({ x: tree.x + tree.radius, y: tree.y + tree.radius, z: 0 })
            const bTL = this.translateWorldToCanvas3d({ x: tree.x - tree.radius, y: tree.y + tree.radius, z: 0 })

            // Top face (z=treeHeight)
            const tBL = this.translateWorldToCanvas3d({ x: tree.x - tree.radius, y: tree.y - tree.radius, z: -treeHeight })
            const tBR = this.translateWorldToCanvas3d({ x: tree.x + tree.radius, y: tree.y - tree.radius, z: -treeHeight })
            const tTR = this.translateWorldToCanvas3d({ x: tree.x + tree.radius, y: tree.y + tree.radius, z: -treeHeight })
            const tTL = this.translateWorldToCanvas3d({ x: tree.x - tree.radius, y: tree.y + tree.radius, z: -treeHeight })

            if (tree.y <= this.cameraY) {
                continue
            }

            // bottom face
            this.canvas.drawQuadrilateral(bBL, bBR, bTR, bTL, this.treeColor);

            this.canvas.drawLine(bBL, tBL, this.treeColor, 0.5);
            this.canvas.drawLine(bBR, tBR, this.treeColor, 0.5);
            this.canvas.drawLine(bTR, tTR, this.treeColor, 0.5);
            this.canvas.drawLine(bTL, tTL, this.treeColor, 0.5);

            this.canvas.drawQuadrilateral(tBL, tBR, tTR, tTL, this.treeTopColor);
        }
    }

    renderVehicles(): void {
        // Render all vehicles in the game state
        for (const vehicle of this.gameState.vehicles) {
            this.drawCar(vehicle);
        }
    }

}


