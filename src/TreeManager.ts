import { GameState } from './CarGame.js';
import { Tree } from './Tree.js';
import { EnvironmentObject } from './EnvironmentObjects.js';

export class EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    static readonly viewDistance: number = 200;
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    viewDistance: number;

    gameState: GameState;
    constructor(gameState: GameState, viewDistance: number = EnvironmentObjectManager.viewDistance) {
        this.gameState = gameState;
        this.viewDistance = viewDistance;
    }

    calculateRoadWidth(): number {
        const firstRoadSegment = this.gameState.road[0];
        const segmentStart = firstRoadSegment[0];
        const segmentEnd = firstRoadSegment[1];

        return Math.abs(segmentStart.x - segmentEnd.x);
    }

    // sortedEnvironmentObjectsY is a sorted array of environment objects by y-value
    // to check if they are within the view distance
    // updateEnvironmentObjectsInRange is a function to update the environment objects in the range
    checkViewDistanceAndUpdateEnvironmentObjects(sortedEnvironmentObjectsY: Array<EnvironmentObject>, updateEnvironmentObjectsInRange: (minY: number, maxY: number, roadHalfWidth: number) => void): void {
        // TBC - this could be a generic method for all environment objects (e.g. trees, vehicles, etc.)
        const yUpperBound = this.gameState.player.y + this.viewDistance;
        const yLowerBound = this.gameState.player.y - this.viewDistance;


        // Find the actual min/max Y of remaining environment objects
        const existingMinY = sortedEnvironmentObjectsY.length > 0 ? sortedEnvironmentObjectsY[0].y : this.gameState.player.y;
        const existingMaxY = sortedEnvironmentObjectsY.length > 0 ? sortedEnvironmentObjectsY[sortedEnvironmentObjectsY.length - 1].y : this.gameState.player.y;

        const roadHalfWidth = this.calculateRoadWidth() / 2;
        // Generate environment objects ahead if needed
        if (existingMaxY < yUpperBound) {
            console.log('🌳🌳 generateEnvironmentObjects on Upper Bound', existingMaxY, yUpperBound);
            updateEnvironmentObjectsInRange(existingMaxY, yUpperBound + this.viewDistance, roadHalfWidth);
        }

        // Generate environment objects behind if needed
        if (existingMinY > yLowerBound) {
            console.log('🌳🌳 generateEnvironmentObjects on lower Bound', yLowerBound, existingMinY);
            updateEnvironmentObjectsInRange(yLowerBound - this.viewDistance, existingMinY, roadHalfWidth);
        }

    }


}


export class TreesManager extends EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //trees
    readonly treeDensity: number = 0.3;
    readonly treeSize: number = 1
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    updateTrees(): void { //TBC this can be simplified if the player just moves forward
        const sortedTreesY = this.gameState.trees.sort((a, b) => a.y - b.y); // sort trees by y //TBC - don't sort -just keep the array sorted
        this.checkViewDistanceAndUpdateEnvironmentObjects(sortedTreesY, this.generateTreesInRange.bind(this));
    }



    generateTreesInRange(minY: number, maxY: number, roadHalfWidth: number): void {
        // console.log('🌳🌳 generateTreesInRange🌳', minY, maxY);


        // Left side
        for (let y = minY; y <= maxY; y += 1) {
            for (let roadSide = -1; roadSide <= 1; roadSide += 2) { // -1 for left, 1 for right
                if (Math.random() < this.treeDensity) {
                    const randomOffset = Math.random() * roadHalfWidth;
                    const x = roadSide * (roadHalfWidth + randomOffset)
                    const size = ((Math.random() - 1) * this.treeSize * 0.8) + this.treeSize;
                    this.gameState.trees.push(new Tree(x, y, size)); //TBC - push this in a sorted way
                }
            }
        }
    }
}