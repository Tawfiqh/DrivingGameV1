public class TreesManager: EnvironmentObjectManager {
    let treeDensity: Double = 0.3
    let treeSize: Double    = 1.0

    func generateTreesInRange(minY: Double, maxY: Double) {
        let roadHalfWidth = calculateRoadWidth() / 2
        var y = minY
        while y <= maxY {
            for side in [-1.0, 1.0] {
                if Double.random(in: 0..<1) < treeDensity {
                    let offset = Double.random(in: 0..<1) * roadHalfWidth
                    let x      = side * (roadHalfWidth + offset)
                    let size   = ((Double.random(in: 0..<1) - 1.0) * treeSize * 0.8) + treeSize
                    gameState.trees.append(Tree(x: x, y: y, radius: max(0.1, size)))
                }
            }
            y += 1
        }
    }

    func updateTrees() {
        gameState.trees.sort { $0.y < $1.y }
        let ys = gameState.trees.map { $0.y }
        checkViewDistanceAndUpdateEnvironmentObjects(sortedY: ys, updateInRange: generateTreesInRange)
    }
}
