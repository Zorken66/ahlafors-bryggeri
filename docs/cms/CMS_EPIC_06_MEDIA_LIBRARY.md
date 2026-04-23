# Epic 06: Starkare mediebibliotek

## Syfte
Den här epiken gör mediebiblioteket till en verklig kärnfunktion i CMS:et.

Målet är att mediahanteringen ska vara:
- snabb att använda
- enkel att förstå
- trygg att redigera
- återanvändbar över hela sajten

För den här sajten är det särskilt viktigt eftersom bilder används tungt i:
- hero-ytor
- produkter
- event
- kampanjer
- Rulleriet

## Problem i nuläget
Mediahanteringen finns redan, men den är fortfarande på en relativt grundläggande nivå.

Typiska problem i nuläget är:
- svårt att se var en bild används
- svårt att hitta rätt bild när mängden media växer
- alt-text och metadata är inte centrala nog i flödet
- bildkvalitet och beskärning styrs i praktiken utanför CMS-logiken
- det finns begränsad hjälp för att återanvända media i stället för att ladda upp nytt

Konsekvensen blir:
- fler dubletter
- ojämn bildkvalitet
- sämre SEO/tillgänglighet
- mer manuellt arbete för redaktören

## Mål

### Affärsmål
- minska tiden det tar att hitta och återanvända rätt media
- höja den visuella kvaliteten på sajten
- minska mängden dubbletter och felaktiga uppladdningar

### Användarmål
En redaktör ska kunna:
- hitta rätt bild snabbt
- förstå vad bilden används till
- uppdatera namn och alt-text enkelt
- återanvända befintligt material i stället för att ladda upp igen

### Tekniska mål
- rikare metadata för media
- bättre sök- och filtreringsstöd
- tydligare relation mellan media och innehåll
- kompatibilitet med framtida beskärning/fokalpunkt

## Omfattning

### Ingår i epiken
Förbättringar i mediebiblioteket för:
- sök
- filtrering
- metadata
- återanvändning
- användningsspårning

### Ingår inte i epiken
- avancerad bildredigering
- AI-beskärning
- extern DAM-integration
- videohantering i enterprise-nivå

## Målbild
Mediebiblioteket ska fungera som en riktig gemensam resursbank för hela sajten.

Det ska vara lätt att:
- hitta rätt bild
- veta om den redan finns
- se om den används på viktiga sidor
- uppdatera alt-text och visningsnamn
- undvika att ta bort något som används

## Kärnkapabiliteter

### 1. Sök
Det ska gå att söka på:
- filnamn
- visningsnamn
- alt-text
- typ

### 2. Filtrering
Det ska gå att filtrera på:
- bildtyp eller mime-type
- uppladdningsdatum
- använd/inte använd
- eventuellt uppladdad av

### 3. Metadata
Varje mediaobjekt bör tydligt ha:
- filnamn
- visningsnamn
- originalnamn
- mime-type
- storlek
- alt-text
- uppladdad av
- skapad datum

### 4. Användningsspårning
Systemet bör kunna svara på:
- används bilden just nu
- i vilka sektioner används den
- går den att ta bort säkert

Det här är en av de viktigaste funktionerna i denna epic.

### 5. Återanvändning
Mediebiblioteket ska styra beteendet mot återanvändning.

Det innebär:
- tydliga förhandsvisningar
- enkel “välj befintlig”
- mindre behov av att ladda upp samma bild igen

## Påverkan på admin-UI

### Mediebiblioteket
Medievyn bör utvecklas till att innehålla:
- sökfält
- filterrad
- grid/list-växling på sikt
- tydlig kortvy med metadata

### Media picker
När en redaktör väljer bild i formulär bör pickern få:
- bättre sök
- bättre preview
- tydlig visning av alt-text
- enklare återanvändning

### Säker borttagning
Om en bild används ska systemet:
- visa var den används
- varna före borttagning
- helst blockera borttagning eller kräva tydlig bekräftelse

## Alt-text och tillgänglighet
Alt-text ska inte vara en undanskymd detalj.

Den bör:
- vara tydligt synlig i mediaeditorn
- kunna uppdateras utan att byta fil
- lyftas fram som kvalitetsfaktor

På sikt bör kvalitetsvarningar kunna signalera:
- viktiga bilder utan alt-text

## Fokalpunkt och beskärning
Det här behöver inte byggas fullt ut direkt, men modellen bör förberedas för:
- fokalpunkt
- enkel beskärningsvariant per användningsyta

Det är särskilt relevant för:
- hero-bilder
- produktbilder
- eventbilder

## Användningsspårning

### Syfte
Användningsspårning ska minska risken att media tas bort eller byts ut utan förståelse för konsekvensen.

### Målbild
För ett mediaobjekt ska redaktören kunna se:
- används i startsida
- används i produkt X
- används i event Y
- används i Rulleriet

### Första nivå
Första versionen behöver inte vara perfekt live-spårning, men ska kunna ge användbar information genom att analysera CMS-innehållet.

## Datamodell

### Befintlig grund
Det finns redan en databasmodell för media med bland annat:
- `filename`
- `display_name`
- `original_name`
- `mime_type`
- `size_bytes`
- `public_url`
- `alt_text`
- `uploaded_by`

### Förbättringar som bör övervägas
På sikt kan modellen utökas med:
- `tags`
- `focal_point_x`
- `focal_point_y`
- `usage_count`
- `last_used_at`

Detta behöver dock inte vara första steget i epiken.

## Koppling till andra epics

### Epic 02: Kvalitetsvarningar
Mediaepiken gör det möjligt att varna för:
- saknad hero-bild
- saknad produktbild
- saknad eventbild
- saknad alt-text

### Epic 03: Dashboard
Dashboarden bör kunna visa:
- antal mediefiler utan alt-text
- oanvänt media
- nyligen uppladdat media

### Epic 05: Kampanj- och temamodell
Teman blir bara praktiskt användbara om det är lätt att hitta rätt bildmaterial och återanvända det.

## Acceptanskriterier

### Funktionella
- media går att söka fram på fler sätt än i dag
- media går att filtrera
- alt-text går att redigera tydligt
- systemet kan visa om ett mediaobjekt används
- borttagning av använt media hanteras säkrare

### UI
- mediebiblioteket känns mer som ett arbetsverktyg än en rå filista
- en redaktör kan hitta rätt bild snabbare än i dag
- viktiga metadata är synliga utan extra klick när det är rimligt

### Tekniska
- användningslogik ligger centralt
- mediehanteringen fortsätter fungera med befintlig databas och uploads-struktur
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Förbättra mediaquery och metadataflöden
Påverkar:
- `frontend/lib/cms-media.ts`
- eventuellt media-schemafiler

Lägg till stöd för:
- sök
- filtrering
- tydligare metadataretur

### Steg 2. Bygg användningsspårning
Ny logik, exempelvis:
- `frontend/lib/media-usage.ts`

Den kan analysera CMS-innehållet och returnera:
- vilka objekt som refererar till ett media-URL
- hur många gånger det används

### Steg 3. Förbättra mediaadmin
Påverkar sannolikt:
- `frontend/components/admin/MediaManager.tsx`

Första fokus:
- sök/filter
- tydligare kortvy
- visa användning
- bättre metadataredigering

### Steg 4. Förbättra media picker
Påverkar:
- `frontend/components/admin/MediaPickerField.tsx`

Lägg till:
- bättre sökbarhet
- förhandsvisning
- mer metadata i valet

### Steg 5. Säker borttagning
Innan delete:
- kontrollera användning
- visa varning eller blockera

## Risker

### 1. Användningsspårning blir ofullständig
Motåtgärd:
- börja med att analysera kända CMS-fält
- dokumentera eventuella begränsningar

### 2. För tung media-UI
Motåtgärd:
- fokusera på högsignaldata
- håll första versionen enkel

### 3. För många metadatafält för redaktören
Motåtgärd:
- prioritera visningsnamn och alt-text först
- gör övrig metadata sekundär

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Sök fram en befintlig eventbild via visningsnamn eller filnamn.
2. Filtrera media till endast bilder.
3. Uppdatera alt-text på en bild utan att byta fil.
4. Se att ett mediaobjekt används i en eller flera sektioner.
5. Försöka ta bort en använd bild och få en tydlig varning eller blockering.

## Definition of Done
Epiken är klar när:
- mediebiblioteket har sök och bättre filtrering
- viktiga metadata går att redigera tydligt
- användningsspårning finns på en användbar nivå
- borttagning av använt media är säkrare än i dag
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 07: Preview och förhandsgranskning över fler innehållstyper`

Det bygger vidare på publicering, kvalitet och media på ett naturligt sätt.
