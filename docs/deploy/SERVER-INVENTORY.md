# Server Inventory

Det här dokumentet beskriver hur `ahlafors-bryggeri` är uppsatt på den delade VPS:en.

## VPS

- server: `185.189.49.123`
- användare för deploy: `deploy`
- SSH-nyckel lokalt: `~/.ssh/ahlafors_vps`

## App

- appnamn: `ahlafors-bryggerier`
- repo: `ahlafors-bryggeri`
- app-path: `/var/www/ahlafors-bryggerier`
- release-path: `/var/www/ahlafors-bryggerier/current`
- shared-path: `/var/www/ahlafors-bryggerier/shared`

## Process

- PM2-process: `ahlafors-bryggerier`
- intern port: `3002`
- intern app-URL: `http://127.0.0.1:3002`
- healthcheck: `http://127.0.0.1:3002/api/health`

## Domän

- mål-domän: `ahlaforsbryggerier.se`
- alternativ domän: `www.ahlaforsbryggerier.se`
- status just nu: DNS pekar inte ännu till denna VPS

## Nginx

- nginx-conf finns ännu inte för denna app
- framtida fil: `/etc/nginx/conf.d/ahlaforsbryggerier.se.conf`
- framtida proxy target: `127.0.0.1:3002`

## PostgreSQL

- host: `127.0.0.1`
- port: `5432`
- databas: `ahlafors_bryggerier_cms`
- user: `ahlafors_bryggerier_user`

Lösenord dokumenteras inte i repo.

## Miljöfiler

- produktionsmiljö: `/var/www/ahlafors-bryggerier/shared/.env.local`
- appen länkar denna till: `/var/www/ahlafors-bryggerier/current/frontend/.env.local`

## Uploads

- persistent uploads: `/var/www/ahlafors-bryggerier/shared/uploads`
- symlink i appen: `/var/www/ahlafors-bryggerier/current/frontend/public/uploads`

## Migrerad data

Följande har migrerats från lokal miljö:

- `cms_content`
- `cms_media_assets`
- `cms_admin_users`
- uppladdade filer i `uploads`

Verifierat läge efter migrering:

- `cms_content`: `1`
- `cms_media_assets`: `8`
- `cms_admin_users`: `4`
- uploads på servern: `8`

## Nuvarande status

- appen kör internt och svarar `200`
- `/admin/login` svarar `200`
- DNS-cutover återstår
- nginx-konfig och certifikat för `ahlaforsbryggerier.se` återstår

## Driftkommandon

```bash
pm2 ls
pm2 logs ahlafors-bryggerier
pm2 restart ahlafors-bryggerier --update-env
curl -I http://127.0.0.1:3002/
curl -I http://127.0.0.1:3002/admin/login
curl -I http://127.0.0.1:3002/api/health
```

## Relaterade filer i repo

- [DEPLOY.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/deploy/DEPLOY.md:1)
- [DEPLOYMENT.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/deploy/DEPLOYMENT.md:1)
- [PRODUCTION-CUTOVER.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/deploy/PRODUCTION-CUTOVER.md:1)
- [deploy-vps.ps1](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/deploy-vps.ps1:1)
