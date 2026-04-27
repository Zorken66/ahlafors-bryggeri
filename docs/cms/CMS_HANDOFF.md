# CMS Handoff

Senast uppdaterad: `2026-04-24`

## Syfte
Det här dokumentet är en kort teknisk handover för nästa arbetspass. Fokus är vad som är byggt, var den centrala logiken ligger och vad som är viktigast att veta innan nya ändringar görs.

## Arkitektur i korthet
CMS:et är inte en separat tjänst. Det är ett inbyggt lager i samma Next.js-app som driver den publika sajten.

Grundmönstret är:
- innehåll lagras centralt i Postgres som ett sammanhållet `SiteContent`
- admin arbetar mot API-rutter under `frontend/app/api/cms`
- publik rendering använder samma centrala publiceringslogik som admin
- media lagras som filer på disk och metadata i databasen

## Viktiga kodytor

### Innehåll och schema
- `frontend/lib/content-store.ts`
- `frontend/lib/content-schema.ts`

### Publicering och preview
- `frontend/lib/publishing.ts`
- `frontend/lib/published-content.ts`
- `frontend/lib/rulleriet-posts.ts`

### Kvalitet och dashboard
- `frontend/lib/content-quality.ts`
- `frontend/lib/cms-dashboard.ts`

### Revisionshistorik
- `frontend/lib/content-revisions.ts`
- `frontend/components/admin/RevisionsManager.tsx`

### Media
- `frontend/lib/cms-media.ts`
- `frontend/lib/cms-media-schema.ts`
- `frontend/lib/media-usage.ts`
- `frontend/components/admin/MediaLibraryManager.tsx`
- `frontend/components/admin/MediaPickerField.tsx`

### Adminskal och routing
- `frontend/components/admin/CmsAdmin.tsx`
- `frontend/lib/cms-permissions.ts`
- `frontend/lib/cms-route-guards.ts`

### Cookie consent
- `frontend/components/CookieConsent.tsx`
- `frontend/components/FooterCookieSettingsButton.tsx`
- `frontend/lib/cookie-consent.ts`
- `frontend/app/kakor/page.tsx`

## Det som är viktigt att förstå innan man ändrar något

### 1. Publiceringslogik ska hållas central
Om nytt innehåll ska få `draft/scheduled/published/expired` ska det in via de centrala selector-/helper-lagren i `lib`, inte via speciallogik i enskilda managers eller publika sidor.

### 2. Mediaflödet bygger nu på usage och integritet
Mediebiblioteket är inte längre bara ett filregister. Dashboarden, integritetsrapporten och broken-reference-flödet bygger på:
- usage-spårning
- asset-metadata i databasen
- fysisk fil på disk

Om bildfält läggs till i `SiteContent` måste också `media-usage.ts` uppdateras, annars blir usage och integritetskontroller ofullständiga.

### 3. Dashboarden är nu ett riktigt arbetsflöde
Mediahälsa är inte bara visning längre. Där finns:
- brutna referenser
- arbetskö för att fixa dem
- klickbara uppgifter för alt-text, oanvänt media och svag kvalitet

Det betyder att nya operativa signaler helst ska byggas som uppgifter med åtgärd, inte bara som siffror.

### 4. Revisionsvyn har två nivåer
Det finns nu både:
- begriplig fältdiff för redaktörer
- rå JSON för teknisk kontroll

Vid vidareutveckling bör båda nivåerna bevaras.

### 5. Cookie-lagret finns, men styr ännu inget externt verktyg
Den publika sajten har nu:
- cookie-banner
- sparat val i `ahlafors_cookie_consent`
- settings-entrypoint i footern
- publik sida `/kakor`

I nuläget används ingen publik statistik- eller marknadsföringscookie. Om sådana verktyg läggs till senare ska de kopplas till consent-valet i stället för att laddas direkt.

## Verifierat vid senaste passet
- `npm run build --workspace=frontend`
- `npm run lint --workspace=frontend`

Båda gick igenom. Enda kvarvarande varningen är `baseline-browser-mapping`.

## Produk­tionsdeploy
Koddeploy sker via:
- `deploy-vps.ps1`

Viktigt:
- scriptet är avsett för koddeploy
- det ska inte skriva över CMS-innehåll
- shared uploads och `.env.local` länkas in på VPS:en

Content promotion sker nu separat via:
- `scripts/export-cms-content.mjs`
- `scripts/import-cms-content.mjs`
- `promote-content-bundle-vps.ps1`

Viktigt:
- promotion ska inte blandas ihop med vanlig koddeploy
- VPS-scriptet tar nu ett rollback-bundle före riktig import om inte det uttryckligen hoppas över

## Rekommenderad nästa riktning
Nästa huvudspår bör vara content promotion mellan miljöer:
- export/import av innehåll
- säker promotion av media
- verifiering före och efter promotion
- rollback-rutin

Det är den naturliga fortsättningen nu när CMS:et blivit redaktionellt starkare.
