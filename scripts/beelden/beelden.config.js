// Schermafbeeldingen voor de functiekaarten opnieuw maken (npm run beelden). Zelfde app en instellingen als de tests,
// maar een eigen map, zodat npm test deze niet draait. Alleen de demo met verzonnen gegevens; nooit de productiedatabase.
const path = require('path');
const basis = require('../../playwright.config.js');

module.exports = { ...basis, testDir: __dirname, testMatch: 'beelden.spec.js', workers: 1, fullyParallel: false, reporter: 'list',
  webServer: { ...basis.webServer, cwd: path.join(__dirname, '..', '..') } };
