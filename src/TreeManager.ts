import { GameState } from './CarGame.js';

export interface Tree {
    x: number;
    y: number;
    size: number;
}

export class TreesManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //trees
    readonly viewDistance: number = 200;
    readonly treeDensity: number = 0.05;
    readonly treeSize: number = 2
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


    gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    updateTrees(): void { //TBC this can be simplified if the player just moves forward
        // Check if we need to regenerate trees based on player position
        const yUpperBound = this.gameState.player.y + this.viewDistance;
        const yLowerBound = this.gameState.player.y - this.viewDistance;


        // Find the actual min/max Y of remaining trees
        const sortedTreesY = this.gameState.trees.sort((a, b) => a.y - b.y); // sort trees by y
        const existingMinY = sortedTreesY.length > 0 ? sortedTreesY[0].y : this.gameState.player.y;
        const existingMaxY = sortedTreesY.length > 0 ? sortedTreesY[sortedTreesY.length - 1].y : this.gameState.player.y;

        // Generate trees ahead if needed
        if (existingMaxY < yUpperBound) {
            console.log('🌳🌳 generateTrees on Upper Bound', existingMaxY, yUpperBound);
            this.generateTreesInRange(existingMaxY, yUpperBound + this.viewDistance);
        }

        // Generate trees behind if needed
        if (existingMinY > yLowerBound) {
            console.log('🌳🌳 generateTrees on lower Bound', yLowerBound, existingMinY);
            this.generateTreesInRange(yLowerBound - this.viewDistance, existingMinY);
        }
    }

    calculateRoadWidth(): number {
        const firstRoadSegment = this.gameState.road[0];
        const segmentStart = firstRoadSegment[0];
        const segmentEnd = firstRoadSegment[1];

        return Math.abs(segmentStart.x - segmentEnd.x);
    }

    generateTreesInRange(minY: number, maxY: number): void {
        // console.log('🌳🌳 generateTreesInRange🌳', minY, maxY);
        const roadHalfWidth = this.calculateRoadWidth() / 2;


        // Left side
        for (let y = minY; y <= maxY; y += 1) {
            for (let roadSide = -1; roadSide <= 1; roadSide += 2) { // -1 for left, 1 for right
                if (Math.random() < this.treeDensity) {

                    console.log('🌳🌳 generateTree on side', roadSide, y);

                    const randomOffset = Math.random() * roadHalfWidth;
                    const x = roadSide * (roadHalfWidth + randomOffset)
                    const size = ((Math.random() - 1) * this.treeSize * 0.8) + this.treeSize;
                    this.gameState.trees.push({ x, y, size });
                }
            }

            console.log("\n\n");
        }
    }
}