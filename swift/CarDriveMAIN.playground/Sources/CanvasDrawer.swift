import SwiftUI

public struct CanvasDrawer {
    var context: GraphicsContext
    public let size: CGSize
    public let scaleFactor: Double

    public init(context: GraphicsContext, size: CGSize, scaleFactor: Double = 1.0) {
        self.context = context
        self.size = size
        self.scaleFactor = scaleFactor
    }

    public func clearCanvas(backgroundColor: Color) {
        context.fill(
            Path(CGRect(origin: .zero, size: size)),
            with: .color(backgroundColor)
        )
    }

    public func drawText(x: Double, y: Double, fontSize: Double, text: String, color: Color) {
        let resolved = context.resolve(
            Text(text).font(.system(size: fontSize, design: .monospaced)).foregroundColor(color)
        )
        context.draw(resolved, at: CGPoint(x: x, y: y), anchor: .topLeading)
    }

    public func drawEllipse(x: Double, y: Double, radiusX: Double, radiusY: Double, color: Color) {
        let rect = CGRect(
            x: x - radiusX,
            y: y - radiusY,
            width: radiusX * 2,
            height: radiusY * 2
        )
        context.fill(Path(ellipseIn: rect), with: .color(color))
    }

    public func drawCircle(x: Double, y: Double, radius: Double, color: Color) {
        drawEllipse(x: x, y: y, radiusX: radius, radiusY: radius, color: color)
    }

    public func drawQuadrilateral(a: CGPoint, b: CGPoint, c: CGPoint, d: CGPoint, color: Color) {
        let lowerBound = -size.width * 1.5
        let upperBound = size.width * 1.5
        let points = [a, b, c, d]
        for p in points {
            if p.x < lowerBound || p.y < lowerBound || p.x > upperBound || p.y > upperBound {
                return
            }
        }

        var path = Path()
        path.move(to: a)
        path.addLine(to: b)
        path.addLine(to: c)
        path.addLine(to: d)
        path.closeSubpath()
        context.fill(path, with: .color(color))
    }

    public func drawRect(x: Double, y: Double, rotation: Double, width: Double, height: Double, color: Color) {
        var ctx = context
        ctx.translateBy(x: x, y: y)
        ctx.rotate(by: .degrees(rotation))
        ctx.fill(
            Path(CGRect(x: -width / 2, y: -height / 2, width: width, height: height)),
            with: .color(color)
        )
    }

    public func drawLine(from start: CGPoint, to end: CGPoint, color: Color, strokeWidth: Double, dashed: Bool = false) {
        var path = Path()
        path.move(to: start)
        path.addLine(to: end)

        let scaledWidth = strokeWidth * scaleFactor

        if dashed {
            let mainLineLength = 25 * scaleFactor
            let gapLength = 10 * scaleFactor
            let shortLineLength = 1.5 * scaleFactor
            let style = StrokeStyle(
                lineWidth: scaledWidth,
                dash: [mainLineLength, gapLength, shortLineLength, gapLength]
            )
            context.stroke(path, with: .color(color), style: style)
        } else {
            context.stroke(path, with: .color(color), lineWidth: scaledWidth)
        }
    }
}
