import { Player, DIRECTIONS, Direction } from './Player.js';
import { TreesManager } from './TreeManager.js';
import { RoadManager, Road } from './RoadManager.js';
import { VehiclesManager } from './VehiclesManager.js';
import { Vehicle } from './Vehicle.js';
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


        this.checkCollisions();

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

    checkCollisions(): void {

        // Check for collisions with the road and trees
        const objectListsToCheck = [this.gameState.trees, this.gameState.vehicles];

        const playerMaxSize = Math.max(this.gameState.player.width, this.gameState.player.length) * 1.5; // add buffer to the player's size

        for (let objectList of objectListsToCheck) {

            // Check for collisions in the list of objects
            const anyCollidedObjects = this.checkCollisionsInList(playerMaxSize, objectList);
            if (anyCollidedObjects) {
                this.endGame();
                return
            }
        }

    }

    checkCollisionsInList(playerMaxSize: number, objectsToCheck: EnvironmentObject[]): boolean {

        const closeObjects = objectsToCheck.filter(
            object => object.checkBasicCollision(this.gameState.player, playerMaxSize)
        );

        if (closeObjects.length > 0) {
            console.log('🌳🌳 Checking closeObjects', closeObjects.length, "/", objectsToCheck.length);
            for (let object of closeObjects) {

                let objectHasCollided = object.checkCollisionWithPlayerDetailed(this.gameState.player)
                if (objectHasCollided) {
                    console.log('❌❌❌Object has collided -- gamer over ❌', object, this.gameState.player);
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

