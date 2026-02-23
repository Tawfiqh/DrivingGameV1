import SwiftUI

// MARK: - SAT helpers

struct VVector {
    let x: Double
    let y: Double

    func subtract(_ other: VVector) -> VVector { VVector(x: x - other.x, y: y - other.y) }
    func perp() -> VVector { VVector(x: -y, y: x) }
    func dot(_ other: VVector) -> Double { x * other.x + y * other.y }
}

struct VProjection {
    let min: Double
    let max: Double
    func overlaps(_ other: VProjection) -> Bool { min <= other.max && max >= other.min }
}

// MARK: - Vehicle

public class Vehicle: EnvironmentObject {
    var width: Double
    var length: Double
    var color: SwiftUI.Color
    var lighterColor: SwiftUI.Color
    var steeringAngle: Double   // degrees, 0 = straight ahead
    var velocity: Double        // metres per second

    init(x: Double, y: Double,
         width: Double, length: Double,
         color: SwiftUI.Color,
         steeringAngle: Double = 0,
         velocity: Double = 10,
         name: String = "Vehicle") {
        self.width = width
        self.length = length
        self.color = color
        self.lighterColor = lightenColor(color)
        self.steeringAngle = steeringAngle
        self.velocity = velocity
        super.init(x: x, y: y, name: name)
    }

    func updatePosition(seconds: Double) {
        let d = velocity * seconds
        x += d * sin(steeringAngle * .pi / 180)
        y += d * cos(steeringAngle * .pi / 180)
    }

    func getVehicleCollisionObject() -> VehicleCollisionObject {
        VehicleCollisionObject(self)
    }

    override func getCollisionObject() -> EnvironmentObject {
        VehicleCollisionObject(self)
    }
}

// MARK: - VehicleCollisionObject
// A snapshot of a Vehicle with pre-computed SAT vertices and axes.

public class VehicleCollisionObject: Vehicle {
    var vertices: [VVector] = []
    var axes: [VVector] = []

    init(_ v: Vehicle) {
        super.init(
            x: v.x, y: v.y,
            width: v.width, length: v.length,
            color: v.color,
            steeringAngle: v.steeringAngle,
            velocity: v.velocity,
            name: v.name
        )
        self.vertices = computeVertices()
        self.axes = computeAxes()
    }

    private func computeVertices() -> [VVector] {
        let angle = steeringAngle * .pi / 180
        let c = cos(angle), s = sin(angle)
        let hw = width / 2, hl = length / 2
        let corners: [(Double, Double)] = [(-hw, -hl), (hw, -hl), (hw, hl), (-hw, hl)]
        return corners.map { (lx, ly) in
            VVector(x: x + lx * c - ly * s,
                    y: y + lx * s + ly * c)
        }
    }

    private func computeAxes() -> [VVector] {
        var result = [VVector]()
        for i in 0..<vertices.count {
            let p1 = vertices[i]
            let p2 = vertices[(i + 1) % vertices.count]
            result.append(p1.subtract(p2).perp())
        }
        return result
    }

    func project(_ axis: VVector) -> VProjection {
        var minVal = axis.dot(vertices[0])
        var maxVal = minVal
        for i in 1..<vertices.count {
            let d = axis.dot(vertices[i])
            if d < minVal { minVal = d } else if d > maxVal { maxVal = d }
        }
        return VProjection(min: minVal, max: maxVal)
    }

    // SAT collision detection between two rotated rectangles
    override func checkCollisionWithPlayerDetailed(_ player: VehicleCollisionObject) -> Bool {
        for axis in player.axes + axes {
            if !player.project(axis).overlaps(project(axis)) { return false }
        }
        return true
    }
}
