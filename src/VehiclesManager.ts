import { EnvironmentObjectManager } from './EnvironmentObjectManager.js';
import { varyNumberByPercentage, randomShadeOfBlue } from './Helpers.js';
import { Vehicle } from './Vehicle.js';


export class VehiclesManager extends EnvironmentObjectManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
    readonly minYForVehicles: number = 50;
    //trees
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

        this.checkViewDistanceAndUpdateEnvironmentObjects(sortedVehiclesY, this.generateVehiclesInRange.bind(this), '🚗🚗');

    }


    carDensityPerYUnit(y: number): number {
        // Generate a vehicle at the minYForVehicles boundary
        // AND then don't generate any more vehicles behind the player
        // Otherwise the algorithm will keep trying to generate vehicles 2*viewDistance behind the player
        // Avoid generating vehicles behind the player that immediately drive into the player
        if (y == -this.minYForVehicles) {
            return 1;
        }
        // Then don't generate any more vehicles behind the player


        // if we're within the minYForVehicles range, we don't generate vehicles
        // this is to avoid generating vehicles behind the player that immediately drive into the player
        // also to avoid generating vehicles ahead of the player that the player drives into quickly
        if (-this.minYForVehicles < y && y < this.minYForVehicles) {
            return 0;
        }

        // y is the distance from the player
        // we want to generate fewer vehicles as we get further away from the player
        const startGeneratingVehiclesAtY = this.minYForVehicles;
        const density = (-startGeneratingVehiclesAtY / y) + 1; // This is based on y=(-50/x) + 1

        const maxDensity = 1 / 15;
        return density * maxDensity; // reduce the density by 100x to make it more sparse

    }

    vehicleVelocityBasedOnY(y: number): number {
        // vehicles get faster as we get further along the y-axis
        if (y < 0) {
            return 0;
        }

        return varyNumberByPercentage(15, 0.333); // Random velocity between 10 and 20
    }


    generateVehiclesInRange(minY: number, maxY: number): void {
        console.log('🚗🚗 generateVehiclesInRange🚗', minY, maxY);

        const roadHalfWidth = this.calculateRoadWidth() / 2;

        for (let y = minY; y <= maxY; y += 1) {
            for (let roadSide = -1; roadSide <= 1; roadSide += 2) { // -1 for left, 1 for right
                if (Math.random() < this.carDensityPerYUnit(y)) {
                    const randomOffsetWithinRoadWidth = Math.random() * roadHalfWidth;
                    const x = roadSide * randomOffsetWithinRoadWidth

                    const width = varyNumberByPercentage(this.baseCarSize, 0.2); // add some variance to the base car size
                    let length = width * 1.2;
                    const newVehicle = new Vehicle(
                        x,
                        y,
                        width,
                        varyNumberByPercentage(length, 0.2),
                        randomShadeOfBlue(),
                        0,
                        this.vehicleVelocityBasedOnY(y)
                    );

                    this.gameState.vehicles.push(newVehicle);
                }
            }
        }
    }
}