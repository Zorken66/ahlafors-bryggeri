# Epic 02: Kvalitetsvarningar i formulären

## Syfte
Den här epiken inför kvalitetsvarningar i CMS-formulären så att redaktören får tidig feedback innan innehåll sparas eller publiceras.

Målet är inte att blockera allt som inte är perfekt. Målet är att göra vanliga misstag synliga i rätt ögonblick och därmed minska:
- felpublicering
- tomma eller ofullständiga sektioner
- visuellt svaga sidor
- innehåll som fungerar tekniskt men håller låg kvalitet

Det här är nästa naturliga steg efter en enhetlig publiceringsmodell, eftersom status och publicering blir mycket mer användbara när systemet också kan säga vad som saknas.

## Problem i nuläget
CMS:et har många bra formulär, men redaktören måste i hög grad själv upptäcka om något är ofullständigt.

Exempel på risker i dag:
- hero utan bild
- SEO-fält tomma
- CTA-knapp utan länk
- produkt utan extern länk eller bild
- event med passerat datum som fortfarande är publicerat
- tomma rubriker
- för långa texter som riskerar att bli dåliga i layouten

Konsekvensen blir:
- fler manuella kontroller
- större beroende av utvecklare eller testning
- sämre flyt i det redaktionella arbetet

## Mål

### Affärsmål
- höja den genomsnittliga innehållskvaliteten
- minska mängden fel som upptäcks sent
- göra CMS:et mer självinstruerande

### Användarmål
En redaktör ska direkt kunna se:
- vad som saknas
- vad som bör förbättras
- vad som riskerar att ge dålig effekt publikt

### Tekniska mål
- ett återanvändbart valideringslager
- varningar som går att använda i flera formulär
- stöd för både hårda fel och mjuka varningar

## Omfattning

### Ingår i epiken
Kvalitetsvarningar för:
- startsida
- om oss
- kontakt
- produkter
- tjänster
- recept
- nyheter
- Rulleriet
- produktdetaljsida där relevant

Stöd för två nivåer:
- `Fel`
- `Varning`

### Ingår inte i epiken
- fullständig SEO-analys
- automatisk textförbättring
- bildanalys med AI
- automatisk omskrivning
- publiceringsworkflow med godkännande

## Princip
Systemet ska skilja på:

### Fel
Fel betyder att innehållet är så ofullständigt att det normalt inte bör publiceras.

Exempel:
- tom rubrik
- hero-bild saknas där hero kräver bild
- CTA-text finns men länk saknas
- produkt saknar namn

### Varning
Varning betyder att innehållet går att spara och ibland även publicera, men kvaliteten är tveksam.

Exempel:
- SEO-title saknas
- produkt saknar OG-bild
- hero-lead är mycket lång
- eventbild saknas
- beskrivning är ovanligt kort

## Målbild för användarupplevelsen

### I formuläret
Redaktören ska se kvalitetsstatus direkt i den vy där innehållet redigeras.

Det kan vara:
- en summeringsruta högst upp
- inline-varningar vid fält
- tydlig badge eller statusrad nära spara/publicera

### Vid sparande
Systemet ska:
- tillåta spar av utkast även med varningar
- kunna blockera spar/publicering vid riktiga fel om vi väljer det för vissa typer
- alltid visa varför

### Vid publicering
När publicering införs fullt enligt Epic 01 bör publicering kunna:
- stoppas av fel
- tillåtas trots varningar, men med tydlig sammanfattning

## Förslag på kategorier av regler

### 1. Struktur
Kontrollerar att grundläggande fält finns.

Exempel:
- titel saknas
- hero-rubrik saknas
- hero-bild saknas
- beskrivning saknas

### 2. Länkar
Kontrollerar att CTA och externa länkar fungerar logiskt.

Exempel:
- knapptext finns men länk saknas
- extern länk saknas på produkt
- biljettlänk saknas på event som tydligt kräver anmälan

### 3. Media
Kontrollerar att viktiga visuella delar finns.

Exempel:
- hero-bild saknas
- produktbild saknas
- eventbild saknas
- alt-text saknas på media där vi har den informationen

### 4. SEO
Kontrollerar minimikvalitet i metadata.

Exempel:
- SEO-title saknas
- SEO-description saknas
- OG-bild saknas

### 5. Tid och publicering
Kontrollerar innehåll med datum och status.

Exempel:
- eventdatum har passerat men innehållet är fortfarande publikt
- avpubliceringsdatum ligger före publiceringsdatum
- publiceringsdatum är ogiltigt

### 6. Redaktionell kvalitet
Mjuka regler som hjälper innehållet att bli bättre.

Exempel:
- hero-lead över rekommenderad längd
- CTA-text för vag
- produktbeskrivning ovanligt kort
- listor tomma där de normalt bör ha minst ett objekt

## Prioriterade regler i första iterationen

### Sidor
- hero-rubrik saknas
- hero-bild saknas
- SEO-title saknas
- SEO-description saknas
- CTA-text finns men länk saknas

### Produkter
- namn saknas
- slug saknas eller blir tom
- produktbild saknas
- kort beskrivning saknas
- Systembolaget-länk eller annan extern länk saknas
- artikelnummer saknas: varning, inte fel
- SEO-title saknas
- SEO-description saknas

### Tjänster
- titel saknas
- kort beskrivning saknas
- länk saknas
- publiceringsdatum ogiltigt

### Recept
- titel saknas
- ingredienslista tom
- instruktioner tomma
- bild saknas
- pairing saknas: varning

### Nyheter
- titel saknas
- datum saknas
- bild saknas
- länk saknas

### Rulleriet-event
- titel saknas
- datum saknas
- tid saknas
- beskrivning saknas
- publicerat event ligger i dåtid
- bild saknas: varning

### Rulleriet-inlägg
- titel saknas
- slug saknas
- ingress saknas
- innehåll saknas
- publiceringsdatum saknas
- bild saknas

## Omfattning per regeltyp

### Fas 1 i denna epic
Inför:
- summeringsruta med fel/varningar
- central regelmotor
- de viktigaste reglerna enligt listan ovan

### Fas 2 i denna epic
Inför:
- inline-markering vid enskilda fält
- mer redaktionella rekommendationer, exempelvis längdvarningar

## Teknisk målmodell

### Gemensamt valideringslager
Skapa ett centralt bibliotek, till exempel:
- `frontend/lib/content-quality.ts`

Det bör innehålla:
- typ för resultat
- regelutvärdering per innehållstyp
- hjälpfunktioner för återanvändbara kontroller

### Förslag på datatyp
En möjlig modell:

- `severity`: `error` eller `warning`
- `field`: fältnyckel eller sektion
- `message`: mänsklig förklaring
- `code`: stabil kod för logik/test

### Förslag på funktioner
- `validateHomepage(content)`
- `validateProduct(product)`
- `validateService(service)`
- `validateRecipe(recipe)`
- `validateNewsItem(item)`
- `validateRullerietEvent(event)`
- `validateRullerietPost(post)`

Samt gemensamma helpers:
- `requireText(...)`
- `requireImage(...)`
- `warnIfLong(...)`
- `requireLinkIfLabelExists(...)`
- `warnIfPastDateStillPublished(...)`

## Påverkan på admin-UI

### Återanvändbar komponent
Skapa en gemensam komponent för att visa kvalitetsstatus, exempel:
- `frontend/components/admin/QualityChecklist.tsx`

Den ska kunna visa:
- antal fel
- antal varningar
- lista med meddelanden
- eventuell hopplänk till sektion eller fält senare

### Placering
I första iterationen bör den visas:
- högst upp i editorn
- nära spara/publicera

### Språk
Språket ska vara konkret och handlingsbart.

Dåligt:
- `Ogiltigt innehåll`

Bättre:
- `Hero-bild saknas`
- `SEO-beskrivning är tom`
- `Eventdatum har passerat men eventet är fortfarande publicerat`

## Koppling till publiceringsmodellen
När Epic 01 finns på plats kan kvalitetsvarningarna användas vid publicering:
- `Fel` bör kunna blockera publicering
- `Varning` bör inte blockera, men visas tydligt

I denna epic räcker det att:
- visa felen
- markera när ett objekt inte är redo för publicering

## Acceptanskriterier

### Funktionella
- varje prioriterad editoryta kan beräkna kvalitetsstatus
- systemet skiljer på fel och varningar
- saknade kärnfält upptäcks för respektive innehållstyp
- passerade event som fortfarande är publika får varning eller fel enligt regel

### UI
- kvalitetsstatus visas tydligt i admin
- fel och varningar är läsbara och konkreta
- samma visningsmönster används i flera managers

### Tekniska
- regler ligger centralt och inte dupliceras i flera komponenter
- det går att lägga till nya regler utan att skriva om varje manager
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Skapa regelmotor
Ny fil:
- `frontend/lib/content-quality.ts`

Den ska innehålla:
- typer
- generella hjälpfunktioner
- validatorer per innehållstyp

### Steg 2. Skapa återanvändbar UI-komponent
Ny fil:
- `frontend/components/admin/QualityChecklist.tsx`

Den visar:
- antal fel
- antal varningar
- lista med meddelanden

### Steg 3. Integrera i de största managers först
Föreslagen ordning:
1. `ProductsManager`
2. `RullerietSectionManager`
3. `HomepageSectionManager`
4. `ServicesManager`
5. `RecipesManager`
6. `NewsManager`

### Steg 4. Lägg till enklare inline-indikatorer
Exempel:
- röd text under tomma obligatoriska fält
- gul text vid kvalitetsvarningar

## Risker

### 1. För många varningar ger brus
Motåtgärd:
- börja med få men träffsäkra regler
- fokusera på hög signal

### 2. Otydlig skillnad mellan fel och varning
Motåtgärd:
- definiera tydliga kriterier
- använd konsekvent språk

### 3. Regler blir spridda i managers
Motåtgärd:
- central validator och återanvändbar UI-komponent

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Skapa produkt utan bild och se tydlig fel- eller varningsindikator.
2. Skapa event med passerat datum och publicerad status och få relevant varning.
3. Lämna SEO-title tom på en sida och se varning.
4. Fyll i saknade fält och se att checklistan uppdateras korrekt.
5. Säkerställ att samma mönster används i flera adminsektioner.

## Definition of Done
Epiken är klar när:
- centralt valideringslager finns
- minst de prioriterade innehållstyperna har kvalitetsstatus i admin
- fel och varningar visas konsekvent
- de viktigaste kvalitetsbristerna upptäcks automatiskt
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 03: Admin-dashboard och redaktionell överblick`

Det bygger vidare på både publiceringsstatus och kvalitetsvarningar och ger direkt nytta i admin-starten.
