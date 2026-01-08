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


    constructor() {
        this.player = new Player(0, 10);
        this.road = []
        this.trees = [];
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
        this.gameState.road = this.roadManager.generateRoad();


        this.treesManager = new TreesManager(this.gameState);

        this.updateMap();

    }


    runLoop(runLoopIntervalMilliseconds: number): void {
        this.gameState.player.updatePosition(runLoopIntervalMilliseconds / 1000);
        this.updateMap();
    }


    updateMap(): void {
        this.treesManager.updateTrees();
        // TBC - update other map elements
        // e.g. vehicles on the road
    }


    setupGameRunLoop(): void {
        setInterval(() => {
            this.runLoop(this.runLoopIntervalMilliseconds);
        }, this.runLoopIntervalMilliseconds);
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
}

