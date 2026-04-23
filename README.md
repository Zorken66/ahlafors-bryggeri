# Ahlafors Bryggeri

Next.js-webbplats med eget CMS för Ahlafors Bryggeri.

## Struktur

- `/frontend` - Webbplats, API-rutter och admin
- `/frontend/content/site-content.json` - Innehållsdatabas
- `/frontend/app/admin` - Eget CMS
- `/docs/cms` - CMS-vision, roadmap och epics
- `/docs/deploy` - deploy-, VPS- och cutover-dokumentation
- `/docs/project` - projektplanering och innehållsunderlag

## Komma igång

```bash
npm install

npm run dev
```

Öppna sedan:

- Webbplats: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

## Miljövariabler

Skapa `frontend/.env.local`:

```bash
CMS_SESSION_SECRET=en-lang-slumpad-hemlighet
CMS_COOKIE_SECURE=false
CMS_ADMIN_USERS=[{"username":"admin","displayName":"Admin","passwordHash":"scrypt:..."}]
CMS_DB_HOST=127.0.0.1
CMS_DB_PORT=5432
CMS_DB_NAME=ahlafors_cms
CMS_DB_USER=cms
CMS_DB_PASSWORD=cms
```

Skapa hash för ett lösenord med:

```bash
npm run cms:hash-password -- mittlosenord
```

Skapa en färdig adminpost för `CMS_ADMIN_USERS` med:

```bash
npm run cms:create-admin-user -- admin mittlosenord "Admin"
```

Exempel med flera admins:

```json
[{"username":"admin","displayName":"Admin","passwordHash":"scrypt:..."},{"username":"mattias","displayName":"Mattias","passwordHash":"scrypt:..."}]
```

Skriv användarna till PostgreSQL med:

```bash
npm run cms:seed-admins
```

## Docker Desktop

1. Kopiera `.env.docker.example` till `.env`
2. Sätt `CMS_ADMIN_USERS`, `CMS_SESSION_SECRET` och PostgreSQL-variablerna
3. Kör `docker compose up --build`

Öppna sedan:

- Webbplats: `http://localhost:3000`
- CMS: `http://localhost:3000/admin`

CMS-data, admin-användare, sessioner och login-skydd lagras i PostgreSQL-volymen `postgres_data`.
För lokal HTTP-körning i Docker ska `CMS_COOKIE_SECURE=false`. Sätt den till `true` bakom riktig HTTPS i produktion.

Om port `3000` redan används kan du sätta t.ex. `APP_PORT=3001` i `.env` och sedan öppna `http://localhost:3001`.

## Produktion

För VPS:

- `deploy-vps.ps1` = koddeploy
- `promote-content-vps.ps1 -Force` = explicit innehållspromotion till CMS-databasen

De ska inte blandas ihop. Produktions-CMS, inklusive hero-bilder, lever i databasen och ska inte skrivas över vid vanlig deploy.
