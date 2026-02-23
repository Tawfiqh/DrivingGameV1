import Foundation

public class Tree: EnvironmentObject {
    var radius: Double

    init(x: Double, y: Double, radius: Double = 1.0) {
        self.radius = radius
        super.init(x: x, y: y, name: "tree")
    }

    // SAT collision between rotated rectangle (player) and circle (tree)
    override func checkCollisionWithPlayerDetailed(_ player: VehicleCollisionObject) -> Bool {
        let angle = player.steeringAngle * .pi / 180
        let c = cos(angle), s = sin(angle)
        let hw = player.width / 2, hl = player.length / 2

        let localCorners: [(Double, Double)] = [(-hw, -hl), (hw, -hl), (hw, hl), (-hw, hl)]
        let wc = localCorners.map { (lx, ly) -> (Double, Double) in
            (player.x + lx * c - ly * s,
             player.y + lx * s + ly * c)
        }

        // Step 1: check edge normals as separating axes
        for i in 0..<4 {
            let j = (i + 1) % 4
            let ex = wc[j].0 - wc[i].0
            let ey = wc[j].1 - wc[i].1
            let len = sqrt(ex * ex + ey * ey)
            guard len > 0 else { continue }
            let nx = -ey / len, ny = ex / len

            var minR = Double.infinity, maxR = -Double.infinity
            for corner in wc {
                let p = corner.0 * nx + corner.1 * ny
                minR = min(minR, p); maxR = max(maxR, p)
            }
            let cp = x * nx + y * ny
            if maxR < cp - radius || minR > cp + radius { return false }
        }

        // Step 2: axis from circle centre to closest point on rectangle
        var closestX = x, closestY = y
        for i in 0..<4 {
            let j = (i + 1) % 4
            let ex = wc[j].0 - wc[i].0
            let ey = wc[j].1 - wc[i].1
            let tx = x - wc[i].0, ty = y - wc[i].1
            let el2 = ex * ex + ey * ey
            guard el2 > 0 else { continue }
            let t = max(0, min(1, (tx * ex + ty * ey) / el2))
            let cx = wc[i].0 + t * ex, cy = wc[i].1 + t * ey
            let d1 = (x - cx) * (x - cx) + (y - cy) * (y - cy)
            let d2 = (x - closestX) * (x - closestX) + (y - closestY) * (y - closestY)
            if d1 < d2 { closestX = cx; closestY = cy }
        }

        let dx = x - closestX, dy = y - closestY
        return dx * dx + dy * dy < radius * radius
    }

    override func getCollisionObject() -> EnvironmentObject { self }
}
