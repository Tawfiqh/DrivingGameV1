import { EnvironmentObject } from './EnvironmentObjects.js';
import { Player } from './Player.js';
import { Position } from './CarGame.js';
import { lightenColor } from './Helpers.js';

class Vector { //same as a Position but can do some calculations by using the class
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `x:${this.x},y:${this.y}`;
    }


    // subtract
    subtract(other: Vector): Vector {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    // the perp method is just (x, y) => (-y, x) or (y, -x)
    perp(): Vector {
        return new Vector(-this.y, this.x);
    }

    dot(other: Vector): number {
        return this.x * other.x + this.y * other.y;
    }
}


class Projection { //TBC if correct
    min: number;
    max: number;

    constructor(min: number, max: number) {
        this.min = min;
        this.max = max;
    }

    overlap(other: Projection): boolean {
        return this.min <= other.max && this.max >= other.min;
    }
}



export class Vehicle extends EnvironmentObject {

    width: number;
    length: number;
    color: string;
    lighterColor: string;
    steeringAngle: number; // how far has the user turned the steering wheel (away from 0 degrees which is straight ahead)
    velocity: number; // how fast is the car going (Meters per second)

    constructor(
        x: number,
        y: number,
        width: number,
        length: number,
        color: string,
        steeringAngle: number = 0,
        velocity: number = 10,
        name: string = "Vehicle") {

        super(x, y, name);
        this.width = width;
        this.length = length;
        this.color = color;
        this.lighterColor = lightenColor(color);
        this.steeringAngle = steeringAngle;
        this.velocity = velocity;
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


    getCollisionObject(): VehicleCollisionObject {
        return new VehicleCollisionObject(this);
    }
}


export class VehicleCollisionObject extends Vehicle {
    vertices: Vector[];
    axes: Vector[];

    constructor(vehicle: Vehicle) {
        super(vehicle.x, vehicle.y, vehicle.width, vehicle.length, vehicle.color, vehicle.steeringAngle, vehicle.velocity, vehicle.name);
        this.vertices = this.calculateVertices();
        this.axes = this.calculateAxes();
    }

    calculateVertices(): Vector[] { // The vertices are the corners of the vehicle
        const angle = this.steeringAngle * Math.PI / 180; // Convert to radians
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const halfWidth = this.width / 2;
        const halfLength = this.length / 2;

        // Local corners (before rotation, relative to center)
        const localCorners: Position[] = [
            { x: -halfWidth, y: -halfLength },
            { x: halfWidth, y: -halfLength },
            { x: halfWidth, y: halfLength },
            { x: -halfWidth, y: halfLength }
        ];

        // Rotate and translate corners to world coordinates
        const worldCorners: Vector[] = localCorners.map(
            corner => {
                let worldX = this.x + corner.x * cos - corner.y * sin
                let worldY = this.y + corner.x * sin + corner.y * cos
                return new Vector(worldX, worldY)
            }
        );

        // console.log('🚗🚗 calculateVertices🚗', worldCorners.length);
        return worldCorners;
    }

    calculateAxes(): Vector[] { // The axes are the normals of each shape’s edges.

        const axes: Vector[] = [];

        const vertices: Vector[] = this.vertices;

        // loop over the vertices
        for (let i = 0; i < vertices.length; i++) {
            // get the current vertex
            const p1: Vector = vertices[i];

            // get the next vertex
            const p2: Vector = vertices[i + 1 == vertices.length ? 0 : i + 1];

            // subtract the two to get the edge vector
            const edge: Vector = p1.subtract(p2);

            // get either perpendicular vector
            const normal: Vector = edge.perp();


            axes[i] = normal;
        }

        return axes;

    }

    // Commented out as not that much recomputation actually happens - so the cache doesn't help much
    // this is a cache of the projections for the axes
    // computedProjections: Map<string, Projection> = new Map();

    // checkProjectionAlreadyExistsFor(axis: Vector): Projection | undefined {
    //     return this.computedProjections.get(axis.toString()) as Projection | undefined;
    // }

    project(axis: Vector): Projection {

        // const existingProjection = this.checkProjectionAlreadyExistsFor(axis)
        // if (existingProjection) {
        //     console.log('📈✅ Projection already exists for axis', axis.toString(), "on ", this.name);
        //     return existingProjection
        // }
        // console.log('📈❌ Projection does not exist for axis', axis.toString(), "on ", this.name);

        const vertices: Vector[] = this.vertices;

        let min: number = axis.dot(vertices[0]);
        let max: number = min;

        for (let i = 1; i < vertices.length; i++) {
            // NOTE: the axis must be normalized to get accurate projections for MTV -- not needed in this simple use case
            const dotP: number = axis.dot(vertices[i]);
            if (dotP < min) {
                min = dotP;
            } else if (dotP > max) {
                max = dotP;
            }
        }

        const projection = new Projection(min, max);

        // // cache this projection for the axis
        // console.log('📈💾 Caching projection for axis', axis.toString(), this.name);
        // this.computedProjections.set(axis.toString(), projection);

        return projection;
    }


    //TBC - should just do the player calculations once 
    // pass in a collisionPlayer object that has the axes, vertices, etc.
    checkCollisionWithPlayerDetailed(player: VehicleCollisionObject): boolean {
        // SAT (Separating Axis Theorem) collision detection between polygons
        // https://dyn4j.org/2010/01/sat/
        const axes1: Vector[] = player.axes;
        const axes2: Vector[] = this.axes;

        const axes: Vector[] = [...axes1, ...axes2] // get the axes to test;


        // loop over the axes
        for (let i = 0; i < axes.length; i++) {
            let axis: Vector = axes[i];

            // project both shapes onto the axis
            const p1: Projection = player.project(axis); //TBC these can be stored for the player object as it will be reprojected for each of the player's axes
            const p2: Projection = this.project(axis);

            // do the projections overlap?
            if (!p1.overlap(p2)) {
                // then we can guarantee that the shapes do not overlap
                return false;
            }
        }
        // if we get here then we know that every axis had overlap on it
        // so we can guarantee an intersection
        return true;

    }
}
