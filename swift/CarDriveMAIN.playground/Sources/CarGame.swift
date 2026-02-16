//
//  CarGame.swift
//  
//
//  Created by Tawfiq Hamid on 15/01/2026.
//

struct Position {
    var x: Double
    var y: Double
}

class GameState {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    // var player: Player;
    // var trees: [Tree]
    // var vehicles: [Vehicle]
    // var road: [Road]
    var gameOver: Bool
    var score: Double


    init() {
        // self.player = Player(x: 0, y: CarGame.startY);
        // self.road = []
        // self.trees = []
        // self.vehicles = []
        self.gameOver = false
        self.score = 0.0
    }

}

public class CarGame{
        // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    static var FPS: Int = 120;
    var runLoopIntervalMilliseconds: Double = 1000 / Double(CarGame.FPS) / 2.0; // Twice the FPS
    
    // x -axis runs from -10 to 10
    static var xAxisRange: Double = 20.0;
    var roadWidth: Double = Double(CarGame.xAxisRange) / 2.0;
    static var startY: Double = 10.0;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    var gameState: GameState;
    // var treesManager: TreesManager;
    // var roadManager: RoadManager;
    // var vehiclesManager: VehiclesManager;

    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    // private var runLoopInterval: DispatchTimeInterval;


init() {
        print("Welcome to Car Game 🚗");
        // 1.
        setupGameState();

        // 2
        setupKeyboardControls();

        //3.
        setupGameRunLoop();
    }

    setupGameState(): void {
        gameState = GameState();

        // roadManager = RoadManager(gameState, roadWidth);
        // treesManager = TreesManager(gameState);
        // vehiclesManager = VehiclesManager(gameState);

        // updateMap(); // trees and road are updated here    

    }



    setupKeyboardControls(): void {
        // Debounced / throttled keyboard controls
        // document.addEventListener('keydown', (event: KeyboardEvent) => {
        //     // console.log('⌨️ keydown', event.key);
        //     switch (event.key) {
        //         case 'ArrowUp':
        //         case 'w':
        //             this.gameState.player.adjustVelocity(DIRECTIONS.UP);
        //             break;
        //         case 'ArrowDown':
        //         case 's':
        //             this.gameState.player.adjustVelocity(DIRECTIONS.DOWN);
        //             break;
        //         case 'ArrowLeft':
        //         case 'a':
        //             this.gameState.player.adjustSteering(DIRECTIONS.LEFT);
        //             break;
        //         case 'ArrowRight':
        //         case 'd':
        //             this.gameState.player.adjustSteering(DIRECTIONS.RIGHT);
        //             break;
        //     }
        // });

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
    // Mobile Touch logic -Source - https://stackoverflow.com/a/56663695
    // Posted by Damjan Pavlica, modified by community. See post 'Timeline' for change history
    // Retrieved 2025-12-25, License - CC BY-SA 4.0
    // touchstartX = 0
    // touchendX = 0

    // touchstartY = 0
    // touchendY = 0

    // checkSwipeDirection() {

    //     let xMovement = this.touchendX - this.touchstartX
    //     let yMovement = this.touchendY - this.touchstartY

    //     const horizontalSwipe = Math.abs(xMovement) > Math.abs(yMovement)

    //     if (horizontalSwipe) { // More horizontal movement than vertical movement
    //         const rightSideSwipe = xMovement > 0
    //         if (rightSideSwipe) {
    //             this.gameState.player.adjustSteering(DIRECTIONS.RIGHT);
    //         } else {
    //             this.gameState.player.adjustSteering(DIRECTIONS.LEFT);
    //         }
    //     } else { // verticalSwipe = More vertical movement than horizontal movement
    //         const downSideSwipe = yMovement > 0 // remember that y-axis is inverted for a canvas
    //         if (downSideSwipe) {
    //             this.gameState.player.adjustVelocity(DIRECTIONS.DOWN);
    //         } else {
    //             this.gameState.player.adjustVelocity(DIRECTIONS.UP);
    //         }
    //     }
    // }
    
    func setupGameRunLoop() -> Void {
        return
        // this.runLoopInterval = setInterval(() => {
        //     this.gameRunLoop(this.runLoopIntervalMilliseconds);
        // }, this.runLoopIntervalMilliseconds);
    }


    // gameRunLoop(runLoopIntervalMilliseconds: number): void {
    //     this.updatePlayer(runLoopIntervalMilliseconds);
    //     this.updateMap(runLoopIntervalMilliseconds); // Update any foliage, enemies, road etc 


    //     this.checkAllCollisions();

    //     this.updateScore(); // do this last - after collisions are checked
    // }

    // updatePlayer(runLoopIntervalMilliseconds: number): void {
    //     this.gameState.player.updatePosition(runLoopIntervalMilliseconds / 1000);
    // }

    // updateMap(runLoopIntervalMilliseconds: number = 0): void {
    //     this.roadManager.updateRoad(); // do this first 
    //     // as the other methods require a road to be present so they can place cars on the road and trees by the side of the road

    //     this.vehiclesManager.updateVehicles(runLoopIntervalMilliseconds / 1000);

    //     this.treesManager.updateTrees(); // this requires a road to be present -- so it can put trees either side of the road

    // }


    // updateScore(): void {
    //     let currentY = Math.floor(this.gameState.player.y - CarGame.startY);
    //     // currentY = Math.floor(currentY / 10); // divide by 10 to scale the score down a bit.

    //     this.gameState.score = Math.max(this.gameState.score, currentY);
    //     // console.log('🚗🚗 Score: ', this.gameState.score);
    // }

    // checkAllCollisions(): void {

    //     // Check for collisions with the road and trees
    //     const objectListsToCheck = [this.gameState.trees, this.gameState.vehicles];


    //     for (let objectList of objectListsToCheck) {

    //         // Check for collisions in the list of objects
    //         const anyCollidedObjects = this.checkCollisionsInList(this.gameState.player, objectList);

    //         if (anyCollidedObjects) {
    //             this.endGame();
    //             return
    //         }
    //     }

    // }

    // checkCollisionsInList(player: Player, objectsToCheck: EnvironmentObject[]): boolean {

    //     // Player Max Size is used to quickly calculate if an object is even close to player
    //     const playerMaxSize = Math.max(player.width, player.length) * 1.5; // add buffer to the player's size

    //     const closeObjects = objectsToCheck.filter(
    //         object => object.checkObjectIsCloseToPlayer(player, playerMaxSize)
    //     );

    //     if (closeObjects.length > 0) {
    //         console.log('\n\n🌳🚗 Checking closeObjects for collisions', closeObjects.length, "/", objectsToCheck.length);

    //         // Get collision object for the player
    //         let playerCollissionObject: VehicleCollisionObject = player.getCollisionObject();
    //         // this is a snapshot of the player's position and orientation at the time of the check
    //         // with vertices and axes calculated for fast collision detection using SAT
    //         // Calculate this once before the for loop -- and only calculate it if there are closeObjects to check


    //         for (let object of closeObjects) {

    //             // We get a collision object, it's a snapshot of the object
    //             //  but in a representation that is easier to check for collisions
    //             let objectHasCollided = object.getCollisionObject().checkCollisionWithPlayerDetailed(playerCollissionObject)

    //             // For Trees the collisionObject is just the base object
    //             // For Vehicles the collisionObject is a VehicleCollisionObject with vertices and axes calculated for fast collision detection using SAT
    //             // Both use SAT but Trees calculate it based on a circle and the Vehicle calculates it based on a rotated rectangle
    //             // Trees could be simplified as a lot of the same calculations are repeated for each tree


    //             if (objectHasCollided) {
    //                 console.log('❌❌❌Object has collided -- gamer over ❌', object, player);
    //                 return true
    //             }
    //         }
    //     }

    //     return false

    // }


    // endGame() {
    //     console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=🚗🚗 Game Over 🚗🚗  -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=');
    //     clearInterval(this.runLoopInterval) // Cancel the run loop - stop it from updating
    //     this.gameState.gameOver = true;
    // }
}
