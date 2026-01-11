import { GameState } from './CarGame.js';
import { Player } from './Player.js';
import { EnvironmentObjectManager } from './TreeManager.js';
import { EnvironmentObject } from './EnvironmentObjects.js';
import { varyNumberByPercentage, randomShadeOfBlue } from './Helpers.js';


export class Vehicle extends EnvironmentObject {

    width: number;
    length: number;
    color: string;
    steeringAngle: number; // how far has the user turned the steering wheel (away from 0 degrees which is straight ahead)
    velocity: number; // how fast is the car going (Meters per second)

    constructor(
        x: number,
        y: number,
        width: number,
        length: number,
        color: string,
        steeringAngle: number = 0,
        velocity: number = 10) {

        super(x, y);
        this.width = width;
        this.length = length;
        this.color = color;
        this.steeringAngle = steeringAngle;
        this.velocity = velocity;
    }

    checkCollisionWithPlayerDetailed(player: Player): boolean {
        // SAT (Separating Axis Theorem) collision detection between rotated rectangle and circle
        // https://www.sevenson.com.au/programming/sat/

        // Step 1: Calculate the four corners of the rotated rectangle
        const angle = player.steeringAngle * Math.PI / 180; // Convert to radians
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const halfWidth = player.width / 2;
        const halfLength = player.length / 2;

        // Local corners (before rotation, relative to center)
        const localCorners = [
            { x: -halfWidth, y: -halfLength },
            { x: halfWidth, y: -halfLength },
            { x: halfWidth, y: halfLength },
            { x: -halfWidth, y: halfLength }
        ];

        // Rotate and translate corners to world coordinates
        const worldCorners = localCorners.map(corner => ({
            x: player.x + corner.x * cos - corner.y * sin,
            y: player.y + corner.x * sin + corner.y * cos
        }));

        // Step 2: Get edge vectors and their normals
        // const edges: Array<{ x: number; y: number }> = [];
        const normals: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const edge = {
                x: worldCorners[next].x - worldCorners[i].x,
                y: worldCorners[next].y - worldCorners[i].y
            };
            // edges.push(edge);

            // Normalize edge to get normal
            const length = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
            if (length > 0) {
                // Perpendicular vector (normal) - swap x/y and negate one
                normals.push({
                    x: -edge.y / length,
                    y: edge.x / length
                });
            }
        }

        // Step 3: Check each separating axis
        for (const normal of normals) {
            // Project rectangle corners onto the axis
            let minRect = Infinity;
            let maxRect = -Infinity;

            for (const corner of worldCorners) {
                const projection = corner.x * normal.x + corner.y * normal.y; // dot product of corner and the normal
                minRect = Math.min(minRect, projection);
                maxRect = Math.max(maxRect, projection);
            }

            // Project circle onto the axis
            const circleProjection = this.x * normal.x + this.y * normal.y;
            const minCircle = circleProjection - this.radius;
            const maxCircle = circleProjection + this.radius;

            // Check for separation (gap between projections)
            if (maxRect < minCircle || minRect > maxCircle) {
                // Found a separating axis - no collision
                return false;
            }
        }

        // Step 4: Check axis from circle center to closest point on rectangle
        // Find closest point on rectangle to circle center
        let closestX = this.x;
        let closestY = this.y;

        // Clamp circle center to rectangle bounds
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const edge = {
                x: worldCorners[next].x - worldCorners[i].x,
                y: worldCorners[next].y - worldCorners[i].y
            };

            const toPoint = {
                x: this.x - worldCorners[i].x,
                y: this.y - worldCorners[i].y
            };

            const edgeLength = edge.x * edge.x + edge.y * edge.y;
            if (edgeLength > 0) {
                const t = Math.max(0, Math.min(1, (toPoint.x * edge.x + toPoint.y * edge.y) / edgeLength));
                const closestOnEdge = {
                    x: worldCorners[i].x + t * edge.x,
                    y: worldCorners[i].y + t * edge.y
                };

                const distToEdge = Math.sqrt(
                    (this.x - closestOnEdge.x) ** 2 + (this.y - closestOnEdge.y) ** 2
                );
                const distToClosest = Math.sqrt(
                    (this.x - closestX) ** 2 + (this.y - closestY) ** 2
                );

                if (distToEdge < distToClosest) {
                    closestX = closestOnEdge.x;
                    closestY = closestOnEdge.y;
                }
            }
        }

        // Check distance from circle to closest point
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If distance is less than radius, there's a collision
        return distance < this.radius;
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
}




export class VehiclesManager extends EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //trees
    readonly carDensityPerYUnit: number = 1 / 20; // 1 car per 40 units of y-axis
    readonly baseCarSize: number = 1.5
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    updateExistingVehicles(secondsSinceLastUpdate: number): void {
        for (const vehicle of this.gameState.vehicles) {
            vehicle.updatePosition(secondsSinceLastUpdate);
        }
    }

    updateVehicles(secondsSinceLastUpdate: number): void { //TBC this can be simplified if the player just moves forward

        this.updateExistingVehicles(secondsSinceLastUpdate);
        const sortedVehiclesY = this.gameState.vehicles.sort((a, b) => a.y - b.y); // sort vehicles by y//TBC - don't sort -just keep the array sorted

        this.checkViewDistanceAndUpdateEnvironmentObjects(sortedVehiclesY, this.generateVehiclesInRange.bind(this));

    }

    generateVehiclesInRange(minY: number, maxY: number, roadHalfWidth: number): void {
        console.log('🚗🚗 generateVehiclesInRange🚗', minY, maxY);


        for (let y = minY; y <= maxY; y += 1) {
            for (let roadSide = -1; roadSide <= 1; roadSide += 2) { // -1 for left, 1 for right
                if (Math.random() < this.carDensityPerYUnit) {
                    const randomOffset = Math.random() * roadHalfWidth;
                    const x = roadSide * (roadHalfWidth - randomOffset)

                    const width = varyNumberByPercentage(this.baseCarSize, 0.2); // add some variance to the base car size
                    let length = width * 1.2;
                    const newVehicle = new Vehicle(
                        x,
                        y,
                        width,
                        varyNumberByPercentage(length, 0.2),
                        randomShadeOfBlue(),
                        0,
                        10 //TBC - random velocity between 10 and 20
                    );

                    this.gameState.vehicles.push(newVehicle);
                }
            }
        }
    }
}