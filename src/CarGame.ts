import { Player, DIRECTIONS, Direction } from './Player.js';

export interface Tree {
    x: number;
    y: number;
    size: number;
}

export interface Position {
    x: number;
    y: number;
}

type Road = [Position, Position][];


// GameState class - manages the game state
export class GameState {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly viewDistance: number = 200;
    readonly treeDensity: number = 0.3;
    readonly treeSize: number = 5
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    player: Player;
    trees: Tree[];
    road: Road;


    constructor() {
        this.player = new Player(0, 10, 3, 5, 'red');
        this.road = []
        this.trees = [];
    }

}

// Initialise the game-state
export class CarGame {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly FPS: number = 120;
    readonly runLoopIntervalMilliseconds: number = 1000 / this.FPS / 2; // Twice the FPS
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    gameState!: GameState;

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
        this.gameState.road = this.generateRoad();

        this.updateMap();

    }

    generateRoad(): Road {
        const road: Road = [];
        for (let y = -100; y <= 100; y += 50) { //Straight roads! TBC - add some curves later
            road.push(
                [{ x: -5, y }, { x: 5, y }]
            );
        }
        road.push(
            [{
                x: -5, y: 1000

            }, { x: 5, y: 1000 }]
        );
        return road;
    }

    runLoop(runLoopIntervalMilliseconds: number): void {
        this.gameState.player.updatePosition(runLoopIntervalMilliseconds / 1000);
        this.updateTrees();
    }


    updateMap(): void {
        this.updateTrees();
        // TBC - update other map elements
        // e.g. vehicles on the road
    }

    updateTrees(): void { //TBC this can be simplified if the player just moves forward
        // Check if we need to regenerate trees based on player position
        const yUpperBound = this.gameState.player.y + this.gameState.viewDistance;
        const yLowerBound = this.gameState.player.y - this.gameState.viewDistance;


        // Find the actual min/max Y of remaining trees
        const sortedTreesY = this.gameState.trees.sort((a, b) => a.y - b.y); // sort trees by y
        const existingMinY = sortedTreesY.length > 0 ? sortedTreesY[0].y : this.gameState.player.y;
        const existingMaxY = sortedTreesY.length > 0 ? sortedTreesY[sortedTreesY.length - 1].y : this.gameState.player.y;

        // Generate trees ahead if needed
        if (existingMaxY < yUpperBound) {
            console.log('🌳🌳 generateTrees on Upper Bound', existingMaxY, yUpperBound);
            this.generateTreesInRange(existingMaxY, yUpperBound + this.gameState.viewDistance);
        }

        // Generate trees behind if needed
        if (existingMinY > yLowerBound) {
            console.log('🌳🌳 generateTrees on lower Bound', yLowerBound, existingMinY);
            this.generateTreesInRange(yLowerBound - this.gameState.viewDistance, existingMinY);
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
                if (Math.random() < this.gameState.treeDensity) {

                    console.log('🌳🌳 generateTree on side', roadSide, y);

                    const randomOffset = Math.random() * roadHalfWidth;
                    const x = roadSide * (roadHalfWidth + randomOffset)
                    const size = Math.random() * this.gameState.treeSize;
                    this.gameState.trees.push({ x, y, size });
                }
            }

            console.log("\n\n");
        }
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

