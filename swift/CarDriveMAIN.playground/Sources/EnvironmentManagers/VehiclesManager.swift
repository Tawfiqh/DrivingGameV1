import SwiftUI

public class VehiclesManager: EnvironmentObjectManager {
    let minYForVehicles: Double = 50
    let baseCarWidth: Double    = 1.5

    func carDensity(atY y: Double) -> Double {
        // Always spawn one vehicle right at the near boundary
        if y == -minYForVehicles { return 1 }
        // Dead zone around the player to avoid instant collisions
        if y > -minYForVehicles && y < minYForVehicles { return 0 }
        // Density rises with distance: y = (-50/x) + 1, scaled down
        let d = (-minYForVehicles / y) + 1
        return d * (1.0 / 15.0)
    }

    func vehicleVelocity(atY y: Double) -> Double {
        y < 0 ? 0 : varyNumberByPercentage(15, maxVariance: 0.333)
    }

    func generateVehiclesInRange(minY: Double, maxY: Double) {
        let roadHalfWidth = calculateRoadWidth() / 2
        var y = minY
        while y <= maxY {
            for side in [-1.0, 1.0] {
                if Double.random(in: 0..<1) < carDensity(atY: y) {
                    let offset = Double.random(in: 0..<1) * roadHalfWidth
                    let x      = side * offset
                    let width  = varyNumberByPercentage(baseCarWidth, maxVariance: 0.2)
                    let length = width * 2.8
                    gameState.vehicles.append(
                        Vehicle(x: x, y: y,
                                width: width, length: length,
                                color: randomShadeOfBlue(),
                                steeringAngle: 0,
                                velocity: vehicleVelocity(atY: y))
                    )
                }
            }
            y += 1
        }
    }

    func updateVehicles(seconds: Double) {
        for v in gameState.vehicles { v.updatePosition(seconds: seconds) }
        gameState.vehicles.sort { $0.y < $1.y }
        let ys = gameState.vehicles.map { $0.y }
        checkViewDistanceAndUpdateEnvironmentObjects(sortedY: ys, updateInRange: generateVehiclesInRange)
    }
}
