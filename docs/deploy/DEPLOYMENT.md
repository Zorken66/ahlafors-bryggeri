# Deployment Guide - Inleed VPS

Den här appen passar bäst på Inleed VPS med:

- `Node.js 20`
- `PM2`
- `nginx`
- `PostgreSQL`

Produktion bör inte köras med Docker som huvudspår här. Docker-upplägget i repot är bra för lokal testmiljö, men VPS-mallarna under `templates/vps` utgår från ett enklare och mer stabilt produktionsflöde med `ssh`, `pm2` och `nginx`.

## Rekommenderad produktionsmodell

Publik trafik:

- `https://ahlaforsbryggerier.se`
- `nginx` terminerar HTTPS
- `nginx` proxar till `127.0.0.1:3000`
- `PM2` håller Next-appen igång

App:

- repo deployas till `/var/www/ahlafors-bryggeri/current`
- appen körs med `npm run start --workspace=frontend`
- intern appport: `3000`

Data:

- PostgreSQL körs på VPS eller som separat host
- CMS-innehåll lagras i PostgreSQL
- uppladdade mediafiler lagras på disk utanför själva deploymappen

## Kakor i nuvarande produktion

Publika sajten använder nu:

- `ahlafors_cookie_consent`
  sparar användarens cookieval på webbplatsen
- `cms_session`
  används bara under `/admin` för inloggad CMS-session

Viktigt just nu:

- inga aktiva statistikcookies används på den publika sajten
- inga aktiva marknadsföringscookies används på den publika sajten
- cookie-banner, settings-knapp i footer och sidan `/kakor` finns nu i produktion

Om statistik eller tredjepartsmarknadsföring läggs till senare ska de kopplas till consent-lagret innan de aktiveras publikt.

## Viktig skillnad mot den generella VPS-mallen

Den generella mallen i `templates/vps` behöver anpassas för detta projekt av två skäl:

1. Appen är ett workspace-projekt där root-script kör `frontend`.
2. CMS-media skrivs till `frontend/public/uploads`, vilket måste vara persistent mellan deploys.

Det betyder att vi i produktion ska använda en `shared/uploads`-mapp och länka in den i appen, i stället för att låta deployen skriva över den.

## Rekommenderad serverstruktur

```bash
/var/www/ahlafors-bryggeri/
  current/
  shared/
    uploads/
    .env.local
```

I appen ska denna sökväg finnas:

```bash
/var/www/ahlafors-bryggeri/current/frontend/public/uploads
```

Den ska vara en symlink till:

```bash
/var/www/ahlafors-bryggeri/shared/uploads
```

Exempel:

```bash
mkdir -p /var/www/ahlafors-bryggeri/shared/uploads
mkdir -p /var/www/ahlafors-bryggeri/current/frontend/public
ln -sfn /var/www/ahlafors-bryggeri/shared/uploads /var/www/ahlafors-bryggeri/current/frontend/public/uploads
```

## Miljövariabler i produktion

Skapa på servern:

```bash
/var/www/ahlafors-bryggeri/shared/.env.local
```

Minst detta behövs:

```env
NEXT_PUBLIC_SITE_URL=https://ahlaforsbryggerier.se
CMS_SESSION_SECRET=<lang-slumpad-hemlighet>
CMS_COOKIE_SECURE=true
CMS_ADMIN_USERS=[{"username":"admin","displayName":"Admin","passwordHash":"scrypt:...","role":"superadmin"}]
CMS_DB_HOST=127.0.0.1
CMS_DB_PORT=5432
CMS_DB_NAME=ahlafors_cms
CMS_DB_USER=cms
CMS_DB_PASSWORD=<starkt-losenord>
CONTACT_NOTIFICATION_TO=info@ahlaforsbryggeri.se
CONTACT_NOTIFICATION_FROM=no-reply@ahlaforsbryggeri.se
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>
HOSTNAME=127.0.0.1
PORT=3000
NODE_ENV=production
```

## Första serveruppsättningen

Utgå från `templates/vps/NEW-PROJECT-CHECKLIST.md`, men använd dessa projektspecifika värden:

- app-path: `/var/www/ahlafors-bryggeri/current`
- shared-path: `/var/www/ahlafors-bryggeri/shared`
- PM2-process: `ahlafors-bryggeri`
- intern appport: `127.0.0.1:3000`

Rekommenderad användare:

- deploy-användare: `deploy`

## Node och PM2

Installera Node 20 och PM2 på VPS:en.

Startkommando för appen:

```bash
cd /var/www/ahlafors-bryggeri/current
pm2 start npm --name ahlafors-bryggeri -- run start --workspace=frontend
pm2 save
```

Vid uppdateringar:

```bash
cd /var/www/ahlafors-bryggeri/current
pm2 reload ahlafors-bryggeri --update-env
```

## Bygg och start på servern

Appen byggs på servern:

```bash
cd /var/www/ahlafors-bryggeri/current
npm ci
npm run build
pm2 reload ahlafors-bryggeri --update-env || pm2 start npm --name ahlafors-bryggeri -- run start --workspace=frontend
pm2 save
```

## nginx

Exempel på server block:

```nginx
server {
    listen 80;
    server_name ahlaforsbryggerier.se www.ahlaforsbryggerier.se;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ahlaforsbryggerier.se www.ahlaforsbryggerier.se;

    ssl_certificate /etc/letsencrypt/live/ahlaforsbryggerier.se/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ahlaforsbryggerier.se/privkey.pem;

    client_max_body_size 12m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

Verifiera:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## PostgreSQL

Appen skapar tabeller automatiskt vid första uppstarten om databasen finns och användaren har rättigheter.

Det här behöver finnas i förväg:

- databas: `ahlafors_cms`
- användare: `cms`
- korrekt lösenord
- rättigheter till databasen

Seeddata:

- `frontend/content/site-content.json` används bara när databasen är tom
- efter första riktiga körningen är PostgreSQL källan för CMS-innehållet

## Admin-användare

Skapa hash lokalt:

```bash
npm run cms:create-admin-user -- admin mittlosenord "Admin"
```

Lägg sedan resultatet i `CMS_ADMIN_USERS` på servern.

Om ni behöver synka in adminposter manuellt på servern:

```bash
cd /var/www/ahlafors-bryggeri/current
cp /var/www/ahlafors-bryggeri/shared/.env.local .env
npm run cms:seed-admins
```

## Driftkommandon

```bash
pm2 ls
pm2 logs ahlafors-bryggeri
pm2 restart ahlafors-bryggeri
curl -I http://127.0.0.1:3000/
curl -I http://127.0.0.1:3000/api/health
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
sudo systemctl status postgresql --no-pager
```

## Rekommenderad deployordning

1. Ladda upp ny kod till `/var/www/ahlafors-bryggeri/current`.
2. Säkerställ att `frontend/public/uploads` fortfarande pekar på `shared/uploads`.
3. Länka in eller kopiera `shared/.env.local` till `current/frontend/.env.local`.
4. Kör `npm ci`.
5. Kör `npm run build`.
6. Reloada PM2-processen.
7. Kör smoke test mot `http://127.0.0.1:3000/api/health`.
8. Verifiera publikt via domänen.

## Backup och restore

För lokal Docker-miljö finns nu följande script:

```bash
npm run db:backup
npm run uploads:backup
npm run cms:backup
npm run db:restore -- <dump-eller-backupkatalog>
npm run uploads:restore -- <backupkatalog> [--verify-only]
```

Den kombinerade backupen skapar:

```text
backups/cms-backup-<timestamp>/
  manifest.json
  postgres.dump
  uploads/
```

Det här är avsett som första riktiga restorekedja för CMS-innehåll plus media. Full runbook finns i:

- `docs/deploy/BACKUP-RESTORE.md`
- `docs/deploy/VPS-BACKUP.md`

## Nästa steg för detta repo

Följande är nästa rimliga implementationer i repot:

1. Lägga till schemalagd backup och retention.
2. Lägga till enkel backupstatus i driftkontroller eller admin.
3. Dokumentera en verifierad restore-test för VPS.

## Säkerhetsregler

- använd `deploy`, inte `root`, för vanlig deploy
- lägg aldrig privat SSH-nyckel i repo
- lägg aldrig riktiga `.env`-värden i repo
- håll `CMS_COOKIE_SECURE=true` i produktion
- rotera hemligheter om de råkat exponeras
