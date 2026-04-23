# Epic 08: Revisionsdiff och trygg återställning

## Syfte
Den här epiken gör revisionshistoriken till ett praktiskt arbetsverktyg, inte bara ett tekniskt arkiv.

Målet är att redaktörer och administratörer ska kunna:
- se vad som faktiskt ändrats
- förstå vem som ändrat vad
- återställa innehåll tryggt
- känna att misstag är reversibla

Det här är en avgörande pusselbit för att CMS:et ska upplevas som säkert i vardagen.

## Problem i nuläget
Revisionshistorik finns redan, men nyttan är begränsad om användaren inte snabbt kan svara på:
- vad ändrades egentligen
- vilken version är rätt
- vad händer om jag återställer

Utan tydlig diff och trygg återställning blir revisioner lätt något man bara använder i nödfall.

Konsekvensen blir:
- större osäkerhet vid redigering
- högre tröskel för förändringar
- större risk att fel löses manuellt i stället för kontrollerat

## Mål

### Affärsmål
- minska konsekvensen av felredigeringar
- öka tilliten till CMS:et som arbetsverktyg
- minska behovet av utvecklarhjälp vid återställning

### Användarmål
En redaktör eller admin ska kunna:
- öppna en revision
- direkt se vad som ändrats
- jämföra versioner begripligt
- återställa rätt version med rimlig trygghet

### Tekniska mål
- tydlig diff mellan versioner
- säker restoreprocess
- god spårbarhet
- fortsatt kompatibilitet med befintlig revisionslagring

## Omfattning

### Ingår i epiken
- bättre visning av revisionshistorik
- diffvisning
- tydligare restoreflöde
- bättre metadata kring ändringar

### Ingår inte i epiken
- realtids-samarbete
- branchning av innehåll
- konflikthantering mellan samtidiga redigeringar
- extern audit-loggplattform

## Målbild
Revisionshistoriken ska kännas lika självklar som versionshistorik i ett modernt dokumentverktyg:
- lätt att läsa
- lätt att jämföra
- lätt att backa

Systemet ska inte bara visa att en revision finns, utan hjälpa användaren förstå dess innebörd.

## Kärnkapabiliteter

### 1. Tydlig revisionslista
Varje revision bör visa:
- sektion eller innehållstyp
- vem som ändrade
- när
- ändringskommentar
- eventuell typ av ändring om det går att härleda

### 2. Diffvisning
Användaren ska kunna se:
- vilka fält som ändrats
- gammalt värde
- nytt värde

För textfält räcker i första versionen:
- fältnivådiff
- tydlig före/efter-visning

Det behöver inte vara en perfekt inline-orddiff i första iterationen.

### 3. Återställning med trygghet
Restoreflödet ska:
- tydligt säga vad som återställs
- visa vilken sektion som påverkas
- kräva bekräftelse
- skapa ny revision efter återställning

Det sista är viktigt så att även återställningen själv blir spårbar och reversibel.

### 4. Kontext
Användaren ska förstå om en revision gäller:
- en hel sektion
- en sida
- en enskild innehållstyp
- en lista med objekt

## Typer av diff vi bör stödja

### 1. Fältdiff
För strukturerat innehåll som:
- hero-titel
- SEO-title
- CTA-text
- datum

### 2. Text före/efter
För längre texter som:
- produktbeskrivningar
- introtexter
- Rulleriet-inlägg

### 3. Liständringar
För arrayer ska systemet kunna visa enkla skillnader som:
- objekt tillagt
- objekt borttaget
- objekt ändrat

Det behöver inte vara perfekt identifiering i första versionen, men det ska ge faktisk hjälp.

## Restoremodell

### Grundprincip
Restore ska aldrig kännas som en blind operation.

Användaren ska innan återställning se:
- vilken revision det gäller
- vem som skapade den
- när den skapades
- vilken sektion som påverkas

### Restore ska skapa ny revision
När något återställs ska systemet:
1. skriva tillbaka tidigare innehåll
2. skapa en ny revision som beskriver återställningen

Det gör att man även kan ångra en restore.

## Påverkan på admin-UI

### Revisionslista
Revisionsvyn bör få:
- bättre tabell eller kortvy
- filter på sektion
- filter på användare
- sök i ändringskommentar där det är rimligt

### Revisionsdetalj
När en revision öppnas ska användaren se:
- metadata
- diff
- knapp för återställning

### Bekräftelsedialog
Återställning ska inte ske direkt på första klick.

Dialogen ska säga:
- vad som återställs
- att nuvarande innehåll ersätts
- att en ny revision kommer skapas

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
Publiceringsändringar måste bli tydliga i diffen.

Exempel:
- `published` ändrat
- `publishedAt` ändrat
- `unpublishedAt` ändrat

### Epic 02: Kvalitetsvarningar
När någon återställer innehåll bör kvalitetskontroller kunna köras igen så att användaren inte återställer något uppenbart bristfälligt utan varning.

### Epic 03: Dashboard
Dashboarden kan senare visa:
- senaste ändringar
- senaste återställningar
- sektioner med ovanligt många ändringar

### Preview
På sikt kan en revision också kunna previewas före restore, men det behöver inte ingå i denna epic.

## Acceptanskriterier

### Funktionella
- användaren kan öppna en revision och se vad som ändrats
- användaren kan återställa en revision på ett kontrollerat sätt
- återställning skapar en ny revision
- ändringskommentar och metadata är tydligt synliga

### UI
- revisionsvyn är begriplig även för icke-tekniska användare
- diffen är läsbar
- restoreflödet känns tryggt och tydligt

### Tekniska
- difflogik ligger centralt
- restorelogik fortsätter använda säkra serverflöden
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Bygg diffhjälplogik
Ny fil, exempelvis:
- `frontend/lib/content-diff.ts`

Den ska kunna:
- jämföra två JSON-strukturer
- returnera ändrade fält på användbar nivå

### Steg 2. Förbättra revisionsdata i UI
Påverkar sannolikt:
- `frontend/components/admin/RevisionsManager.tsx`

Lägg till:
- bättre metadata
- tydligare listvy
- länkar till detaljvy

### Steg 3. Ny diffvisning
Ny komponent, exempelvis:
- `frontend/components/admin/RevisionDiff.tsx`

Den visar:
- fältnamn
- gammalt värde
- nytt värde

### Steg 4. Förbättra restoreflöde
Påverkar:
- restore-api
- revisionsmanager

Målet är att:
- visa tydlig bekräftelse
- skapa ny revision efter restore

### Steg 5. Lägg till filtrering
I revisionslistan:
- sektion
- användare
- datum

## Risker

### 1. Diffen blir för teknisk
Motåtgärd:
- visa diff på fältnivå, inte rå JSON i första hand

### 2. Restore sker på fel nivå
Motåtgärd:
- tydlig sektionstext
- tydlig bekräftelsedialog

### 3. För stora revisionsobjekt blir svåröverskådliga
Motåtgärd:
- prioritera mest relevanta ändringar först
- möjlighet att expandera detaljer senare

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Ändra en sida och se diffen i revisionshistoriken.
2. Ändra ett publiceringsdatum och se det tydligt i diffen.
3. Återställ en tidigare revision och verifiera att nuvarande innehåll ändras.
4. Se att återställningen själv skapar en ny revision.
5. Filtrera revisioner på sektion eller användare.

## Definition of Done
Epiken är klar när:
- revisionshistoriken visar meningsfull diff
- restoreflödet är tydligt och säkert
- restore skapar ny revision
- användaren förstår vad som ändrats utan att läsa rå JSON
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 09: Förfinade roller och publiceringsbehörighet`

Det blir särskilt viktigt när fler personer arbetar parallellt i CMS:et.
