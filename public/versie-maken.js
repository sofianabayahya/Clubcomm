// ClubComm — bij elke publicatie op Vercel: versie.json maken met de commit, zodat de app ziet dat er een nieuwe
// versie is en zichzelf ververst (Besluit 63). Lokaal niet nodig: zonder versie.json doet de app niets.
// Besluit 89: demo.html = kopie van index.html, zodat mijnclubcomm.nl/demo een gewone pagina is (cleanUrls).
const fs = require('fs'); const path = require('path');
fs.writeFileSync(path.join(__dirname, 'versie.json'), JSON.stringify({ v: (process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())).slice(0, 12), gemaakt: new Date().toISOString() }));
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(__dirname, 'demo.html'));
