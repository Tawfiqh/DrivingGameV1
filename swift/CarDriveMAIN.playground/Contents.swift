// A SwiftUI Canvas based Playground
import SwiftUI
import PlaygroundSupport

struct ContentView: View {
    @State private var currentGame = CarGame()
    @State private var renderer    = TopDown2dRenderer()

    var body: some View {
        VStack(spacing: 8) {
            Text("Car Drive")
                .font(.title)

            Text("Swipe up/down to accelerate · left/right to steer")
                .font(.caption)
                .foregroundColor(.secondary)

            ZStack {
                // Game canvas – TimelineView forces a redraw every frame
                TimelineView(.animation) { _ in
                    GameCanvas(
                        scaleFactor: 1.0,
                        canvasSize: CGSize(width: 350, height: 350)
                    ) { drawer in
                        // Update game state then render
                        currentGame.gameRunLoop(dt: 1.0 / 60.0)
                        renderer.render(canvas: drawer, gameState: currentGame.gameState)
                    }
                }

                // Game-over overlay
                if currentGame.gameState.gameOver {
                    VStack(spacing: 12) {
                        Text("Game Over")
                            .font(.title).bold()
                        Text("Score: \(Int(currentGame.gameState.score))")
                            .font(.headline)
                        Button("Play Again") {
                            currentGame.restart()
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 8)
                        .background(Color.orange)
                        .foregroundColor(.black)
                        .cornerRadius(8)
                    }
                    .padding(20)
                    .background(Color(red: 0.67, green: 1, blue: 0.18).opacity(0.9))
                    .cornerRadius(12)
                }
            }
            .gesture(
                DragGesture(minimumDistance: 20)
                    .onEnded { value in
                        let dx = value.translation.width
                        let dy = value.translation.height
                        if abs(dx) > abs(dy) {
                            currentGame.gameState.player.adjustSteering(dx > 0 ? .right : .left)
                        } else {
                            currentGame.gameState.player.adjustVelocity(dy < 0 ? .up : .down)
                        }
                    }
            )
            .focusable()
            .onKeyPress(.upArrow)    { _ in currentGame.gameState.player.adjustVelocity(.up);    return .handled }
            .onKeyPress(.downArrow)  { _ in currentGame.gameState.player.adjustVelocity(.down);  return .handled }
            .onKeyPress(.leftArrow)  { _ in currentGame.gameState.player.adjustSteering(.left);  return .handled }
            .onKeyPress(.rightArrow) { _ in currentGame.gameState.player.adjustSteering(.right); return .handled }
            .onKeyPress(characters: CharacterSet(charactersIn: "wW")) { _ in currentGame.gameState.player.adjustVelocity(.up);    return .handled }
            .onKeyPress(characters: CharacterSet(charactersIn: "sS")) { _ in currentGame.gameState.player.adjustVelocity(.down);  return .handled }
            .onKeyPress(characters: CharacterSet(charactersIn: "aA")) { _ in currentGame.gameState.player.adjustSteering(.left);  return .handled }
            .onKeyPress(characters: CharacterSet(charactersIn: "dD")) { _ in currentGame.gameState.player.adjustSteering(.right); return .handled }

            Text("Score: \(Int(currentGame.gameState.score))")
                .font(.headline)
                .monospacedDigit()
        }
        .padding()
    }
}

PlaygroundPage.current.setLiveView(ContentView())
