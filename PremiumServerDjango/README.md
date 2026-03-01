# CarDriveDash — Django Backend

Django 5 backend for CarDriveDash. Serves the game to all visitors and provides an admin interface for managing game content (maps, colour schemes).

## What it does

- **`/`** — Serves the pre-built WebVersion game (no login required)
- **`/admin/`** — Admin interface where superusers create and manage `GameContent` entries (name, display name, JSON config defining maps and colour schemes)

## Project Structure

```
PremiumServerDjango/
├── config/             # Settings (base / development / production), root URLs, WSGI
├── core/               # Game view served at /
├── game_content/       # GameContent model — maps and colour schemes
├── users/              # Custom user model, login/logout
├── static/             # Django static assets
├── templates/          # core/game.html, registration/login.html
├── Setup.sh            # First-time setup script
└── run.sh              # Start dev server
```

## Setup

### Prerequisites

- Python 3.12+
- WebVersion built first — run `npm run build` in `../WebVersion/` (or use the root `./run.sh` which does both)

### First-time setup

```bash
./Setup.sh
```

This creates the virtualenv, installs dependencies, runs migrations, and optionally creates a superuser.

### Running

```bash
./run.sh
```

Or from the repo root:

```bash
../run.sh   # builds WebVersion then starts Django
```

Access the game at `http://127.0.0.1:8000/` and the admin at `http://127.0.0.1:8000/admin/`.

### Manual setup

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## GameContent model

Managed entirely via the Django admin. Fields:

| Field | Type | Description |
|---|---|---|
| `name` | SlugField | Unique identifier (auto-populated from display name) |
| `display_name` | CharField | Human-readable name shown in the game |
| `json_config` | JSONField | Map layout, colour scheme, and other game parameters |

## Settings

Split across three files in `config/settings/`:

- `base.py` — shared config; also wires `WebVersion/dist/` into Django's static files as `/static/dist/`
- `development.py` — `DEBUG=True`, local hosts
- `production.py` — reads `SECRET_KEY`, `ALLOWED_HOSTS` from environment variables; enforces HTTPS cookies

Switch environments via `DJANGO_SETTINGS_MODULE` in `manage.py` or as an environment variable.
