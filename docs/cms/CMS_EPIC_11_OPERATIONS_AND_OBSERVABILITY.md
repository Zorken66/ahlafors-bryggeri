# Epic 11: Driftmognad, backupövervakning och observability

## Syfte
Den här epiken gör CMS-plattformen robust i skarp drift.

Målet är att det inte bara ska gå att köra systemet, utan att det också ska gå att:
- förstå när något är fel
- upptäcka problem tidigt
- verifiera att backup fungerar
- återställa med trygghet
- felsöka utan gissningar

Det här är det sista naturliga mognadslagret ovanpå innehåll, publicering, media, revisioner och miljöflytt.

## Problem i nuläget
Systemet fungerar redan tekniskt, men utan tydlig observability och operativ rutin uppstår några klassiska risker:
- fel upptäcks sent
- backup finns kanske, men ingen vet säkert om den fungerar
- det är svårt att se om media, databas eller app är i osynk
- felsökning blir personberoende

Konsekvensen blir:
- högre operativ risk
- långsammare incidenthantering
- större osäkerhet inför produktion och förändringar

## Mål

### Affärsmål
- minska driftstopp och fel i produktion
- öka tryggheten inför release och innehållsimport
- göra systemet mindre personberoende

### Användarmål
Teknisk administratör eller utvecklare ska snabbt kunna svara på:
- är appen uppe
- är databasen frisk
- fungerar media och uploads
- har backup körts
- gick senaste deployen bra

### Tekniska mål
- tydliga health checks
- bättre loggning
- dokumenterade operativa kontroller
- verifierad backup- och restorekedja

## Omfattning

### Ingår i epiken
- health checks
- operativa loggar
- backupövervakning
- restore-verifiering
- enkel observability och runbooks

### Ingår inte i epiken
- full enterprise-monitoringstack
- avancerad SIEM
- extern incidentplattform

## Målbild
Systemet ska vara driftbart med låg friktion på nuvarande VPS-upplägg.

Vi ska kunna lita på att:
- appen svarar
- databasen svarar
- uploads finns
- backup körs och går att återställa
- driftstatus går att förstå utan att öppna flera verktyg och gissa

## Kärnkapabiliteter

### 1. Health checks
Vi bör ha tydliga health endpoints för:
- app
- databas
- eventuellt media/uploads-tillgänglighet

Målet är att skilja på:
- appen svarar
- appen svarar och databasen fungerar
- appen svarar men viktiga beroenden är degraderade

### 2. Strukturerad loggning
Viktiga händelser bör loggas konsekvent:
- login
- failed login
- innehållssparning
- publicering
- restore
- media upload/delete
- import/export av innehåll
- deploy och smoke tests

### 3. Backupövervakning
Det ska inte räcka att “ha backupscript”.

Vi ska kunna svara på:
- när senaste backup kördes
- om den lyckades
- var den finns
- om den testats att återställa

### 4. Restore-verifiering
Restore måste vara dokumenterad och testad.

Det räcker inte att tro att backup fungerar.

### 5. Operativa runbooks
Vid vanliga händelser ska det finnas tydliga steg för:
- app nere
- databasproblem
- media saknas
- felaktig release
- rollback
- innehållsimport som gått fel

## Health checks

### Rekommenderade nivåer

#### App health
Svarar om appprocessen lever och kan leverera svar.

#### DB health
Svarar om appen kan nå Postgres och köra enkel kontroll.

#### CMS health
Kan på sikt utökas för att kontrollera:
- att `cms_content` finns
- att media-lager är tillgängligt
- att kritiska env-vars finns

## Loggning

### Vad som bör loggas särskilt tydligt
- sparning av CMS-innehåll
- revisionsskapande
- restore
- admin login/logout
- misslyckade loginförsök
- media uppladdning/ersättning/radering
- import/export mellan miljöer

### Loggar ska vara användbara
De bör innehålla:
- tidpunkt
- användare där relevant
- sektion eller objekt
- åtgärd
- utfall

## Backupmodell

### Databasbackup
Ska omfatta:
- CMS-innehåll
- adminanvändare
- revisioner
- media metadata

### Uploads-backup
Ska omfatta:
- `shared/uploads`

### Frekvens
Faktisk frekvens bestäms i drift, men modellen bör stödja:
- daglig backup
- extra backup före större import eller release

### Retention
Det bör finnas tydlig policy för:
- hur länge backup sparas
- vilka snapshotar som bevaras längre

## Restoremodell

### Målet
Restore ska kunna göras kontrollerat för:
- hel databas
- media
- kombinerad återställning

### Krav
Det ska finnas en testad restorechecklista som beskriver:
1. hur backup hämtas
2. hur restore körs
3. hur verifiering sker

## Deploy-observability

### Deployflödet bör logga
- start av deploy
- bygg lyckades/misslyckades
- PM2 reload
- smoke test
- slutstatus

### Innehållsdeploy bör logga
- exportkälla
- importmål
- counts
- backup före import
- verifieringsresultat

## Påverkan på repo och drift

### Repo
Vi bör ha:
- tydliga runbooks
- backupskript eller dokumenterade kommandon
- verifieringskommandon
- driftstatusdokumentation

### VPS
Vi bör ha:
- körbara backupkommandon
- loggvägar
- dokumenterade PM2/nginx/databaskontroller
- en enkel rutin för restore-test

## Dashboard eller adminpåverkan
Det här är främst en drift- och plattformsepic, men på sikt kan en del visas i admin:
- senaste backupstatus
- senaste deploystatus
- om media-/db-health är degraderad

Det behöver inte vara första iterationen.

## Koppling till andra epics

### Epic 08: Revisioner och restore
Revisionsrestore löser innehållsnivån. Den här epiken löser plattformsnivån.

### Epic 10: Innehållsdeploy
Miljöflytt kräver verifiering, backup före import och tydliga operativa kontroller.

### Mediaepiken
Media måste ingå i backup- och restorekedjan.

## Acceptanskriterier

### Funktionella
- app health och db health finns och fungerar
- viktiga CMS-händelser loggas användbart
- backupflödet är dokumenterat
- restoreflödet är dokumenterat och testbart
- deployflödet har tydliga verifieringssteg

### Operativa
- det går att avgöra om senaste backup lyckats
- det går att utföra restore med dokumenterad checklista
- det går att felsöka vanliga problem utan att vara beroende av minneskunskap

### Tekniska
- health checks är stabila
- loggning följer ett konsekvent mönster
- runbooks finns i repot

## Föreslagen implementation i nuvarande kodbas

### Steg 1. Säkerställ och dokumentera health checks
Påverkar:
- befintliga health routes
- eventuell utökning med CMS/media-kontroller

### Steg 2. Förbättra loggstruktur
Påverkar:
- befintliga logger-funktioner
- API-routes för känsliga operationer

### Steg 3. Backuprunbook och backupscript
Lägg till:
- dokumenterad databasbackup
- dokumenterad uploads-backup
- standardkommandon

### Steg 4. Restore-test
Skapa en dokumenterad restoreövning för testmiljö:
- backup tas
- restore körs
- verifiering görs

### Steg 5. Driftchecklista
Samla i ett dokument:
- daglig kontroll
- releasekontroll
- incidentsteg

## Risker

### 1. För mycket dokumentation utan faktisk rutin
Motåtgärd:
- varje runbook ska kunna köras i praktiken
- minst ett restore-test ska göras

### 2. För omfattande observabilitymål
Motåtgärd:
- håll fokus på det som ger mest nytta på en VPS:
  - health
  - logs
  - backup
  - restore

### 3. Backup finns men verifieras aldrig
Motåtgärd:
- restore-test som definierad del av driftsättningen

## Verifiering
När epiken är byggd ska vi kunna testa:

1. Köra app health och db health med förväntat svar.
2. Verifiera att en CMS-ändring loggas.
3. Köra dokumenterad databasbackup.
4. Köra dokumenterad uploads-backup.
5. Återställa till testmiljö och verifiera att app och innehåll svarar.

## Definition of Done
Epiken är klar när:
- health checks är tydliga och användbara
- kritiska CMS-händelser loggas konsekvent
- backup och restore är dokumenterade och testade
- driftchecklistor finns i repot
- plattformen är märkbart mindre personberoende

## Rekommenderat nästa steg efter epics
När denna epic är klar finns ett tillräckligt komplett underlag för att:
- prioritera första faktiska implementationsepics
- bryta ner dem till sprintbara tasks
- starta med `Epic 01` och `Epic 02` direkt i kod

Det naturliga nästa dokumentet är därför inte ännu en epic, utan en implementeringsplan med konkreta tasks och ordning för genomförande.
