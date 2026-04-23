# CMS Vision

## Syfte
Det här dokumentet beskriver målbilden för ett riktigt starkt CMS för Ahlafors Bryggerier. Tanken är inte att beskriva nästa lilla förbättring, utan att definiera vad systemet ska bli när det fungerar som ett affärskritiskt verktyg för marknad, redaktion, drift och försäljning.

Det här dokumentet ska användas som underlag för roadmap, epics, prioritering och tekniska vägval.

## Utgångspunkt
CMS:et fungerar redan i dag för mycket av det viktigaste:
- sidhantering för centrala sektioner
- hero- och SEO-styrning
- produkt-, recept-, tjänste- och Rulleriet-innehåll
- mediahantering
- revisioner
- roller och behörigheter

Nästa steg är därför inte att "få ett CMS", utan att gå från ett fungerande egenbyggt CMS till ett redaktionellt och operativt förstklassigt system.

## Vision
CMS:et ska vara så bra att verksamheten kan driva sajten snabbt, tryggt och självständigt utan att vara beroende av utvecklare för normalt innehållsarbete.

Det ska kännas:
- snabbt att förstå
- tryggt att ändra i
- svårt att göra fel i
- flexibelt när innehållsbehov förändras
- konsekvent mellan alla sidtyper
- tillräckligt kraftfullt för kampanjer, jubileum, event och säsongsinnehåll

## Principer

### 1. Redaktion först
CMS:et ska byggas för hur människor faktiskt arbetar, inte för hur datamodellen råkar se ut.

Det innebär:
- tydliga formulär i stället för rådata
- samma mental model på alla sidor
- förhandsvisning nära redigeringen
- bra defaults
- hjälptexter där fel annars ofta uppstår

### 2. Konsekvens före specialfall
Om hero, CTA, SEO, bild och publicering fungerar på en sida ska det fungera likadant på andra sidor, om det inte finns ett tydligt affärsskäl att avvika.

### 3. Säkert att publicera
En redaktör ska kunna ändra innehåll utan rädsla för att förstöra layout, radera viktig data eller publicera halvfärdigt material.

Det kräver:
- autospar eller tydlig sparstatus
- utkast/publicerad-logik
- versionshistorik
- återställning
- validering före publicering

### 4. Media är en kärnfunktion
För den här typen av sajt är bilder inte ett bihang. CMS:et måste göra det enkelt att hantera hero-bilder, produktbilder, eventbilder, beskärning, alt-texter och återanvändning.

### 5. Innehåll ska vara återanvändbart
Samma innehåll ska inte behöva matas in på flera ställen.

Exempel:
- jubileumstema som används i hero, produktkort och event
- produkter som kan lyftas i flera block
- event som kan visas både i Rulleriet, på startsidan och i nyhetsflöden

### 6. Drift ska vara odramatisk
CMS:et ska vara enkelt att köra på egen VPS utan skör drift, manuell specialkunskap eller riskabla deployrutiner.

## Målbild för användarupplevelsen

### Startsidan för admin
När en användare loggar in ska adminytan direkt svara på:
- vad kan jag redigera
- vad är nytt
- vad väntar på publicering
- vad är snart inaktuellt
- vad behöver bild eller SEO

Admin-starten ska därför på sikt innehålla:
- snabbgenvägar till vanliga sektioner
- "kommande att uppdatera"-panel
- senaste ändringar
- opublicerat innehåll
- innehåll med saknade bilder eller metadata

### Redigering av en sida
Varje innehållssida ska ha samma grundstruktur:
- `Sida`
- `Innehåll`
- `SEO`
- `Förhandsvisning`
- `Historik`

Om sidan är större kan den delas i interna tabbar, men mönstret ska vara konsekvent.

### Redigering av listinnehåll
Produkter, recept, tjänster, nyheter, event och blogginlägg ska ha:
- sök
- filtrering
- sortering
- status
- snabb duplicering
- tydlig publiceringsstatus
- möjlighet att markera utvalda objekt

### Mediahantering
Mediebiblioteket ska stödja:
- uppladdning
- återanvändning
- sök
- filtrering på typ och användning
- alt-text
- visuell förhandsvisning
- enkel bildbeskärning eller fokalpunkt

## Kärnkapabiliteter

### 1. Sida som innehållstyp
Alla centrala sidor ska styras via samma grundmodell:
- hero
- ingress
- block
- CTA
- SEO
- publicering

Det gäller bland annat:
- startsida
- om oss
- produkter
- produktdetalj
- tjänster
- recept
- Rulleriet
- kontakt

### 2. Blockbaserad redigering
På sikt bör CMS:et kunna bygga sidor av återanvändbara block, inte bara fasta formulär.

Exempel på block:
- hero
- text + bild
- citat
- faktaruta
- produktlyft
- eventlista
- kampanj/jubileumsblock
- CTA
- galleri

Målet är inte att allt ska vara helt fritt direkt, utan att utvalda block ska kunna återanvändas utan ny kod varje gång marknaden vill göra en satsning.

### 3. Stark publiceringsmodell
CMS:et ska stödja:
- utkast
- planerad publicering
- avpublicering
- preview-länkar
- publiceringsansvar
- ändringskommentarer

Det är särskilt viktigt för:
- event
- säsongsprodukter
- kampanjer
- jubileumsinnehåll

### 4. Versioner och återställning
Allt viktigt innehåll ska kunna:
- versionssparas
- jämföras
- återställas

Målet är att en redaktör aldrig ska känna att ett misstag är oåterkalleligt.

### 5. Behörigheter på riktigt
Rollsystemet ska bli mer kapabelt än "kan/kan inte".

Önskat läge:
- superadmin
- redaktör
- kampanjredaktör
- produktredaktör
- eventredaktör
- kontakt/kundtjänst

Behörigheter ska kunna styras på:
- sektion
- innehållstyp
- publicering
- media
- revisioner

### 6. Inbyggd kvalitetssäkring
CMS:et ska aktivt hjälpa redaktören.

Exempel:
- varna om hero saknar bild
- varna om SEO-title är tom
- varna om eventdatum har passerat
- varna om en produkt saknar länk eller bild
- varna om CTA saknar mål
- visa om text riskerar att bli för lång för layouten

## Innehållsmodeller vi bör sikta mot

### Produkt
En produkt ska inte bara vara text och bild.

Den bör kunna bära:
- grunddata
- kategorier och taggar
- artikelnummer och externa länkar
- bildgalleri
- säsongsstatus
- kampanjmarkeringar
- relaterade produkter
- food pairings
- tillgänglighet
- SEO och Open Graph

### Event
Event ska fungera som en riktig innehållstyp, inte som en enkel lista.

Den bör ha:
- datum och tid
- status
- plats
- bild
- ingress och full beskrivning
- arrangör/foodtruck
- biljettlänk
- maxantal
- återkommande format
- koppling till Rulleriet, startsida och nyheter

### Kampanjtema
Det här är viktigt för jubileum, säsonger och lanseringar.

Vi bör ha en modell för ett tema eller en kampanj som kan påverka:
- startsidan
- utvalda produkter
- banners/badges
- eventlyft
- CTA-ytor

Exempel:
- `30-årsjubileum`
- `Sommar på Rulleriet`
- `Julsortiment`

## Målbild för teknik och arkitektur

### 1. Stabil datamodell
Innehåll ska leva i en tydlig datamodell, inte i ad hoc-fält som växer fram okontrollerat.

Målet är:
- tydliga typer
- normalisering där det behövs
- migreringar när modellen förändras
- bakåtkompatibla defaults

### 2. CMS och frontend i samma produkt, men med tydliga gränser
Nuvarande modell där CMS:et bor i samma Next.js-app är rimlig för drift och enkelhet.

Det som måste bli tydligare är gränsen mellan:
- innehållsmodell
- admin-UI
- rendering
- publicering
- media

### 3. API-först internt
Även om admin och frontend ligger i samma repo bör CMS-kapabiliteter exponeras via stabila interna API-kontrakt.

Det gör det enklare att senare:
- lägga till extern preview
- bygga widgets
- integrera andra verktyg
- skapa automation

### 4. Driftsäkert på VPS
Den tekniska målbilden ska fungera väl på Inleed-VPS med:
- Next.js
- Postgres
- PM2
- nginx
- lokal filhantering eller objektlagring
- enkel backup

### 5. Backup och återställning som standard
Ingen produktion utan:
- databasbackup
- mediabackup
- dokumenterad restore-rutin
- verifierad återställning

## Målbild för arbetsflöden

### Redaktionellt arbetsflöde
1. Skapa utkast
2. Förhandsgranska
3. Validera
4. Publicera eller schemalägg
5. Följ upp

### Kampanjflöde
1. Skapa kampanjtema
2. Koppla till sidor, produkter och event
3. Förhandsgranska helheten
4. Tidsstyr start och slut
5. Avsluta utan att lämna skräp i innehållet

### Driftflöde
1. Redaktör ändrar innehåll
2. System loggar revision
3. Backup tas
4. Publicering kan rullas tillbaka
5. Problem går att spåra

## Vad som särskiljer ett fantastiskt CMS från ett bara fungerande CMS

Ett fungerande CMS låter dig ändra innehåll.

Ett fantastiskt CMS:
- hjälper dig att fatta rätt beslut
- visar konsekvensen av ändringen innan publicering
- minimerar risken för fel
- sparar tid i vardagen
- gör återkommande jobb nästan friktionsfria
- håller sajten visuellt konsekvent
- gör kampanjer och säsongsinnehåll lätta att driva

## Konkreta kvalitetskriterier
När CMS:et börjar närma sig visionen ska följande vara sant:

- en redaktör kan skapa en ny kampanjyta utan utvecklarhjälp
- en produktredaktör kan lägga till en ny produkt med komplett data på några minuter
- gamla event blir automatiskt enkla att hitta, arkivera eller dölja
- media är lätt att återanvända och svårt att tappa bort
- varje större ändring har preview och historik
- samma typ av innehåll beter sig likadant i admin
- innehåll går att flytta mellan miljöer på ett kontrollerat sätt
- drift, backup och restore är dokumenterade och testade

## Saker vi inte ska optimera för
För att hålla systemet starkt ska vi undvika att bygga för mycket av fel saker:

- total frihet i layout för varje sida från dag ett
- komplex enterprise-behörighet innan de verkliga rollerna kräver det
- extern headless-komplexitet om intern enkelhet räcker
- nya specialfält för varje engångsbehov
- kampanjlösningar som inte går att återanvända

## Rekommenderade huvudspår för roadmap
Det här är inte roadmapen, men det är de naturliga spåren att bryta ner vidare:

### Spår 1. Redaktionell upplevelse
- bättre admin-start
- bättre formulär
- preview
- sparstatus
- validering

### Spår 2. Innehållsmodell
- tydligare modeller för produkt, event, kampanj och sida
- mindre speciallogik
- bättre återanvändning

### Spår 3. Publicering och kvalitet
- utkast
- schemaläggning
- avpublicering
- revisioner och diff
- kvalitetsvarningar

### Spår 4. Media
- starkare mediebibliotek
- alt-texter
- fokalpunkt/beskärning
- användningsspårning

### Spår 5. Drift och säkerhet
- backup/restore
- övervakning
- loggning
- miljöflytt av innehåll
- robust deploymodell

### Spår 6. Kampanj och affärsstöd
- jubileum
- säsongsytor
- återanvändbara promos
- tidsstyrda teman

## Nästa steg
Nästa dokument bör vara en roadmap som bryter ner visionen i:
- `Now`
- `Next`
- `Later`

Den roadmapen bör sedan översättas till konkreta epics och därefter till sprintbara uppgifter.
