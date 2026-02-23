public class RoadManager: EnvironmentObjectManager {
    let roadWidth: Double

    init(_ gameState: GameState, _ roadWidth: Double) {
        self.roadWidth = roadWidth
        super.init(gameState)
    }

    func generateRoad(minY: Double, maxY: Double) {
        let step: Double = 10
        var y = minY
        while y <= maxY {
            let segment: Road = (
                Position(x: -roadWidth / 2, y: y),
                Position(x:  roadWidth / 2, y: y)
            )
            pushSorted(&gameState.road, segment) { a, b in a.0.y - b.0.y }
            y += step
        }
    }

    func updateRoad() {
        let ys = gameState.road.map { $0.0.y }
        checkViewDistanceAndUpdateEnvironmentObjects(sortedY: ys, updateInRange: generateRoad)
    }
}
