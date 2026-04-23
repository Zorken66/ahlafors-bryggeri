# Epic 09: Förfinade roller och publiceringsbehörighet

## Syfte
Den här epiken utvecklar behörighetsmodellen från enkel sektionsåtkomst till en mer verksamhetsnära modell för ansvar, publicering och risknivå.

Målet är att olika användartyper ska kunna arbeta effektivt i CMS:et utan att alla behöver ha full kontroll över allt.

Det här är viktigt när:
- fler personer börjar redigera samtidigt
- publiceringsmodellen blir starkare
- revisionshistorik och restore blir mer centrala
- kampanjer, event och produkter hanteras av olika roller

## Problem i nuläget
Nuvarande behörighetsmodell är en bra grund, men den är fortfarande relativt grov:
- åtkomst styrs huvudsakligen per sektion
- skillnaden mellan att redigera och att publicera är inte tillräckligt tydlig
- restore och känsligare operationer bör kunna styras mer finmaskigt

Konsekvensen blir:
- onödigt breda rättigheter för vissa användare
- svårare att spegla verkliga arbetsroller
- högre risk om fler ska arbeta i CMS:et

## Mål

### Affärsmål
- möjliggöra trygg delegering av innehållsansvar
- minska risken för oavsiktliga publiceringar eller ändringar
- skapa tydligare ansvarsfördelning i verksamheten

### Användarmål
En användare ska:
- se det som är relevant för sin roll
- kunna arbeta snabbt inom sitt område
- inte mötas av onödig komplexitet eller onödiga riskfunktioner

### Tekniska mål
- tydligare skillnad mellan `kan se`, `kan redigera`, `kan publicera`, `kan återställa`
- fortsatt enkel modell som fungerar väl på egen VPS och i nuvarande kodbas

## Omfattning

### Ingår i epiken
Förbättrad behörighetsmodell för:
- läsning av adminsektioner
- redigering av innehåll
- publicering
- restore/revisioner
- mediahantering
- adminhantering

### Ingår inte i epiken
- enterprise-RBAC med helt fri rollbyggare
- team- eller organisationshierarkier
- externa identity providers

## Målbild
CMS:et ska ha roller som motsvarar verkligt arbete, inte bara teknisk åtkomst.

En användare ska kunna vara:
- superadmin
- redaktör
- produktredaktör
- eventredaktör
- kampanjredaktör
- kontakt/kundtjänst

Varje roll ska ha rimliga rättigheter, och dessa rättigheter ska vara begripliga både i kod och i admin.

## Behörighetsnivåer

### 1. Läsa
Användaren kan se en sektion eller lista.

### 2. Redigera
Användaren kan ändra utkast eller innehåll inom sitt område.

### 3. Publicera
Användaren kan ändra publiceringsstatus och göra innehåll live.

### 4. Hantera revisioner
Användaren kan återställa tidigare versioner.

### 5. Hantera systemfunktioner
Användaren kan hantera adminanvändare, driftfunktioner eller andra högriskytor.

Det här är viktigare än att bara säga “rollen får sektionen”.

## Föreslagna roller

### Superadmin
Full åtkomst till:
- alla sektioner
- publicering
- restore
- adminanvändare
- media
- driftfunktioner

### Redaktör
Bred redaktionell roll som kan:
- redigera de flesta sektioner
- publicera de flesta sektioner
- se revisioner

Men inte:
- hantera adminanvändare
- göra känsliga driftsoperationer

### Produktredaktör
Kan arbeta med:
- produkter
- produktsida
- produktdetalj
- media som behövs för produktarbete

Kan eventuellt:
- redigera
- men inte nödvändigtvis publicera utan rättighet

### Eventredaktör
Kan arbeta med:
- Rulleriet-event
- Rulleriet-inlägg
- relevanta media

### Kampanjredaktör
Kan arbeta med:
- kampanjer/teman
- startsidans promos
- relevanta media

### Kontakt/kundtjänst
Kan arbeta med:
- kontaktmeddelanden
- kontaktsida
- eventuellt enklare informationsytor

## Behörighetsprinciper

### Minsta nödvändiga rättighet
En roll ska inte få mer makt än den behöver för sitt vardagsjobb.

### Publicering är känsligare än redigering
Det ska vara möjligt att låta någon skapa eller ändra innehåll utan att samtidigt ge full publiceringsrätt.

### Restore är känsligare än läsning
Att få se revisionshistorik är inte samma sak som att få återställa.

## Påverkan på admin-UI

### Meny och sektioner
Användaren ska bara se det som är relevant för rollen.

Det innebär:
- färre menyval för begränsade roller
- mindre brus
- tydligare fokus

### Knappar och åtgärder
UI ska anpassas efter rättighet.

Exempel:
- användare utan publiceringsrätt ser inte “Publicera”-åtgärd
- användare utan restore-rätt ser historik men inte återställningsknapp
- användare utan adminrätt ser inte adminhantering

### Status för rättigheter
Det kan vara värdefullt att i vissa flöden visa varför en åtgärd inte finns eller är låst.

## Påverkan på API och serverlogik

### Route guards
Nuvarande guards bör utvecklas så att de kan kontrollera mer än bara sektionstillgång.

Vi behöver sannolikt nivåer som:
- section access
- publish access
- restore access
- admin access

### Servern ska avgöra, inte bara UI
Det räcker inte att dölja knappar.

API och serverside-logik måste också säkerställa att:
- användare utan rättighet inte kan publicera via API
- användare utan restore-rättighet inte kan återställa

## Koppling till andra epics

### Epic 01: Enhetlig publiceringsmodell
Publiceringsrättigheter bygger direkt på denna modell.

### Epic 03: Dashboard
Dashboarden kan på sikt anpassas efter roll.

### Epic 07: Preview
Vissa roller ska kunna previewa utkast utan att kunna publicera dem.

### Epic 08: Revisionsdiff och restore
Restore-rättigheter måste styras separat.

## Acceptanskriterier

### Funktionella
- roller kan särskiljas bättre än i dag
- det går att styra publicering separat från redigering
- restore kan styras separat från revisionstillgång
- adminanvändare kan fortsatt hanteras endast av rätt roller

### UI
- användare ser relevanta sektioner och åtgärder för sin roll
- onödiga eller otillåtna åtgärder visas inte

### Tekniska
- behörighetslogik ligger centralt
- både UI och API respekterar samma regler
- build går igenom

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Utöka rollmodellen
Påverkar:
- `frontend/lib/content-schema.ts`
- `frontend/lib/cms-admin-config.ts`
- `frontend/lib/cms-permissions.ts`

Lägg till nya roller och tydligare rättighetsfunktioner.

### Steg 2. Skapa rättighetsnivåer
I stället för att bara fråga `canAccessSection(...)` bör vi även ha funktioner som:
- `canPublishSection(...)`
- `canRestoreSection(...)`
- `canManageMedia(...)`
- `canManageAdmins(...)`

### Steg 3. Uppdatera route guards
Påverkar:
- `frontend/lib/cms-route-guards.ts`

Servern ska kontrollera:
- sektionstillgång
- publicering
- restore
- adminhantering

### Steg 4. Uppdatera admin-UI
Påverkar:
- `frontend/components/admin/CmsAdmin.tsx`
- managers med publicerings- eller restoreknappar

### Steg 5. Uppdatera admin user management
Påverkar:
- `frontend/components/admin/AdminUsersManager.tsx`
- `frontend/lib/cms-admin-users.ts`

Adminvyn ska kunna hantera de nya rollerna tydligt.

## Risker

### 1. För komplex rollmatris
Motåtgärd:
- håll första versionen enkel
- utgå från verkliga roller, inte teoretiska specialfall

### 2. UI och API kommer ur synk
Motåtgärd:
- centralisera behörighetsregler
- låt servern vara källa till sanning

### 3. För lite flexibilitet
Motåtgärd:
- bygg modellen så att fler roller kan läggas till senare utan total omskrivning

## Verifiering
När epiken är byggd ska vi kunna testa:

1. En eventredaktör kan redigera event men inte adminanvändare.
2. En produktredaktör kan arbeta med produkter men inte Rulleriet.
3. En användare utan publiceringsrätt kan spara utkast men inte publicera.
4. En användare utan restore-rätt kan läsa revisioner men inte återställa.
5. API blockerar otillåtna operationer även om UI manipuleras.

## Definition of Done
Epiken är klar när:
- roller bättre speglar verkliga arbetsansvar
- publicering och restore kan styras separat
- admin-UI och API följer samma rättighetsmodell
- build går igenom

## Rekommenderat nästa epic efter denna
När denna epic är klar är nästa naturliga steg:
- `Epic 10: Miljöflytt av innehåll och säkrare innehållsdeploy`

Det blir viktigt när CMS:et används mer aktivt över lokal, test och produktion.
