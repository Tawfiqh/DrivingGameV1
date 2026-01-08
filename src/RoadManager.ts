import { GameState, Position } from './CarGame.js';

export type Road = [Position, Position][];

export class RoadManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    gameState: GameState;
    roadWidth: number;

    constructor(gameState: GameState, roadWidth: number) {
        this.gameState = gameState;
        this.roadWidth = roadWidth;
    }

    generateRoad(): Road {
        const road: Road = [];

        for (let y = -100; y <= 100; y += 50) { //Straight roads! TBC - add some curves later
            road.push(
                [{ x: -this.roadWidth / 2, y }, { x: this.roadWidth / 2, y }]
            );
        }
        road.push(
            [{
                x: -this.roadWidth / 2, y: 1000

            }, { x: this.roadWidth / 2, y: 1000 }]
        );
        return road;
    }

}