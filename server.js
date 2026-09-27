// ClubComm — lokaal draaien (online staat de app op Vercel, zie docs/techniek.md).
// Serveert alleen de map public/. Start: npm install && npm start → http://localhost:5000 (demo: /?demo)
const express = require('express');
const path = require('path');

const app = express();
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.use((req, res) => res.status(404).send('Niet gevonden'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`ClubComm draait op http://localhost:${PORT}`));
