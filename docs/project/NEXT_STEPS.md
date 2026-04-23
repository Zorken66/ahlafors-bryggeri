# Ahlafors Bryggeri - Nästa steg

## ✅ Klart

1. **Eget CMS** - Adminyta i Next.js på `/admin`
2. **Central innehållsfil** - Allt innehåll ligger i `frontend/content/site-content.json`
3. **Frontend kopplad till CMS-data** - Produkter, nyheter, tjänster, recept, om oss, kontakt och Rulleriet läser samma källa
4. **Strapi/Vercel-frikoppling** - Root-scripts och dokumentation pekar inte längre på den gamla lösningen

## 🎨 Design & Känsla

Hemsidan har nu:
- **Färgpalett**: Mörka toner (ek, sten) med koppar och amber-accenter
- **Typografi**: Playfair Display (serif) för rubriker, Inter för brödtext
- **Känsla**: Rustik elegans, industriell charm, äkta hantverk
- **Texturer**: Subtila överläggseffekter för extra djup

## 🚀 Starta projektet

```bash
npm run dev
```

## 📝 Nästa steg

### 1. Säkra CMS-inloggningen

1. Skapa `frontend/.env.local`
2. Sätt `CMS_ADMIN_PASSWORD`
3. Sätt `CMS_SESSION_SECRET`
4. Testa inloggning på `http://localhost:3000/admin`

### 2. Lägg till riktiga bilder

- Byt ut placeholder-bilder i `site-content.json`
- Optimera bilder med Next.js Image-komponent
- Lägg till bilder i `/frontend/public/images/`

### 3. Förbättra CMS-redigeringen

- Ersätt JSON-editorn med formulär per innehållstyp
- Lägg till uppladdning av bilder
- Lägg till versionshistorik eller backup-export

### 4. Flytta lagring till databas vid behov

- Behåll adminytan
- Byt bara implementationen i `frontend/lib/content-store.ts`
- Bra första steg: SQLite för enkel drift på egen server

### 5. Lägg till funktioner

- Lägg till metadata per sida
- Implementera sitemap.xml
- Koppla kontaktformuläret till e-post
- Lägg till Analytics

### 6. Deploy

- Kör på egen VPS eller annan Node-server
- Använd `npm run build` och `npm run start`
- Säkerställ att filsystemet är skrivbart för CMS-data

## 📚 Viktiga filer

- `frontend/content/site-content.json`
- `frontend/lib/content-store.ts`
- `frontend/app/admin/page.tsx`
- `frontend/components/admin/CmsAdmin.tsx`

## 🎯 Tips

1. **Ta backup på `site-content.json`** innan större ändringar
2. **Testa adminflödet lokalt** innan deploy
3. **Byt lagringsmotor innan serverless** om ni vill undvika förlorade CMS-ändringar
4. **Optimera bilder** när ni byter från placeholder-material
5. **Testa mobil** efter varje större innehållsändring

## 🛠 Verktyg & Teknologier

- **App**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **CMS**: Eggenbyggd adminyta i samma app
- **Lagring**: JSON-fil idag, utbytbar till SQLite/Postgres senare
