// Direction constants
const DIRECTIONS = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

// Player class - manages player location and movement
class Player {

    // Constants

    velocityIncrement = 2;
    maxVelocity = 10;
    maxSteeringAngle = 135;
    steeringAngleIncrement = 30; // degrees

    constructor(initialX = 10, initialY = 10, width = 3, length = 5, color = 'red') {
        this.x = initialX;
        this.y = initialY;
        this.width = width;
        this.length = length;
        this.color = color;

        this.steeringAngle = 0; // how far has the user turned the steering wheel (away from 0 degrees which is straight ahead)
        this.velocity = 0; // how fast is the car going (Meters per second)
    }

    adjustSteering(direction) {
        switch (direction) {
            case DIRECTIONS.LEFT:
                this.steeringAngle -= this.steeringAngleIncrement;
                break;
            case DIRECTIONS.RIGHT:
                this.steeringAngle += this.steeringAngleIncrement;
                break;
        }

        this.clampSteeringAngleToMax(this.maxSteeringAngle) // Clamp the steering angle between -135 and 135 degrees

        console.log('Steering angle:', this.steeringAngle);
    }

    clampSteeringAngleToMax(maxSteeringAngle) {
        this.steeringAngle = Math.max(
            -maxSteeringAngle,
            Math.min(maxSteeringAngle, this.steeringAngle) // make sure it is not more than maxSteeringAngle
        )
    }

    adjustVelocity(direction) {
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

    clampVelocityToMax(maxVelocity) {
        this.velocity = Math.max(
            -maxVelocity,
            Math.min(maxVelocity, this.velocity) // make sure it is not more than maxVelocity
        )
    }

    updatePosition(secondsSinceLastUpdate) {
        // Calculate the distance the car has travelled in the last update
        const intervalVelocity = this.velocity * secondsSinceLastUpdate; // velocity is in metres per second -- but a whole second might not have elapsed!

        // Update the position of the player based on the steering angle and velocity
        this.x += intervalVelocity * Math.sin(this.steeringAngle * Math.PI / 180);
        this.y += intervalVelocity * Math.cos(this.steeringAngle * Math.PI / 180);

        // Debugging - print the position every second
        console.log('UPDATEdddd Position:', this.x, this.y);

    }

    // Get player state as an object (for compatibility with existing code)
    getState() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            length: this.length,
            color: this.color
        };
    }
}

export { Player, DIRECTIONS };

