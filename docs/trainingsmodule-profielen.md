# Trainingsmodule: opleidingsprofielen per club

*27 oktober 2026. Antwoord op "Aanvulling ClubComm – Clubspecifieke methodologie". Dit is een **voorstel, geen besluit**: er is niets gebouwd of gemigreerd. Het vult `docs/trainingsmodule-2.md` aan en herziet daar een deel van: de soort `begrip` gaat op in het profiel, en de leerdoelen van een vorm komen in een aparte koppeling. Voorbeeldschermen: `docs/onderzoek/trainingsmodule-2/p-swift.png`, `p-dcg.png` en `p-trainer.png`.*

**In het kort:** een **opleidingsprofiel** is een los pakket gegevens met versies. Elke club heeft er één. Oefenvormen zijn neutraal en worden via een **koppeling** aan de leerdoelen van een profiel verbonden. De KNVB-standaard staat als **gegevensbestand** in de repository en niet in de code. Elke club krijgt een eigen kopie in de eigen clubgegevens. Daardoor blijft de bestaande clubscheiding zoals hij is.

---

## 1. Technische inrichting binnen het bestaande datamodel

### Drie lagen
| Laag | Waar | Wie past aan |
|---|---|---|
| **Standaardprofiel KNVB** | Bestand `supabase/profielen/knvb-2026.1.json` in de repository, met een versienummer. Niet in de JavaScript-code en niet als gedeelde databaserij | Alleen wij (ClubComm), na controle met de KNVB-documenten |
| **Clubprofiel** | Soort `profiel` in `rij` (eigen club-id). Kop: naam, modus, basis {bron: `knvb`, versie: `2026.1`}, gepubliceerde versie, conceptversie | HO / TC (en de clubbeheerder) |
| **Profielversie** | Soort `profielversie`, id `profielId@n`. Wordt **nooit meer gewijzigd** na het publiceren | Ontstaat door "Publiceren" |

### Modus van een clubprofiel
- **Volgt de standaard** (Swift): het profiel bevat geen eigen inhoud, alleen "basis = KNVB 2026.1". Komt er een nieuwe standaardversie, dan ziet de HO één melding: *"Nieuwe KNVB-versie: overnemen?"*. Er verandert niets vanzelf in de lopende trainingen.
- **Eigen versie op basis van KNVB:** per onderdeel staat *overgenomen* of *eigen*. Wat overgenomen is, volgt de basis. Wat eigen is, blijft van de club.
- **Helemaal eigen** (DCG kan dit kiezen): de club begint leeg.

### Inhoud van een profielversie (velden, allemaal optioneel)
- `visie`: tekst en uitgangspunten.
- `begrippen`: teamfuncties, spelprincipes, spelproblemen, vaardigheden, leerdoelen en methodische fases. Elk begrip heeft een **vaste id** (bijv. `ld-vrijkomen`), naam, ouder-id, leeftijden, synoniemen, volgorde en actief. **Een id verandert nooit**, ook niet als de naam verandert.
- `leeftijd`: aandachtspunten per leeftijdsgroep (sluit aan op de indeling in bouwen, Besluit 100).
- `sjablonen`: trainingsopbouw (onderdelen, volgorde, richtduur).
- `periodisering`: periodes, thema's en contrathema's (mag leeg).
- `evaluatie`: vragen en kwaliteitscriteria.
- `termen`: woordenlijst (sleutel → term van de club). De app toont bijvoorbeeld "Hoofd opleiding" of "HJO", of "leerdoel" of "aandachtspunt".
- `filters`: welke filters de vormenbank toont.

### Koppelingen aan het profiel
- **De vorm en de vormversie** bevatten geen leerdoelen meer, alleen neutrale inhoud: tekening, spelers, duur, ruimte, organisatie, regels, coachaccenten en makkelijker/moeilijker.
- Nieuwe soort **`vormkoppeling`**: vorm-id, profiel-id, begrip-ids (primair en secundair) en wie de koppeling maakte. Er mogen **meerdere koppelingen** per vorm zijn, bijvoorbeeld één per profiel.
- **Trainingsplan, uitvoering en evaluatie** krijgen een stempel `profiel: {id, versie}`. Zo is altijd na te gaan met welk profiel en welke versie iets gemaakt is.

### Gebruikerservaring (punt 5 van de aanvulling)
- De app leest bij het openen het actieve profiel van de club van de trainer (zoals nu `S.club`). Termen, leerdoelen, sjablonen, evaluatievragen en filters komen daaruit.
- De trainer kiest **nooit** zelf een profiel.
- Later kan er een profiel per bouw komen. Dat zit nog niet in deze eerste opzet: per club één profiel is genoeg.

- **Voordelen:**
  - Geen nieuwe tabellen.
  - Geen gedeelde gegevens tussen clubs, dus de huidige clubscheiding blijft 100% zoals hij is.
  - Versies zijn onveranderlijk, dus alle oude trainingen blijven herleidbaar.
  - De KNVB-inhoud staat los van de code en is te controleren.
- **Nadelen:**
  - Een nieuwe KNVB-versie moet per club worden overgenomen (één tik van de HO, of een script voor alle clubs die de standaard volgen).
  - Een profielversie is een groot jsonb-blok. Dat is prima voor honderden begrippen, maar niet voor tienduizenden.
- **Advies:** zo doen. Een kopie per club is veiliger dan één gedeeld standaardprofiel in de database. Bij een gedeeld profiel zou elke club gegevens van buiten de eigen club moeten kunnen lezen, en dat is precies de grens die nu elke nacht getest wordt.

---

## 2. Voorbeeld: KNVB-standaardprofiel en eigen profiel

**Belangrijk:** niets hieronder is al vastgesteld. Elk onderdeel krijgt in het bestand en op het scherm een status:
- **gecontroleerd**: vergeleken met een genoemd KNVB-document, met de datum erbij;
- **nog te controleren**: komt uit eerdere kennis of onderzoek, nog niet nagelopen;
- **eigen**: door de club zelf vastgesteld;
- **leeg**: nog niet ingevuld.

Trainers zien alleen onderdelen met de status *gecontroleerd* of *eigen*.

### KNVB-standaard (voorbeeld, alles "nog te controleren")
| Onderdeel | Voorbeeldinhoud | Status |
|---|---|---|
| Visie | Leren door te voetballen; van wedstrijd naar training en terug; plezier en veel balcontact | nog te controleren |
| Teamfuncties | Aanvallen: opbouwen, scoren · Verdedigen: storen, doelpunten voorkomen · Omschakelen | nog te controleren |
| Speelvormen per leeftijd | O7 4 tegen 4 · O8–O10 6 tegen 6 · O11–O12 8 tegen 8 · vanaf O13 11 tegen 11 (staat al in de app, `data.js`, Besluit 60) | gecontroleerd 25-09-2026 |
| Indeling in bouwen | Mini's O6–O7 · onderbouw O8–O12 · middenbouw O13–O15 · bovenbouw O16–O19 (Besluit 100) | al in de app |
| Trainingsopbouw | Voetbalprobleem uit de wedstrijd → oefenvorm(en) → partijvorm | nog te controleren |
| Evaluatievragen | Werd er veel gevoetbald · kwam het probleem vaak terug · was er weerstand · plezier | nog te controleren (sluit aan op de aandachtspunten van Besluit 99) |
| Leerdoelen per leeftijd | — | leeg tot de controle met de KNVB-leerlijnen (zoals Besluit 99 al zegt) |
| Periodisering | — | leeg |

### Eigen profiel DCG (voorbeeld, nog in te vullen door de HO)
| Onderdeel | Voorbeeldinhoud | Status |
|---|---|---|
| Basis | KNVB-standaard 2026.1 | — |
| Visie DCG | Te schrijven door de HO | leeg |
| Teamfuncties | Overgenomen van KNVB | overgenomen |
| Spelprincipes | Bijv. "speler tussen de linies", "overtal in de opbouw" | voorbeeld, nog niet vastgesteld |
| Leerdoelen | De vijf vaardigheden uit het voorstel: vrijkomen – timen · passen – helpen · aannemen – voorbereiden · 1v1 aanvallend – manipuleren · 1v1 verdedigen – controleren | voorbeeld uit het voorstel, nog niet vastgesteld |
| Trainingsopbouw | Bijv. warming-up · vorm 1 · vorm 2 · partij | voorbeeld, nog niet vastgesteld |
| Termen | Bijv. "HJO" in plaats van "hoofd opleiding" | eigen |

- **Voordelen:** het is eerlijk wat zeker is en wat niet. Trainers krijgen geen half werk te zien.
- **Nadelen:** de KNVB-inhoud moet echt nagelopen worden met de officiële documenten. Bij eerdere besluiten was knvb.nl niet bereikbaar vanuit de bouwomgeving.
- **Advies:** het KNVB-bestand vullen vanuit de documenten die jij als HO van de KNVB-opleiding hebt (zoals de hand-outs bij Besluit 99). Jij stelt elk onderdeel vast, en pas dan krijgt het de status *gecontroleerd*.

---

## 3. Hoe een HJO een profiel kiest of aanpast (zie de voorbeeldschermen)

- **Plek:** tabblad Trainers → **Opleidingsprofiel** (HO/TC). Voor een club zonder HO kan de clubbeheerder het vinden onder Regels.
- **Kiezen** (scherm `p-swift.png`): drie keuzes, namelijk *KNVB-standaard*, *Eigen versie op basis van KNVB* of *Helemaal eigen*. Daaronder staat de inhoud met per onderdeel de status. Swift kiest de standaard.
- **Aanpassen** (scherm `p-dcg.png`): per onderdeel *overgenomen* of *eigen*. Wijzigingen komen in een **concept** en bewaren vanzelf (Besluit 103). Trainers zien het pas na **Publiceren**. *Verschil bekijken* laat zien wat er verandert. Bestaande trainingen houden hun versie.
- **Wisselen van profiel** verwijdert niets: oude trainingen, vormen en evaluaties blijven met hun stempel bestaan.
- **Trainer** (scherm `p-trainer.png`): dezelfde vorm, met per profiel een andere leerdoel-koppeling en andere termen.

- **Voordelen:** één plek en één werkwijze (concept → publiceren, zoals bij de kennismaking en het traject in Besluit 99). Je kunt niets per ongeluk kapotmaken.
- **Nadelen:** er komt een extra scherm voor de HO bij. Een profiel helemaal invullen is veel werk.
- **Advies:** zo doen, maar per onderdeel invullen en pas publiceren wat klaar is. Trainers zien lege onderdelen niet. Begin met leerdoelen en termen, want die heeft de vormenbank nodig.

---

## 4. Bestaande oefenvormen koppelen zonder dubbele vormen of gegevensverlies

- **Nu zijn er nog geen oefenvormen in de database.** Het testscherm `/tekenen` bewaart alleen op het eigen toestel. Er hoeft dus niets omgezet te worden. We kiezen het juiste model nu, vóór de eerste vorm bestaat.
- **Eén vorm, meerdere koppelingen:** de vorm blijft één rij (met versies). De koppeling aan leerdoelen staat ernaast. Een tweede profiel voegt een tweede koppeling toe, niet een tweede vorm.
- **Profiel wijzigen of wisselen:** begrippen houden hun vaste id.
  - Een afgeleid profiel erft de ids van zijn basis, dus koppelingen aan KNVB-begrippen blijven gewoon werken.
  - Verwijdert de HO een begrip, dan wordt het *inactief* en niet gewist. Oude koppelingen blijven leesbaar ("leerdoel uit versie 3").
  - Bij een wissel naar een heel ander profiel toont de vormenbank vormen zonder koppeling onder **"Nog niet gekoppeld"**. De HO of trainer koppelt ze opnieuw. Er gaat niets verloren.
- **Clubeigen aanpassing van een gedeelde vorm** = nieuwe versie met `bron: {vormId, versie}`. Het origineel blijft ongewijzigd.
- **Delen tussen clubs** gebeurt alleen bewust: nu via export en import (JSON, met controle en voorbeeld vooraf), later via een gedeelde bibliotheek. Bij het delen gaat de vorm mee, maar **de koppelingen en het profiel niet**. Die zijn van de club.

- **Voordelen:** geen dubbele vormen en niets gaat verloren. Een vorm is bruikbaar onder elke methodiek.
- **Nadelen:** na een wissel van profiel moet er gekoppeld worden. Zoeken op leerdoel vraagt één stap meer in de code (vorm + koppeling).
- **Advies:** zo doen. Bij een wissel kan de app voorstellen doen ("dit KNVB-leerdoel lijkt op jouw leerdoel …"), maar een mens beslist.

---

## 5. Gevolgen voor gebruikersrechten en clubscheiding

**Clubscheiding:** blijft precies zoals hij is. Elke rij hoort bij één club (`club_id`) en de database laat alleen rijen van de eigen club zien (`priv.cc_club()`). Omdat het standaardprofiel een bestand is en geen gedeelde rij, hoeft er **geen enkele uitzondering** in de clubscheiding. Een wijziging bij DCG kan Swift dus technisch niet raken.

**Nieuwe scope (één migratie):** `trainersclub`.
- **Lezen:** iedereen met een staffunctie in de club (trainer, teamleider, coördinator), plus HO, TC en clubbeheerder. **Ouders niet.**
- **Schrijven:** HO/TC en clubbeheerder. Bij vormen ook de auteur (`persoon_id` = ik).
- Gebruikt voor `profiel`, `profielversie`, clubbrede `vorm`/`vormversie` en `vormkoppeling` op clubniveau.

**Bestaande scopes die blijven:** `eigen` (privé-vormen en favorieten), `teamstaf` (teamvormen, trainingsplan, uitvoering, evaluatie).

**Extra regels in de database (bewaker `priv.cc_bewaak`):**
- Een gepubliceerde `profielversie` mag niemand meer wijzigen of verwijderen, ook de HO niet. Alleen een nieuwe versie maken kan.
- De scope wijzigen blijft verboden (zoals nu).

**Nieuwe controles in `priv.rechtentest()`** (vóór het online gaat):
1. Een ouder leest geen profiel of clubvorm.
2. Een trainer leest het profiel, maar wijzigt het niet.
3. De HO publiceert een versie.
4. Niemand wijzigt een gepubliceerde versie.
5. Een gebruiker van club A leest niets van club B (bestaat al, wordt uitgebreid met de nieuwe soorten).
6. Een trainer kopieert een clubvorm naar privé.
7. Een trainer verwijdert de vorm van een ander niet.

**Rollen:** de rechten van bestaande rollen veranderen niet. Er komt alleen de nieuwe scope bij.

- **Voordelen:** kleinste mogelijke wijziging in de rechten (één scope) en geen uitzondering op de clubscheiding. Alles wordt elke nacht getest.
- **Nadelen:** het blijft een rechtenmigratie. Een fout daarin is gevoelig, daarom eerst de controles.
- **Advies:** deze migratie pas doen bij stap 5 (clubbrede bank) uit `trainingsmodule-2.md`. De eerste stappen (laden per soort, privé- en teamvormen) hebben haar niet nodig.

---

## 6. Gevonden: KNVB-regels die al in de code staan
De speelvormen en speelduur per leeftijd (`data.js`, Besluit 60) en de indeling in bouwen (Besluit 100, wel aanpasbaar) staan nu in de code. Dat zijn **competitieregels** van de KNVB, geen opleidingsmethodiek. Ze gelden voor elke club en kunnen dus blijven staan. Advies: niet verplaatsen. Alleen de methodiek (visie, leerdoelen, sjablonen, evaluatie, termen) gaat in het profiel.

## 7. Gevolgen voor de bouwvolgorde (aanvulling op `trainingsmodule-2.md` §6)
1. Laden per soort (onveranderd, eerste stap).
2. Vormen **zonder leerdoelen in de vorm zelf**, met de koppeling als aparte soort (privé en team, bestaande scopes).
3. Profiel als **bestand** (KNVB-standaard, status per onderdeel) dat de app leest. Nog geen database nodig: elke club gebruikt de standaard.
4. Daarna de migratie `trainersclub` + profiel in de database + scherm Opleidingsprofiel voor de HO + clubbrede bank.

- **Advies:** stap 3 vóór stap 4. Dan werkt alles eerst met de standaard (zoals Swift), en pas daarna komt het eigen profiel van DCG.
