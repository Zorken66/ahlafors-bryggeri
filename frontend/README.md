# Frontend

Next.js-app för Ahlafors Bryggeri med publik webbplats och eget CMS.

## Starta lokalt

```bash
npm install
npm run dev
```

Öppna `http://localhost:3000` för webbplatsen och `http://localhost:3000/admin` för CMS.

## CMS

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

Allt innehåll lagras i PostgreSQL. `frontend/content/site-content.json` används som seed vid första uppstart.

Skapa adminposter för `CMS_ADMIN_USERS` med:

```bash
npm run cms:create-admin-user -- admin mittlosenord "Admin"
```

## Viktiga mappar

- `app/` - sidor och API-rutter
- `components/` - UI-komponenter
- `content/` - CMS-data
- `lib/` - innehållslagring och auth för admin
