import { GameState } from './CarGame.js';
import { Canvas } from './Canvas.js';

export class BaseRenderer {

    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly scaleFactor = 10;
    readonly htmlCanvasSize: number = 200 * this.scaleFactor;
    readonly FPS: number = 120;


    gameOver: HTMLDivElement;
    gameState: GameState;
    canvas: Canvas;

    renderLoopInterval: ReturnType<typeof setInterval>;


    constructor(gameState: GameState, canvas: HTMLCanvasElement, gameOver: HTMLDivElement) {
        this.gameState = gameState;
        this.gameOver = gameOver;

        // set width and height to initial map-size
        this.canvas = new Canvas(canvas, this.htmlCanvasSize, this.scaleFactor);


        this.renderLoopInterval = setInterval(() => {
            this.render();
        }, this.FPS / 1000);
    }

    render(): void {
        throw new Error('Method not implemented.');
    }

    stop(): void {
        clearInterval(this.renderLoopInterval);
    }

    endGame(score: number): void {
        this.gameOver.style.display = 'block';
        this.gameOver.innerHTML = `
            <h1> Score: <span id="finalScore" > ${score} </span> </h1>
                <h1>Game Over - refresh to play again </h1>
                <button id="refreshButton" onclick="location.reload()">Refresh</button>
        `
        this.stop();
    }

    renderScore(score: number): void {
        const fontSize = 12 * this.scaleFactor;
        const xPos = 10 * this.scaleFactor;
        const yPos = 15 * this.scaleFactor;
        this.canvas.drawText(xPos, yPos, fontSize, "Score: " + score, "greenyellow");
    }

}