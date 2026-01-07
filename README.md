# Car Drive Dash 🚗

A top-down 2D driving game built with TypeScript and HTML5 Canvas. Drive your car along procedurally generated roads while avoiding obstacles and staying on the road.

## Features

- **Smooth Car Driving**: "Realistic" steering and velocity mechanics with configurable max speed and steering angles
- **Procedural Road Generation**: Infinite roads that generate as you drive
- **Dynamic Environment**: Trees populate on both sides of the road as you progress
- **Top-Down 2D Rendering**: Canvas-based rendering with coordinate transformations
- **Keyboard Controls**: Intuitive WASD or arrow key controls
- **TypeScript**: Fully typed codebase for better maintainability

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CarDriveDash
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

This will:
- Compile TypeScript to JavaScript
- Start a live-server on port 3000
- Automatically open the game in your browser
- Watch for changes and rebuild automatically

### Manual Build

If you prefer to build manually:

```bash
# Build once
npm run build

# Watch mode (rebuilds on file changes)
npm run watch

# Serve the game (separate terminal)
npm run serve
```

## Controls

- **W / ↑ Arrow**: Accelerate forward
- **S / ↓ Arrow**: Brake/Reverse
- **A / ← Arrow**: Steer left
- **D / → Arrow**: Steer right

## Game Mechanics

### Player Physics
- **Velocity**: Adjustable speed with a maximum limit
- **Steering**: Steering angle system (max 135 degrees)
- **Movement**: Position updates based on velocity and steering angle using trigonometry

### Road System
- Road width is configurable
- Roads extend infinitely as you drive

### Environment
- Trees are generated dynamically based on view distance
- Tree density and size are configurable

## Project Structure

```
CarDriveDash/
├── src/
│   ├── CarGame.ts          # Main game logic and state management
│   ├── Player.ts           # Player class with physics and movement
│   └── TopDown2dRenderer.ts # Canvas rendering system
├── dist/                   # Compiled JavaScript (generated)
├── carDrive.html           # Main HTML file
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Development

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and rebuild automatically
- `npm run serve` - Start live-server on port 3000
- `npm run dev` - Build and start development server with watch mode

### Configuration

Key game constants can be adjusted in `src/CarGame.ts`:
- `FPS`: Frame rate (default: 120)
- `roadWidth`: Width of the road
- `viewDistance`: How far ahead/behind trees are generated
- `treeDensity`: Probability of tree generation
- `treeSize`: Size of trees

Player physics can be adjusted in `src/Player.ts`:
- `velocityIncrement`: How much velocity changes per keypress
- `maxVelocity`: Maximum speed
- `maxSteeringAngle`: Maximum steering angle (degrees)
- `steeringAngleIncrement`: How much steering changes per keypress

## Future Enhancements

See `Todo.md` for planned features

## Technologies Used

- **TypeScript**: Type-safe JavaScript
- **HTML5 Canvas**: 2D rendering
- **live-server**: Development server with live reload
- **concurrently**: Run multiple npm scripts simultaneously

