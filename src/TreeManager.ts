import { GameState } from './CarGame.js';
import { Player } from './Player.js';

export class Tree {
    x: number;
    y: number;
    radius: number;

    constructor(x: number, y: number, radius: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    checkCollisionWithPlayer(player: Player): boolean {
        // SAT (Separating Axis Theorem) collision detection between rotated rectangle and circle
        // https://www.sevenson.com.au/programming/sat/

        // Step 1: Calculate the four corners of the rotated rectangle
        const angle = player.steeringAngle * Math.PI / 180; // Convert to radians
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const halfWidth = player.width / 2;
        const halfLength = player.length / 2;

        // Local corners (before rotation, relative to center)
        const localCorners = [
            { x: -halfWidth, y: -halfLength },
            { x: halfWidth, y: -halfLength },
            { x: halfWidth, y: halfLength },
            { x: -halfWidth, y: halfLength }
        ];

        // Rotate and translate corners to world coordinates
        const worldCorners = localCorners.map(corner => ({
            x: player.x + corner.x * cos - corner.y * sin,
            y: player.y + corner.x * sin + corner.y * cos
        }));

        // Step 2: Get edge vectors and their normals
        // const edges: Array<{ x: number; y: number }> = [];
        const normals: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const edge = {
                x: worldCorners[next].x - worldCorners[i].x,
                y: worldCorners[next].y - worldCorners[i].y
            };
            // edges.push(edge);

            // Normalize edge to get normal
            const length = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
            if (length > 0) {
                // Perpendicular vector (normal) - swap x/y and negate one
                normals.push({
                    x: -edge.y / length,
                    y: edge.x / length
                });
            }
        }

        // Step 3: Check each separating axis
        for (const normal of normals) {
            // Project rectangle corners onto the axis
            let minRect = Infinity;
            let maxRect = -Infinity;

            for (const corner of worldCorners) {
                const projection = corner.x * normal.x + corner.y * normal.y; // dot product of corner and the normal
                minRect = Math.min(minRect, projection);
                maxRect = Math.max(maxRect, projection);
            }

            // Project circle onto the axis
            const circleProjection = this.x * normal.x + this.y * normal.y;
            const minCircle = circleProjection - this.radius;
            const maxCircle = circleProjection + this.radius;

            // Check for separation (gap between projections)
            if (maxRect < minCircle || minRect > maxCircle) {
                // Found a separating axis - no collision
                return false;
            }
        }

        // Step 4: Check axis from circle center to closest point on rectangle
        // Find closest point on rectangle to circle center
        let closestX = this.x;
        let closestY = this.y;

        // Clamp circle center to rectangle bounds
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const edge = {
                x: worldCorners[next].x - worldCorners[i].x,
                y: worldCorners[next].y - worldCorners[i].y
            };

            const toPoint = {
                x: this.x - worldCorners[i].x,
                y: this.y - worldCorners[i].y
            };

            const edgeLength = edge.x * edge.x + edge.y * edge.y;
            if (edgeLength > 0) {
                const t = Math.max(0, Math.min(1, (toPoint.x * edge.x + toPoint.y * edge.y) / edgeLength));
                const closestOnEdge = {
                    x: worldCorners[i].x + t * edge.x,
                    y: worldCorners[i].y + t * edge.y
                };

                const distToEdge = Math.sqrt(
                    (this.x - closestOnEdge.x) ** 2 + (this.y - closestOnEdge.y) ** 2
                );
                const distToClosest = Math.sqrt(
                    (this.x - closestX) ** 2 + (this.y - closestY) ** 2
                );

                if (distToEdge < distToClosest) {
                    closestX = closestOnEdge.x;
                    closestY = closestOnEdge.y;
                }
            }
        }

        // Check distance from circle to closest point
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If distance is less than radius, there's a collision
        return distance < this.radius;
    }
}




export class TreesManager {
    // Constants =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    //trees
    readonly viewDistance: number = 200;
    readonly treeDensity: number = 0.3;
    readonly treeSize: number = 1
    //-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


    gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    updateTrees(): void { //TBC this can be simplified if the player just moves forward
        // Check if we need to regenerate trees based on player position
        const yUpperBound = this.gameState.player.y + this.viewDistance;
        const yLowerBound = this.gameState.player.y - this.viewDistance;


        // Find the actual min/max Y of remaining trees
        const sortedTreesY = this.gameState.trees.sort((a, b) => a.y - b.y); // sort trees by y
        const existingMinY = sortedTreesY.length > 0 ? sortedTreesY[0].y : this.gameState.player.y;
        const existingMaxY = sortedTreesY.length > 0 ? sortedTreesY[sortedTreesY.length - 1].y : this.gameState.player.y;

        // Generate trees ahead if needed
        if (existingMaxY < yUpperBound) {
            console.log('🌳🌳 generateTrees on Upper Bound', existingMaxY, yUpperBound);
            this.generateTreesInRange(existingMaxY, yUpperBound + this.viewDistance);
        }

        // Generate trees behind if needed
        if (existingMinY > yLowerBound) {
            console.log('🌳🌳 generateTrees on lower Bound', yLowerBound, existingMinY);
            this.generateTreesInRange(yLowerBound - this.viewDistance, existingMinY);
        }
    }

    calculateRoadWidth(): number {
        const firstRoadSegment = this.gameState.road[0];
        const segmentStart = firstRoadSegment[0];
        const segmentEnd = firstRoadSegment[1];

        return Math.abs(segmentStart.x - segmentEnd.x);
    }

    generateTreesInRange(minY: number, maxY: number): void {
        // console.log('🌳🌳 generateTreesInRange🌳', minY, maxY);
        const roadHalfWidth = this.calculateRoadWidth() / 2;


        // Left side
        for (let y = minY; y <= maxY; y += 1) {
            for (let roadSide = -1; roadSide <= 1; roadSide += 2) { // -1 for left, 1 for right
                if (Math.random() < this.treeDensity) {
                    const randomOffset = Math.random() * roadHalfWidth;
                    const x = roadSide * (roadHalfWidth + randomOffset)
                    const size = ((Math.random() - 1) * this.treeSize * 0.8) + this.treeSize;
                    this.gameState.trees.push(new Tree(x, y, size));
                }
            }
        }
    }
}