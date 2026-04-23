# Epic 07: Preview och förhandsgranskning över fler innehållstyper

## Syfte
Den här epiken gör preview till en konsekvent kärnfunktion i CMS:et.

Målet är att redaktören ska kunna se hur innehåll kommer att se ut publikt innan det publiceras, utan att behöva gissa, vänta på deploy eller publicera halvfärdigt material.

Preview ska fungera som ett naturligt steg mellan:
- redigering
- kvalitetskontroll
- publicering

## Problem i nuläget
Preview finns redan delvis i systemet, men stödet är inte helt konsekvent mellan innehållstyper.

Konsekvenser i nuläget:
- redaktören måste ibland föreställa sig resultatet
- risk för att layoutproblem upptäcks sent
- utkast kan vara svårare att kvalitetssäkra
- arbetsflödet blir mindre tryggt än det borde vara

## Mål

### Affärsmål
- minska felpublicering
- minska behovet av efterjusteringar i produktion
- göra redaktionellt arbete snabbare och tryggare

### Användarmål
En redaktör ska kunna:
- öppna preview från relevanta innehållstyper
- se utkast som om de vore publicerade
- kontrollera bild, text, CTA och helhetsintryck före publicering

### Tekniska mål
- enhetlig preview-modell
- samma princip för flera innehållstyper
- tydlig åtkomstkontroll för preview-läge
- minimal duplicerad logik

## Omfattning

### Ingår i epiken
Konsekvent preview-stöd för:
- sidor
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-inlägg
- event där det är relevant

### Ingår inte i epiken
- visuell diff mellan publicerat och preview
- delbara externa preview-länkar med lång livslängd
- godkännandeflöden med flera personer

## Målbild
Preview ska vara så enkelt att redaktören förväntar sig att det alltid finns.

Det ska fungera så här:
1. Redaktören ändrar innehåll
2. Klickar `Förhandsgranska`
3. Ser exakt eller nära nog exakt hur det kommer att visas
4. Går tillbaka och justerar
5. Publicerar först när det känns rätt

## UX-principer

### 1. Preview ska vara nära innehållet
Det ska inte krävas flera steg eller specialkunskap för att öppna preview.

### 2. Preview ska tydligt märkas
Det ska vara uppenbart att användaren tittar på en förhandsvisning och inte på live-sidan.

### 3. Preview ska visa helheten
Det räcker inte att se rådata. Preview ska visa det faktiska frontendresultatet så långt det går.

## Innehållstyper som ska stödjas

### Sidor
Förstasida, om oss, kontakt, produkter, tjänster, recept, Rulleriet.

### Objekt
Produkter, tjänster, recept, nyheter, Rulleriet-inlägg och event.

### Särskilt viktiga kandidater
De som bör prioriteras först:
- produkter
- startsida
- Rulleriet-event
- Rulleriet-inlägg

## Preview-lägen

### 1. Objektpreview
Visar ett enskilt objekt som om det vore publicerat.

Exempel:
- produktdetaljsida för ett utkast
- receptsida för ett utkast
- nyhetsinlägg i preview-läge

### 2. Sidpreview
Visar en hel sida med senaste utkastet.

Exempel:
- startsidan med jubileumsblock
- Rulleriet-sidan med opublicerade event

### 3. Kontextpreview
På sikt bör preview kunna visa innehåll i sitt sammanhang.

Exempel:
- ett event så som det syns i en kortlista
- en produkt så som den syns på startsidan och i produktgriden

Detta kan börja enklare och byggas ut senare.

## Säkerhet och åtkomst
Preview får inte bli en bakdörr till opublicerat innehåll.

Det kräver:
- aktiv adminsession eller annan säker preview-token
- serverkontroll av åtkomst
- tydlig avgränsning mellan publikt läge och preview-läge

Nuvarande modell med sessionbaserad preview är en bra grund att bygga vidare på.

## Tekniska principer

### 1. Samma renderingskomponenter som live
Preview ska i första hand använda samma rendering som publika sidor.

Det minskar risken för att preview visar något annat än verkligheten.

### 2. Preview ska styra datakälla, inte layout
Skillnaden mellan preview och live ska främst vara vilken data som används:
- publicerad data i live
- utkastdata i preview

### 3. Preview-logik ska centraliseras
Vi bör undvika att varje sida löser preview på eget sätt.

## Föreslagen teknisk modell

### Central preview-hjälplogik
Skapa eller förtydliga ett centralt lager, exempelvis:
- `frontend/lib/preview.ts`

Det kan hantera:
- om preview är aktiv
- om användaren får se preview
- hur utkastdata ska hämtas

### Preview-flagga
En konsekvent parameter eller mekanism, exempel:
- `?preview=1`

Detta används redan delvis och bör standardiseras.

### Preview-banner
Skapa en återanvändbar komponent, exempel:
- `frontend/components/admin/PreviewBanner.tsx`

Den visar:
- att sidan är preview
- eventuell knapp tillbaka till admin
- eventuell statusinformation

## Påverkan på admin-UI

### Förhandsgranskningsknapp
Alla relevanta managers bör ha en tydlig preview-knapp.

Exempel:
- `Förhandsgranska sida`
- `Förhandsgranska produkt`
- `Förhandsgranska event`

### Placering
Den bör ligga nära:
- spara
- publicering
- kvalitetsstatus

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
Preview blir ännu viktigare när innehåll kan vara utkast eller schemalagt.

### Epic 02: Kvalitetsvarningar
Preview bör användas som nästa steg efter att varningar gåtts igenom.

### Epic 03: Dashboard
Dashboarden kan senare visa innehåll som är redo för preview eller nyligen previewat.

### Epic 06: Mediebibliotek
Preview gör det lättare att bedöma om bildval, alt-text och beskärning fungerar i praktiken.

## Acceptanskriterier

### Funktionella
- redaktören kan öppna preview för prioriterade innehållstyper
- utkast visas i preview även om de inte är publika
- publika sidor fortsätter respektera publiceringsstatus
- preview kräver behörighet

### UI
- preview-läge är tydligt markerat
- det finns en enhetlig preview-knapp i relevanta managers
- användaren kan enkelt navigera tillbaka till admin

### Tekniska
- previewlogik ligger centralt
- samma rendering som live används så långt det är rimligt
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Inventera och standardisera befintlig preview
Påverkar:
- sidor och managers som redan använder `?preview=1`

Målet är att få samma mönster överallt.

### Steg 2. Centralisera preview-hjälplogik
Skapa eller utöka:
- `frontend/lib/preview.ts`

### Steg 3. Lägg till återanvändbar preview-banner
Ny komponent:
- `frontend/components/admin/PreviewBanner.tsx`

### Steg 4. Integrera i prioriterade managers
Föreslagen ordning:
1. `HomepageSectionManager`
2. `ProductsManager`
3. `RullerietSectionManager`
4. `RullerietPostsManager`
5. `ServicesManager`
6. `RecipesManager`
7. `NewsManager`

### Steg 5. Utöka eventpreview där det är rimligt
Event kan i första versionen previewas i sitt listsammanhang på Rulleriet-sidan, snarare än som helt egen detaljsida.

## Risker

### 1. Preview visar inte exakt samma som live
Motåtgärd:
- återanvänd samma renderingslogik
- minimera specialfall

### 2. Preview blir osäkert
Motåtgärd:
- tydlig åtkomstkontroll
- sessionbaserad kontroll eller säkra tokens

### 3. För många individuella previewlösningar
Motåtgärd:
- en central previewmodell
- enhetliga knappar och mönster

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Förhandsgranska en opublicerad produkt.
2. Förhandsgranska startsidan med utkaständringar.
3. Förhandsgranska ett Rulleriet-inlägg före publicering.
4. Säkerställa att preview inte är åtkomlig utan behörighet.
5. Säkerställa att live fortfarande bara visar publicerat innehåll.

## Definition of Done
Epiken är klar när:
- preview finns konsekvent för prioriterade innehållstyper
- preview kräver behörighet
- preview-läge är tydligt markerat
- samma renderingsprincip används som live där det är rimligt
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 08: Revisionsdiff och trygg återställning`

Det är ett naturligt nästa steg för att göra CMS:et verkligt tryggt i redaktionell vardag.
