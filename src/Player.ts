import { Vehicle } from './Vehicle.js';

// Direction constants
export const DIRECTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
} as const;

export type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

// Player class - manages player location and movement
export class Player extends Vehicle {
    // Constants
    velocityIncrement: number = 2;
    maxVelocity: number = 30;// metres per second
    static defaultColor: string = 'rgb(225, 40, 0)'; // Ferrari Red
    // 15mph = 6.7m/s 
    // 30mph = 13m/s 
    // 67.1mph = 30m/s 
    maxSteeringAngle: number = 135;
    steeringAngleIncrement: number = 10; // degrees
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    constructor(initialX: number = 0, initialY: number = 10, width: number = 1.5, length: number = 1.75, color: string = Player.defaultColor) {
        const initialSteeringAngle = 0
        const initialVelocity = 0
        const objectName = "playerName"
        super(initialX, initialY, width, length, color, initialSteeringAngle, initialVelocity, objectName);
    }

    adjustSteering(direction: Direction): void {
        switch (direction) {
            case DIRECTIONS.LEFT:
                this.steeringAngle -= this.steeringAngleIncrement;
                break;
            case DIRECTIONS.RIGHT:
                this.steeringAngle += this.steeringAngleIncrement;
                break;
        }

        this.clampSteeringAngleToMax(this.maxSteeringAngle); // Clamp the steering angle between -135 and 135 degrees

        console.log('Steering angle:', this.steeringAngle);
    }

    clampSteeringAngleToMax(maxSteeringAngle: number): void {
        this.steeringAngle = Math.max(
            -maxSteeringAngle,
            Math.min(maxSteeringAngle, this.steeringAngle) // make sure it is not more than maxSteeringAngle
        );
    }

    adjustVelocity(direction: Direction): void {
        switch (direction) {
            case DIRECTIONS.UP:
                this.velocity += this.velocityIncrement;
                break;
            case DIRECTIONS.DOWN:
                this.velocity -= this.velocityIncrement;
                break;
        }
        this.clampVelocityToMax(this.maxVelocity); // make sure it is not more than maxVelocity or less than -maxVelocity
        console.log('Velocity:', this.velocity);
    }

    clampVelocityToMax(maxVelocity: number): void {
        this.velocity = Math.max(
            -maxVelocity,
            Math.min(maxVelocity, this.velocity) // make sure it is not more than maxVelocity
        );
    }



}

