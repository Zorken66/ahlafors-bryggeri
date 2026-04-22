# VPS Templates

Den här mappen innehåller återanvändbara mallar för andra projekt som ska deployas till VPS via SSH.

Filer:

- `DEPLOY-VPS-TEMPLATE.md`
- `deploy-vps.template.ps1`
- `ssh-config.example`
- `NEW-PROJECT-CHECKLIST.md`

Så används de:

1. Kopiera `DEPLOY-VPS-TEMPLATE.md` till projektets `DEPLOY.md`.
2. Kopiera `deploy-vps.template.ps1` till projektroten som `deploy-vps.ps1`.
3. Följ `NEW-PROJECT-CHECKLIST.md` för första serveruppsättningen.
4. Lägg in ett host-alias i din lokala `~/.ssh/config` baserat på `ssh-config.example`.
5. Justera host, remote path, PM2-process och eventuella appmappar i projektet.

Säkerhetsprincip:

- privat SSH-nyckel stannar i `~/.ssh`
- riktiga `.env`-värden stannar på servern
- repo innehåller bara struktur och instruktioner
