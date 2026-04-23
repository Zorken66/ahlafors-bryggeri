# Epic 04: Riktig eventmodell

## Syfte
Den här epiken gör event till en fullvärdig innehållstyp i CMS:et, i stället för att bara vara en enkel lista med datum och text.

För Ahlafors Bryggerier är detta särskilt viktigt eftersom:
- Rulleriet är en central del av varumärket
- event driver besök, försäljning och aktualitet
- startsidan, Rulleriet-sidan och framtida kampanjer behöver kunna återanvända samma eventdata

Målet är att event ska gå att hantera lika redaktionellt tryggt och strukturerat som produkter eller sidor.

## Problem i nuläget
Nuvarande eventhantering fungerar, men är begränsad:
- event ligger som inbäddad lista i Rulleriet-sektionen
- modellen är relativt enkel
- återanvändning mellan olika ytor är begränsad
- det finns ingen tydlig livscykel för kommande, pågående, passerade och arkiverade event
- event är inte designade som en självständig innehållstyp med egen tyngd

Konsekvensen blir:
- mer manuellt arbete
- sämre överblick
- större risk för att gamla event ligger kvar
- svårare att bygga framtida funktioner som eventlyft på startsidan, filtrering, kampanjkoppling och arkiv

## Mål

### Affärsmål
- göra det enklare att driva Rulleriet som levande besöksmål
- stärka event som återkommande marknadsföringsyta
- minska tiden det tar att uppdatera och återanvända eventinnehåll

### Användarmål
En redaktör ska kunna:
- skapa ett nytt event snabbt
- förstå dess status direkt
- lägga till all relevant information utan speciallösningar
- låta eventet visas på flera ställen utan dubbelarbete

### Tekniska mål
- en tydlig eventtyp
- återanvändbar logik för status och sortering
- stöd för både listning, highlight och arkiv
- kompatibilitet med publiceringsmodell och kvalitetsvarningar

## Omfattning

### Ingår i epiken
En förbättrad eventmodell för:
- Rulleriet-event i CMS
- publik rendering på Rulleriet-sidan
- återanvändning av utvalda event på andra ytor på sikt

Modellen ska stödja:
- datum
- tid
- status
- plats
- bild
- ingress och beskrivning
- arrangör/foodtruck
- biljettlänk
- publicering
- featured

### Ingår inte i epiken
- fullt bokningssystem
- betalningsintegration
- kapacitetsstyrning med live-antal
- kalenderintegration mot externa system
- återkommande eventgenerator

De kan bli senare epics.

## Målbild
Event ska behandlas som en riktig innehållstyp med egen livscykel och tydlig struktur.

Den ska kunna stödja flera behov samtidigt:
- enkel publicering av AW och foodtruck-kvällar
- lyft av större event och jubileumskvällar
- återanvändning i startsida eller kampanjblock
- tydlig sortering mellan kommande och passerade

## Föreslagen datamodell

### Grundfält
Varje event bör kunna ha:
- `id`
- `title`
- `slug`
- `shortDescription`
- `description`
- `date`
- `startTime`
- `endTime`
- `location`
- `image`
- `organizer` eller `foodTruck`
- `ticketUrl`
- `featured`
- `published`
- `publishedAt`
- `unpublishedAt`

### Utökade fält som bör vara möjliga
- `statusLabel` för särskilda fall, exempelvis `Slutsålt`
- `priceText`
- `ctaLabel`
- `ctaUrl`
- `tags`
- `themeId` eller kampanjkoppling på sikt

## Statusmodell
Event bör ha två typer av status:

### Publiceringsstatus
Bygger på Epic 01:
- utkast
- schemalagd
- publik
- utgången

### Eventstatus
Beräknas från datum och tid:
- kommande
- pågår
- passerat
- arkiverat

Det är viktigt att inte blanda ihop dessa två.

Exempel:
- ett event kan vara `publikt` men samtidigt `kommande`
- ett event kan vara `publikt` men `passerat`
- ett event kan vara `utkast` och ändå ha ett framtida datum

## Livscykel

### Rekommenderat flöde
1. Skapa som utkast
2. Förhandsgranska
3. Publicera
4. Eventet blir kommande
5. Eventet passerar
6. Eventet markeras som passerat
7. Eventet kan ligga kvar i arkiv eller döljas från huvudlistan

### Viktigt
Passerade event ska inte bara "försvinna". De bör kunna:
- arkiveras
- visas i separat historik om man vill
- användas som underlag för framtida återbruk

## Påverkan på admin-UI

### Event ska få egen tyngd
I admin bör event tydligt separeras från allmän sidtext i Rulleriet.

Rulleriet-sektionen bör därför på sikt delas i:
- `Sida`
- `Event`
- `Inlägg`
- `SEO`

### Eventlistan i admin bör stödja
- sök
- filtrering på status
- sortering
- statusbadges
- markering av featured
- snabb duplicering av liknande event

### Eventeditorn bör stödja
- titel
- datum och tid
- kort ingress
- full beskrivning
- plats
- foodtruck/arrangör
- bild
- biljett/CTA
- publiceringssektion

## Publik rendering

### På Rulleriet-sidan
Rulleriet ska tydligt kunna visa:
- kommande event
- utvalda event
- event med bild
- eventuell separat sektion för tidigare event

### På startsidan
På sikt ska det vara enkelt att återanvända samma event som:
- kommande höjdpunkt
- kampanjyta
- del av nyhets- eller eventblock

### Framtida eventdetaljsidor
Om vi senare vill ge event egna detaljsidor ska modellen redan stödja det.

Därför är `slug` och rikare fält viktiga redan nu.

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
Event måste följa samma publiceringsregler som övrigt innehåll.

### Epic 02: Kvalitetsvarningar
Event ska kunna få varningar som:
- datum saknas
- tid saknas
- bild saknas
- event är passerat men fortfarande publikt

### Epic 03: Admin-dashboard
Dashboarden ska kunna hämta:
- kommande event
- event som kräver åtgärd
- passerade men fortfarande publika event

### Senare kampanjmodell
Event ska senare kunna kopplas till teman som:
- jubileum
- sommar
- jul

## Acceptanskriterier

### Funktionella
- event har en tydligare datamodell än i dag
- event kan bära titel, ingress, beskrivning, datum, tider, plats, bild och CTA
- event kan filtreras och sorteras utifrån status
- event kan markeras som utvalda
- gamla event kan särskiljas från kommande

### UI
- admin gör det enkelt att se skillnad mellan kommande och passerade event
- event har tydliga statusbadges
- eventformuläret känns komplett och redaktionellt tydligt

### Tekniska
- eventlogik ligger centralt
- modellen är kompatibel med publiceringsstatus
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Utöka eventtypen
Påverkar:
- `frontend/lib/content-schema.ts`

Lägg till eller förtydliga:
- `slug`
- `shortDescription`
- `description`
- `startTime`
- `endTime`
- `location`
- `ticketUrl`
- `featured`
- publiceringsfält

Vi bör undvika att behålla för mycket speciallogik runt ett enda `time`-fält om modellen ska bli långsiktigt stark.

### Steg 2. Central eventlogik
Skapa exempelvis:
- `frontend/lib/events.ts`

Den ansvarar för:
- normalisering
- statusberäkning
- sortering
- filtrering mellan kommande/passerade
- eventhighlight-logik

### Steg 3. Förbättra adminvyn för Rulleriet
Påverkar:
- `frontend/components/admin/RullerietSectionManager.tsx`

Föreslagen riktning:
- tydligare uppdelning i tabbar
- starkare eventeditor
- bättre listvy för event

### Steg 4. Förbättra publik eventvisning
Påverkar:
- `frontend/app/rulleriet/page.tsx`

Föreslagen riktning:
- tydligare sektion för kommande event
- möjlighet att senare lägga till arkiv
- bättre användning av eventbild och CTA

### Steg 5. Förbered återanvändning
Även om vi inte bygger allt nu bör modellen göra det lätt att senare använda event i:
- startsidan
- kampanjblock
- dashboard

## Risker

### 1. För stor ombyggnad av Rulleriet på en gång
Motåtgärd:
- separera modellförbättring från större redesign

### 2. Otydlig gräns mellan event och nyheter
Motåtgärd:
- event är tidsbundna upplevelser
- nyheter är redaktionellt innehåll

### 3. För mycket struktur för små event
Motåtgärd:
- håll formuläret rikt men snabbt
- bara ett fåtal fält ska vara obligatoriska

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Skapa ett nytt kommande event med bild och CTA.
2. Markera ett event som featured och se det lyftas korrekt.
3. Låta ett event passera datumgränsen och se att status ändras.
4. Filtrera adminlistan mellan kommande och passerade event.
5. Bekräfta att publik sida bara visar rätt event i rätt sektion.

## Definition of Done
Epiken är klar när:
- event har en tydlig och rik modell
- admin gör event lättare att hantera än i dag
- publika sidor kan använda modellen konsekvent
- event kan särskiljas som kommande, pågående och passerade
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 05: Kampanj- och temamodell`

Det bygger vidare på jubileum, eventlyft och återanvändning av innehåll över flera ytor.
