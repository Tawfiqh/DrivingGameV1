import { GameState, Position } from './CarGame.js';
import { EnvironmentObjectManager } from './EnvironmentObjectManager.js';

export type RoadSegment = [Position, Position];
export type Road = RoadSegment[];

export class RoadManager extends EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    roadWidth: number;

    constructor(gameState: GameState, roadWidth: number) {
        super(gameState);
        this.roadWidth = roadWidth;
    }

    generateRoad(minY: number, maxY: number): void {

        const roadIncrements = 10;

        for (let y = minY; y <= maxY; y += roadIncrements) { //Straight roads! TBC - add some curves later
            const newRoadSegment: RoadSegment =
                [
                    { x: -this.roadWidth / 2, y: y },
                    { x: this.roadWidth / 2, y: y }
                ]
            this.gameState.road.push(newRoadSegment);
        }

        this.gameState.road.sort((a, b) => a[0].y - b[0].y);
        // TBC THIS IS EXPENSIVE - don't sort if possible
        // Should jsut keep the array sorted as we add new segments

        // const firstRoadSegment = this.gameState.road[0];
        // const lastRoadSegment = this.gameState.road[this.gameState.road.length - 1];
        // console.log('🛣 generating road from', minY, 'to', maxY, `Road: ${firstRoadSegment[0].y} --> ${lastRoadSegment[1].y}`);

    }

    updateRoad(): void {

        const mappedRoadSegments = this.gameState.road.map((segment) =>
            segment[0]
        );

        this.checkViewDistanceAndUpdateEnvironmentObjects(mappedRoadSegments, this.generateRoad.bind(this), '🛣🛣');

        // TBC - could add potholes!

    }

}