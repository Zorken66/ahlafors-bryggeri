# Production Cutover

Den här checklistan används när appen redan är deployad och verifierad internt på VPS:en.

## Förutsättningar

- appen kör i PM2 som `ahlafors-bryggerier`
- appen svarar på `http://127.0.0.1:3002`
- databasen är skapad
- `shared/.env.local` finns
- uploads ligger i `shared/uploads`

## 1. DNS

Peka följande till `185.189.49.123`:

- `ahlaforsbryggerier.se`
- `www.ahlaforsbryggerier.se`

Verifiera på VPS:en:

```bash
getent hosts ahlaforsbryggerier.se
getent hosts www.ahlaforsbryggerier.se
```

## 2. nginx

Skapa:

```bash
/etc/nginx/conf.d/ahlaforsbryggerier.se.conf
```

Mall:

```nginx
server {
    server_name ahlaforsbryggerier.se www.ahlaforsbryggerier.se;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }

    listen [::]:443 ssl; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/ahlaforsbryggerier.se/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/ahlaforsbryggerier.se/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.ahlaforsbryggerier.se) {
        return 301 https://$host$request_uri;
    }

    if ($host = ahlaforsbryggerier.se) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;
    server_name ahlaforsbryggerier.se www.ahlaforsbryggerier.se;
    return 404;
}
```

## 3. Certifikat

Kör `certbot` när DNS pekar rätt:

```bash
sudo certbot --nginx -d ahlaforsbryggerier.se -d www.ahlaforsbryggerier.se
```

## 4. Reload och kontroll

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I https://ahlaforsbryggerier.se
curl -I https://www.ahlaforsbryggerier.se
```

## 5. Slutkontroll

- startsidan svarar `200`
- `/admin/login` svarar `200`
- CMS-inloggning fungerar
- mediauppladdning fungerar
- kontaktformulär fungerar
- `pm2 logs ahlafors-bryggerier` är ren
