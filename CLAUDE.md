# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

CarDriveDash / "Sundown Getaway" is a multi-platform driving game with three independent sub-projects:

| Directory | Stack | Purpose |
|---|---|---|
| `WebVersion/` | TypeScript + HTML5 Canvas | Browser-based game |
| `ApplePlatforms/` | Swift / SwiftUI (Xcode: `GetawayRun.xcodeproj`) | iOS/macOS native app |
| `PremiumServerDjango/` | Python 3.12 / Django 5 | Backend with StoreKit server, scraping, user auth |

---

## WebVersion

### Commands (run from `WebVersion/`)

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript once (output → dist/)
npm run dev          # Build + watch + live-server on :3000 (recommended for dev)
npm run watch        # Watch mode only
npm run serve        # Serve dist/ on :3000 (separate terminal)
```

### Architecture

The game separates **logic** (no DOM/canvas dependencies) from **rendering**:

- **`CarGame.ts`** — Orchestrator. Owns `GameState`, sets up the keyboard/touch controls, and drives the run loop via `setInterval`. Calls managers to update state, then checks collisions.
- **`GameState`** — Plain data object: `player`, `road`, `trees`, `vehicles`, `gameOver`, `score`.
- **`Player.ts`** — Physics: velocity, steering angle, position update (trigonometry-based).
- **`RoadManager.ts`** — Procedural infinite road generation.
- **`VehiclesManager.ts` / `Vehicle.ts`** — NPC cars on the road.
- **`TreesManager.ts` / `Tree.ts`** — Trees placed off-road.
- **`EnvironmentObjectManager.ts` / `EnvironmentObjects.ts`** — Base types for collidable scene objects.
- **`BaseRenderer.ts`** — Abstract renderer: manages its own `setInterval` render loop, draws score/game-over overlay.
- **`TopDown2dRenderer.ts`** — Overhead 2D view (extends `BaseRenderer`).
- **`Chase3dRenderer.ts`** — Behind-the-car 3D perspective view (extends `BaseRenderer`).
- **`Canvas.ts`** — Thin wrapper around `HTMLCanvasElement` with coordinate transform helpers.
- **`Helpers.ts`** — Shared math utilities.

Collision detection uses SAT (Separating Axis Theorem). Trees use circle vs. rotated-rectangle; vehicles use rotated-rectangle vs. rotated-rectangle. `checkObjectIsCloseToPlayer` pre-filters the list before running full SAT to keep it efficient.

**Key constants**: `FPS` and `roadWidth` in `CarGame.ts`; `velocityIncrement`, `maxVelocity`, `maxSteeringAngle` in `Player.ts`.

---

## ApplePlatforms

Open `ApplePlatforms/GetawayRun.xcodeproj` in Xcode. Build and run via Xcode (⌘R). No separate build scripts.

### Architecture

Mirrors the web version's structure in Swift/SwiftUI:

- **`CarGame main/CarGame.swift`** — Game loop and state.
- **`CarGame main/CarGameView.swift`** — SwiftUI view that wraps the game canvas.
- **`Rendering/BaseRenderer.swift`** — Base class for renderers.
- **`Rendering/TopDown2dRenderer.swift`** / **`Chase3dRenderer.swift`** — The two rendering modes.
- **`Rendering/CanvasDrawer.swift`** / **`GameCanvas.swift`** — Drawing abstraction over SwiftUI `Canvas`.
- **`Objects/`** — `Player.swift`, `Vehicle.swift`, `Tree.swift`, `EnvironmentObject.swift`.
- **`EnvironmentManagers/`** — `RoadManager.swift`, `VehiclesManager.swift`, `TreesManager.swift`, `EnvironmentObjectManager.swift`.
- **`StoreKit/`** — Full StoreKit 2 integration: `Store.swift`, `CustomerEntitlements.swift`, `ContentView.swift`, subscription/purchase views, `Products.storekit` (local StoreKit config for testing).

The app is titled "Sundown Getaway" in the UI. `ContentView` is the root view; it creates a `CarGame` and passes it to `CarGameView`. A `Garage` sheet lets the user select cars (non-consumable IAP). `SubscriptionStore` handles the SKDemo+ subscription.

---

## PremiumServerDjango

### Commands (run from `PremiumServerDjango/`)

```bash
./Setup.sh                          # First-time setup: venv, pip install, migrations, optional superuser
./run.sh                            # Start dev server
source venv/bin/activate            # Manual venv activation
python manage.py runserver          # Dev server
python manage.py makemigrations     # Generate migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin user
```

Requires Python 3.12. Uses SQLite for dev. Only dependency is Django 5.

### Architecture

- **`config/settings/`** — Split settings: `base.py`, `development.py`, `production.py`.
- **`core/`** — Serves the game at `/`. The `game` view renders `templates/core/game.html`, which is the WebVersion game adapted for Django static file serving.
- **`game_content/`** — `GameContent` model (name slug, display_name, json_config JSONField). Admin-only; no public views. This is where map definitions and colour schemes for the game are created.
- **`users/`** — Custom `AbstractUser` model, login/logout only (no public registration). Admin users created via `createsuperuser`.
- **`templates/`** — `core/game.html` (full-screen game), `base.html` (used only for login), `registration/login.html`.
- **`static/`** — Django static assets.

### Static files & WebVersion

`config/settings/base.py` maps `('dist', BASE_DIR.parent / 'WebVersion' / 'dist')` into `STATICFILES_DIRS`. This means **WebVersion must be built first** (`npm run build` in `WebVersion/`) before the Django server can serve the game JS. The game template uses `{% static 'dist/CarGame.js' %}` etc. to reference these files.

### URL Structure

`/` — game (no auth required) · `/accounts/{login,logout}/` · `/admin/` — Django admin (superusers only; GameContent managed here)
