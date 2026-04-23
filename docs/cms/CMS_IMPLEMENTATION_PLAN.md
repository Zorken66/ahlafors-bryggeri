# CMS Implementation Plan

## Syfte
Det här dokumentet bryter ner de första epicsen till konkreta genomförandesteg i nuvarande kodbas.

Fokus ligger på:
- `Epic 01: Enhetlig publiceringsmodell`
- `Epic 02: Kvalitetsvarningar i formulären`

Skälet är enkelt: dessa två epics ger högst faktisk nytta tidigt och skapar grunden för nästan allt annat i roadmapen.

## Mål med första implementationen
Efter första implementationsfasen ska CMS:et ha:
- en gemensam publiceringsmodell för prioriterade innehållstyper
- en central statuslogik för `Utkast`, `Schemalagd`, `Publik`, `Utgången`
- tydlig publiceringssektion i relevanta adminvyer
- återanvändbara kvalitetsvarningar i de viktigaste formulären
- en teknisk bas som senare kan användas av dashboard, preview och eventmodellen

## Varför börja här
De här två epicsen löser fyra konkreta problem direkt:
- redaktörer vet inte alltid om innehåll verkligen är publikt eller inte
- gammalt innehåll kan ligga kvar längre än tänkt
- ofullständigt innehåll är lätt att spara utan tydlig feedback
- senare funktioner som dashboard och preview blir svagare utan tydlig status- och kvalitetsmodell

## Leveransstrategi
Vi bör inte försöka bygga allt på en gång.

Rimlig strategi:
1. bygg centrala bibliotek först
2. koppla in i 1-2 managers
3. verifiera mönstret
4. sprid till övriga managers

Det minskar risk och gör implementationen lättare att justera.

## Fas 1: Epic 01 - Enhetlig publiceringsmodell

### Mål för fas 1
Införa en gemensam publiceringslogik som fungerar för:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

### Task 1.1: Inför central publiceringslogik
Skapa ny fil:
- `frontend/lib/publishing.ts`

Den bör innehålla:
- typ för publicerbara objekt
- `normalizePublishingFields(item)`
- `isPublishedNow(item, now?)`
- `getPublishingStatus(item, now?)`
- hjälpfunktioner för datumtolkning

Definition:
- `published = false` => `Utkast`
- `published = true` och `publishedAt` i framtiden => `Schemalagd`
- `published = true` och `unpublishedAt` i dåtid => `Utgången`
- annars => `Publik`

### Task 1.2: Utöka typer i content-schema
Påverkar:
- `frontend/lib/content-schema.ts`

Lägg till `unpublishedAt?: string` där det saknas för:
- produkt
- tjänst
- recept
- nyhet
- Rulleriet-event
- Rulleriet-post

Samt:
- normalisering av tomma strängar
- bakåtkompatibla defaults

### Task 1.3: Uppdatera published selectors
Påverkar:
- `frontend/lib/published-content.ts`

Byt från spridd enkel logik till central logik från `publishing.ts`.

Detta är viktigt för att frontend och admin ska använda samma regler.

### Task 1.4: Skapa återanvändbar adminkomponent för publicering
Skapa ny komponent:
- `frontend/components/admin/PublishingFields.tsx`

Den bör stödja:
- checkbox/toggle för `published`
- datumfält för `publishedAt`
- datumfält för `unpublishedAt`
- statusbadge
- kort hjälptext

### Task 1.5: Integrera i ProductsManager
Påverkar:
- `frontend/components/admin/ProductsManager.tsx`

Det här blir pilotimplementationen för listbaserat innehåll.

Målet:
- publiceringssektion i editor
- statusbadge i listan
- konsekvent statusvisning

### Task 1.6: Integrera i ServicesManager
Påverkar:
- `frontend/components/admin/ServicesManager.tsx`

När mönstret fungerar i produkter återanvänds det här.

### Task 1.7: Integrera i RecipesManager
Påverkar:
- `frontend/components/admin/RecipesManager.tsx`

### Task 1.8: Integrera i NewsManager
Påverkar:
- `frontend/components/admin/NewsManager.tsx`

### Task 1.9: Integrera i Rulleriet managers
Påverkar:
- `frontend/components/admin/RullerietSectionManager.tsx`
- `frontend/components/admin/RullerietPostsManager.tsx`

Här behöver vi särskilt:
- statuslogik för event med datum
- tydlig skillnad mellan eventstatus och publiceringsstatus

### Task 1.10: Uppdatera seed/content-format
Påverkar:
- `frontend/content/site-content.json`

Det krävs inte att allt fylls med `unpublishedAt`, men formatet ska stödja det.

### Task 1.11: Verifiering
Verifiera:
- draft visas inte publikt
- future `publishedAt` blir `Schemalagd`
- past `unpublishedAt` blir `Utgången`
- statusbadges visas rätt i admin
- build går igenom

## Fas 2: Epic 02 - Kvalitetsvarningar

### Mål för fas 2
Införa återanvändbara kvalitetsvarningar i de viktigaste formulären.

### Task 2.1: Skapa central kvalitetsmotor
Skapa ny fil:
- `frontend/lib/content-quality.ts`

Den bör innehålla:
- typ `QualityIssue`
- `severity: error | warning`
- `code`
- `field`
- `message`

Samt validatorer för:
- startsida
- produkt
- tjänst
- recept
- nyhet
- Rulleriet-event
- Rulleriet-post

### Task 2.2: Skapa generella hjälpfunktioner
I samma fil eller som del av biblioteket:
- `requireText(...)`
- `requireImage(...)`
- `requireLinkIfLabelExists(...)`
- `warnIfLong(...)`
- `warnIfPastDateStillPublished(...)`

### Task 2.3: Skapa återanvändbar UI-komponent
Skapa ny komponent:
- `frontend/components/admin/QualityChecklist.tsx`

Den ska visa:
- antal fel
- antal varningar
- lista med meddelanden

Den ska vara enkel att återanvända i flera managers.

### Task 2.4: Integrera i ProductsManager
Pilot för kvalitetsvarningar.

Regler i första versionen:
- namn saknas
- produktbild saknas
- kort beskrivning saknas
- extern länk saknas
- SEO-title saknas
- SEO-description saknas

### Task 2.5: Integrera i RullerietSectionManager
Regler i första versionen:
- eventtitel saknas
- datum saknas
- tid saknas
- beskrivning saknas
- passerat event fortfarande publikt
- bild saknas som varning

### Task 2.6: Integrera i HomepageSectionManager
Regler i första versionen:
- hero-rubrik saknas
- hero-bild saknas
- CTA-text utan länk
- SEO-fält saknas där relevant

### Task 2.7: Integrera i ServicesManager, RecipesManager och NewsManager
När mönstret sitter från produkter och Rulleriet sprids det vidare.

### Task 2.8: Koppla kvalitetsstatus till publicering
Det behöver inte blockera allt i första steg, men systemet ska åtminstone kunna säga:
- innehållet har fel
- innehållet har varningar
- innehållet ser redo ut

Detta blir särskilt värdefullt när preview och dashboard byggs.

### Task 2.9: Verifiering
Verifiera:
- saknade kärnfält ger fel
- svagare problem ger varning
- checklistan uppdateras när formuläret ändras
- build går igenom

## Föreslagen ordning i praktiken

### Sprint 1
- `publishing.ts`
- uppdaterat `content-schema.ts`
- uppdaterat `published-content.ts`
- `PublishingFields.tsx`
- integration i `ProductsManager`

### Sprint 2
- integration i `ServicesManager`, `RecipesManager`, `NewsManager`
- integration i `RullerietSectionManager` och `RullerietPostsManager`
- seed- och dataverifiering

### Sprint 3
- `content-quality.ts`
- `QualityChecklist.tsx`
- kvalitetsvarningar i `ProductsManager` och `RullerietSectionManager`

### Sprint 4
- kvalitetsvarningar i `HomepageSectionManager`, `ServicesManager`, `RecipesManager`, `NewsManager`
- justering av copy, UI och signalnivå

## Påverkade filer

### Nya filer
- `frontend/lib/publishing.ts`
- `frontend/components/admin/PublishingFields.tsx`
- `frontend/lib/content-quality.ts`
- `frontend/components/admin/QualityChecklist.tsx`

### Troliga ändringar
- `frontend/lib/content-schema.ts`
- `frontend/lib/published-content.ts`
- `frontend/components/admin/ProductsManager.tsx`
- `frontend/components/admin/ServicesManager.tsx`
- `frontend/components/admin/RecipesManager.tsx`
- `frontend/components/admin/NewsManager.tsx`
- `frontend/components/admin/RullerietSectionManager.tsx`
- `frontend/components/admin/RullerietPostsManager.tsx`
- `frontend/components/admin/HomepageSectionManager.tsx`
- `frontend/content/site-content.json`

## Tekniska beslut vi bör hålla fast vid

### 1. Central logik före UI
All status- och kvalitetslogik ska ligga i bibliotek först, inte i komponenterna.

### 2. Bakåtkompatibilitet
Befintligt innehåll får fortsätta fungera utan att allt måste migreras manuellt direkt.

### 3. Återanvändbara komponenter
Publiceringsfält och kvalitetschecklista ska inte kopieras mellan managers.

### 4. Hög signal, låg komplexitet
Första versionen ska vara tydlig och användbar, inte perfekt eller överbyggd.

## Risker

### Risk 1: För mycket på en gång
Motåtgärd:
- börja med produkter och Rulleriet
- sprid först när mönstret sitter

### Risk 2: Inkonsekvens mellan admin och frontend
Motåtgärd:
- gemensamt `publishing.ts`

### Risk 3: För brusiga kvalitetsvarningar
Motåtgärd:
- börja med få regler
- skilj tydligt på `Fel` och `Varning`

## Definition of Ready för implementation
Vi är redo att börja när:
- vi accepterar statusmodellen
- vi accepterar fälten `publishedAt` och `unpublishedAt`
- vi accepterar att produkter blir pilot för publicering
- vi accepterar att produkter + Rulleriet blir pilot för kvalitetsvarningar

## Definition of Done för första implementationsfasen
Den här planen är genomförd när:
- Epic 01 är implementerad för prioriterade innehållstyper
- Epic 02 är implementerad för prioriterade formulär
- build går igenom
- lokal och testmiljö är verifierade
- den nya modellen känns konsekvent i admin

## Rekommenderat nästa steg efter denna plan
Nästa steg är att börja bygga `Sprint 1` direkt.

Om vi ska börja i kod nu är den bästa första konkreta uppgiften:
- skapa `frontend/lib/publishing.ts`
- uppdatera `frontend/lib/content-schema.ts`
- koppla in `ProductsManager` som första pilot
