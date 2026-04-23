# Epic 03: Admin-dashboard och redaktionell överblick

## Syfte
Den här epiken skapar en riktig startsida för admin där redaktören direkt ser vad som behöver göras.

Målet är att `/admin` inte bara ska vara en ingång till olika sektioner, utan ett operativt nav för innehållsarbetet.

Dashboarden ska svara på:
- vad är opublicerat
- vad är snart inaktuellt
- vad saknar kvalitet
- vad ändrades senast
- vad behöver uppmärksamhet nu

## Problem i nuläget
CMS:et har många sektioner, men ingen sammanhållen överblick.

Det innebär att redaktören i dag behöver:
- klicka sig runt för att hitta utkast
- själv komma ihåg passerade event
- själv upptäcka saknade bilder eller metadata
- sakna snabb bild av vad som nyligen ändrats

Det blir särskilt tungt när:
- innehållsmängden växer
- flera personer redigerar
- kampanjer, jubileum och event går parallellt

## Mål

### Affärsmål
- göra innehållsarbetet snabbare
- minska risken att gammalt eller ofullständigt innehåll ligger kvar
- ge bättre operativ kontroll över sajten

### Användarmål
När en redaktör loggar in ska hen på under en minut förstå:
- vad som är viktigast just nu
- vad som går att publicera
- vad som behöver förbättras
- vilka sektioner som senast har ändrats

### Tekniska mål
- en dashboard som bygger på befintliga datakällor
- sammanställningar från publiceringslogik och kvalitetsvarningar
- snabb rendering utan att behöva bygga om hela CMS:et

## Omfattning

### Ingår i epiken
En admin-dashboard med:
- snabbgenvägar
- innehållsstatus
- kvalitetsöversikt
- tidskänsligt innehåll
- senaste ändringar

### Ingår inte i epiken
- avancerad analys
- grafer över trafik eller konvertering
- notifikationer via e-post eller SMS
- personliga dashboards per användare

## Målbild
Dashboarden ska bestå av ett fåtal tydliga paneler med hög signal.

Den ska kännas:
- snabb
- tydlig
- redaktionell
- handlingsinriktad

Varje panel ska helst kunna leda till en konkret åtgärd direkt.

## Föreslagna paneler

### 1. Snabbgenvägar
En enkel övre rad med genvägar till de viktigaste sektionerna:
- Förstasida
- Produkter
- Rulleriet
- Media
- Revisionshistorik

Målet är att minska klick och göra det lätt att gå till rätt ställe.

### 2. Publiceringsöversikt
Visar antal objekt i status:
- utkast
- schemalagda
- publika
- utgångna

Uppdelat på prioriterade innehållstyper:
- produkter
- tjänster
- recept
- nyheter
- event
- Rulleriet-inlägg

### 3. Kräver åtgärd
En lista över sådant som bör hanteras nu.

Exempel:
- publicerade event med passerat datum
- innehåll med fel enligt kvalitetsregler
- produkter utan bild
- sidor utan SEO-title

Det här är dashboardens viktigaste panel.

### 4. Snart aktuellt
Visar tidskänsligt innehåll som snart blir relevant eller passerar.

Exempel:
- event kommande 14 dagar
- schemalagd publicering kommande 7 dagar
- innehåll med avpublicering inom 7 dagar

### 5. Senaste ändringar
Visar:
- sektion eller objekt
- vem som ändrat
- när
- eventuell ändringskommentar

Den här panelen ska bygga på revisionshistoriken som redan finns.

### 6. Innehållskvalitet
En översikt av varningsläget:
- antal fel
- antal varningar
- vilka sektioner som har flest problem

Det här bygger direkt på Epic 02.

## Prioriterad första version
Första versionen av dashboarden ska vara enkel men användbar.

Fas 1 bör innehålla:
- snabbgenvägar
- kräver åtgärd
- snart aktuellt
- senaste ändringar

Fas 2 kan lägga till:
- aggregerad publiceringsöversikt
- kvalitetsöversikt

## Datakällor

### Befintliga källor
Vi har redan mycket av det som behövs:
- CMS-innehållet
- revisionshistorik
- publiceringsfält
- kvalitetsvarningar när Epic 02 är klar

### Nya sammanställningar
Vi bör skapa en central dashboard-sammanställning, exempel:
- `frontend/lib/cms-dashboard.ts`

Den ska returnera:
- counts per status
- listor över akuta objekt
- kommande objekt
- senaste ändringar

## Påverkan på admin-UI

### Ny eller förbättrad startsida
Dashboarden bör visas som standard när admin öppnas.

Den ska inte ersätta sidomenyn, utan komplettera den.

### Panelmönster
Varje panel ska:
- ha tydlig rubrik
- visa få men viktiga datapunkter
- gärna ha en direktlänk till rätt sektion

### Exempel på CTA i paneler
- `Gå till produkter`
- `Hantera event`
- `Öppna media`
- `Se revisioner`

## Förslag på innehåll i panelerna

### Kräver åtgärd
Exempelrader:
- `2 event har passerat men är fortfarande publicerade`
- `5 produkter saknar bild`
- `1 sida saknar SEO-title`

### Snart aktuellt
Exempelrader:
- `After Work med Rollin Bistros om 2 dagar`
- `Jubileumstema avpubliceras om 6 dagar`
- `1 produkt publiceras nästa vecka`

### Senaste ändringar
Exempelrader:
- `Förstasida uppdaterad av mattias`
- `Produkt "Jubileums IPA" ändrad av editor`
- `Rulleriet-event uppdaterat för 2026-05-08`

## Tekniska målmodeller

### Central sammanställning
Skapa ett internt lager som sammanställer dashboard-data.

Förslag:
- `getAdminDashboardData()`

Det bör läsa från:
- innehåll
- revisioner
- kvalitetsregler
- publiceringsstatus

### Förslag på struktur
Dashboard-datat kan delas i:
- `quickLinks`
- `needsAttention`
- `upcoming`
- `recentChanges`
- `publishingSummary`
- `qualitySummary`

## Acceptanskriterier

### Funktionella
- dashboarden visas som standard i admin
- det finns panel för senaste ändringar
- det finns panel för innehåll som kräver åtgärd
- det finns panel för snart aktuellt innehåll
- varje panel leder vidare till relevant sektion

### UI
- dashboarden är lätt att skanna
- panelerna har tydliga rubriker
- ingen panel visar för mycket brus

### Tekniska
- dashboardlogik ligger centralt
- inga tunga beräkningar dupliceras i flera komponenter
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Ny sammanställningslogik
Skapa:
- `frontend/lib/cms-dashboard.ts`

Den ansvarar för:
- statusöversikt
- needs attention
- upcoming
- senaste ändringar

### Steg 2. Ny dashboard-komponent
Skapa:
- `frontend/components/admin/AdminDashboard.tsx`

Den renderar panelerna.

### Steg 3. Koppla in i befintlig admin
Påverkar sannolikt:
- `frontend/components/admin/CmsAdmin.tsx`

Dashboarden bör vara första vy i admin, före eller som del av sidnavigeringen.

### Steg 4. Integrera publicerings- och kvalitetslogik
Bygg direkt på:
- Epic 01 publiceringsmodell
- Epic 02 kvalitetsvarningar

## Risker

### 1. För mycket information på en gång
Motåtgärd:
- börja med få paneler
- visa bara det mest relevanta

### 2. Dashboarden blir bara dekorativ
Motåtgärd:
- varje panel ska leda till handling
- fokus på konkreta problem, inte bara statistik

### 3. Dyr datahämtning
Motåtgärd:
- håll sammanställningen enkel
- bygg på befintliga datakällor

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Logga in och direkt se senaste ändringar.
2. Se passerade men publicerade event i `Kräver åtgärd`.
3. Se kommande event i `Snart aktuellt`.
4. Klicka från panel till rätt adminsektion.
5. Bekräfta att dashboarden uppdateras när innehåll ändras.

## Definition of Done
Epiken är klar när:
- admin har en riktig dashboard-start
- redaktören kan se senaste ändringar och åtgärdspunkter direkt
- dashboarden bygger på central logik
- den fungerar tillsammans med publiceringsstatus och kvalitetsvarningar
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 04: Riktig eventmodell`

Det är ett område med mycket affärsnytta och tydligt behov i den här sajten.
