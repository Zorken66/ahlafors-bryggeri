# Nytt VPS-projekt - Checklista

Använd den här checklistan när ett nytt projekt ska sättas upp på VPS med samma arbetssätt.

## 1. Lokal SSH

- skapa eller välj en lokal privat nyckel i `~/.ssh`
- lägg till ett host-alias i `~/.ssh/config`
- testa anslutning med:

```bash
ssh example-vps
```

## 2. Serveranvändare

- skapa deploy-användare om den inte redan finns
- ge rätt ägarskap till projektmappen
- använd inte `root` för vanlig deploy

Exempel:

```bash
useradd -m -s /bin/bash deploy
mkdir -p /var/www/example-app
chown -R deploy:deploy /var/www/example-app
```

## 3. Appstruktur på VPS

- skapa projektmapp, t.ex. `/var/www/example-app`
- bestäm intern port, t.ex. `127.0.0.1:3001`
- bestäm PM2-processnamn, t.ex. `example-app`

## 4. Repo

- kopiera in:
  - `templates/vps/DEPLOY-VPS-TEMPLATE.md`
  - `templates/vps/deploy-vps.template.ps1`
- döp om till:
  - `DEPLOY.md`
  - `deploy-vps.ps1`
- fyll i:
  - host/alias
  - användare
  - remote path
  - PM2-process
  - healthcheck-url

## 5. Miljövariabler

- skapa `.env.local` på servern
- skapa `.env` om CLI-verktyg behöver den
- lägg aldrig riktiga secrets i repo

## 6. Node och processhantering

- installera Node
- installera PM2
- starta appen med PM2
- spara PM2-konfiguration

Exempel:

```bash
pm2 start server.js --name example-app
pm2 save
```

## 7. Nginx

- skapa server block / vhost
- proxy till rätt intern port
- testa konfigurationen
- reloada nginx

Exempel:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 8. HTTPS

- peka DNS till VPS
- installera certifikat
- verifiera automatisk förnyelse

Exempel:

```bash
sudo certbot certificates
sudo systemctl status certbot-renew.timer --no-pager
```

## 9. Drift

- aktivera backup
- aktivera healthcheck/monitorering
- verifiera att loggar och timers fungerar

## 10. Slutkontroll

- startsida svarar `200`
- admin/login svarar `200`
- appen kör i PM2
- nginx kör
- databas kör
- deployscript fungerar från projektroten

## Grundregel

Dokumentera:

- host-alias
- användare
- paths
- processnamn
- driftkommandon

Dokumentera inte:

- privat nyckel
- lösenord
- riktiga `.env`-värden
