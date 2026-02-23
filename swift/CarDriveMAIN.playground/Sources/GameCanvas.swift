import SwiftUI

public struct GameCanvas: View {
    let scaleFactor: Double
    let canvasSize: CGSize
    let draw: (CanvasDrawer) -> Void

    public init(
        scaleFactor: Double = 1.0,
        canvasSize: CGSize = CGSize(width: 300, height: 300),
        draw: @escaping (CanvasDrawer) -> Void
    ) {
        self.scaleFactor = scaleFactor
        self.canvasSize = canvasSize
        self.draw = draw
    }

    public var body: some View {
        Canvas { context, size in
            let drawer = CanvasDrawer(context: context, size: size, scaleFactor: scaleFactor)
            draw(drawer)
        }
        .frame(width: canvasSize.width, height: canvasSize.height)
        .border(Color.green)
        .cornerRadius(4)
    }
}
