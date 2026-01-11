import { GameState } from './CarGame.js';
import { Player } from './Player.js';

export class EnvironmentObject {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Checks if the x and y are even possibly close
    checkBasicCollision(player: Player, playerMaxSize: number): boolean {
        // Check y first as this is most likely to fail first
        // As the player is moving fast along the y-axis with sparse objects sharing a y-value
        return this.y > player.y - playerMaxSize
            && this.y < player.y + playerMaxSize
            && this.x > player.x - playerMaxSize
            && this.x < player.x + playerMaxSize
    }

    checkCollisionWithPlayerDetailed(player: Player): boolean {
        return false
    }

}
