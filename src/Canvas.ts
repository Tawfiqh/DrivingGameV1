import { Position } from './CarGame.js';

export class Canvas {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    scaleFactor: number;


    constructor(canvas: HTMLCanvasElement, initialMapSize: number, scaleFactor: number) {
        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Could not get 2d context from canvas");
        }
        this.ctx = context;

        this.canvas = canvas;
        this.canvas.width = initialMapSize;
        this.canvas.height = initialMapSize;

        this.scaleFactor = scaleFactor;

    }

    drawText(x: number, y: number, fontSize: number, text: string, color: string): void {
        this.ctx.font = fontSize + "px 'Courier New', Courier, monospace";
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    drawEllipse(x: number, y: number, radiusX: number, radiusY: number, color: string): void {
        const ctx = this.ctx;
        ctx.beginPath();

        ctx.fillStyle = color;

        ctx.ellipse(x, y, radiusX, radiusY, 0, 0, 2 * Math.PI);

        ctx.fill();
    }

    drawQuadrilateral(a: Position, b: Position, c: Position, d: Position, color: string): void {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.fillStyle = color;

        ctx.lineTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineTo(d.x, d.y);

        ctx.closePath();
        ctx.fill();

    }

    clearCanvas(backgroundColor: string): void {

        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }


    drawCircle(x: number, y: number, radius: number, color: string): void {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(
            x,
            y,
            radius,
            0, 2 * Math.PI);
        ctx.fill();
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


    drawLine(start: Position, end: Position, color: string, strokeWidth: number, dashed: boolean = false): void {
        const ctx = this.ctx;

        if (dashed) {
            const mainLineLength = 25 * this.scaleFactor;
            const gapLength = 10 * this.scaleFactor;
            const shortLineLength = 1.5 * this.scaleFactor;
            ctx.setLineDash([mainLineLength, gapLength, shortLineLength, gapLength]);
        }
        else {
            ctx.setLineDash([]);
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth * this.scaleFactor;
        ctx.beginPath();
        ctx.lineTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }


}