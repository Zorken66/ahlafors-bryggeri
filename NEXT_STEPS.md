# Ahlafors Bryggeri - Nästa steg

## ✅ Klart

1. **Monorepo-struktur** - Färdig med workspaces för frontend och backend
2. **Strapi Backend** - Installerad och konfigurerad
3. **Next.js Frontend** - Modern design med hantverk-känsla
4. **Komponenter** - Header, Footer, Hero, About, Products, News, Services, CTA

## 🎨 Design & Känsla

Hemsidan har nu:
- **Färgpalett**: Mörka toner (ek, sten) med koppar och amber-accenter
- **Typografi**: Playfair Display (serif) för rubriker, Inter för brödtext
- **Känsla**: Rustik elegans, industriell charm, äkta hantverk
- **Texturer**: Subtila överläggseffekter för extra djup

## 🚀 Starta projektet

```bash
# Starta båda applikationerna
npm run dev

# Eller separat:
npm run dev:backend  # http://localhost:1337
npm run dev:frontend # http://localhost:3000
```

## 📝 Nästa steg

### 1. Konfigurera Strapi (Backend)

1. Starta backend: `npm run dev:backend`
2. Gå till http://localhost:1337/admin
3. Skapa en admin-användare
4. Följ instruktionerna i `backend/SETUP.md` för att:
   - Skapa content types
   - Konfigurera API permissions
   - Skapa API token
   - Lägga till exempelinnehåll

### 2. Koppla Frontend till Strapi

1. Kopiera `frontend/.env.local.example` till `frontend/.env.local`
2. Lägg till Strapi API token från backend
3. Uppdatera komponenter att hämta data från Strapi API

### 3. Lägg till riktiga bilder

- Byt ut placeholder-bilder (Unsplash) med riktiga foton från bryggeriet
- Optimera bilder med Next.js Image-komponent
- Lägg till bilder i `/frontend/public/images/`

### 4. Skapa ytterligare sidor

- `/produkter` - Produktlista och produktdetaljer
- `/produkter/[slug]` - Individuell produktsida
- `/rulleriet` - Information om smakbaren
- `/tjanster` - Tjänster i detalj
- `/om-oss` - Om bryggeriet
- `/kontakt` - Kontaktformulär
- `/nyheter` - Nyhetsarkiv
- `/nyheter/[slug]` - Individuell nyhetssida
- `/recept` - Recept med öl/cider

### 5. Implementera Strapi-integration

Skapa API-helpers i `frontend/lib/strapi.ts`:

```typescript
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export async function fetchAPI(path: string) {
  const response = await fetch(`${STRAPI_URL}/api${path}`);
  return response.json();
}

export async function getProducts() {
  return fetchAPI('/products?populate=*');
}

export async function getNews() {
  return fetchAPI('/news?populate=*&sort=publishedAt:desc');
}
```

### 6. SEO & Performance

- Lägg till metadata för varje sida
- Implementera sitemap.xml
- Optimera bilder
- Lägg till Analytics

### 7. Deploy

#### Backend (Strapi):
- Railway, Render eller Strapi Cloud
- Konfigurera PostgreSQL databas
- Sätt miljövariabler

#### Frontend (Vercel):
- Koppla GitHub repository
- Automatisk deployment vid push
- Konfigurera miljövariabler

## 📚 Dokumentation

- `README.md` - Projektöversikt
- `CONTENT_PLAN.md` - Innehållsplanering
- `DEPLOYMENT.md` - Deployment-instruktioner
- `backend/SETUP.md` - Strapi setup-guide
- `backend/CONTENT_TYPES.js` - Content type-definitioner

## 🎯 Tips

1. **Content First**: Lägg till innehåll i Strapi innan du kopplar frontend
2. **Testa lokalt**: Se till att både backend och frontend fungerar lokalt först
3. **Iterera**: Bygg en sida i taget, testa och förbättra
4. **Optimera bilder**: Använd WebP-format för bättre prestanda
5. **Mobile First**: Testa alltid responsivitet på mobil

## 🛠 Verktyg & Teknologier

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Strapi 5 (Headless CMS)
- **Deploy**: Vercel (frontend), Railway/Render (backend)
- **Database**: SQLite (lokal), PostgreSQL (produktion)

Lycka till med projektet! 🍺
