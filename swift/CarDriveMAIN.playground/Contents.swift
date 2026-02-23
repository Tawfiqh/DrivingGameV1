// A SwiftUI Canvas based Playground
import SwiftUI
import PlaygroundSupport

struct ContentView: View {
    @State var gameOverVisible: Bool = false
    @State var viewPort3dEnabled: Bool = false
    
    @State var currentGame: CarGame = CarGame()
    let renderer = TopDown2dRenderer()
    
    var body: some View {
        Text("Car Drive").font(.title)
        
        VStack {
            Text("Use the arrow-keys/WASD to move. On mobile swipe up/down to accelerate and left/right to steer.").font(.body)
            Toggle("3D View", isOn: $viewPort3dEnabled)
        }
        
        ZStack {
            VStack {
                Text("Score: \(Int(currentGame.gameState.score))").font(.title)
                Text("Game Over - refresh to play again").font(.title)
                Button(action: restart) {
                    Text("Refresh")
                }
            }.opacity(gameOverVisible ? 1 : 0)
            
            GameCanvas { drawer in
                renderer.render(canvas: drawer, gameState: currentGame.gameState)
            }
        }

    }// end of the body: some View
    
    func restart() {
        print("TBC - restarting game")
    }
    
} //end of the ContentView:View struct


// Present the view controller in the Live View window
PlaygroundPage.current.setLiveView(ContentView())

//<script type="module">
//    // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//    // Game initialisation
//    const carGame = new CarGame();
//
//    const startWith3d = true;
//    // Start with 3D view
//    let currentRenderer = { stop: () => { }, start: () => { } };
//    if (startWith3d) {
//        toggleView(Chase3dRenderer, view3d);
//    } else {
//        toggleView(TopDown2dRenderer, view2d);
//    }
//
//</script>


//-=-=-=
//<head>
//    <style>
//        :root {
//            --main-color: red;
//        }
//
//        html,
//        body {
//            /* this is to prevent the page from scrolling when playing on mobile */
//            height: 100%;
//            width: 100%;
//            overflow: hidden;
//        }
//
//        body {
//            background-color: black;
//            font-family: Arial, sans-serif;
//            color: white;
//        }
//
//        canvas {
//            border: 1px solid var(--main-color);
//            width: min(80vw, 80vh);
//            height: min(80vw, 80vh);
//
//        }
//
//        #gameCanvas {
//            border: 1px solid greenyellow;
//            border-radius: 10px;
//        }
//
//        #gameOver {
//            display: none;
//            width: 50%;
//            border: 1px solid greenyellow;
//            border-radius: 10px;
//
//            padding: 20px;
//            z-index: 10;
//            text-align: center;
//            font-family: 'Courier New', Courier, monospace;
//
//            background-color: greenyellow;
//            color: black;
//        }
//
//        .centreDiv {
//            position: absolute;
//            left: 50%;
//            top: 50%;
//            transform: translate(-50%, -50%);
//        }
//
//        #refreshButton {
//            background-color: orange;
//            color: black;
//            border: 1px solid black;
//            border-radius: 5px;
//            padding: 10px 20px;
//            font-family: 'Courier New', Courier, monospace;
//            font-weight: bold;
//            font-size: 1.2em;
//            cursor: pointer;
//            transition: background-color 0.3s ease;
//
//            &:hover {
//                background-color: darkorange;
//                box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
//            }
//        }
//
//        .view-toggle {
//            display: flex;
//            align-items: center;
//            gap: 8px;
//            margin-top: 10px;
//        }
//
//        .view-label {
//            font-size: 0.9em;
//            color: #ccc;
//        }
//
//        .view-btn {
//            background: #333;
//            color: #ccc;
//            border: 1px solid #555;
//            border-radius: 6px;
//            padding: 6px 14px;
//            font-family: 'Courier New', Courier, monospace;
//            font-size: 0.95em;
//            cursor: pointer;
//            transition: background 0.2s, color 0.2s, border-color 0.2s;
//        }
//
//        .view-btn:hover {
//            background: #444;
//            color: white;
//            border-color: greenyellow;
//        }
//
//        .view-btn.active {
//            background: greenyellow;
//            color: black;
//            border-color: greenyellow;
//        }
//    </style>
//</head>

