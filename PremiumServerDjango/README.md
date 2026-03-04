# Sundown Getaway — Django Backend

Django 5 backend for Sundown Getaway (CarDriveDash). Serves the browser game, provides a premium game-config API gated by App Store subscription verification, and receives App Store Server Notifications V2 for real-time subscription lifecycle events.

## Setup / How to Run Locally

### Prerequisites

- Python 3.12+
- (Optional) WebVersion built first — run `npm run build` in `../WebVersion/` if you want the browser game served at `/`

### First-time setup

```bash
./Setup.sh
```

This creates the virtualenv, installs dependencies, runs migrations, and optionally creates a superuser.

### Running

```bash
./run.sh
```

Or manually:

```bash
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional, for admin access
python manage.py runserver
```

- Game: `http://127.0.0.1:8000/`
- Admin: `http://127.0.0.1:8000/admin/`
- Game config API: `http://127.0.0.1:8000/api/game-content/`

## Architecture

```
PremiumServerDjango/
├── config/             # Settings (base / development / production), root URLs, WSGI
├── core/               # Browser game view served at /
├── game_content/       # GameContent model + premium-gated API
├── appstore/           # App Store Server Notifications V2 webhook + JWS verification
├── users/              # Custom user model, login/logout
├── static/             # Django static assets
├── templates/          # core/game.html, registration/login.html
├── Procfile            # Gunicorn start command for Railway / Heroku
├── runtime.txt         # Python version for Railway / Heroku
├── railway.toml        # Railway-specific deploy config
└── requirements.txt    # Python dependencies
```

### Apps

| App | Purpose |
|---|---|
| `core` | Serves the browser game at `/` |
| `game_content` | `GameContent` model (maps, colour schemes). Premium-gated detail API at `/api/game-content/<slug>/` — returns `json_config` only for verified subscribers |
| `appstore` | Receives App Store Server Notifications V2 at `/api/appstore/webhook/`. Persists subscription state in `AppStoreSubscription` model. Provides JWS verification utilities used by `game_content` |
| `users` | Custom `AbstractUser` model, login/logout views |

### URL Structure

| Path | Method | Auth | Description |
|---|---|---|---|
| `/` | GET | None | Browser game |
| `/admin/` | GET | Superuser | Django admin |
| `/accounts/login/` | GET/POST | None | Login |
| `/accounts/logout/` | POST | None | Logout |
| `/api/game-content/` | GET | None | List all GameContent (metadata only) |
| `/api/game-content/<slug>/` | GET | App Store JWS | Premium game config detail (401 without valid subscription) |
| `/api/appstore/webhook/` | POST | Apple JWS | App Store Server Notifications V2 endpoint |

### Settings

Split across three files in `config/settings/`:

- **`base.py`** — shared config, App Store settings, static files
- **`development.py`** — `DEBUG=True`, local hosts
- **`production.py`** — reads secrets from env vars, enforces HTTPS cookies, WhiteNoise for static files

Switch environments via the `DJANGO_SETTINGS_MODULE` environment variable. The default (in `manage.py` and `wsgi.py`) is `config.settings.development`.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | **Production** | `django-insecure-...` | Django secret key |
| `DEBUG` | No | `True` (dev) / `False` (prod) | Debug mode |
| `ALLOWED_HOSTS` | **Production** | `127.0.0.1,localhost` | Comma-separated allowed hosts |
| `CSRF_TRUSTED_ORIGINS` | **Production** | `http://127.0.0.1:8000,https://<your-app>.up.railway.app` | Comma-separated trusted origins for CSRF protection |
| `DJANGO_SETTINGS_MODULE` | **Production** | `config.settings.development` | Must be `config.settings.production` on Railway |
| `APPSTORE_BUNDLE_ID` | Yes | `com.yourcompany.getawayrun` | App bundle ID (must match App Store Connect) |
| `APPSTORE_APP_APPLE_ID` | **Production** | — | Numeric App Apple ID from App Store Connect |
| `APPSTORE_ENVIRONMENT` | No | `Sandbox` | `Sandbox` or `Production` |
| `APPSTORE_ROOT_CA_G3_PATH` | Yes | — | Path to Apple Root CA G3 cert (DER format) |
| `APPSTORE_ROOT_CA_G2_PATH` | No | — | Path to Apple Root CA G2 cert (DER format) |
| `APPSTORE_ENABLE_ONLINE_CHECKS` | No | `true` | Enable OCSP certificate checks |
| `SECURE_SSL_REDIRECT` | No | `False` | Redirect HTTP to HTTPS (set `True` on Railway) |
CSRF_TRUSTED_ORIGINS=https://sundown-getaway-api-production.up.railway.app
## Deployment (Railway)

### 1. Create a Railway project

Go to [railway.app](https://railway.app), create a new project, and connect your GitHub repo. Railway auto-detects the Python app via `requirements.txt`, `Procfile`, and `runtime.txt`.

### 2. Set the root directory

In Railway's service settings, set the **Root Directory** to `PremiumServerDjango` so Railway builds from the correct subdirectory.

### 3. Set environment variables

In the Railway dashboard, add these variables:

```
DJANGO_SETTINGS_MODULE=config.settings.production
SECRET_KEY=<generate a strong random key>
ALLOWED_HOSTS=<your-app>.up.railway.app
APPSTORE_BUNDLE_ID=uk.co.tawfiq.GetawayRun
APPSTORE_ENVIRONMENT=Sandbox
APPSTORE_ROOT_CA_G3_PATH=/app/certs/AppleRootCA-G3.cer
```

> **Apple Root CA certs**: Download from [Apple PKI](https://www.apple.com/certificateauthority/). Place the `.cer` files in a `certs/` directory in the project, or configure the paths to wherever you store them on the deploy host.

### 4. Deploy

You can deploy using the deploy script:

```bash
./deploy.sh
```

this mostly just calls: 

```bash
railway up ./PremiumServerDjango
```

Railway will automatically:
1. Install Python 3.12 (from `runtime.txt`)
2. Install dependencies (from `requirements.txt`)
3. Run the start command from `railway.toml` (migrates, collects static files, starts gunicorn)

### 5. Get your Railway URL

After deployment, Railway assigns a public URL like `https://<your-app>.up.railway.app`. Use this URL in:
You can find this by running `railway domain --json` in the Django project directory.

- **iOS app**: Set it in `ApplePlatforms/CarDriveDash/Config/Release.xcconfig`
- **App Store Connect**: Configure the webhook URL (see below)

### 6. Run Management Commands on Railway

SSH Into the Railway project:
```bash
railway ssh
```

Then you can run management commands on Railway by running:
```bash
source /opt/venv/bin/activate

# e.g: Make a superuser
python manage.py createsuperuser

# Change password for a user
python manage.py changepassword <username>
```

For example:

## App Store Server Notifications

After deploying, configure Apple to send subscription notifications to your server:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) > Your App > App Information
2. Under **App Store Server Notifications**, set the **Production URL** to:
   ```
   https://<your-railway-url>.up.railway.app/api/appstore/webhook/
   ```
3. Set the **Sandbox URL** to the same (or a separate staging deployment) -- this can be the same for both sandbox and production as the data sent from the AppStore will tell the server if it is a sandbox or production notification.
4. Select **Version 2 Notifications**

The webhook receives notifications for subscription events (purchase, renewal, expiry, refund, revocation) and updates the local `AppStoreSubscription` records accordingly. The `game_content` detail endpoint cross-checks these records when verifying entitlements.

## iOS App Configuration

The iOS app reads the server URL from an `.xcconfig` file via Info.plist. To wire it up:

1. In Xcode, add the files from `CarDriveDash/Config/` to the project
2. Go to **Project** (not target) > **Info** > **Configurations**
3. Set **Debug** to use `Debug.xcconfig` and **Release** to use `Release.xcconfig`
4. Edit `Release.xcconfig` and replace `YOUR_RAILWAY_URL` with your actual Railway domain

The `GameConfigService` reads `GameConfigBaseURL` from Info.plist at runtime, falling back to `http://127.0.0.1:8000` in debug builds if the xcconfig is not yet assigned.
