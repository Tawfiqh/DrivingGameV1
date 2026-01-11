TODO List 
=========
ss
Basic game
----------
1. ✅ Basic run loop - updating game state and rendering
2. ✅ Basic game = car drives along - can steer left and right and forward
3. ✅ Draw a road - and a car - and keep the car on the road
4. ✅ Populate trees off-the road
5. ✅ Move to Typescript
6. ✅ Collision detection if it's off-road => crash = end the game
7. ✅ gameState gameOver - in renderer
7. ✅ Scoring based on displacement from start-point
8. ✅ Refresh button to play again
9. Vehicles on the road
    - Vary by percentage
    - ✅ Adjust size
    - Add collisions
    - Change colours of car roofs!
    - Keep them in the lanes

10. Potholes on the road
11. Dynamic road that keeps extending to infinity -- can use the environmentObjectManager

2D Rendering
-------------
1. ✅ 2d renderer isn't squashed
2. ✅ Renderer that follows the car as it moves past 1000
3. ✅ Road Markings
4. ✅ Fix car drawing of headlights 
5. ✅ Cooler background colour - maybe dirt -- not just black
6. Show current speed in mph 
7. Mobile support - for controls
8. Add car headlights 


3d Rendering
-------------
1. 3d rednering that follows the car - based on chat GPT projection
2. Start with basic reimplementation of the 2d renderer



Game mechanics
-------------
1. Handle crashes and collisions a bit better -- e.g: reset to the middle of the road with zero velocity OR wipeout completely depending on speed, i.e slow is fine, fast is game-over
2. Time 