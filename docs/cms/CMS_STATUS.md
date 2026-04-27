# CMS Status

Senast uppdaterad: `2026-04-27`

## Syfte
Det här dokumentet beskriver faktiskt genomfört CMS-arbete, nuläge i koden och vad som återstår. Det ska gå att använda som startpunkt för nästa arbetspass utan att först läsa hela historiken.

## Sammanfattning
CMS:et har nu passerat första prototypfasen och fungerar som ett sammanhållet redaktionellt system i samma Next.js-app som den publika sajten.

Det som nu är byggt och verifierat:
- enhetlig publiceringsmodell för prioriterade innehållstyper
- kvalitetsvarningar och checklistor i admin
- admin-dashboard med redaktionella arbetslistor
- sök och filtrering i större listvyer för produkter, nyheter, tjänster, recept och Rulleriet-inlägg
- fungerande mediebibliotek med usage-spårning och säker delete
- integritetskontroll för media med brutna referenser, saknad alt-text, oanvänt media och enkel bildkvalitetskontroll
- arbetskö för att åtgärda brutna mediareferenser direkt från dashboarden
- revisionshistorik med faktisk fältdiff, inte bara rå JSON
- preview-flöden för produkter, nyheter, recept, tjänster och Rulleriet
- roller och sektionsbehörigheter
- första backup/restore-rutin för lokal Docker-miljö
- första VPS-backupscript för CMS
- retentionstöd för VPS-backups
- förberett nattligt backupscript för VPS
- nattlig VPS-backup aktiv via renad `deploy`-crontab

Status just nu:
- lokal build är grön
- lokal lint är grön
- kvarvarande varning är endast `baseline-browser-mapping`, vilket är låg prioritet
- produkten är redo för koddeploy till produktion via `deploy-vps.ps1`

## Genomfört arbete

### 1. Enhetlig publiceringsmodell
Central logik finns i:
- `frontend/lib/publishing.ts`
- `frontend/lib/published-content.ts`
- `frontend/lib/content-schema.ts`

Det som stöds:
- `Utkast`
- `Schemalagd`
- `Publik`
- `Utgången`

Innehållstyper som använder modellen:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

UI-stöd finns via:
- `frontend/components/admin/PublishingFields.tsx`

### 2. Kvalitetsmotor och kvalitets-UI
Central kvalitetslogik finns i:
- `frontend/lib/content-quality.ts`

Återanvändbara adminkomponenter:
- `frontend/components/admin/QualityChecklist.tsx`
- `frontend/components/admin/FieldIssueHint.tsx`
- `frontend/components/admin/QualityStatusBadge.tsx`

Det som detta ger:
- summering av fel och varningar per objekt
- inline-markering på viktiga fält
- kvalitetsstatus i listor och kort
- blockering av publicering när objektet inte är redo

### 3. Dashboard och redaktionella arbetslistor
Dashboarden finns i:
- `frontend/lib/cms-dashboard.ts`
- `frontend/components/admin/AdminDashboard.tsx`
- `frontend/components/admin/CmsAdmin.tsx`

Det som finns nu:
- översikt över publiceringsstatus och kvalitetsstatus
- lista över innehåll som kräver åtgärd
- kommande datum och publiceringar
- senaste aktivitet via revisions-API
- mediahälsa som egen sektion
- klickbara arbetslistor för:
  - brutna mediareferenser
  - bilder utan alt-text
  - oanvänt media
  - bilder med svag kvalitet

### 3b. Sök och filtrering i större listor
Listmanagers för större innehållsmängder har nu ett gemensamt filterlager via:
- `frontend/components/admin/ContentListFilters.tsx`

Det som nu finns:
- fritextsökning
- filtrering på publiceringsstatus
- filtrering på kvalitetsstatus
- enkel sortering i större listvyer
- produktkategori-filter i produktlistan

Detta är inkopplat i:
- `frontend/components/admin/ProductsManager.tsx`
- `frontend/components/admin/NewsManager.tsx`
- `frontend/components/admin/ServicesManager.tsx`
- `frontend/components/admin/RecipesManager.tsx`
- `frontend/components/admin/RullerietPostsManager.tsx`

Mediebiblioteket har nu också:
- fritextsökning
- filter för använd/oinanvänd
- filter för alt-textstatus
- sortering på datum, namn, filstorlek och användning
- batchåtgärder för:
  - sätta alt-text från bildnamn på markerade bilder
  - ta bort markerade oanvända bilder

Detta finns i:
- `frontend/components/admin/MediaLibraryManager.tsx`

### 4. Mediebibliotek och mediahälsa
Central logik finns i:
- `frontend/lib/cms-media.ts`
- `frontend/lib/cms-media-schema.ts`
- `frontend/lib/media-usage.ts`
- `frontend/app/api/cms/media/integrity/route.ts`

UI finns i:
- `frontend/components/admin/MediaLibraryManager.tsx`
- `frontend/components/admin/MediaPickerField.tsx`

Det som nu fungerar:
- uppladdning
- metadataredigering
- ersättning av fil utan att byta URL
- beskärning
- usage-spårning: var en bild används
- blockering av delete när bilden fortfarande används
- integritetsrapport för brutna referenser
- arbetskö för att åtgärda brutna mediareferenser från dashboarden
- direktlänk från dashboard till rätt asset i mediebiblioteket

### 5. Revisionshistorik och återställning
Revisionslogik finns i:
- `frontend/lib/content-revisions.ts`
- `frontend/components/admin/RevisionsManager.tsx`
- `frontend/app/api/cms/revisions`

Det som nu finns:
- revisionslista
- detaljvy
- restore
- faktisk fältdiff med summering av:
  - ändrade fält
  - tillagda värden
  - borttagna värden
- sektionsetiketter i revisionslistan
- daggruppering i revisionslistan
- gruppering av diffen per objekt/fältkluster
- fortsatt rå JSON-vy för teknisk kontroll

### 6. Preview
Preview-stöd finns nu för:
- produkter
- nyheter
- recept
- tjänster
- Rulleriet-sidan
- Rulleriet-inlägg

Central logik finns i:
- `frontend/lib/published-content.ts`
- `frontend/lib/rulleriet-posts.ts`

Publika sidor använder preview-aware selektorer, och adminmanagers länkar in till rätt preview-URL med fokus på rätt objekt.

### 7. Roller och behörigheter
Behörighetsmodellen finns i:
- `frontend/lib/cms-permissions.ts`
- `frontend/lib/cms-route-guards.ts`

Det som finns:
- roller
- sektionsbehörigheter
- separata rättigheter för t.ex. revisions-restore

## Miljöstatus

### Lokal utvecklingsmiljö
Verifierat lokalt:
- `npm run build --workspace=frontend`
- `npm run lint --workspace=frontend`

Resultat:
- build går igenom
- lint går igenom
- kvar finns bara `baseline-browser-mapping`-varningen

### VPS/produktion
Koddeploy sker via:
- `deploy-vps.ps1`

Scriptet är uttryckligen byggt för koddeploy och ska inte skriva över CMS-innehåll i produktion.

### Backup/restore
Första driftbara backupkedjan finns nu lokalt via:
- `scripts/backup-postgres.mjs`
- `scripts/backup-uploads.mjs`
- `scripts/backup-cms-environment.mjs`
- `scripts/restore-postgres.mjs`
- `scripts/restore-uploads.mjs`

VPS-backup finns nu också via:
- `backup-cms-vps.ps1`
- `install-vps-backup-cron.ps1`

Tillgängliga npm-script:
- `npm run db:backup`
- `npm run uploads:backup`
- `npm run cms:backup`
- `npm run db:restore -- <dump-eller-backupkatalog>`
- `npm run uploads:restore -- <backupkatalog> [--verify-only]`

Runbook:
- `docs/deploy/BACKUP-RESTORE.md`
- `docs/deploy/VPS-BACKUP.md`

## Det som ännu inte är gjort

Det här är de tydligaste kvarvarande luckorna:

### 1. Content promotion mellan miljöer
Första CLI-versionen finns nu i:
- `scripts/export-cms-content.mjs`
- `scripts/import-cms-content.mjs`
- `scripts/cms-promotion-lib.mjs`

Det som nu finns:
- bundle-format med `manifest.json`, `content.json` och `media.json`
- export av valda sektioner
- export av relevant media-metadata
- valfri kopia av mediefiler i bundle
- verifieringsläge före import
- import i `merge-sections` eller full `replace`

Det som återstår:
- tydligare rollback-script
- enklare målmiljöflöde för VPS/produktion
- mer detaljerad diff/preview före import

### 2. Mer redaktionell revisionsupplevelse
Fältdiff finns nu, men diffen är fortfarande tekniskt orienterad. Nästa nivå vore mer redaktionella etiketter, bättre gruppering och objektfokuserad historik.

### 3. Starkare media-kvalitet
Bildkvalitetskontrollen är just nu avsiktligt enkel. Den är användbar för att fånga uppenbart svaga bilder, men är inte en full kvalitetsbedömning.

### 4. Backup/restore på VPS och som rutin
Lokal backupkedja och första VPS-backup finns nu, men nästa nivå är:
- verifierad restore-rutin i driftmiljö
- enkel backupstatus eller senaste-backup-spårning
- djupare säkerhetsgenomgång av VPS utanför CMS-spåret

### 5. Sök och filtrering i större listor
Flera större managers skulle fortfarande vinna på bättre sök, sortering och filter.

### 6. Eventmodell och kampanjmodell
Rulleriet fungerar, men det finns ännu ingen mer komplett eventdomän eller generell kampanj-/temamodell.

## Rekommenderat nästa steg
Nästa starkaste huvudspår är nu:
- verifierad restore-test i driftmiljö

Motivering:
- backup finns nu lokalt, på VPS och nattligt via cron
- den största återstående operativa risken är att restorekedjan ännu inte är körd och dokumenterad i VPS-miljö
- Epic 10 och Epic 11 möts nu främst i att rollback måste vara bevisat, inte bara teoretiskt

Konkreta första delar att bygga där:
- dokumenterad restore-test i driftmiljö
- enkel backupstatus eller senaste-backup-spårning
- separat säkerhetsuppföljning för VPS:en

## Snabb start nästa gång
Om nästa pass ska fortsätta direkt i CMS-spåret, börja med:
1. läs detta dokument
2. läs `docs/cms/CMS_HANDOFF.md`
3. läs `docs/cms/CMS_ROADMAP.md`
4. fortsätt i `docs/cms/CMS_EPIC_11_OPERATIONS_AND_OBSERVABILITY.md`
