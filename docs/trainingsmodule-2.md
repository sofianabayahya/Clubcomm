# Trainingsmodule 2.0: ontwerpvoorstel

*27 oktober 2026. Antwoord op "Ontwikkelvoorstel ClubComm – Methodologische trainingsmodule 2.0". Dit is een **voorstel, geen besluit**. Er is niets gebouwd of gemigreerd. Database, rechten en productieschermen blijven ongewijzigd tot het akkoord. ART blijft ongewijzigd. Achtergrond en audit: `docs/trainingsmodule.md`. De voorbeeldschermen zijn verzonnen voorbeelden.*

---

## 1. Vergelijking: ART, ClubComm nu en 2.0

| Onderdeel | ART (bron) | ClubComm nu | Voorstel 2.0 |
|---|---|---|---|
| Tekentool | Volledig (DrawTool, velden, pijlen, zones) | Overgenomen in het testscherm `/tekenen`, alleen op het toestel | Bewaren als `tekening_json` met een schemaversie, fases (start → vervolg), geen plaatjes |
| Oefenvorm | Velden per vorm in een weekplan | Geen | Vorm (vaste kern) los van de **uitvoering** (wat er op een training gebeurde) |
| Vormenbank | Per groep, eenvoudige lijst | Geen | Club / team / mijn / favorieten, gecombineerde filters, zoeken met synoniemen |
| Leerlijn | Vast in de code (Ajax-opbouw A1/A2) | Geen. Visie van de HO volgt nog (Besluit 99) | Door de HO zelf in te vullen (begrippen), niets vast in de code |
| Weekplanning | Onderdelen A/B/C, vorm 1 en 2, deadline vrijdag | Training = activiteit uit het rooster (Besluit 87) | Trainingsplan per activiteit, vrij aantal onderdelen, eigenaar per onderdeel |
| Periodisering | Nee | Fases van het seizoen (`M.blok`) | Thema en contrathema per week, overzicht laatst / hoe vaak / volgende per leerdoel |
| Evaluatie | Vragen per vorm | Reflectie van de trainer in Trainers begeleiden (Besluit 99) | Evaluatie van de **vorm**, niet van de trainer. Bestaande reflectie hergebruiken |
| Ontwikkeling speler | Nee | Beoordeling en ontwikkelgesprek (`beoordeling.js`) | Onderscheid **aangeboden** (uitvoeringen), **waargenomen** (evaluatie) en **aangetoond** (bestaande beoordeling) |
| Rechten | Eén gebruiker | Scopes per rij, rechtentest elke nacht (Besluit 119) | Privé / teamstaf / clubbreed / goedgekeurd door HO. Centraal komt later |
| Import en export | Nee | Nee | JSON-formaat `clubcomm-oefenvorm` v1, met controle, dubbele vormen en voorbeeld vooraf |
| AI | Nee | Nee | Alleen voorbereid: velden en formaat geschikt, geen koppeling |

- **Voordelen:** we hergebruiken veel (tekentool, activiteiten, reflectie, beoordeling, printen, rechtentest). Niets wordt dubbel gebouwd.
- **Nadelen:** 2.0 is veel groter dan ART. Het risico is dat het voor een pilotteam te zwaar wordt (Principe 10).
- **Advies:** de kern van ART overnemen (vorm + tekening + weekplan). De extra's van 2.0 bouwen in lagen, pas wanneer de laag eronder gebruikt wordt.

---

## 2. Technisch datamodel

Alles komt als nieuwe *soorten* in de bestaande tabel `rij`. Er komen geen nieuwe tabellen.

| Soort | Sleutel / koppeling | Inhoud | Scope |
|---|---|---|---|
| `begrip` | eigen id | type (leeftijd · teamfunctie · teamtaak · spelprobleem · spelprincipe · vaardigheid · leerdoel · fase), naam, ouder-id, synoniemen, volgorde, actief | `club` (lezen: staf). Schrijven: HO/TC |
| `vorm` | eigen id | kop: auteur, zichtbaarheid, status (concept · gedeeld · goedgekeurd), nummer van de huidige versie | `eigen`, `teamstaf` of nieuw `trainersclub` |
| `vormversie` | `vormId@n`, wordt nooit meer gewijzigd | alle velden: doel, organisatie, regels, coachaccenten, makkelijker/moeilijker, spelers, duur, ruimte, begrip-ids, `tekening_json` {v, fases[]}, bron {vormId, versie} | zelfde scope als de vorm |
| `uitvoering` | eigen id; team, act | een kopie van de versie op het moment van gebruik, plus bron, onderdeel, volgnummer, eigenaar, aanpassingen | `teamstaf` |
| `trainingsplan` | id = act; team, act | onderdelen (vrij aantal), thema, contrathema, leerdoelen, status, deadline | `teamstaf` |
| `evaluatie` | eigen id; uitvoering | liep het, gedrag zichtbaar, uitdaging, aanpassing die werkte. Zonder naam van de trainer naar buiten | `teamstaf`. Telling per bronvorm voor de bank |
| `favoriet` | persoon + vorm | alleen een verwijzing | `eigen` |
| `periodeplan` | team + fase | weken met thema en contrathema | `teamstaf` (later) |

**Belangrijke keuzes**
- **Delen = een nieuwe versie schrijven met een andere scope.** De database verbiedt het wijzigen van een scope (`priv.cc_bewaak`), en dat houden we zo. Daardoor blijft de privé-vorm privé en ontstaat er een gedeelde kopie met een verwijzing naar de bron.
- **Uitvoering = momentopname.** Wijzigt iemand later de vorm, dan blijft wat er op de training gebeurde kloppen (patroon "momentopname" in de pilotlog).
- **Tekening:** veld `v` (schemaversie). Een `opwaardeer()`-functie zet oude tekeningen om. De tekenaar slaat onbekende items over in plaats van te crashen.
- **Clubbreed** vraagt één nieuwe scope `trainersclub`: alle trainers, HO en TC van de club mogen lezen; alleen de auteur en de HO mogen schrijven. Dat betekent een migratie plus controles in `priv.rechtentest()` (lezen, schrijven, kopiëren, publiceren en verwijderen elk apart, ouders zien niets, andere club ziet niets).
- **Centrale bibliotheek** (voor meerdere clubs): later, als aparte club-id `centraal`, alleen lezen.

- **Voordelen:** past bij de bestaande opbouw (één tabel, scopes, rechtentest). Versies en bron maken delen veilig. Geen bestandsopslag nodig.
- **Nadelen:** jsonb-velden zijn lastiger te doorzoeken dan losse kolommen. Veel versies maken veel rijen.
- **Advies:** zo doen. Zoeken gebeurt in de app (honderden vormen per club is klein). Bij duizenden vormen kan er een database-index of zoekfunctie bij komen.

---

## 3. Navigatie en schermindeling

| Rol | Waar | Wat |
|---|---|---|
| Trainer | Tabblad **Training** in plaats van *Aanwezigheid* (de trainer heeft al 5 tabbladen). Bovenin twee knoppen: **Week** · **Vormenbank** | Week: trainingen van deze week met plan, status en aanwezigheid (via de trainingskaart). Vormenbank: zoeken, vorm openen, "Gebruik in training" |
| HO / TC | Onder **Trainers**: *Leerlijn* (begrippen invullen) en *Goedkeuren* (gedeelde vormen) | Goedkeuren = één venster met de vorm en de knoppen Goedkeuren of Terug met opmerking |
| Teamleider, ouder | Niets | Ouders zien de trainingsmodule nooit |
| Laptop | Twee kolommen: filters links, kaarten rechts. Het vormvenster is een groot venster in het midden (Besluit 115) | — |

- **Voordelen:** geen zesde tabblad. Aanwezigheid blijft één tik weg via de trainingskaart. De HO houdt alles op één plek (Trainers).
- **Nadelen:** trainers moeten wennen aan de nieuwe naam *Training* in plaats van *Aanwezigheid*. Aanwezigheid kost één tik meer.
- **Advies:** zo doen. Eerst testen met alleen Sofian, en daarna pas aan de andere trainers tonen.

---

## 4. Visueel ontwerp

Voorbeelden: `docs/onderzoek/trainingsmodule-2/` (o-bank-tel, o-bank-lap, o-venster-tel, o-venster-lap).

- **Vormenbank, telefoon:** knoppen Club / Team / Mijn / ★, een zoekbalk, filterchips (O13 · 12 spelers · ≤ 15 min) en *+ Filter*. Daaronder compacte kaarten met de tekening links. Per kaart staan:
  - naam;
  - primair leerdoel (groen);
  - spelers, tijd, ruimte en soort;
  - herkomst (goedgekeurd door HO / clubvorm / teamstaf / privé);
  - evaluatie ("Werkte 4 van 5 keer").
- **Vormenbank, laptop:** filterpaneel links (leeftijd, spelers en tijd, leerdoel, teamfunctie, soort, overig) en een raster met grote tekeningen.
- **Oefenvormvenster:** bovenaan de tekening (fases). Daaronder staan:
  - status en versie;
  - naam en doel in één zin;
  - leerdoelen;
  - zes vaste kenmerken;
  - uitklapblokken (organisatie, coachaccenten, makkelijker/moeilijker, eerder met deze vorm, versies);
  - één hoofdknop **+ Gebruik in training**.

- **Voordelen:** actie eerst, één hoofdknop. Kleur alleen voor herkomst en leerdoel. De evaluatie staat direct zichtbaar op de kaart.
- **Nadelen:** veel kenmerken per vorm. Het invulformulier (nog niet ontworpen) kan lang worden.
- **Advies:** bij het invullen maar vier velden verplicht maken (naam, tekening, spelers, duur). De rest is optioneel en uitklapbaar, en bewaart vanzelf (Besluit 103).

---

## 5. Technische risico's en afhankelijkheden

| Risico | Waarom | Oplossing |
|---|---|---|
| **De app laadt elke 30 seconden álle rijen van de club** (`live.js`: `alleRijen` + `ververs`) | Een vormenbank met honderden versies maakt elke telefoon traag en kost dataverkeer | **Eerst** laden per soort: vormen alleen ophalen bij het openen van de vormenbank, en daarna alleen wat gewijzigd is |
| Scope wijzigen mag niet | Delen kan niet door een vlag om te zetten | Delen = nieuwe versie (zie datamodel) |
| Nieuwe scope `trainersclub` | Fout in de rechten = vormen zichtbaar voor ouders of een andere club | Controles in `priv.rechtentest()` vóór het online gaat (Besluit 119) |
| Tekening-schema verandert | Oude tekeningen kapot | Schemaversie + `opwaardeer()` + tekenaar die onbekende items overslaat |
| Server (`automaat`) gebruikt dezelfde regels | Nieuwe soorten mogen het automatische werk niet storen | Server negeert onbekende soorten. Controleren in de test |
| Te veel tegelijk (Principe 10) | Trainers haken af | In lagen bouwen. Elke laag eerst bij één team |
| Afhankelijkheid: visie van de HO | Leerlijn en periodisering hebben inhoud nodig | Leerlijn-scherm leeg opleveren. De HO vult het in |
| AVV Swift (pakket Trainers) | Geen trainingen in de planning daar | Eerst alleen DCG |

- **Advies:** het laden per soort is de enige harde voorwaarde vóór een clubbrede bank. De rest los je op per stap.

---

## 6. Prioriteiten

**Noodzakelijk (eerst)**
1. Laden per soort (prestatie).
2. Vorm + vormversie + tekening (privé en teamstaf, bestaande scopes).
3. Vormvenster en de vormenbank Mijn / Team met filters.
4. Gebruik in training → trainingsplan per activiteit (vrije onderdelen, eigenaar).

**Waardevol (daarna)**
5. Clubbrede bank (scope `trainersclub`) + goedkeuren door de HO.
6. Evaluatie per uitvoering + "Werkte x van y" op de kaart.
7. Leerlijn (begrippen) door de HO + filters en synoniemen daarop.
8. Afdrukken van een training (`CC.printDoc`).

**Later**
9. Periodisering, thema/contrathema, overzicht laatst / hoe vaak / volgende per leerdoel.
10. Aangeboden / waargenomen / aangetoond bij de speler.
11. JSON-import en -export.
12. Centrale bibliotheek voor meerdere clubs.
13. AI-hulp.

- **Voordelen:** na stap 4 heeft de trainer al iets bruikbaars.
- **Nadelen:** de HO-kant (leerlijn) komt pas bij stap 7.
- **Advies:** deze volgorde. Leerlijn eerder kan, als de HO-visie eerder klaar is.

---

## 7. Eerste kleine, veilige bouwstap

**Stap 1: laden per soort.** Er verandert niets voor gebruikers en niets aan de rechten. `live.js` krijgt de mogelijkheid om soorten over te slaan bij het verversen en ze pas op te halen wanneer een scherm erom vraagt. Met test: de bestaande 52 tests blijven groen, plus een test dat een overgeslagen soort niet geladen wordt.

**Stap 2 (na stap 1):** privé-vormen en teamvormen met het vormvenster en de tekening. Dit gebruikt de bestaande scopes `eigen` en `teamstaf`, dus **geen migratie**. Het staat achter een moduleschakelaar die alleen Sofian ziet. Eerst een voorbeeld van het invulvenster.

- **Voordelen:** geen risico voor de pilot (de wedstrijden beginnen 31 okt). Geen databasewijziging. Het lost meteen het grootste risico op.
- **Nadelen:** stap 1 levert niets zichtbaars op.
- **Advies:** zo doen, en pas **na 31 oktober** beginnen, zodat de eerste wedstrijddag rustig verloopt.

---

## 8. Open vragen (uit `trainingsmodule.md`, nog onbeantwoord)
1. Onderdelen A/B/C uit ART of vrij (warming-up · vorm 1 · vorm 2 · partij)? *Voorstel 2.0: vrij aantal onderdelen.*
2. Rollen-rooster (trainer A/B schuiven door) of eigenaar per onderdeel? *Voorstel: eigenaar per onderdeel.*
3. Vormenbank clubbreed? *Voorstel: ja, in stap 5.*
4. Evaluatievragen: ART of de vijf KNVB-vragen? *Voorstel: vier korte (liep het, gedrag zichtbaar, uitdaging, aanpassing).*
5. Ook AVV Swift? *Voorstel: eerst alleen DCG.*
6. Duur-maximum en deadline: vast of per club? *Voorstel: per club instelbaar, standaard uit.*
