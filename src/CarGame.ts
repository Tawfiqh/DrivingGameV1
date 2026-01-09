import { Player, DIRECTIONS, Direction } from './Player.js';
import { TreesManager, Tree } from './TreeManager.js';
import { RoadManager, Road } from './RoadManager.js';



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
    road: Road;
    gameOver: boolean;


    constructor() {
        this.player = new Player(0, 10);
        this.road = []
        this.trees = [];
        this.gameOver = false;
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


    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    gameState!: GameState;
    treesManager!: TreesManager;
    roadManager!: RoadManager;

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

        this.updateMap(); // trees and road are updated here    

    }



    setupKeyboardControls(): void {
        // Debounced / throttled keyboard controls
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            console.log('keydown', event.key);
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
            this.runLoop(this.runLoopIntervalMilliseconds);
        }, this.runLoopIntervalMilliseconds);
    }


    runLoop(runLoopIntervalMilliseconds: number): void {
        this.gameState.player.updatePosition(runLoopIntervalMilliseconds / 1000);
        this.checkCollisions();
        this.updateMap();
    }

    checkCollisions(): void {
        // TBC - check for collisions with the road and trees
        // Check for collisions with trees

        const playerMaxSize = Math.max(this.gameState.player.width, this.gameState.player.length) * 1.5; // add buffer to the player's size

        const closeTrees = this.gameState.trees.filter(tree =>
            tree.y > this.gameState.player.y - playerMaxSize
            && tree.y < this.gameState.player.y + playerMaxSize
            && tree.x > this.gameState.player.x - playerMaxSize
            && tree.x < this.gameState.player.x + playerMaxSize
        );

        if (closeTrees.length > 0) {
            console.log('🌳🌳 Checvking closeTrees', closeTrees.length, "/", this.gameState.trees.length);
            for (let tree of closeTrees) {
                let treeHasCollided = tree.checkCollisionWithPlayer(this.gameState.player)
                if (treeHasCollided) { this.endGame() }
            }

        }
    }

    endGame() {
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=🚗🚗 Game Over 🚗🚗  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
        clearInterval(this.runLoopInterval) // Cancel the run loop - stop it from updating
        this.gameState.gameOver = true;
    }

    updateMap(): void {
        this.roadManager.updateRoad();

        this.treesManager.updateTrees(); // this requires a road to be present -- so it can put trees either side of the road

        // TBC - update other map elements
        // e.g. vehicles on the road
    }



}

