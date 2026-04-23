# Epic 01: Enhetlig publiceringsmodell

## Syfte
Den här epiken etablerar en gemensam publiceringsmodell för CMS:et, så att innehåll beter sig likadant oavsett om det gäller produkter, tjänster, recept, nyheter eller event.

Målet är att redaktörer alltid ska förstå:
- om något är utkast eller publikt
- när något blir publikt
- när något slutar vara publikt
- varför något syns eller inte syns på sajten

Det här är den viktigaste grundepiken i roadmapen eftersom den påverkar både redaktionell trygghet, innehållskvalitet och framtida funktioner som preview, schemaläggning, kampanjer och automation.

## Problem i nuläget
Det finns redan publiceringsfält i delar av systemet, men modellen är inte helt konsekvent:
- vissa innehållstyper har `published`
- flera har `publishedAt`
- beteendet är inte lika tydligt i admin för alla typer
- det finns inte ett enhetligt stöd för avpublicering
- det finns inget tydligt språk i UI för status, framtida publicering och utgångna objekt

Konsekvensen blir:
- onödig osäkerhet för redaktören
- svårt att se varför något visas eller inte visas
- svårt att bygga vidare med preview, dashboard och validering

## Mål

### Affärsmål
- minska risken för felpublicering
- göra det möjligt att förbereda innehåll i förväg
- göra det enkelt att hålla sajten aktuell
- minska behovet av manuell rensning av gammalt innehåll

### Användarmål
En redaktör ska kunna:
- skapa innehåll som utkast
- välja när det ska börja visas
- välja när det ska sluta visas
- direkt förstå aktuell status i admin

### Tekniska mål
- en gemensam modell för publiceringsstatus
- en gemensam hjälpfunktion för att avgöra om innehåll ska visas
- tydlig bakåtkompatibilitet med nuvarande data
- enkel vidareutveckling mot preview, schemaläggning och automation

## Omfattning

### Ingår i epiken
Gemensam publiceringsmodell för:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

UI-stöd för:
- statusvisning
- utkast/publicerad
- publiceringsdatum
- avpubliceringsdatum

Frontend-logik för:
- vad som räknas som publikt just nu
- hur framtida och avslutat innehåll filtreras bort

### Ingår inte i epiken
- komplett preview-ombyggnad
- notifikationer
- schemalagda bakgrundsjobb
- kampanjmodell
- blockbaserad sidbyggare
- revisionsdiff

Det här är en grundepik, inte hela publiceringsplattformen.

## Föreslagen målmodell

### Publiceringsfält per innehållsobjekt
Alla listbaserade innehållstyper ska kunna bära:
- `published: boolean`
- `publishedAt?: string`
- `unpublishedAt?: string`

Tolkning:
- `published = false` betyder utkast, oavsett datum
- `published = true` och `publishedAt` i framtiden betyder schemalagd publicering
- `published = true` och `unpublishedAt` i det förflutna betyder avpublicerad/utgången
- `published = true` och aktuellt datum inom intervallet betyder publik

### Statusar i UI
Vi bör använda ett enhetligt språk:
- `Utkast`
- `Schemalagd`
- `Publik`
- `Utgången`

Detta är bättre än att bara visa en checkbox för `Publicerad`.

## Förslag på statuslogik

### Regler
Ett objekt är publikt om:
1. `published !== false`
2. `publishedAt` saknas eller är mindre än eller lika med nu
3. `unpublishedAt` saknas eller är större än nu

### Statusberäkning
UI-status bör räknas så här:
- `Utkast`: `published === false`
- `Schemalagd`: `published !== false` och `publishedAt > now`
- `Utgången`: `published !== false` och `unpublishedAt <= now`
- `Publik`: `published !== false` och inom giltigt intervall

## Datamodell och schema

### Ändringar i typer
Följande typer ska utökas med `unpublishedAt?: string` där det saknas:
- produkt
- tjänst
- recept
- nyhet
- Rulleriet-event
- Rulleriet-post

### Normalisering
Vi bör införa en central normalisering för publiceringsfält:
- tom sträng blir `undefined`
- saknat `published` normaliseras till `true` för bakåtkompatibilitet
- ogiltiga datum hanteras defensivt

### Gemensam hjälpfunktion
Skapa ett centralt publiceringsbibliotek, till exempel:
- `frontend/lib/publishing.ts`

Det bör innehålla:
- `isPublishedNow(item, now?)`
- `getPublishingStatus(item, now?)`
- `normalizePublishingFields(item)`
- eventuellt `compareByPublishingDate(...)`

## Påverkan på admin-UI

### Formulär
Alla relevanta formulär ska få samma sektion för publicering:
- checkbox eller toggle för `Publicerad`
- datumfält för `Publiceras`
- datumfält för `Avpubliceras`
- tydlig statusetikett

### Listvyer
Listor ska visa:
- statusbadge
- publiceringsdatum
- avpubliceringsdatum när relevant

Det ska gå snabbt att se:
- vad som är live
- vad som väntar
- vad som passerat

### Hjälptexter
Kort hjälptext i formulären:
- `Avpubliceras` är frivilligt
- om datum ligger i framtiden publiceras innehållet senare
- om avpubliceringsdatum passerat visas objektet inte publikt

## Påverkan på frontend

### Publicerade listor
Alla publika listor ska använda samma filtreringsfunktion:
- produkter
- tjänster
- recept
- nyheter
- event
- relaterade sektioner

Detta ersätter spridd logik och gör beteendet mer förutsägbart.

### Produktdetalj och andra detaljsidor
Detaljsidor ska inte kunna visa objekt som:
- är utkast
- ännu inte publicerats
- har avpublicerats

Undantag:
- preview-läge för behörig användare

## Påverkan på revisioner
Revisionssystemet bör inte byggas om i denna epic, men måste fortsätta fånga:
- ändring av `published`
- ändring av `publishedAt`
- ändring av `unpublishedAt`

Det ger viktigt stöd för återställning när publicering går fel.

## Påverkan på migration och bakåtkompatibilitet

### Krav
Befintligt innehåll får inte gå sönder när modellen införs.

### Strategi
- objekt som saknar `published` ska tolkas som `true`
- objekt som saknar `publishedAt` fortsätter fungera som direkt publicerade
- objekt som saknar `unpublishedAt` fortsätter vara publicerade tills vidare

### Seed och befintlig data
Seedfiler och normalisering bör uppdateras först.
Sedan adminformulär.
Sedan frontendfiltrering.

## Acceptanskriterier

### Funktionella
- en produkt kan sparas som utkast och visas inte publikt
- en produkt kan få ett framtida publiceringsdatum och visas först när datumet passerat
- en produkt kan få ett avpubliceringsdatum och försvinner publikt efter det datumet
- samma regler gäller för tjänster, recept, nyheter, Rulleriet-event och Rulleriet-inlägg
- admin visar status med samma språk för alla dessa typer
- preview fungerar fortfarande för utkast där preview redan finns

### UI
- varje relevant redigeringsvy har en publiceringssektion
- varje relevant lista visar statusbadge
- statusbadge använder exakt en av: `Utkast`, `Schemalagd`, `Publik`, `Utgången`

### Tekniska
- publiceringsregler ligger i central hjälplogik, inte duplicerade i flera komponenter
- befintligt seedinnehåll fungerar utan manuell datarensning
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Skapa gemensam publiceringslogik
Nya eller utökade filer:
- `frontend/lib/publishing.ts`
- `frontend/lib/published-content.ts`

Flytta dit all central logik för:
- publicerad nu
- status
- datumtolkning

### Steg 2. Utöka typer och normalisering
Påverkar främst:
- `frontend/lib/content-schema.ts`

Lägg till:
- `unpublishedAt?: string`
- normalisering av publiceringsfält

### Steg 3. Uppdatera adminformulär
Påverkar:
- `ProductsManager`
- `ServicesManager`
- `RecipesManager`
- `NewsManager`
- `RullerietSectionManager`
- `RullerietPostsManager`

Inför en återanvändbar liten komponent för publiceringsfält, exempel:
- `frontend/components/admin/PublishingFields.tsx`

### Steg 4. Uppdatera liststatus i admin
Byt nuvarande enkla badges till gemensamma statusbadges.

Exempel:
- `Publik`
- `Utkast`
- `Schemalagd`
- `Utgången`

### Steg 5. Uppdatera publika selectors
Påverkar:
- `frontend/lib/published-content.ts`
- sidor som i dag förlitar sig på enklare publiceringslogik

### Steg 6. Uppdatera seeddata
Påverkar:
- `frontend/content/site-content.json`

Det krävs inte att alla objekt får `unpublishedAt`, men formatet ska stödjas.

## Risker

### 1. Inkonsekvent status mellan admin och frontend
Motåtgärd:
- en central status- och publiceringsfunktion

### 2. Datumtolkning blir fel beroende på tidszon
Motåtgärd:
- definiera hur datum utan tid ska tolkas
- använd konsekvent serverlogik

### 3. Befintligt innehåll försvinner oavsiktligt
Motåtgärd:
- bakåtkompatibla defaults
- verifiering i testmiljö före produktionsbruk

## Verifiering
När epiken byggs klart bör vi verifiera följande manuellt:

1. Skapa ett utkast och kontrollera att det inte syns publikt.
2. Skapa ett objekt med framtida `publishedAt` och kontrollera att det får status `Schemalagd`.
3. Ge ett objekt `unpublishedAt` i det förflutna och kontrollera att det får status `Utgången`.
4. Säkerställ att preview fortfarande fungerar där preview-läge finns.
5. Kontrollera att listor och detaljsidor följer samma publiceringsregler.

## Definition of Done
Epiken är klar när:
- alla prioriterade innehållstyper använder samma publiceringsmodell
- admin visar enhetliga statusar
- frontend använder central publiceringslogik
- build går igenom
- lokal och testmiljö är verifierade
- dokumentation för modellen finns i repot

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 02: Kvalitetsvarningar i formulären`

Det bygger direkt vidare på publiceringsmodellen och gör CMS:et märkbart tryggare för redaktörer.
