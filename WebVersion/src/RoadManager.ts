import { GameState, Position } from './CarGame.js';
import { EnvironmentObjectManager } from './EnvironmentObjectManager.js';
import { pushSorted } from './Helpers.js';

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
            pushSorted(
                this.gameState.road,
                newRoadSegment,
                (seg1: RoadSegment, seg2: RoadSegment) => seg1[0].y - seg2[0].y // compare the y-values of the first positions of the road segments
            );

        }

        const firstRoadSegment = this.gameState.road[0];
        const lastRoadSegment = this.gameState.road[this.gameState.road.length - 1];
        console.log('🛣 generating road from', minY, 'to', maxY, `Road: ${firstRoadSegment[0].y} --> ${lastRoadSegment[1].y}`);

    }

    updateRoad(): void {

        const mappedRoadSegments = this.gameState.road.map((segment) =>
            segment[0]
        );

        this.checkViewDistanceAndUpdateEnvironmentObjects(mappedRoadSegments, this.generateRoad.bind(this), '🛣🛣');

        // TBC - could add potholes!

    }

}