# CMS Roadmap

## Syfte
Det här dokumentet bryter ner [CMS_VISION.md](C:/Dev/Ahlafors-Bryggerier/ahlafors-bryggeri/docs/cms/CMS_VISION.md:1) till en första konkret roadmap.

Roadmapen är avsiktligt uppdelad i:
- `Now`: det som bör göras först för att höja nytta, trygghet och fart i vardagen
- `Next`: det som gör CMS:et starkt som redaktionellt verktyg
- `Later`: det som gör CMS:et riktigt förstklassigt och mer framtidssäkert

Det här är inte sprintplanering. Det är en prioriterad riktning.

## Nuläge
CMS:et har redan en ovanligt bra grund för ett egenbyggt system:
- sida + hero + SEO går att styra för centrala sektioner
- produkter, tjänster, recept och Rulleriet är redigerbara
- mediahantering finns
- revisionshistorik finns
- roller och sektionsbehörigheter finns
- preview finns delvis för vissa innehållstyper
- publiceringsfält finns för flera objekt

Det som saknas är främst sammanhållen publiceringsmodell, bättre redaktionell överblick, starkare validering och en mer återanvändbar kampanjmodell.

## Prioriteringsprinciper
Vi ska prioritera sådant som:
- sparar redaktionell tid varje vecka
- minskar risken för felpublicering
- minskar behovet av utvecklare för återkommande innehållsarbete
- gör CMS:et mer konsekvent mellan sidtyper
- förbättrar drift och återställning utan att öka komplexiteten i onödan

## Now
Målet i `Now` är att göra CMS:et betydligt tryggare och snabbare i daglig användning utan stor ombyggnad av arkitekturen.

### 1. Enhetlig publiceringsmodell
Inför samma publiceringslogik för alla relevanta innehållstyper:
- `Utkast`
- `Publicerad`
- `Publiceras datum`
- `Avpublicera datum` där det är relevant

Omfattar i första hand:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

Varför nu:
- publiceringsfält finns redan delvis
- stor nytta med relativt begränsad implementation
- minskar risken för att gammalt innehåll ligger kvar publikt

### 2. Kvalitetsvarningar i formulären
Lägg till enkla, tydliga varningar före spar/publicering:
- saknad hero-bild
- tom SEO-title eller description
- produkt utan bild
- produkt utan extern länk
- event med passerat datum men fortfarande publicerat
- CTA utan länk
- tomma viktiga rubrikfält

Varför nu:
- hög nytta
- låg till medelhög teknisk kostnad
- gör CMS:et direkt tryggare

### 3. Förbättrad preview
Bygg ut preview så att den fungerar konsekvent för:
- sidor
- produkter
- tjänster
- recept
- Rulleriet-inlägg
- event där det är relevant

Varför nu:
- preview finns redan som idé och delvis i produktflödet
- borde bli en standardfunktion i hela CMS:et

### 4. Tydligare admin-start
Skapa en enkel dashboard på `/admin` med:
- snabbgenvägar till vanligaste sektionerna
- senaste ändringar
- opublicerat innehåll
- snart passerade eller redan passerade event
- innehåll med saknade bilder eller SEO

Varför nu:
- gör stor skillnad för redaktionell användbarhet
- kräver inte att hela CMS:et byggs om

### 5. Sök och filtrering i större listor
Inför sök/filter i:
- produkter
- tjänster
- recept
- Rulleriet-event
- Rulleriet-inlägg
- media

Varför nu:
- datamängden växer redan
- snabbt värde

### 6. Driftspår: backup och restore som rutin
Formalisera detta i repo och drift:
- schemalagd databasbackup
- schemalagd backup av uploads
- dokumenterad restore-test
- enkel checklista för återställning

Varför nu:
- hög riskreducering
- särskilt viktigt innan produktion öppnas fullt

## Next
Målet i `Next` är att gå från fungerande CMS till stark redaktionell produkt.

### 1. Standardiserade redigeringsvyer per sidtyp
Alla sidtyper bör följa samma grundstruktur:
- `Sida`
- `Innehåll`
- `SEO`
- `Förhandsvisning`
- `Historik`

Detta gäller särskilt:
- startsida
- om oss
- kontakt
- produkter
- tjänster
- recept
- Rulleriet

Varför next:
- kräver mer UI-arbete än `Now`
- stor effekt på konsekvens och onboarding

### 2. Riktig eventmodell
Gör event till en mer komplett innehållstyp med:
- status
- publicering
- plats
- arrangör/foodtruck
- biljettlänk
- bild
- featured
- eventuell kapacitet eller bokningsinfo
- arkivläge

Dessutom:
- möjliggör visning både på Rulleriet och på startsidan/nyhetsytor

### 3. Kampanj- och temamodell
Skapa en återanvändbar modell för teman som:
- jubileum
- sommar
- jul
- lanseringar

Ett tema ska kunna styra:
- badges
- utvalda produkter
- startsideblock
- CTA-ytor
- eventlyft

Det här ersätter behovet av att bygga specialfält varje gång verksamheten vill göra en satsning.

### 4. Starkare mediebibliotek
Bygg vidare på nuvarande mediahantering med:
- alt-text som tydligt redigerbart fält
- filtrering på användning
- bättre namn/metadata
- användningsspårning: var används bilden
- möjlighet att byta fil utan att bryta innehåll

Om tekniken tillåter:
- fokalpunkt eller enkel beskärning

### 5. Diff i revisionshistoriken
Nu finns revisioner. Nästa steg är att göra dem mer användbara:
- visa vad som ändrats
- sektion för sektion
- textdiff där det är relevant
- lättare återställning

### 6. Fler och bättre roller
Gå från dagens modell till mer verksamhetsnära roller:
- superadmin
- redaktör
- produktredaktör
- eventredaktör
- kampanjredaktör
- kontakt/kundservice

Behörighet ska kunna skiljas mellan:
- läsa
- redigera
- publicera
- återställa revisioner
- hantera media

## Later
Målet i `Later` är att göra CMS:et verkligt starkt över tid, utan att kompromissa med enkel drift.

### 1. Blockbaserad sidbyggare
Inför återanvändbara block för utvalda typer av innehåll:
- hero
- text + bild
- citat
- galleri
- produktlyft
- eventblock
- CTA
- kampanjblock

Det här ska inte vara en helt fri page builder från början, utan en kontrollerad blockmodell som håller designen konsekvent.

### 2. Schemalagda flöden och automation
Bygg ut publiceringsmotorn med:
- schemalagd publicering
- schemalagd avpublicering
- automatiskt arkiv för gamla event
- påminnelser om innehåll som snart blir inaktuellt

### 3. Miljöflytt av innehåll
Skapa kontrollerade flöden för att flytta innehåll mellan:
- lokal miljö
- test/VPS
- produktion

Målet är:
- export/import per innehållstyp
- säker migrering av mediareferenser
- mindre manuellt arbete

### 4. Interna CMS-API-kontrakt
Tydliggör CMS:et som intern plattform genom stabila API-kontrakt för:
- innehåll
- media
- preview
- revisioner
- publiceringsstatus

Det gör senare integrationer enklare utan att kräva en extern headless-arkitektur i dag.

### 5. Observability och driftmognad
På längre sikt bör CMS-driften ha:
- bättre loggning
- larm på centrala fel
- tydligare health checks
- backupövervakning
- återställningstester som körs återkommande

## Föreslagen ordning på epics
Om vi översätter roadmapen till epics bör de tas ungefär i den här ordningen:

1. Enhetlig publiceringsmodell
2. Kvalitetsvarningar i formulären
3. Förbättrad preview
4. Admin-dashboard
5. Sök och filtrering i listvyer
6. Backup/restore-rutin
7. Standardiserade sidvyer
8. Riktig eventmodell
9. Kampanj- och temamodell
10. Starkare mediebibliotek
11. Revisionsdiff
12. Förfinade roller och publiceringsbehörighet

## Rekommenderad leveransstrategi

### Fas 1
Fokusera på trygghet och överblick:
- publicering
- preview
- validering
- dashboard

### Fas 2
Fokusera på redaktionell skala:
- sök/filter
- standardiserade sidvyer
- eventmodell
- mediaförbättringar

### Fas 3
Fokusera på affärsstöd:
- kampanjteman
- återanvändbara promotions
- bättre styrning av säsongsinnehåll

### Fas 4
Fokusera på plattformsmognad:
- blockmodell
- automation
- miljöflytt
- observability

## Vad jag skulle prioritera först i praktiken
Om vi ska börja direkt i nuvarande repo och få snabbast verkligt värde skulle jag ta:

1. Enhetlig publiceringsmodell
2. Kvalitetsvarningar
3. Admin-dashboard
4. Preview över fler innehållstyper
5. Riktig eventmodell

Det är den bästa kombinationen av:
- redaktionell nytta
- låg till medelhög teknisk risk
- tydlig förbättring i hur CMS:et upplevs

## Nästa steg
Nästa steg efter detta dokument bör vara att bryta ut roadmapen till konkreta epics med:
- mål
- scope
- icke-mål
- beroenden
- acceptanskriterier

Det mest naturliga är att börja med epic nummer 1:
- `Enhetlig publiceringsmodell`
