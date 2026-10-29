# Eén begeleidingsmoment in zeven stappen (voorbeeld ronde 5)

*29-10-2026. Voorstel Spoor 2 (inhoud) en Spoor 3 (software). Dit is **een voorbeeld, geen bouwopdracht**. Telefoon 390 px, het gesprek ook op de laptop (1280 px). De namen zijn verzonnen: trainer Daan (niveau Startend), begeleider Sam. Elk blok in de schermen draagt een label:*
- **Bestaat**: werkt nu al in ClubComm;
- **Deels**: bestaat, maar moet worden aangepast;
- **Nieuw**: moet nog worden gebouwd.

**Belangrijkste ontwerpkeuze: zo veel mogelijk zonder nieuwe toegangsrechten.**
- **De basisvoorbereiding** (probleem, doel, vormen, coachaccenten) wordt opgeslagen in de bestaande **vragenlijst vooraf** van het begeleidingsmoment (scope `trainerzelf`). De trainer is eigenaar. De begeleider leest alleen; dat wordt na herstel 033 afgedwongen.
- **De voorfeedback** komt in het **begeleidingsmoment** zelf (scope `trainerdossier`). De begeleider schrijft en de trainer leest.
- **Alleen het delen van de héle training**, met de tekeningen, vraagt nieuwe rechten. Dat komt later, met een eigen rechtenvoorstel.

| Stap | Scherm | Bestaat | Deels (aanpassen) | Nieuw | Rechten |
|---|---|---|---|---|---|
| 1. Basisvoorbereiding trainer | `1-basisvoorbereiding.png` | De training en vormen in de planner | Vragenlijst vooraf → de drie onderdelen + coachaccenten (aanbevolen) | Keuzes Aanvallen/Verdedigen, teamtaak of omschakelmoment (uit het profiel); Swift-principe als hulp; de vorige afspraak bovenaan | bestaand (`trainerzelf`), **na 033** |
| 2. Voorfeedback HJO/TJC | `2-voorfeedback.png` | Bericht aan de trainer | De voorbereiding lezen (andere velden) | Het veld *voorfeedback* in het moment, met snelle keuzes en één zin | bestaand (`trainerdossier`) |
| 3. Observatie | `3-observatie.png` | A4-observatie, leertijd-klok, notities | De vragen uit het profiel in plaats van de code; vierpuntsschaal in plaats van ✓ / ~ / – | De gedragsbeschrijving per criterium, in te klappen | bestaand |
| 4. Korte trainerreflectie | `4-reflectie.png` | Reflectie met 3 vragen | Andere drie vragen; direct na de training op Home, één herinnering na 24 uur (keuze B), niet pas na delen | De zes criteria optioneel; de observatie pas zichtbaar na de eigen reflectie | bestaand, **na 033** |
| 5. Gesprek naast elkaar | `5-gesprek.png`, `5-gesprek-laptop.png` | Vier vakken, de gegevens van beide kanten | De weergave: per criterium naast elkaar, verschil gemarkeerd | De vorige afspraak als eerste punt | bestaand |
| 6. Eén ontwikkelafspraak | `6-afspraak.png` | Ontwikkelpunt (verplicht), naar het traject | | Koppeling aan één criterium; *waar zien we het aan?* | bestaand |
| 7. Opvolging | `7-opvolging.png` | Volgend moment plannen uit het rooster | | De afspraak op Home van de trainer, bij zijn voorbereiding en bovenaan het volgende moment, met *gelukt / deels / nog niet*; *later bepalen* zonder vast schema | bestaand |

**Wat dus nog moet worden gebouwd (fase 3, na herstel 033):**
1. de zes criteria en de schaal in de observatie;
2. de korte reflectie (B);
3. het gesprek naast elkaar;
4. de afspraak gekoppeld aan een criterium, die terugkomt;
5. de voorbereiding en voorfeedback in het moment.

Er zijn geen nieuwe toegangsrechten nodig. Wel moet het Swift-profiel er zijn (criteria, gedragsbeschrijvingen, teamfuncties): fase 1 en 2.

**Later (fase 5 en 6):**
- de hele training delen met tekeningen;
- TJC per werkgebied;
- de doelstellingassistent;
- de ondersteuningsniveaus in de app.

**Normen nagelopen** (`docs/app-controle.md`):
- tikvlakken minstens 44 px;
- leestekst 16 px (toelichting 14 px);
- kleur nooit als enige drager: een verschil heeft een oranje rand **en** de uitleg eronder;
- geen totaalcijfer.

Nog **niet** getest: Beperk beweging, safe area en dubbel tikken. Dat kan pas bij het bouwen.
