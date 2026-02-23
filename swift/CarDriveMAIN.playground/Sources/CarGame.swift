import Foundation
import SwiftUI

// MARK: - Core types

public typealias Road = (Position, Position)

public struct Position {
    public var x: Double
    public var y: Double

    public init(x: Double, y: Double) {
        self.x = x
        self.y = y
    }
}

// MARK: - GameState

public class GameState {
    public var player: Player
    public var trees: [Tree]
    public var vehicles: [Vehicle]
    public var road: [Road]
    public var gameOver: Bool
    public var score: Double

    public init() {
        self.player   = Player(x: 0, y: CarGame.startY)
        self.road     = []
        self.trees    = []
        self.vehicles = []
        self.gameOver = false
        self.score    = 0
    }
}

// MARK: - CarGame

public class CarGame {
    // World constants
    public static let xAxisRange: Double = 20.0
    public static let startY: Double     = 10.0
    let roadWidth: Double = CarGame.xAxisRange / 2.0

    public var gameState: GameState

    // Environment managers
    var roadManager: RoadManager!
    var treesManager: TreesManager!
    var vehiclesManager: VehiclesManager!

    public init() {
        print("Welcome to Car Game 🚗")
        gameState    = GameState()
        roadManager  = RoadManager(gameState, roadWidth)
        treesManager = TreesManager(gameState)
        vehiclesManager = VehiclesManager(gameState)
        updateMap()     // seed initial road, trees, vehicles
    }

    // MARK: - Game loop (called every frame by the view)

    public func gameRunLoop(dt: Double) {
        guard !gameState.gameOver else { return }
        updatePlayer(seconds: dt)
        updateMap(seconds: dt)
        checkAllCollisions()
        updateScore()
    }

    // MARK: - Updates

    func updatePlayer(seconds: Double) {
        gameState.player.updatePosition(seconds: seconds)
    }

    func updateMap(seconds: Double = 0) {
        roadManager.updateRoad()
        vehiclesManager.updateVehicles(seconds: seconds)
        treesManager.updateTrees()
    }

    func updateScore() {
        let dist = floor(gameState.player.y - CarGame.startY)
        gameState.score = max(gameState.score, dist)
    }

    // MARK: - Collision detection

    func checkAllCollisions() {
        if checkCollisionsInList(player: gameState.player, objects: gameState.trees as [EnvironmentObject]) {
            endGame(); return
        }
        if checkCollisionsInList(player: gameState.player, objects: gameState.vehicles as [EnvironmentObject]) {
            endGame(); return
        }
    }

    func checkCollisionsInList(player: Player, objects: [EnvironmentObject]) -> Bool {
        let maxSize = max(player.width, player.length) * 1.5
        let close   = objects.filter { $0.checkObjectIsCloseToPlayer(player, playerMaxSize: maxSize) }
        guard !close.isEmpty else { return false }

        let playerCollision = player.getVehicleCollisionObject()
        for obj in close {
            if obj.getCollisionObject().checkCollisionWithPlayerDetailed(playerCollision) {
                return true
            }
        }
        return false
    }

    // MARK: - Game over / restart

    func endGame() {
        print("🚗🚗 Game Over! Score: \(Int(gameState.score)) 🚗🚗")
        gameState.gameOver = true
    }

    public func restart() {
        gameState       = GameState()
        roadManager     = RoadManager(gameState, roadWidth)
        treesManager    = TreesManager(gameState)
        vehiclesManager = VehiclesManager(gameState)
        updateMap()
    }
}
