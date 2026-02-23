public class EnvironmentObjectManager {
    static let defaultViewDistance: Double = 300

    let viewDistance: Double
    let gameState: GameState

    init(_ gameState: GameState, viewDistance: Double = EnvironmentObjectManager.defaultViewDistance) {
        self.gameState = gameState
        self.viewDistance = viewDistance
    }

    func calculateRoadWidth() -> Double {
        guard let first = gameState.road.first else { return 10 }
        return abs(first.0.x - first.1.x)
    }

    /// sortedY: y-coordinates of existing objects, sorted ascending.
    /// updateInRange: called with (minY, maxY) for each gap that needs to be populated.
    func checkViewDistanceAndUpdateEnvironmentObjects(
        sortedY: [Double],
        updateInRange: (Double, Double) -> Void
    ) {
        let playerY = gameState.player.y
        let maxWanted = playerY + viewDistance
        let minWanted = playerY - viewDistance
        let buffer    = viewDistance   // generate extra ahead to avoid constant regeneration

        let currentMin = sortedY.first ?? playerY
        let currentMax = sortedY.last  ?? playerY

        if maxWanted > currentMax {
            updateInRange(currentMax, maxWanted + buffer)
        }
        if currentMin > minWanted {
            updateInRange(minWanted - buffer, currentMin)
        }
    }
}
