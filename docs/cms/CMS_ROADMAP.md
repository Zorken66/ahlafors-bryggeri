# CMS Roadmap

## Syfte
Det här dokumentet bryter ner CMS-visionen till en prioriterad riktning utifrån dagens faktiska status i koden.

Roadmapen är uppdelad i:
- `Done`: det som nu är byggt och verifierat
- `Next`: det som ger högst nästa värde
- `Later`: det som gör CMS:et ännu starkare över tid

Det här är inte sprintplanering. Det är prioriterad riktning efter den implementationsfas som nu är klar.

## Nuläge
CMS:et har nu en betydligt starkare grund än när roadmapen först skrevs.

Det som redan finns i praktiken:
- enhetlig publiceringsmodell
- kvalitetsvarningar i formulären
- admin-dashboard
- mediebibliotek med usage-spårning
- mediaintegritet och broken-reference-flöde
- preview för flera innehållstyper
- revisionshistorik med fältdiff
- roller och sektionsbehörigheter

Det som nu saknas mest är inte längre grundläggande redaktionell UX, utan säkrare flöden mellan miljöer och fortsatt driftmognad.

## Prioriteringsprinciper
Vi ska prioritera sådant som:
- minskar risken i produktion
- sparar redaktionell tid varje vecka
- gör återställning och promotion tryggare
- håller CMS:et konsekvent mellan innehållstyper
- undviker speciallogik som driver isär admin och publik rendering

## Done

### 1. Enhetlig publiceringsmodell
Byggt för:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-event
- Rulleriet-inlägg

### 2. Kvalitetsvarningar i formulären
Byggt som central kvalitetsmotor med checklistor, inline-varningar och koppling till publicering.

### 3. Dashboard
Byggt som egen adminöversikt med:
- kvalitets- och publiceringssammanfattning
- uppgifter som kräver åtgärd
- kommande datum
- senaste aktivitet
- mediahälsa

### 4. Preview
Byggt och standardiserat vidare för:
- produkter
- nyheter
- recept
- tjänster
- Rulleriet
- Rulleriet-inlägg

### 5. Mediebibliotek
Byggt i fungerande grundversion med:
- uppladdning
- metadata
- filersättning utan URL-byte
- usage-spårning
- säker delete
- integritetskontroll

### 6. Revisioner
Byggt med:
- lista
- detaljvy
- restore
- fältdiff

### 7. Roller och publiceringsbehörighet
Byggt i första riktiga version med sektionsstyrning och restore-rättigheter.

## Next

### 1. Content promotion mellan miljöer
Det här är nu nästa starkaste behov.

Målet är:
- export/import av innehåll per sektion eller innehållstyp
- säker promotion av media
- verifiering före promotion
- dokumenterad rollback

Varför nu:
- redaktionella flöden är tillräckligt mogna
- drift och miljöflytt är nästa verkliga riskyta

Nu påbörjat:
- första CLI-bundle för export/import finns
- nästa nivå är rollback, tydligare VPS-runbook och bättre preflight-diff

### 2. Sök och filtrering i större listor
Inför bättre sök/filter i:
- produkter
- tjänster
- recept
- nyheter
- Rulleriet-inlägg
- media

Varför nu:
- mängden innehåll och media börjar bli stor nog
- mycket hög nytta per relativt liten insats

Nu påbörjat:
- sök/filter är byggt för produkter, tjänster, recept, nyheter och Rulleriet-inlägg
- motsvarande filter/sortering finns nu också i media
- batchåtgärder finns nu för vanlig mediahygien
- nästa nivå är mer avancerad sortering, sparade filter och starkare kvalitetsrekommendationer

### 3. Fördjupad revisionsupplevelse
Nästa nivå efter nuvarande fältdiff:
- bättre gruppering per objekt
- tydligare redaktionella etiketter
- enklare överblick över vad som ändrats i en sektion

Nu påbörjat:
- revisionslistan har nu tydligare sektionsetiketter och daggruppering
- diffen grupperas nu per objekt/fältkluster i stället för bara platt lista

### 4. Starkare media-kvalitet
Bygg vidare på det nuvarande kvalitetslagret med:
- bättre heuristik eller metadata för bildkvalitet
- tydligare rekommendationer
- eventuellt batchåtgärder för alt-text och oanvänt media

### 5. Backup och restore som rutin
Formalisera driftspåret ytterligare:
- schemalagda backups
- dokumenterad restore-test
- enkel checklista för återställning

Nu påbörjat:
- lokal databasbackup finns
- uploads-backup finns
- kombinerad CMS-backup med manifest finns
- enkel restore-runbook finns för lokal Docker-miljö
- första VPS-backupscript finns
- retentionstöd finns
- nattligt backupscript finns och är aktivt efter sanerad crontab

## Later

### 1. Standardiserade redigeringsvyer per sidtyp
Alla större managers bör på sikt följa en ännu tydligare gemensam struktur.

### 2. Riktig eventmodell
Rulleriet fungerar, men en mer komplett eventdomän är fortfarande ett senare steg.

### 3. Kampanj- och temamodell
Återanvändbara teman och kampanjer finns fortfarande som framtida utveckling.

### 4. Blockbaserad sidbyggare
Inte prioriterat nu, men kan bli relevant senare om redaktionell flexibilitet behöver ökas.

### 5. Djupare observability
Health checks finns, men på sikt behövs:
- bättre loggning
- larm
- backupövervakning
- återställningstester

## Rekommenderad ordning från idag

1. Content promotion mellan miljöer
2. Sök och filtrering i större listor
3. Fördjupad revisionsupplevelse
4. Starkare media-kvalitet
5. Backup/restore-rutin
6. Riktig eventmodell
7. Kampanj- och temamodell

## Nästa steg
Nästa steg efter detta dokument bör vara:
- att fortsätta i `docs/cms/CMS_EPIC_10_CONTENT_PROMOTION_AND_DEPLOY.md`
- att bryta ner promotion-spåret i konkret implementation för export/import, verifiering och rollback
