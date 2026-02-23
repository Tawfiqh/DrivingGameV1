// Base class for all objects placed in the game world (trees, vehicles, etc.)
public class EnvironmentObject {
    var x: Double
    var y: Double
    var name: String

    init(x: Double, y: Double, name: String = "") {
        self.x = x
        self.y = y
        self.name = name
    }

    // Quick proximity check before doing expensive collision detection
    func checkObjectIsCloseToPlayer(_ player: Player, playerMaxSize: Double) -> Bool {
        return y > player.y - playerMaxSize
            && y < player.y + playerMaxSize
            && x > player.x - playerMaxSize
            && x < player.x + playerMaxSize
    }

    // Subclasses override for fine-grained SAT collision detection
    func checkCollisionWithPlayerDetailed(_ player: VehicleCollisionObject) -> Bool {
        return false
    }

    func getCollisionObject() -> EnvironmentObject {
        return self
    }
}
