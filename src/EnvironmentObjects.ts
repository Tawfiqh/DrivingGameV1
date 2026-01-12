import { GameState } from './CarGame.js';
import { Player } from './Player.js';
import { VehicleCollisionObject } from './Vehicle.js';

export class EnvironmentObject {
    x: number;
    y: number;
    name: string;

    constructor(x: number, y: number, name: string = "") {
        this.x = x;
        this.y = y;
        this.name = name;
    }

    // Checks if the x and y are even possibly close
    checkObjectIsCloseToPlayer(player: Player, playerMaxSize: number): boolean {
        // Check y first as this is most likely to fail first
        // As the player is moving fast along the y-axis with sparse objects sharing a y-value
        return this.y > player.y - playerMaxSize
            && this.y < player.y + playerMaxSize
            && this.x > player.x - playerMaxSize
            && this.x < player.x + playerMaxSize
    }

    checkCollisionWithPlayerDetailed(player: VehicleCollisionObject): boolean {
        return false //Subclasses should implement this for fine-grained collision detection
    }

    getCollisionObject(): EnvironmentObject {
        return this
    }

}
