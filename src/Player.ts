// Direction constants
export const DIRECTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
} as const;

export type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

export interface PlayerState {
    x: number;
    y: number;
    width: number;
    length: number;
    color: string;
}

// Player class - manages player location and movement
export class Player {
    // Constants
    velocityIncrement: number = 2;
    maxVelocity: number = 10;
    maxSteeringAngle: number = 135;
    steeringAngleIncrement: number = 10; // degrees

    x: number;
    y: number;
    width: number;
    length: number;
    color: string;
    steeringAngle: number; // how far has the user turned the steering wheel (away from 0 degrees which is straight ahead)
    velocity: number; // how fast is the car going (Meters per second)

    constructor(initialX: number = 0, initialY: number = 10, width: number = 3, length: number = 5, color: string = 'red') {
        this.x = initialX;
        this.y = initialY;
        this.width = width;
        this.length = length;
        this.color = color;

        this.steeringAngle = 0;
        this.velocity = 0;
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

    updatePosition(secondsSinceLastUpdate: number): void {
        // Calculate the distance the car has travelled in the last update
        const intervalVelocity = this.velocity * secondsSinceLastUpdate; // velocity is in metres per second -- but a whole second might not have elapsed!

        // Update the position of the player based on the steering angle and velocity
        this.x += intervalVelocity * Math.sin(this.steeringAngle * Math.PI / 180);
        this.y += intervalVelocity * Math.cos(this.steeringAngle * Math.PI / 180);

        // Debugging - print the position every second
        // console.log('UPDATEdddd Position:', this.x, this.y);
    }

    // Get player state as an object (for compatibility with existing code)
    getState(): PlayerState {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            length: this.length,
            color: this.color
        };
    }
}

