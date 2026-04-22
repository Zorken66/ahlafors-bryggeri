# Deploy - VPS Template

Den här mallen är avsedd för projekt som körs på egen VPS via `ssh`, `pm2` och `nginx`.

Kopiera den till projektets egen `DEPLOY.md` och ersätt exempelvärdena.

## Serveröversikt

- domän: `example.com`
- host eller IP: `203.0.113.10`
- deploy-användare: `deploy`
- app-path: `/var/www/example-app`
- intern appport: `127.0.0.1:3000`
- PM2-process: `example-app`

## SSH

Rekommenderat upplägg:

- privat nyckel ligger lokalt i `~/.ssh`
- serveranslutning sker via host-alias i `~/.ssh/config`
- projektet refererar bara till alias eller parametrar, aldrig till hemligheter

Exempel:

```sshconfig
Host example-vps
  HostName 203.0.113.10
  User deploy
  IdentityFile ~/.ssh/example_vps
```

## Hemligheter

Lägg aldrig detta i repo:

- privat SSH-nyckel
- lösenord
- riktiga `.env`-värden
- databashemligheter

Dokumentera i stället:

- användarnamn
- paths
- processnamn
- host-alias

## Produktionsmiljö

Exempel:

```bash
/var/www/example-app/.env.local
```

Minst dessa brukar behövas:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/app_db?schema=public
HOSTNAME=127.0.0.1
PORT=3000
NODE_ENV=production
```

Om Prisma används:

```bash
cp .env.local .env
```

## Deploy

Kör från repo-roten:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy-vps.ps1
```

## Driftkommandon

```bash
pm2 ls
pm2 logs example-app
pm2 restart example-app
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
sudo systemctl status postgresql --no-pager
```

## Säkerhetsregler

- använd `deploy`, inte `root`, för vanlig deploy
- håll privat nyckel utanför repo
- lagra riktiga hemligheter i lösenordshanterare
- rotera hemligheter om de exponerats
