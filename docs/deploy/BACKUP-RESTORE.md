# Backup och restore för CMS

Det här dokumentet beskriver första riktiga backup/restore-flödet för CMS-miljön i lokal Docker-utveckling.

Målet är att kunna backa upp och återställa:
- PostgreSQL-innehåll
- `frontend/public/uploads`

## Kommandon

Databasdump:

```bash
npm run db:backup
```

Uploads-snapshot:

```bash
npm run uploads:backup
```

Kombinerad CMS-backup:

```bash
npm run cms:backup
```

Databaserestore från dumpfil:

```bash
npm run db:restore -- backups/ahlafors-cms-2026-04-25T08-00-00-000Z.dump
```

Databaserestore från kombinerad backupkatalog:

```bash
npm run db:restore -- backups/cms-backup-2026-04-25T08-00-00-000Z
```

Verifiera uploads-restore:

```bash
npm run uploads:restore -- backups/cms-backup-2026-04-25T08-00-00-000Z --verify-only
```

Återställ uploads:

```bash
npm run uploads:restore -- backups/cms-backup-2026-04-25T08-00-00-000Z
```

## Backupformat

`npm run cms:backup` skapar en katalog under `backups/`:

```text
backups/
  cms-backup-<timestamp>/
    manifest.json
    postgres.dump
    uploads/
```

Manifestet innehåller:
- tidpunkt
- databasnamn
- dumpfil
- antal uploadsfiler
- total storlek för uploads-snapshot

## Rekommenderad rutin före riskfyllda ändringar

Kör detta före större innehållsimport, datamigrering eller rensning av media:

```bash
npm run cms:backup
```

Spara backupkatalogen intakt tills ändringen är verifierad.

## Rekommenderad restore-checklista

1. Bekräfta vilken backupkatalog som ska användas.
2. Verifiera uploads-restore:

```bash
npm run uploads:restore -- <backup-dir> --verify-only
```

3. Återställ databasen:

```bash
npm run db:restore -- <backup-dir>
```

4. Återställ uploads:

```bash
npm run uploads:restore -- <backup-dir>
```

5. Starta om appen eller laddad om lokal miljö vid behov.
6. Verifiera:
   - publik sida
   - `/api/health`
   - admin
   - att kritiska mediafiler visas

## Begränsningar i första versionen

- flödet är byggt för lokal Docker-miljö först
- uploads-restore gör merge/overwrite, inte destruktiv clean restore
- retention och schemaläggning är ännu inte automatiserat
- VPS-backup har nu eget script, men VPS-restore är fortfarande manuell och runbook-styrd

## VPS

För VPS-miljön används:

- `backup-cms-vps.ps1`

Se:

- `docs/deploy/VPS-BACKUP.md`
