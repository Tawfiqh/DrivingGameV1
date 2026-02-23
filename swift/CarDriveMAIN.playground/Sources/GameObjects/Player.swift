import SwiftUI

public enum Direction {
    case up, down, left, right
}

public class Player: Vehicle {
    let velocityIncrement: Double      = 2.0
    let maxVelocity: Double            = 30.0
    let maxSteeringAngle: Double       = 135.0
    let steeringAngleIncrement: Double = 10.0

    static let defaultColor = SwiftUI.Color(red: 225.0/255, green: 40.0/255, blue: 0)

    init(x: Double = 0, y: Double = 10) {
        super.init(
            x: x, y: y,
            width: 1.764, length: 3.83,
            color: Player.defaultColor,
            steeringAngle: 0,
            velocity: 10,
            name: "player"
        )
    }

    public func adjustSteering(_ direction: Direction) {
        switch direction {
        case .left:  steeringAngle -= steeringAngleIncrement
        case .right: steeringAngle += steeringAngleIncrement
        default: break
        }
        steeringAngle = max(-maxSteeringAngle, min(maxSteeringAngle, steeringAngle))
    }

    public func adjustVelocity(_ direction: Direction) {
        switch direction {
        case .up:   velocity += velocityIncrement
        case .down: velocity -= velocityIncrement
        default: break
        }
        velocity = max(-maxVelocity, min(maxVelocity, velocity))
    }
}
