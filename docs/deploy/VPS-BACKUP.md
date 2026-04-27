# VPS-backup för CMS

Det här dokumentet beskriver backupflödet för produktions- eller testmiljön på VPS:en.

## Script

Backup tas via:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup-cms-vps.ps1
```

Det scriptet:
- ansluter via SSH
- läser produktionsmiljön från `shared/.env.local`
- skapar en Postgres-dump med `pg_dump`
- kopierar `shared/uploads`
- skriver `manifest.json`

Standardmål på servern:

```text
/var/www/ahlafors-bryggerier/shared/cms-backups/<timestamp>/
  manifest.json
  postgres.dump
  uploads/
```

## Retention

Behåll bara senaste N backups:

```powershell
powershell -ExecutionPolicy Bypass -File .\backup-cms-vps.ps1 -RetainLast 14
```

Det tar först ny backup och rensar sedan äldre kataloger över angivet antal.

## Lista backupkataloger

```powershell
powershell -ExecutionPolicy Bypass -File .\backup-cms-vps.ps1 -ListOnly
```

## Hämta ner backup lokalt

```powershell
powershell -ExecutionPolicy Bypass -File .\backup-cms-vps.ps1 -DownloadTo .\backups\vps
```

Det tar först backup på VPS:en och laddar sedan ner hela backupkatalogen lokalt.

## Förberedd nattlig backup

Repo:t innehåller nu också:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-vps-backup-cron.ps1
```

Det scriptet:
- laddar upp ett nattligt backupscript till `shared/bin`
- skriver ut den cronrad som ska användas
- installerar inte cron automatiskt

Det är avsiktligt. Nuvarande `crontab` på servern ska granskas och saneras innan nya jobb läggs till.

Aktuellt verifierat läge:
- `deploy`-användarens crontab sanerades den `27 april 2026`
- nattlig backup aktiverades därefter med:

```text
15 3 * * * /var/www/ahlafors-bryggerier/shared/bin/backup-cms-nightly.sh >> /var/www/ahlafors-bryggerier/shared/logs/backup-cms-nightly.log 2>&1
```

## Rekommenderad rutin

Ta VPS-backup:
- före innehållspromotion till produktion
- före större datarensning
- före manuell databasändring
- före mediarensning eller flytt

## Snabb verifiering på servern

Efter backup:

```bash
ls -lah /var/www/ahlafors-bryggerier/shared/cms-backups
ls -lah /var/www/ahlafors-bryggerier/shared/cms-backups/<timestamp>
cat /var/www/ahlafors-bryggerier/shared/cms-backups/<timestamp>/manifest.json
```

## Restore-princip

Den här iterationen automatiserar backup, men inte restore på VPS.

Restore ska därför göras kontrollerat och manuellt enligt runbook:
- återställ databas från `postgres.dump`
- återställ `shared/uploads` från backupens `uploads/`
- verifiera app, admin, media och health endpoints efteråt

Det är avsiktligt, så att restore inte blir ett för lätt destruktivt kommando i produktion.
