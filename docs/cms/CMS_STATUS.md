# CMS Status

Senast uppdaterad: `2026-04-23`

## Syfte
Det här dokumentet beskriver faktiskt genomfört CMS-arbete, nuvarande status och rekommenderat nästa steg. Det är tänkt som startpunkt för nästa arbetspass.

## Sammanfattning
Vi har genomfört den första stora implementationsfasen för:
- `Epic 01: Enhetlig publiceringsmodell`
- `Epic 02: Kvalitetsvarningar i formulären`

Status just nu:
- gemensam publiceringsmodell är införd för prioriterade innehållstyper
- kvalitetsmotor och checklistor finns
- inline-varningar finns på viktiga fält
- publiceringssektionen är kopplad till kvalitetsstatus
- listvyer visar både publiceringsstatus och kvalitetsstatus
- första admin-dashboarden finns som egen översiktsvy
- ändringarna är utrullade i lokal Docker-testmiljö och på VPS-testappen

## Genomfört arbete

### 1. Gemensam publiceringsmodell
Infört central logik i:
- `frontend/lib/publishing.ts`
- `frontend/lib/published-content.ts`
- `frontend/lib/content-schema.ts`

Det som nu stöds:
- `Utkast`
- `Schemalagd`
- `Publik`
- `Utgången`

Publiceringsfält som används:
- `published`
- `publishedAt`
- `unpublishedAt`

Innehållstyper som nu använder modellen:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

Adminstöd finns via:
- `frontend/components/admin/PublishingFields.tsx`

### 2. Utrullning i adminmanagers
Publiceringsmodellen är inkopplad i:
- `frontend/components/admin/ProductsManager.tsx`
- `frontend/components/admin/ServicesManager.tsx`
- `frontend/components/admin/RecipesManager.tsx`
- `frontend/components/admin/NewsManager.tsx`
- `frontend/components/admin/RullerietSectionManager.tsx`
- `frontend/components/admin/RullerietPostsManager.tsx`

Detta innebär att:
- redigeringsvyerna har en gemensam publiceringssektion
- listor och kort visar riktig statusbadge
- frontend använder samma regler som admin

### 3. Kvalitetsmotor
Infört central kvalitetslogik i:
- `frontend/lib/content-quality.ts`

Det som finns nu:
- `QualityIssue`
- `error` och `warning`
- gemensamma hjälpfunktioner
- validatorer för startsida, produkt, tjänst, recept, nyhet, Rulleriet-event och Rulleriet-inlägg

### 4. Kvalitets-UI
Infört återanvändbara komponenter:
- `frontend/components/admin/QualityChecklist.tsx`
- `frontend/components/admin/FieldIssueHint.tsx`
- `frontend/components/admin/QualityStatusBadge.tsx`

Det som dessa ger:
- summeringsruta med fel och varningar i editorn
- inline-markeringar nära viktiga fält
- kvalitetsstatus direkt i listvyer

### 5. Koppling mellan kvalitet och publicering
Publiceringssektionen i:
- `frontend/components/admin/PublishingFields.tsx`

är nu kvalitetsmedveten.

Det betyder:
- innehåll med fel markeras som `Inte redo`
- redaktören får tydlig förklaring i publiceringssektionen
- publicering kan inte slås på om objektet har fel
- utkast kan fortfarande sparas

Viktigt:
- för Rulleriet-event blockeras varje event bara av sina egna fel, inte av fel i andra event på samma sida

### 6. Kvalitetsstöd som nu är inkopplat i admin
Checklistor och/eller inline-varningar finns nu i:
- `HomepageSectionManager`
- `ProductsManager`
- `ServicesManager`
- `RecipesManager`
- `NewsManager`
- `RullerietSectionManager`
- `RullerietPostsManager`

Listvyer med kvalitetsbadge finns nu för:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-inlägg
- Rulleriet-eventkort

### 7. Admin-dashboard och redaktionell överblick
Infört första dashboard-versionen i:
- `frontend/lib/cms-dashboard.ts`
- `frontend/components/admin/AdminDashboard.tsx`
- `frontend/components/admin/CmsAdmin.tsx`

Det som finns nu:
- egen adminsektion `Översikt`
- standardstart i dashboarden för roller som har åtkomst till `operations`
- summering av spårade objekt, publicerade objekt, schemalagda objekt och objekt med fel
- lista över innehåll som kräver åtgärd
- lista över kommande publiceringar och datum
- senaste aktivitet via revisions-API

Dashboarden bygger på samma centrala publicerings- och kvalitetslogik som resten av adminen, inte på separat speciallogik.

## Miljöstatus

### Lokal Docker-testmiljö
Uppdaterad.

Verifierat:
- `http://localhost:3001/admin/login` svarar `200`

### VPS-testapp
Uppdaterad.

Verifierat:
- intern app kör på `http://127.0.0.1:3002`
- `http://127.0.0.1:3002/admin/login` svarar `200`
- deploy sker via `deploy-vps.ps1`

## Tekniska beslut vi har bekräftat i praktiken
- status- och kvalitetslogik ska ligga centralt i `lib`, inte i varje manager
- återanvändbara adminkomponenter fungerar bra för detta CMS
- första versionen ska vara tydlig och handlingsbar, inte överbyggd
- kvalitetsfel ska påverka publicering, men inte stoppa spar av utkast

## Det som ännu inte är gjort

### Epic 01
I praktiken färdig för prioriterade innehållstyper, men fortfarande värd att verifiera vidare i redaktionell användning.

Kvar att överväga:
- eventuell bredare användning på fler sidinställningar om behov uppstår
- eventuell extra indikator i fler publika selectorer eller adminlistor

### Epic 02
Bra första version är på plats, men inte slutligt färdig.

Saker som inte är gjorda ännu:
- inline-markering för alla fält i alla managers
- kvalitetsregler för fler sidinställningar utöver nuvarande fokus
- mer finmaskiga redaktionella varningar, t.ex. textlängd på fler fält
- tydligare filtrering och gruppering av kvalitetsstatus över flera sektioner

## Rekommenderat nästa steg
Nästa naturliga huvudspår är:
- fortsättning på `Epic 03: Admin-dashboard och redaktionell överblick`

Motivering:
- vi har nu både publiceringsstatus och kvalitetsstatus
- första dashboard-versionen är på plats och nästa steg är att fördjupa den

Konkreta första dashboard-delar att bygga:
- filtrering och drilldown från dashboard till berörd sektion eller objekt
- utgångna objekt som egen åtgärdslista
- mer redaktionell prioritering, t.ex. “bör publiceras snart” och “saknar SEO”
- eventuellt rollanpassad dashboard per redaktörstyp

## Alternativt nästa steg om vi vill stanna i Epic 02 lite längre
Om vi inte vill gå vidare till dashboard ännu är nästa förbättring inom samma epic:
- fler inline-indikatorer på sidinställningsnivå
- bättre koppling mellan kvalitetsstatus och listfiltrering
- fler kvalitetsregler för CTA, SEO och tomma listor

## Snabb start nästa gång
Om nästa pass ska fortsätta direkt i CMS-spåret, börja med:
1. läs detta dokument
2. läs `docs/cms/CMS_IMPLEMENTATION_PLAN.md`
3. fortsätt i `docs/cms/CMS_EPIC_03_ADMIN_DASHBOARD.md`
