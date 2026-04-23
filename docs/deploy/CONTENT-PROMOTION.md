# Content Promotion

Det här dokumentet beskriver hur CMS-innehåll får flyttas till VPS eller produktion.

## Grundregel

Vanlig deploy:

- körs med `deploy-vps.ps1`
- deployar kod
- deployar statiska filer
- reloadar appen
- skriver **inte** över CMS-innehåll i databasen

Innehållspromotion:

- körs separat
- skriver över `cms_content` i databasen
- ska bara göras medvetet

## Varför detta är viktigt

I den här lösningen lagras liveinnehåll i PostgreSQL.

Det gäller bland annat:

- hero-bilder
- hero-texter
- CTA-knappar
- footerinnehåll
- sidinställningar som redigerats i admin

Filen `frontend/content/site-content.json` är inte den levande sanningen i produktion. Den är:

- seed för första uppstart
- underlag för kontrollerad innehållspromotion mellan miljöer

Om `site-content.json` skrivs in i produktionsdatabasen kommer live-redigeringar i CMS att återställas till filens värden.

## När man får promota innehåll

Använd innehållspromotion när:

- ett nytt innehållsset medvetet ska flyttas från lokal/test till produktion
- produktionen ska återställas från ett känt innehållsunderlag
- man uttryckligen accepterar att produktions-CMS skrivs över

Använd det inte när:

- du bara deployar kod
- du bara deployar buggrättningar eller UI-fixar
- produktionen redan innehåller nyare redaktionella ändringar än repot

## Script

Kör från repo-roten:

```powershell
powershell -ExecutionPolicy Bypass -File .\promote-content-vps.ps1 -Force
```

Det scriptet:

1. laddar upp `frontend/content/site-content.json`
2. läser produktionsmiljön från `shared/.env.local`
3. skriver innehållet till `cms_content` för `content_key = 'site'`

Scriptet kräver `-Force`. Utan den flaggan avbryter det utan att skriva något till VPS-databasen.

## Rekommenderat arbetssätt

1. Gör vanliga kodändringar och deploya med `deploy-vps.ps1`.
2. Låt produktionens CMS-data vara orörd.
3. Om innehåll verkligen ska promotas, kör `promote-content-vps.ps1` som ett separat steg.
4. Verifiera särskilt hero-bilder, startsida, tjänster och andra visuella sektioner direkt efter promotion.

## Kontrollfråga innan promotion

Fråga alltid:

- Är produktions-CMS nyare än `site-content.json`?

Om svaret är ja ska du normalt inte promota filen till produktion.
