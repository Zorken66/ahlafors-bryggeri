# Deploy - Ahlafors Bryggerier VPS

Det här projektet ska deployas som en egen app på den delade VPS:en `185.189.49.123`.

Nuvarande läge på VPS:en:

- `ahlaforsfabriker.se` kör på `127.0.0.1:3000`
- `ahlaforsgym.se` kör på `127.0.0.1:3001`
- denna app ska läggas upp separat på `127.0.0.1:3002`
- appkatalogen finns redan: `/var/www/ahlafors-bryggerier`

Viktigt:

- `ahlaforsbryggerier.se` pekar inte till denna VPS ännu
- därför kan vi förbereda appen fullt ut internt, men inte göra den publik innan DNS-flytt och certifikat är på plats

## Målstruktur på VPS

```bash
/var/www/ahlafors-bryggerier/
  current/
  shared/
    uploads/
    .env.local
```

## Process och port

- PM2-process: `ahlafors-bryggerier`
- intern port: `3002`
- lokal test-URL: `http://127.0.0.1:3002`
- healthcheck: `http://127.0.0.1:3002/api/health`

## Första uppsättning på VPS

Skapa katalogstruktur:

```bash
mkdir -p /var/www/ahlafors-bryggerier/current
mkdir -p /var/www/ahlafors-bryggerier/shared/uploads
```

Skapa produktionsmiljö:

```bash
nano /var/www/ahlafors-bryggerier/shared/.env.local
```

Minst detta behövs:

```env
NEXT_PUBLIC_SITE_URL=https://ahlaforsbryggerier.se
CMS_SESSION_SECRET=<lang-slumpad-hemlighet>
CMS_COOKIE_SECURE=true
CMS_ADMIN_USERS=[{"username":"admin","displayName":"Admin","passwordHash":"scrypt:...","role":"superadmin"}]
CMS_DB_HOST=127.0.0.1
CMS_DB_PORT=5432
CMS_DB_NAME=ahlafors_bryggerier_cms
CMS_DB_USER=ahlafors_bryggerier_cms
CMS_DB_PASSWORD=<starkt-losenord>
CONTACT_NOTIFICATION_TO=info@ahlaforsbryggeri.se
CONTACT_NOTIFICATION_FROM=no-reply@ahlaforsbryggeri.se
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>
HOSTNAME=127.0.0.1
PORT=3002
NODE_ENV=production
```

Skapa databas och användare i PostgreSQL innan första start.

## Deploy

Kör från repo-roten:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-vps.ps1
```

Viktigt:

- vanlig `deploy-vps.ps1` deployar bara kod och statiska filer
- den ska **inte** skriva över `cms_content` i databasen
- hero-bilder och andra redigeringar som gjorts i CMS i produktion lever i PostgreSQL, inte i `frontend/content/site-content.json`
- om `site-content.json` skrivs in i produktionsdatabasen kommer liveinnehåll som hero-bilder, CTA och andra CMS-redigeringar att återgå till filens värden

Deployscriptet gör detta:

1. packar repot utan `node_modules`, `.next` och lokala `.env`-filer
2. laddar upp paketet till VPS:en
3. extraherar till `/var/www/ahlafors-bryggerier/current`
4. länkar `shared/.env.local` till `current/frontend/.env.local`
5. länkar `shared/uploads` till `current/frontend/public/uploads`
6. kör `npm ci`
7. kör `npm run build --workspace=frontend`
8. startar eller reloadar PM2-processen `ahlafors-bryggerier`
9. kör smoke test mot `http://127.0.0.1:3002/api/health`

## Innehållspromotion

Om innehåll uttryckligen ska flyttas till VPS:en används ett separat script:

```powershell
powershell -ExecutionPolicy Bypass -File .\promote-content-vps.ps1 -Force
```

Det scriptet:

- läser `frontend/content/site-content.json`
- skriver in innehållet i VPS:ens `cms_content`
- ska bara köras när man medvetet vill promota innehåll

Använd inte det scriptet som del av vanlig koddeploy.

Se även [CONTENT-PROMOTION.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/deploy/CONTENT-PROMOTION.md:1).

## Intern verifiering före DNS-flytt

På VPS:en:

```bash
pm2 ls
pm2 logs ahlafors-bryggerier
curl -I http://127.0.0.1:3002/
curl -I http://127.0.0.1:3002/api/health
```

Om du vill testa via nginx innan DNS-flytt kan vi senare lägga till en tillfällig intern vhost eller använda lokal `hosts`-override.

## DNS cutover

När appen är verifierad internt återstår:

1. peka `ahlaforsbryggerier.se` och `www.ahlaforsbryggerier.se` till `185.189.49.123`
2. skapa nginx-konfig för domänen
3. hämta certifikat via `certbot`
4. testa `https://ahlaforsbryggerier.se`

Se även [PRODUCTION-CUTOVER.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/deploy/PRODUCTION-CUTOVER.md:1).
