import { GameState } from './CarGame.js';
import { Tree } from './Tree.js';
import { EnvironmentObject } from './EnvironmentObjects.js';
import { EnvironmentObjectManager } from './EnvironmentObjectManager.js';

export class TreesManager extends EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //trees
    readonly treeDensity: number = 0.3;
    readonly treeSize: number = 1
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    updateTrees(): void { //TBC this can be simplified if the player just moves forward
        const sortedTreesY = this.gameState.trees.sort((a, b) => a.y - b.y); // sort trees by y //TBC - don't sort -just keep the array sorted
        this.checkViewDistanceAndUpdateEnvironmentObjects(sortedTreesY, this.generateTreesInRange.bind(this), '🌳🌳');
    }



    generateTreesInRange(minY: number, maxY: number): void {
        // console.log('🌳🌳 generateTreesInRange🌳', minY, maxY);

        const roadHalfWidth = this.calculateRoadWidth() / 2;

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