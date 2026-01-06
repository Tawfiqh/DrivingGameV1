import { Player, DIRECTIONS } from './Player.js';

// GameState class - manages the game state
class GameState {
    constructor() {
        this.player = new Player(10, 10, 3, 5, 'red');
    }

    update(runLoopIntervalMilliseconds) {
        this.player.updatePosition(runLoopIntervalMilliseconds / 1000);
    }

}

// Initialise the game-state
class CarGame {

    // Constants
    FPS = 120;
    runLoopIntervalMilliseconds = 1000 / this.FPS / 2; // Twice the FPS

    constructor() {
        console.log('Welcome to Car Game 🚗');
        // 1.
        this.setupGameState();

        // 2
        this.setupKeyboardControls();

        //3.
        this.setupGameRunLoop();

    }
    setupGameState() {
        this.gameState = new GameState();
    }

    setupGameRunLoop() {
        setInterval(() => {
            this.gameState.update(this.runLoopIntervalMilliseconds)
        }, this.runLoopIntervalMilliseconds
        );
    }


    setupKeyboardControls() {

        // Debounced / throttled keyboard controls
        document.addEventListener('keydown', (event) => {
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

export { CarGame };

