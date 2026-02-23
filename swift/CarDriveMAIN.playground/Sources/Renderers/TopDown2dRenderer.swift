import SwiftUI

public struct CanvasVehicle {
    public var x: Double
    public var y: Double
    public var steeringAngle: Double
    public var width: Double
    public var length: Double
    public var color: Color
    public var lighterColor: Color
}

public class TopDown2dRenderer {

    static let scaleFactor: Double = 10
    static let htmlCanvasSize: Double = 200 * scaleFactor

    let roadColor = Color.gray
    let roadMarkingsColor = Color(red: 0.93, green: 0.93, blue: 0.93)
    let treeColor = Color(red: 0.33, green: 0.37, blue: 0.23)
    let backgroundColor = Color(red: 0.48, green: 0.54, blue: 0.15)

    var canvasCenterInWorldY: Double = 0
    // Actual pixel dimension of the canvas – updated each render call
    var dimension: Double = TopDown2dRenderer.htmlCanvasSize

    public init() {}

    public func render(canvas: CanvasDrawer, gameState: GameState) {
        dimension = canvas.size.width   // use the real canvas size for coordinate mapping
        canvas.clearCanvas(backgroundColor: backgroundColor)

        updateCanvasCenterInWorld(playerY: gameState.player.y)
        drawRoad(canvas: canvas, gameState: gameState)
        renderVehicles(canvas: canvas, gameState: gameState)
        renderTrees(canvas: canvas, gameState: gameState)

        let playerOnCanvas = translatedVehicle(gameState.player)
        drawCar(canvas: canvas, car: playerOnCanvas)

        renderScore(canvas: canvas, score: gameState.score)
    }

    // MARK: - Camera

    func updateCanvasCenterInWorld(playerY: Double) {
        // canvasCenterInWorldY = playerY - gameState.player.length
        // TBC - needs player length accessible
        canvasCenterInWorldY = playerY - 2.0
    }

    // MARK: - Road

    func drawRoad(canvas: CanvasDrawer, gameState: GameState) {
        guard gameState.road.count > 1 else { return }
        for i in 0..<(gameState.road.count - 1) {
            let segmentStart = gameState.road[i]
            let segmentEnd = gameState.road[i + 1]
            drawRoadSegment(
                canvas: canvas,
                start: translateWorldSegment(segmentStart),
                end: translateWorldSegment(segmentEnd)
            )
        }
    }

    func drawRoadSegment(canvas: CanvasDrawer, start: (CGPoint, CGPoint), end: (CGPoint, CGPoint)) {
        canvas.drawQuadrilateral(
            a: start.0, b: start.1, c: end.1, d: end.0,
            color: roadColor
        )
        drawRoadSegmentMarkings(canvas: canvas, start: start, end: end)
    }

    func drawRoadSegmentMarkings(canvas: CanvasDrawer, start: (CGPoint, CGPoint), end: (CGPoint, CGPoint)) {
        drawRoadSegmentBoundaries(canvas: canvas, start: start, end: end, percentage: 1.0 / 3.0, color: roadMarkingsColor, strokeWidth: 0.75, dashed: true)
        drawRoadSegmentBoundaries(canvas: canvas, start: start, end: end, percentage: 0.99, color: roadMarkingsColor, strokeWidth: 0.25, dashed: false)
    }

    func drawRoadSegmentBoundaries(canvas: CanvasDrawer, start: (CGPoint, CGPoint), end: (CGPoint, CGPoint), percentage: Double, color: Color, strokeWidth: Double, dashed: Bool = false) {
        let msChunkX = (start.1.x - start.0.x) * percentage
        let msChunkY = (start.1.y - start.0.y) * percentage
        let ms1 = CGPoint(x: start.0.x + msChunkX, y: start.0.y + msChunkY)
        let ms2 = CGPoint(x: start.1.x - msChunkX, y: start.1.y - msChunkY)

        let meChunkX = (end.1.x - end.0.x) * percentage
        let meChunkY = (end.1.y - end.0.y) * percentage
        let me1 = CGPoint(x: end.0.x + meChunkX, y: end.0.y + meChunkY)
        let me2 = CGPoint(x: end.1.x - meChunkX, y: end.1.y - meChunkY)

        canvas.drawLine(from: ms1, to: me1, color: color, strokeWidth: strokeWidth, dashed: dashed)
        canvas.drawLine(from: ms2, to: me2, color: color, strokeWidth: strokeWidth, dashed: dashed)
    }

    // MARK: - Vehicles

    func renderVehicles(canvas: CanvasDrawer, gameState: GameState) {
        for vehicle in gameState.vehicles {
            drawCar(canvas: canvas, car: translatedVehicle(vehicle))
        }
    }

    func drawCar(canvas: CanvasDrawer, car: CanvasVehicle) {
        canvas.drawRect(x: car.x, y: car.y, rotation: car.steeringAngle, width: car.width, height: car.length, color: car.color)

        let roofScale = 0.67
        canvas.drawRect(x: car.x, y: car.y, rotation: car.steeringAngle, width: car.width * roofScale, height: car.length * roofScale, color: car.lighterColor)

        let cosA = cos(car.steeringAngle * .pi / 180)
        let sinA = sin(car.steeringAngle * .pi / 180)

        for i in stride(from: -1, through: 1, by: 2) {
            let headlightLocalX = Double(i) * car.width / 4
            let headlightLocalY = -car.length / 2

            let headlightX = car.x + (headlightLocalX * cosA) - (headlightLocalY * sinA)
            let headlightY = car.y + (headlightLocalX * sinA) + (headlightLocalY * cosA)

            canvas.drawRect(x: headlightX, y: headlightY, rotation: car.steeringAngle, width: car.width / 5, height: car.length / 10, color: .yellow)
        }
    }

    // MARK: - Trees

    func renderTrees(canvas: CanvasDrawer, gameState: GameState) {
        for tree in gameState.trees {
            let canvasPos = translateWorldToCanvas(Position(x: tree.x, y: tree.y))
            canvas.drawEllipse(
                x: canvasPos.x,
                y: canvasPos.y,
                radiusX: translateLengthOnXAxis(tree.radius),
                radiusY: translateLengthOnYAxis(tree.radius),
                color: treeColor
            )
        }
    }

    // MARK: - Score

    func renderScore(canvas: CanvasDrawer, score: Double) {
        // Scale relative to actual canvas size
        let scale    = dimension / TopDown2dRenderer.htmlCanvasSize
        let fontSize = 12.0 * TopDown2dRenderer.scaleFactor * scale
        let xPos     = 10.0 * TopDown2dRenderer.scaleFactor * scale
        let yPos     = 15.0 * TopDown2dRenderer.scaleFactor * scale
        canvas.drawText(x: xPos, y: yPos, fontSize: fontSize, text: "Score: \(Int(score))", color: Color(red: 0.49, green: 1.0, blue: 0.08))
    }

    // MARK: - Coordinate translation (world -> canvas)

    func translateWorldToCanvas(_ worldPosition: Position) -> CGPoint {
        let xRange: Double = 15
        let yScale: Double = 45
        return CGPoint(
            x: (worldPosition.x + xRange) / (xRange * 2) * dimension,
            y: dimension - (((worldPosition.y - canvasCenterInWorldY) / yScale) * dimension)
        )
    }

    func translateWorldSegment(_ segment: (Position, Position)) -> (CGPoint, CGPoint) {
        return (translateWorldToCanvas(segment.0), translateWorldToCanvas(segment.1))
    }

    func translateLengthOnXAxis(_ length: Double) -> Double {
        let origin = translateWorldToCanvas(Position(x: 0, y: 0))
        let offset = translateWorldToCanvas(Position(x: length, y: 0))
        return offset.x - origin.x
    }

    func translateLengthOnYAxis(_ length: Double) -> Double {
        let origin = translateWorldToCanvas(Position(x: 0, y: 0))
        let offset = translateWorldToCanvas(Position(x: 0, y: length))
        return origin.y - offset.y
    }

    func translatedVehicle(_ vehicle: Vehicle) -> CanvasVehicle {
        let center = translateWorldToCanvas(Position(x: vehicle.x, y: vehicle.y))
        return CanvasVehicle(
            x: center.x,
            y: center.y,
            steeringAngle: vehicle.steeringAngle,
            width: translateLengthOnXAxis(vehicle.width),
            length: translateLengthOnYAxis(vehicle.length),
            color: vehicle.color,
            lighterColor: vehicle.lighterColor
        )
    }
}
