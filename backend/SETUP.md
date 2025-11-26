# Strapi Setup Guide

## 1. Starta Strapi

```bash
npm run dev:backend
```

Gå till http://localhost:1337/admin och skapa en admin-användare.

## 2. Skapa Content Types

### Gå till Content-Type Builder
`Settings → Content-Type Builder`

### Skapa följande Collection Types:

#### 1. Product (Produkt)
- **name** - Text (Short text) - Required
- **slug** - UID (attached to name)
- **description** - Rich text
- **shortDescription** - Text (Long text)
- **productType** - Enumeration (beer, cider)
- **style** - Text (Short text)
- **alcoholContent** - Number (Decimal)
- **volume** - Text (Short text)
- **image** - Media (Single image)
- **gallery** - Media (Multiple images)
- **systembolagetLink** - Text (Short text)
- **featured** - Boolean (Default: false)
- **order** - Number (Integer)

#### 2. News (Nyheter)
- **title** - Text (Short text) - Required
- **slug** - UID (attached to title)
- **excerpt** - Text (Long text)
- **content** - Rich text
- **image** - Media (Single image)
- **publishedAt** - Date (datetime)
- **featured** - Boolean (Default: false)

#### 3. Service (Tjänster)
- **title** - Text (Short text) - Required
- **slug** - UID (attached to title)
- **description** - Rich text
- **shortDescription** - Text (Long text)
- **icon** - Text (Short text)
- **image** - Media (Single image)
- **order** - Number (Integer)

#### 4. Recipe (Recept)
- **title** - Text (Short text) - Required
- **slug** - UID (attached to title)
- **description** - Text (Long text)
- **ingredients** - Rich text
- **instructions** - Rich text
- **prepTime** - Number (Integer)
- **servings** - Number (Integer)
- **image** - Media (Single image)
- **products** - Relation (Many to Many with Product)

### Skapa följande Single Types:

#### 5. About (Om oss)
- **title** - Text (Short text)
- **tagline** - Text (Short text)
- **description** - Rich text
- **history** - Rich text
- **location** - Text (Short text)
- **foundedYear** - Number (Integer)
- **heroImage** - Media (Single image)
- **gallery** - Media (Multiple images)

#### 6. Rulleriet
- **title** - Text (Short text)
- **description** - Rich text
- **nextEvent** - Rich text
- **images** - Media (Multiple images)

#### 7. Contact (Kontakt)
- **email** - Email
- **phone** - Text (Short text)
- **address** - Text (Long text)

## 3. Konfigurera API Permissions

`Settings → Users & Permissions Plugin → Roles → Public`

Aktivera följande för Public access:
- **Product**: find, findOne
- **News**: find, findOne
- **Service**: find, findOne
- **Recipe**: find, findOne
- **About**: find
- **Rulleriet**: find
- **Contact**: find

## 4. Skapa API Token

`Settings → API Tokens → Create new API Token`
- Name: Frontend
- Token type: Read-only
- Token duration: Unlimited
- Kopiera token och lägg till i frontend/.env.local

## 5. Lägg till exempelinnehåll

### About
```
title: "Ahlafors Bryggeri"
tagline: "Hantverk i varje droppe"
description: "Upptäck det unika hantverket bakom varje flaska..."
location: "Alafors, 3 mil norr om Göteborg"
foundedYear: 1854
```

### Produkter (exempel)
```
title: "Pale Ale"
productType: beer
style: "Pale Ale"
alcoholContent: 5.2
volume: "330ml"
featured: true
```

### Tjänster (exempel)
```
title: "Profileringsöl"
shortDescription: "För företag och föreningar"
```

## 6. Testa API

Efter att du skapat innehåll, testa:
- http://localhost:1337/api/products
- http://localhost:1337/api/news
- http://localhost:1337/api/about
