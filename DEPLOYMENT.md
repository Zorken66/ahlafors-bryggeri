# Deployment Guide

## Backend (Strapi)

Strapi backend kan deployas på flera sätt:

### Railway / Render / Heroku
1. Anslut till ditt GitHub-repository
2. Välj `backend`-mappen som root
3. Lägg till miljövariabler från `.env.example`
4. Konfigurera PostgreSQL databas

### Strapi Cloud
1. Logga in på [cloud.strapi.io](https://cloud.strapi.io)
2. Anslut GitHub repository
3. Välj backend-projektet
4. Deploy automatiskt

## Frontend (Vercel)

1. Kör `vercel` i root-mappen
2. Eller koppla GitHub repository till Vercel
3. Konfigurera miljövariabler:
   - `NEXT_PUBLIC_STRAPI_API_URL`: Din Strapi backend URL
   - `STRAPI_API_TOKEN`: API token från Strapi

## Miljövariabler

### Backend (.env)
```
HOST=0.0.0.0
PORT=1337
APP_KEYS=<generera unik key>
API_TOKEN_SALT=<generera unik salt>
ADMIN_JWT_SECRET=<generera unik secret>
TRANSFER_TOKEN_SALT=<generera unik salt>
JWT_SECRET=<generera unik secret>
```

### Frontend (.env.local)
```
NEXT_PUBLIC_STRAPI_API_URL=https://din-strapi-backend.com
STRAPI_API_TOKEN=<din-api-token>
```
