# Content Promotion

Det här dokumentet beskriver hur CMS-innehåll får flyttas till VPS eller produktion.

## Grundregel

Vanlig deploy:

- körs med `deploy-vps.ps1`
- deployar kod
- deployar statiska filer
- reloadar appen
- skriver **inte** över CMS-innehåll i databasen

Innehållspromotion:

- körs separat
- skriver över `cms_content` i databasen
- ska bara göras medvetet

## Varför detta är viktigt

I den här lösningen lagras liveinnehåll i PostgreSQL.

Det gäller bland annat:

- hero-bilder
- hero-texter
- CTA-knappar
- footerinnehåll
- sidinställningar som redigerats i admin

Filen `frontend/content/site-content.json` är inte den levande sanningen i produktion. Den är:

- seed för första uppstart
- underlag för kontrollerad innehållspromotion mellan miljöer

Om `site-content.json` skrivs in i produktionsdatabasen kommer live-redigeringar i CMS att återställas till filens värden.

## När man får promota innehåll

Använd innehållspromotion när:

- ett nytt innehållsset medvetet ska flyttas från lokal/test till produktion
- produktionen ska återställas från ett känt innehållsunderlag
- man uttryckligen accepterar att produktions-CMS skrivs över

Använd det inte när:

- du bara deployar kod
- du bara deployar buggrättningar eller UI-fixar
- produktionen redan innehåller nyare redaktionella ändringar än repot

## Script

Första riktiga promotionsversionen använder nu separata export/import-script i stället för att bara skriva upp `site-content.json`.

Lokal export:

```powershell
npm run cms:export-content -- --output .\content-bundles\local-full --include-media-files --source local
```

Verifiera ett bundle innan import:

```powershell
npm run cms:import-content -- --input .\content-bundles\local-full --verify-only
```

Importera till en annan miljö lokalt eller i rätt shell på målmiljön:

```powershell
npm run cms:import-content -- --input .\content-bundles\local-full --mode merge-sections --copy-media-files
```

Verifiera bundle mot VPS utan att skriva:

```powershell
powershell -ExecutionPolicy Bypass -File .\promote-content-bundle-vps.ps1 -InputBundle .\content-bundles\local-full -VerifyOnly
```

Promota bundle till VPS med backup före import:

```powershell
powershell -ExecutionPolicy Bypass -File .\promote-content-bundle-vps.ps1 -InputBundle .\content-bundles\local-full -Force
```

Stöd i första versionen:

- export av `cms_content` för valda sektioner
- export av relevant media-metadata
- valfri kopia av mediefiler i samma bundle
- manifest med källa, sektioner och verifieringsresultat
- import i `merge-sections` eller `replace`
- VPS-wrapper med remote preflight och rollback-bundle före import

Begränsningar i första versionen:

- ingen automatisk rollback i scriptet
- ingen deletion av gamla mediaobjekt
- ingen tvåvägs-merge mellan redigerade miljöer
- `replace` kräver fullständig export

## Äldre script

Det tidigare scriptet nedan finns kvar för ett smalt fallback-scenario, men ska ses som äldre och mer riskfyllt eftersom det bara skriver `frontend/content/site-content.json` till produktion.

Kör från repo-roten:

```powershell
powershell -ExecutionPolicy Bypass -File .\promote-content-vps.ps1 -Force
```

Det scriptet:

1. laddar upp `frontend/content/site-content.json`
2. läser produktionsmiljön från `shared/.env.local`
3. skriver innehållet till `cms_content` för `content_key = 'site'`

Scriptet kräver `-Force`. Utan den flaggan avbryter det utan att skriva något till VPS-databasen.

## Rekommenderat arbetssätt

1. Gör vanliga kodändringar och deploya med `deploy-vps.ps1`.
2. Låt produktionens CMS-data vara orörd.
3. Skapa ett bundle med `cms:export-content`.
4. Kör alltid `cms:import-content --verify-only` före riktig import.
5. Ta backup av databas och uploads före import till test eller produktion.
6. Kör riktig import som separat steg.
7. Verifiera särskilt hero-bilder, startsida, tjänster och andra visuella sektioner direkt efter promotion.

För VPS-flödet gör `promote-content-bundle-vps.ps1` detta:

1. laddar upp bundle till temporär katalog
2. tar ett rollback-bundle på VPS:en om inte `-SkipBackup` används
3. kör remote `--verify-only`
4. kör riktig import först därefter
5. kör health smoke test

## Kontrollfråga innan promotion

Fråga alltid:

- Är produktions-CMS nyare än `site-content.json`?

Om svaret är ja ska du normalt inte promota filen till produktion.
