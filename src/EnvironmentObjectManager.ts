import { GameState, Position } from './CarGame.js';

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
    checkViewDistanceAndUpdateEnvironmentObjects(
        sortedEnvironmentObjectsY: Array<Position>,
        updateEnvironmentObjectsInRange: (minY: number, maxY: number) => void,
        logger: string = ''
    ): void {
        // -- maxYwhereWeWantToDrawObjectsTo => upperBoundToGenerateTo
        // 🔁 = we want to draw objects in this y-range
        // ---- maxY = maxYwhereWeCurrentlyHaveObjectsUpTo
        // 
        // car
        // 
        // --- minY = minYwhereWeCurrentlyHaveObjectsFrom
        //
        // 🔁 = we want to draw objects in this y-range
        //
        // -- minYwhereWeWantToDrawObjectsFrom => lowerBoundToGenerateFrom


        let maxYwhereWeWantToDrawObjectsTo = this.gameState.player.y + this.viewDistance;
        let minYwhereWeWantToDrawObjectsFrom = this.gameState.player.y - this.viewDistance;

        // Find the actual min/max Y of remaining environment objects
        let minYwhereWeCurrentlyHaveObjectsFrom = sortedEnvironmentObjectsY.length > 0 ? sortedEnvironmentObjectsY[0].y : this.gameState.player.y;
        let maxYwhereWeCurrentlyHaveObjectsUpTo = sortedEnvironmentObjectsY.length > 0 ? sortedEnvironmentObjectsY[sortedEnvironmentObjectsY.length - 1].y : this.gameState.player.y;


        // When we generate objects it's expensive so we generate them quite far in advance so that we're not constantly regenerating new ones
        // otherwise as soon as the player moves forward we'll generate new objects at the new view distance
        const extraBufferToGenerateMoreObjects = this.viewDistance;


        // Generate environment objects ahead if needed
        if (maxYwhereWeWantToDrawObjectsTo > maxYwhereWeCurrentlyHaveObjectsUpTo) { // if there is a gap we generate objects ahead
            const upperBoundToGenerateTo = maxYwhereWeWantToDrawObjectsTo + extraBufferToGenerateMoreObjects;

            console.log(logger, 'UPPER bound need environment objects for y range', `[${maxYwhereWeCurrentlyHaveObjectsUpTo} .. ${maxYwhereWeWantToDrawObjectsTo}]`, maxYwhereWeCurrentlyHaveObjectsUpTo, upperBoundToGenerateTo);

            updateEnvironmentObjectsInRange(maxYwhereWeCurrentlyHaveObjectsUpTo, upperBoundToGenerateTo);
        }

        // Generate environment objects behind if needed
        if (minYwhereWeCurrentlyHaveObjectsFrom > minYwhereWeWantToDrawObjectsFrom) {// if there is a gap we generate objects behind
            let lowerBoundToGenerateFrom = minYwhereWeWantToDrawObjectsFrom - extraBufferToGenerateMoreObjects;
            console.log(logger, 'Lower bound need environment objects for y range', `[${minYwhereWeWantToDrawObjectsFrom} .. ${minYwhereWeCurrentlyHaveObjectsFrom}]`, lowerBoundToGenerateFrom, minYwhereWeCurrentlyHaveObjectsFrom);

            updateEnvironmentObjectsInRange(lowerBoundToGenerateFrom, minYwhereWeCurrentlyHaveObjectsFrom);
        }

    }


}