# Epic 10: Miljöflytt av innehåll och säkrare innehållsdeploy

## Syfte
Den här epiken gör det möjligt att hantera innehåll som en kontrollerad tillgång mellan miljöer, inte som något som råkar finnas i en enskild databas.

Målet är att innehåll ska kunna flyttas tryggt mellan:
- lokal miljö
- testmiljö
- produktion

utan att vi behöver förlita oss på manuella ad hoc-exporter, SQL-klipp eller osäker filkopiering.

## Problem i nuläget
Systemet fungerar redan i flera miljöer, men innehållsflödet mellan dem är fortfarande relativt manuellt.

Risker i nuläget:
- lokala ändringar finns i databasen men inte i repot
- testmiljön kan skilja sig från lokal miljö på svårspårade sätt
- mediafiler och databasdata kan komma ur synk
- deploy av kod och deploy av innehåll är inte tydligt separerade

Konsekvensen blir:
- högre risk vid release
- större osäkerhet om vilken miljö som är “sann”
- onödigt manuellt arbete vid migrering eller återställning

## Mål

### Affärsmål
- säkrare releaseflöde
- mindre risk att produktion saknar innehåll eller media
- enklare arbetsflöde mellan lokal, test och skarp miljö

### Användarmål
Teknisk administratör eller utvecklare ska kunna:
- exportera innehåll från en miljö
- importera det till en annan
- förstå vad som flyttas
- validera att media och innehåll fortfarande matchar

### Tekniska mål
- kontrollerad export/import av innehåll
- tydlig hantering av mediareferenser
- mindre beroende av direkt databasmanipulation
- tydligare gräns mellan koddeploy och innehållsdeploy

## Omfattning

### Ingår i epiken
- export/import av CMS-innehåll
- export/import av media-metadata
- strategi för mediefiler
- dokumenterade kommandon eller script för innehållsdeploy
- verifiering efter import

### Ingår inte i epiken
- full tvåvägssynk i realtid
- avancerad merge mellan två redigerade miljöer
- extern CMS-hosting eller SaaS-lösning

## Målbild
Vi ska kunna beskriva och använda tre tydliga flöden:

### 1. Seedflöde
Repot innehåller en stabil grundnivå av seed/default-content.

### 2. Innehållsflöde mellan miljöer
Utvald CMS-data kan flyttas från lokal till test, eller test till produktion, på ett kontrollerat sätt.

### 3. Koddeploy
Kod kan deployas utan att oavsiktligt skriva över redaktionellt innehåll i databasen eller uploads.

## Principer

### 1. Kod och innehåll är olika saker
Kod ska deployas via deployflödet.
Innehåll ska flyttas via ett separat, tydligt innehållsflöde.

### 2. Media måste behandlas som förstklassig del av innehållet
Det räcker inte att exportera CMS-JSON om mediafilerna inte följer med eller fortfarande pekar fel.

### 3. Import ska vara verifierbar
Efter en import ska det gå att svara på:
- hur mycket innehåll importerades
- vilka mediaobjekt importerades
- saknas några filer
- matchar referenserna

### 4. Produktion ska skyddas
Produktionsinnehåll ska inte skrivas över av misstag.

## Innehållstyper som berörs
Flödet ska minst stödja:
- site/homepage/about/contact
- products/productsPage/productDetailPage
- services/servicesPage
- recipes/recipesPage
- rulleriet inklusive event och inlägg
- news
- media metadata
- admin users där det är rimligt och säkert

## Exportmodell

### Vad som bör exporteras
En export bör kunna innehålla:
- CMS-content snapshot
- media metadata
- referens till eller kopia av uppladdade filer
- versionsinformation
- exportmetadata som datum, källa och miljö

### Format
Ett JSON-baserat exportformat räcker långt i första versionen.

Exempelvis:
- `content.json`
- `media.json`
- `manifest.json`

Eventuellt tillsammans med en mediafolder eller zip-arkiv.

## Importmodell

### Import ska kunna köras på kontrollerat sätt
Importflödet ska:
- läsa manifest
- verifiera innehållsformat
- verifiera mediareferenser
- skriva data till rätt miljö
- logga resultat

### Importlägen
Vi bör stödja åtminstone två lägen:

- `replace`
  Ersätter målmiljöns CMS-innehåll med importerat innehåll.

- `safe merge`
  Begränsad merge där metadata eller media läggs till utan att hela innehållet skrivs över.

Första versionen kan med fördel börja med tydlig `replace`-strategi för utvalda användningsfall.

## Mediahantering i flödet

### Metadata och filer måste hållas ihop
Importen ska inte bara lägga in rader i databasen. Den måste också hantera:
- uppladdade filer
- filnamn
- public paths
- alt-text och metadata

### Målbild
Ett exportpaket ska kunna verifiera:
- att varje mediareferens har en fil
- att varje fil har metadata

### Konflikter
Vid namnkonflikter eller dubletter måste systemet definiera:
- skriv över
- hoppa över
- döp om

Första versionen bör vara tydlig och konservativ, inte magisk.

## Miljöstrategi

### Lokal
Används för utveckling, modellförändringar och innehållsarbete i tidigt skede.

### Test
Ska spegla realistiskt innehåll och användas för verifiering före produktion.

### Produktion
Är den skyddade sanningsmiljön för live-innehåll.

## Rekommenderade flöden

### Flöde A: Lokal till test
Används när ny struktur eller nytt innehåll ska provas i testmiljön.

Steg:
1. Export från lokal
2. Validering
3. Import till test
4. Verifiering

### Flöde B: Test till produktion
Används när testad redaktionell version ska gå live.

Steg:
1. Export från test
2. Backup av produktion
3. Import till produktion
4. Smoke test

### Flöde C: Backup och restore
Används vid fel eller rollback.

Steg:
1. Export eller backup av aktuell miljö
2. Restore från vald snapshot
3. Verifiering

## Påverkan på drift

### Deployscript
Nuvarande deployscript för kod ska inte automatiskt skriva över CMS-data.

Det ska vara tydligt när vi gör:
- koddeploy
- innehållsimport
- mediaimport

### Backup
Innehållsdeploy till test eller produktion bör alltid föregås av:
- databasbackup
- backup av uploads eller relevant mediauppsättning

## Påverkan på admin och UX
Det här behöver inte börja som en adminfunktion.

Första versionen kan med fördel vara:
- scripts
- CLI-kommandon
- dokumenterade runbooks

På sikt kan viss del av detta få enklare adminstöd, men det är inte ett krav nu.

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
När publiceringsstatus blir viktig måste den också flyttas korrekt mellan miljöer.

### Epic 06: Mediebibliotek
Starkare mediahantering gör export/import säkrare och mer verifierbar.

### Epic 08: Revisioner
Restore och rollback behöver fungera ihop med miljöflytt.

### Roller och rättigheter
På sikt kan innehållsimport vara begränsad till superadmin eller driftroll.

## Acceptanskriterier

### Funktionella
- det går att exportera CMS-innehåll från en miljö
- det går att importera det till en annan miljö
- media metadata följer med
- mediafiler kan verifieras eller flyttas med
- produktionsimport kan göras med backup före

### Operativa
- innehållsdeploy och koddeploy är tydligt separerade
- det finns dokumenterade steg för lokal till test och test till produktion
- det går att verifiera utfallet efter import

### Tekniska
- formatet är versionssatt eller åtminstone tydligt beskrivet
- importen validerar data innan skrivning
- build och scripts fungerar i repo och på VPS-flödet

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Export-/importscript
Lägg till script, exempelvis:
- `scripts/export-cms-content.mjs`
- `scripts/import-cms-content.mjs`

De ska kunna:
- läsa från databas
- skriva till filer
- läsa tillbaka och skriva in

### Steg 2. Mediaexport och mediaimport
Lägg till stöd för:
- export av `cms_media_assets`
- kopiering eller paketering av uploads
- verifiering av filnärvaro

### Steg 3. Manifest
Inför ett enkelt manifest, exempel:
- källmiljö
- datum
- versionsfält
- counts per innehållstyp

### Steg 4. Runbooks och dokumentation
Dokumentera:
- lokal till test
- test till produktion
- backup före import
- verifiering efter import

### Steg 5. Integrera med befintlig VPS-struktur
Anpassa flödet till:
- Postgres på VPS
- `shared/uploads`
- befintligt deployscript
- PM2/nginx-upplägget

## Risker

### 1. Innehåll skrivs över av misstag
Motåtgärd:
- backup före import
- tydlig bekräftelse i script
- konservativa standardlägen

### 2. Media och metadata hamnar ur synk
Motåtgärd:
- verifiering av båda delar
- manifest med counts och saknade filer

### 3. För mycket komplexitet i första versionen
Motåtgärd:
- börja med enkel export/import för kända behov
- bygg inte generell synkmotor direkt

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Exportera CMS-data från lokal miljö.
2. Importera den till testmiljö.
3. Kontrollera att counts för innehåll och media stämmer.
4. Kontrollera att refererade mediafiler finns i målmiljön.
5. Göra backup och därefter import till produktionstest med verifiering.

## Definition of Done
Epiken är klar när:
- CMS-data kan flyttas kontrollerat mellan miljöer
- media och metadata hanteras tillsammans på en användbar nivå
- koddeploy och innehållsdeploy är tydligt separerade
- dokumenterade runbooks finns
- verifiering efter import är möjlig

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 11: Driftmognad, backupövervakning och observability`

Det blir det sista naturliga lagret för att göra CMS:et robust över tid.
