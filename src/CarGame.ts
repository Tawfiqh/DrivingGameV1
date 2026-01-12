import { Player, DIRECTIONS, Direction } from './Player.js';
import { TreesManager } from './TreeManager.js';
import { RoadManager, Road } from './RoadManager.js';
import { VehiclesManager } from './VehiclesManager.js';
import { Vehicle, VehicleCollisionObject } from './Vehicle.js';
import { EnvironmentObject } from './EnvironmentObjects.js';
import { Tree } from './Tree.js';


export interface Position {
    x: number;
    y: number;
}


// GameState class - manages the game state
export class GameState {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    player: Player;
    trees: Tree[];
    vehicles: Vehicle[];
    road: Road;
    gameOver: boolean;
    score: number;


    constructor() {
        this.player = new Player(0, CarGame.startY);
        this.road = []
        this.trees = [];
        this.vehicles = [];
        this.gameOver = false;
        this.score = 0;
    }

}

// Initialise the game-state
export class CarGame {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly FPS: number = 120;
    readonly runLoopIntervalMilliseconds: number = 1000 / this.FPS / 2; // Twice the FPS
    // x -axis runs from -10 to 10
    readonly xAxisRange: number = 20;
    readonly roadWidth: number = this.xAxisRange / 2;
    static readonly startY: number = 10;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    gameState!: GameState;
    treesManager!: TreesManager;
    roadManager!: RoadManager;
    vehiclesManager!: VehiclesManager;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    private runLoopInterval!: ReturnType<typeof setInterval>;

    constructor() {
        console.log('Welcome to Car Game 🚗');
        // 1.
        this.setupGameState();

        // 2
        this.setupKeyboardControls();

        //3.
        this.setupGameRunLoop();
    }

    setupGameState(): void {
        this.gameState = new GameState();

        this.roadManager = new RoadManager(this.gameState, this.roadWidth);
        this.treesManager = new TreesManager(this.gameState);
        this.vehiclesManager = new VehiclesManager(this.gameState);

        this.updateMap(); // trees and road are updated here    

    }



    setupKeyboardControls(): void {
        // Debounced / throttled keyboard controls
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            // console.log('⌨️ keydown', event.key);
            switch (event.key) {
                case 'ArrowUp':
                case 'w':
                    this.gameState.player.adjustVelocity(DIRECTIONS.UP);
                    break;
                case 'ArrowDown':
                case 's':
                    this.gameState.player.adjustVelocity(DIRECTIONS.DOWN);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.gameState.player.adjustSteering(DIRECTIONS.LEFT);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.gameState.player.adjustSteering(DIRECTIONS.RIGHT);
                    break;
            }
        });

        // TBC - touch controls -- can migrate from pacman later
        // document.addEventListener('touchstart', e => {
        //     this.touchstartX = e.changedTouches[0].screenX
        //     this.touchstartY = e.changedTouches[0].screenY
        // })

        // document.addEventListener('touchend', e => {
        //     this.touchendX = e.changedTouches[0].screenX
        //     this.touchendY = e.changedTouches[0].screenY
        //     this.checkSwipeDirection()
        // })
    }

    setupGameRunLoop(): void {
        this.runLoopInterval = setInterval(() => {
            this.gameRunLoop(this.runLoopIntervalMilliseconds);
        }, this.runLoopIntervalMilliseconds);
    }


    gameRunLoop(runLoopIntervalMilliseconds: number): void {
        this.updatePlayer(runLoopIntervalMilliseconds);
        this.updateMap(runLoopIntervalMilliseconds); // Update any foliage, enemies, road etc 


        this.checkAllCollisions();

        this.updateScore(); // do this last - after collisions are checked
    }

    updatePlayer(runLoopIntervalMilliseconds: number): void {
        this.gameState.player.updatePosition(runLoopIntervalMilliseconds / 1000);
    }

    updateMap(runLoopIntervalMilliseconds: number = 0): void {
        this.roadManager.updateRoad();
        this.vehiclesManager.updateVehicles(runLoopIntervalMilliseconds / 1000);

        this.treesManager.updateTrees(); // this requires a road to be present -- so it can put trees either side of the road

        // TBC - update other map elements
        // e.g. vehicles on the road
    }


    updateScore(): void {
        let currentY = Math.floor(this.gameState.player.y - CarGame.startY);
        // currentY = Math.floor(currentY / 10); // divide by 10 to scale the score down a bit.

        this.gameState.score = Math.max(this.gameState.score, currentY);
        // console.log('🚗🚗 Score: ', this.gameState.score);
    }

    checkAllCollisions(): void {

        // Check for collisions with the road and trees
        const objectListsToCheck = [this.gameState.trees, this.gameState.vehicles];


        for (let objectList of objectListsToCheck) {

            // Check for collisions in the list of objects
            const anyCollidedObjects = this.checkCollisionsInList(this.gameState.player, objectList);

            if (anyCollidedObjects) {
                this.endGame();
                return
            }
        }

    }

    checkCollisionsInList(player: Player, objectsToCheck: EnvironmentObject[]): boolean {

        // Player Max Size is used to quickly calculate if an object is even close to player
        const playerMaxSize = Math.max(player.width, player.length) * 1.5; // add buffer to the player's size

        const closeObjects = objectsToCheck.filter(
            object => object.checkObjectIsCloseToPlayer(player, playerMaxSize)
        );

        if (closeObjects.length > 0) {
            console.log('\n\n🌳🚗 Checking closeObjects for collisions', closeObjects.length, "/", objectsToCheck.length);

            // Get collision object for the player
            let playerCollissionObject: VehicleCollisionObject = player.getCollisionObject();
            // this is a snapshot of the player's position and orientation at the time of the check
            // with vertices and axes calculated for fast collision detection using SAT
            // Calculate this once before the for loop -- and only calculate it if there are closeObjects to check


            for (let object of closeObjects) {

                // We get a collision object, it's a snapshot of the object
                //  but in a representation that is easier to check for collisions
                let objectHasCollided = object.getCollisionObject().checkCollisionWithPlayerDetailed(playerCollissionObject)

                // For Trees the collisionObject is just the base object
                // For Vehicles the collisionObject is a VehicleCollisionObject with vertices and axes calculated for fast collision detection using SAT
                // Both use SAT but Trees calculate it based on a circle and the Vehicle calculates it based on a rotated rectangle
                // Trees could be simplified as a lot of the same calculations are repeated for each tree


                if (objectHasCollided) {
                    console.log('❌❌❌Object has collided -- gamer over ❌', object, player);
                    return true
                }
            }
        }

        return false

    }


    endGame() {
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=🚗🚗 Game Over 🚗🚗  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
        clearInterval(this.runLoopInterval) // Cancel the run loop - stop it from updating
        this.gameState.gameOver = true;
    }



}

