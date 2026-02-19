import { TopDown2dRenderer } from './TopDown2dRenderer.js';
import { Position } from './CarGame.js';

interface Position3D {
    x: number;
    y: number;

    depth: number;
}

// initialise the renderer
export class Chase3dRenderer extends TopDown2dRenderer {

    readonly canvasSize: number = 200 * this.scaleFactor; // this is just renamed from initialMapSize



    readonly cameraHeight: number = 50
    readonly perspective: number = 800



    translateWorldToCanvas(worldPosition: Position): Position3D {
        const depth = worldPosition.y - this.canvasCenterInWorldY

        // Perspective scaling
        const scale = this.perspective / (this.perspective + depth)

        // X -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        // --- Convert world X (-10..10) to centered space first ---
        const normalizedX = (worldPosition.x + 10) / 20 // between 0..1
        const centredOnOriginX = (normalizedX - 0.5) * this.canvasSize // between -0.5..0.5 => -canvasWidth/2 .. canvasWidth/2
        const perspectiveMappedX = centredOnOriginX * scale // perspective mapped AND between -canvasWidth/2 .. canvasWidth/2

        // From the center of the canvas (vanishing point) add the perspective mapped X
        const canvasCenterX = this.canvasSize / 2
        const screenX = canvasCenterX + perspectiveMappedX // Between 0..canvasWidth = perfect for displaying on HTML canvas

        // Y -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
        // World Y: 0..10
        // Canvas Y: 0..MapHeight
        // Y should be at the bottom of the canvas
        let tiltFactor: number = 0.9
        let horizonAnchorScaling: number = 0.6


        const yOffset = worldPosition.y - this.canvasCenterInWorldY // 0 .. 10 (assuming onscreen)
        const yPerspectiveScaled = yOffset * scale * 5
        const yWithPerspectiveAndTilt = yPerspectiveScaled * tiltFactor

        const horizon = (this.canvasSize * horizonAnchorScaling)
        let screenY = horizon - yWithPerspectiveAndTilt

        // BUG  = TBC = after it renders past vanishing point, it still renders objects above the horizon
        // TBC = keep road and player still (move everything else towards up the screen)

        return {
            x: screenX,
            y: screenY,
            depth: depth,
        }

    }



}


