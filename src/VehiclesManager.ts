import { EnvironmentObjectManager } from './TreeManager.js';
import { varyNumberByPercentage, randomShadeOfBlue } from './Helpers.js';
import { Vehicle } from './Vehicle.js';


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