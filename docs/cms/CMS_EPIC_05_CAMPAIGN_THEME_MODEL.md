# Epic 05: Kampanj- och temamodell

## Syfte
Den här epiken inför en återanvändbar modell för kampanjer och teman i CMS:et.

Målet är att verksamheten ska kunna driva satsningar som:
- `30-årsjubileum`
- `Sommar på Rulleriet`
- `Julsortiment`
- `Lansering av ny produkt`

utan att varje ny satsning kräver specialkod, specialfält eller manuell synkning mellan flera sektioner.

## Problem i nuläget
I dag går det att bygga kampanjytor, men det sker i praktiken genom punktlösningar:
- innehåll läggs in direkt på startsidan
- badges eller lyft byggs per produkt eller sektion
- samma budskap kan behöva upprepas på flera ställen
- tidsstyrning och avveckling av kampanjer är manuellt

Det fungerar för enstaka initiativ, men skalar dåligt när man vill jobba löpande med:
- säsonger
- eventserier
- jubileum
- produktlanseringar

Konsekvensen blir:
- mer redaktionellt dubbelarbete
- större risk för inkonsekvent budskap
- svårare att avsluta en kampanj snyggt

## Mål

### Affärsmål
- göra kampanjer snabbare att lansera
- ge verksamheten större frihet att styra kommunikation utan utvecklarhjälp
- säkerställa att samma budskap används konsekvent på sajten

### Användarmål
En redaktör ska kunna:
- skapa ett tema eller en kampanj
- koppla det till produkter, event och ytor
- styra när det ska synas
- slå av det utan att behöva städa flera sektioner manuellt

### Tekniska mål
- en separat modell för kampanj/tema
- tydlig koppling till andra innehållstyper
- återanvändbar rendering på flera ställen
- kompatibilitet med publicering och dashboard

## Omfattning

### Ingår i epiken
En innehållstyp för kampanj/tema som kan styra:
- namn och identitet
- aktiv period
- budskap
- visuella markeringar
- kopplade produkter
- kopplade event
- startsideblock eller promo-ytor

### Ingår inte i epiken
- full page builder
- dynamiska A/B-testkampanjer
- avancerad målgruppsstyrning
- externa annonsintegrationer

## Målbild
Ett tema ska fungera som ett lager ovanpå befintligt innehåll.

Det ska kunna påverka flera delar av sajten utan att duplicera grundinnehållet.

Exempel:
- `30-årsjubileum` lägger till badge på Jubileums IPA, visar jubileumsblock på startsidan och lyfter utvalda event i Rulleriet
- `Julsortiment` lyfter vinterprodukter och säsongsevent under begränsad tid

## Föreslagen modell

### Grundfält
En kampanj eller ett tema bör kunna ha:
- `id`
- `name`
- `slug`
- `status`
- `published`
- `publishedAt`
- `unpublishedAt`
- `title`
- `eyebrow`
- `lead`
- `body`
- `image`
- `badgeText`
- `ctaLabel`
- `ctaUrl`
- `themeColor` eller stilvariant
- `featured`

### Kopplingar
Ett tema bör kunna kopplas till:
- `productIds`
- `eventIds`
- eventuellt `newsIds`
- utvalda sidytor eller blockpositioner

### Ytstyrning
En första modell bör kunna ange var temat får visas:
- `homepageHero`
- `homepagePromo`
- `productCards`
- `productDetail`
- `rulleriet`

Det behöver inte vara helt fritt från början, men tillräckligt konkret för att kunna återanvändas.

## Statusmodell
Teman ska använda samma publiceringslogik som annat innehåll:
- utkast
- schemalagd
- publik
- utgången

Utöver detta kan ett tema ha ett enklare internt statusbegrepp:
- aktivt
- planerat
- avslutat

Detta kan dock beräknas från publiceringsperiod i första versionen.

## Viktiga användningsfall

### 1. Jubileum
Ett aktivt jubileumstema ska kunna:
- visa ett startsideblock
- märka ut jubileumsprodukter
- lyfta utvalda event
- ge ett sammanhållet budskap

### 2. Säsong
Ett jultema eller sommartema ska kunna:
- lyfta rätt produkter
- markera relevanta event
- ha tidsstyrd start och slut

### 3. Produktlansering
En lanseringskampanj ska kunna:
- peka ut en produkt eller grupp av produkter
- visa en kort promo på startsidan
- koppla CTA till produktsidan

## Påverkan på admin-UI

### Ny sektion eller undermodell
Teman bör få en egen adminsektion, exempelvis:
- `Kampanjer`
- eller `Teman`

Den ska ha:
- lista över teman
- status
- aktiv period
- kopplade objekt
- snabb redigering

### Editor
Temaredigering bör innehålla:
- identitet och budskap
- publicering
- bild
- badge
- CTA
- koppling till produkter och event
- vilka ytor temat får påverka

### Listvy
Listvyn bör stödja:
- statusfilter
- sortering på aktiv period
- sök
- markering av aktivt tema

## Påverkan på frontend

### Startsidan
Startsidan ska kunna fråga efter aktivt tema och rendera:
- hero-innehåll eller promo-yta
- kampanjblock
- relaterade CTA:er

### Produkter
Produktkort och detaljsidor ska kunna kontrollera:
- om produkten ingår i aktivt tema
- om en badge eller markering ska visas

### Rulleriet
Rulleriet ska kunna:
- lyfta event kopplade till aktivt tema
- visa temaanknuten introtext eller promo

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
Tema måste använda samma publiceringsregler som annat innehåll.

### Epic 02: Kvalitetsvarningar
Tema bör få varningar om:
- titel saknas
- CTA saknas
- inga kopplade objekt finns trots att temat ska visas

### Epic 03: Dashboard
Dashboarden bör kunna visa:
- aktiva teman
- teman som snart startar
- teman som snart löper ut

### Epic 04: Eventmodell
Teman ska kunna koppla till event på ett rent sätt.

## Acceptanskriterier

### Funktionella
- ett tema kan skapas och publiceras
- ett tema kan kopplas till produkter
- ett tema kan kopplas till event
- ett tema kan styra minst en startsideyta
- ett tema kan ge en badge eller markering på produktkort
- ett tema kan avaktiveras utan manuell städning i flera sektioner

### UI
- admin gör det enkelt att se vilket tema som är aktivt
- temats period och status är tydlig
- kopplingar till produkter och event är begripliga

### Tekniska
- temalogik ligger centralt
- rendering på flera ytor bygger på samma aktiva tema, inte duplicerad speciallogik
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Lägg till ny innehållstyp
Påverkar:
- `frontend/lib/content-schema.ts`
- `frontend/content/site-content.json`

En möjlig toppnivå:
- `campaignThemes: CampaignTheme[]`

### Steg 2. Skapa central logik
Ny fil:
- `frontend/lib/campaign-themes.ts`

Den ska hantera:
- normalisering
- aktivt tema
- filtrering
- kopplingslogik mellan tema och produkter/event

### Steg 3. Skapa adminmanager
Ny fil, exempelvis:
- `frontend/components/admin/CampaignThemesManager.tsx`

Integreras sedan i:
- `frontend/components/admin/CmsAdmin.tsx`
- `frontend/lib/cms-permissions.ts`

### Steg 4. Koppla in första publika ytor
Föreslagen första nivå:
- startsidans promo/jubileumsblock
- produktkort
- Rulleriet-eventlyft

### Steg 5. Minska tidigare punktlösningar
När modellen finns bör speciallogik som jubileumsmarkeringar gradvis flyttas från hårdkodade regler till temamodellen.

## Risker

### 1. För fri modell tidigt
Motåtgärd:
- börja med få tydliga ytor
- undvik att bygga en generell page builder

### 2. Konflikt mellan flera aktiva teman
Motåtgärd:
- definiera enkel prioritet eller tillåt endast ett huvudtema i första versionen

### 3. Tema blir bara en annan textyta
Motåtgärd:
- säkerställ att teman faktiskt kan påverka återanvändbara komponenter och kopplade objekt

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Skapa ett aktivt jubileumstema.
2. Koppla det till Jubileums IPA.
3. Se en tematisk markering på produktkort.
4. Koppla temat till ett Rulleriet-event.
5. Visa en temaanknuten yta på startsidan.
6. Avpublicera temat och se att markeringarna försvinner utan manuell städning.

## Definition of Done
Epiken är klar när:
- kampanjer/teman finns som egen innehållstyp
- de kan kopplas till produkter och event
- minst två publika ytor kan använda aktivt tema
- admin kan hantera teman utan kodändring
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 06: Starkare mediebibliotek`

Det behövs för att temaarbete, produktarbete och eventarbete ska bli effektivt i praktiken.
