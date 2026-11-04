# Eén begeleidingsproces voor trainer en HJO — functioneel ontwerp

*4-11-2026. Spoor 2 (inhoud) + Spoor 3 (software). **Onderzoek en ontwerp, geen bouwopdracht.** Niets gewijzigd aan code, database, rechten of productie. Schermen zijn concepten met verzonnen namen (demo).*

**Uitgangspunt:** de trainersomgeving en het HJO-dashboard ondersteunen **hetzelfde** proces: de KNVB-begeleidingscyclus *Voorbereiding → Planningsgesprek → Praktijk → Reflectiegesprek → Nazorg*. Wat al bestaat, bouwen we niet opnieuw. Het belangrijkste dat ontbreekt, is de **verbinding**: training ↔ begeleidingsmoment ↔ volgend moment.

---

## 1. KNVB-cyclus tegenover de Swift-route en ClubComm

*Bronnen: KNVB HO-opleiding (sheets 7, 14, 15, model "Coachen van de voetbalcoach"); Spoor 2 ronde 5 (zeven stappen, `onderzoek/swift-trainersontwikkeling`); de code van ClubComm.*

| KNVB-fase | Swift-route (ronde 5) | Bestaat in ClubComm | Werkt gedeeltelijk | Ontbreekt | Inhoudelijk nodig | Nieuwe software nodig |
|---|---|---|---|---|---|---|
| **Voorbereiding**: voetbaldoelstelling, persoonlijke doelstelling coach (feed-up), persoonlijke doelstelling HO, tijdsplanning en randvoorwaarden | 1. Basisvoorbereiding trainer | Doel en voetbalprobleem, leerdoel trainer, *Mijn eigen doel als HO*; trainingen in de planner | Het doel van de HO staat in het moment, maar valt weinig op; de training staat los van het moment | **Vorige afspraak** bovenaan; tijdsplanning en randvoorwaarden | De drie doelen apart en zichtbaar: voetbaldoel · leerdoel trainer · doel begeleider | Vorige afspraak tonen (klein); training koppelen aan het moment (zie §5) |
| **Planningsgesprek**: vragenlijst, afspraken over begeleiding en praktijk, inzet staf | 2. Voorfeedback HJO/TJC | Vragenlijst vooraf (trainer), *afspraken uit het gesprek* (focus, moment van feedback) | Voorfeedback bestaat alleen als bericht, niet bij de training | Voorfeedback op de (gedeelde) training; inzet staf | Kort (5 minuten bij een beginner) | Voorfeedback-veld; training delen (§4) |
| **Praktijk**: lezen, analyseren, beïnvloeden; gerichte interventies en coachmomenten | 3. Observatie | A4-observatie (5 KNVB-categorieën, ✓ / ~ / –), notities, leertijdklok | Geen koppeling met de vorige afspraak; geen *oorzaak → gevolg* | **Vorige afspraak teruggezien?**; de zes Swift-criteria (na de pilot) | Elke waarneming met een toelichting; geen cijfers | Teruggezien-keuze + toelichting (§6) |
| **Reflectiegesprek**: **eerst reflectie coach**, feedback HO t.o.v. doelstellingen, gesprekstechnieken, feed-forward, vervolgafspraken | 4. Korte reflectie (direct na de training) · 5. Gesprek naast elkaar | 3 reflectievragen; vier vakken (sterk, ontwikkelpunt, effect, afspraak); de instructie *"laat de trainer eerst vertellen"* | De reflectie komt pas **na** het delen van het verslag, dus na het gesprek | Reflectie vóór het gesprek; feedback per doelstelling | Volgorde KNVB: trainer eerst | Reflectie-aanvraag na de training i.p.v. na delen (statuslogica) |
| **Nazorg**: verslag coach, verslag HO, volgend begeleidingsmoment | 6. Eén ontwikkelafspraak · 7. Opvolging | Verslag delen, terugblik HO (privé), *Volgend moment plannen*, ontwikkelpunt naar het traject | De afspraak wordt bewaard, maar komt **niet terug** bij het volgende moment | Afspraak **afronden / voortzetten / aanpassen**; voortgang zichtbaar voor beide | De lus sluit: nazorg → voorbereiding | Status van de afspraak (§6) |

**Drie doelen blijven apart herkenbaar** (bestaat al als veld, wordt zichtbaar gemaakt):
| Doel | Van wie | Waar het nu staat |
|---|---|---|
| Voetbaldoelstelling | Trainer (vooraf), vastgelegd door de begeleider | `voor.doel` in het moment |
| Persoonlijk leerdoel trainer | Trainer | vragenlijst vooraf, traject `leerdoel` |
| Begeleidingsdoel HJO/TJC | Begeleider | `voor.hoDoel` (*Mijn eigen doel als HO*); terugblik in `begelHoVerslag` (privé) |

---

## 2. De gezamenlijke route

| | Trainer | Gedeeld gegeven | HJO/TJC |
|---|---|---|---|
| 1 | **Mijn volgende training** (Home) | het trainingsmoment uit het rooster | **Weekoverzicht** (Home, PR #108) |
| 2 | **Voorbereiden** in de planner (bestaat) | de training (privé) | Trainer kiezen in de week |
| 3 | **Delen** (één training) | gedeelde versie (§4) | **Gedeelde voorbereiding bekijken** |
| 4 | **Voorfeedback bekijken** | voorfeedback in het moment | **Voorfeedback geven** |
| 5 | Training geven | — | **Observeren** (+ vorige afspraak teruggezien?) |
| 6 | **Reflecteren** (3 vragen, vóór het gesprek) | eigen reflectie (beschermd, 033) | Reflectie lezen vóór het gesprek |
| 7 | Gesprek | — | **Reflectiegesprek**, feedback per doel, feed-forward |
| 8 | **Ontwikkelafspraak** zien (Home) | afspraak + status | **Afspraak opvolgen** bij het volgende moment |

Een beginnende trainer krijgt **geen extra formulier**: bij een bezoek alleen de minimale voorbereiding (voetbalprobleem, doel, oefenvormen) en de 3 reflectievragen. Alles wat hij al in de planner zet, wordt hergebruikt.

---

## 3. Concept: HJO-weekweergave met gedeelde trainingen

![HJO-week, telefoon](1-hjo-week-390.jpg) ![HJO-week, laptop](1-hjo-week-laptop.jpg)

- **Vertrekpunt:** de week van de begeleider (Besluit 146, PR #108). Geen tweede planner: de regels komen uit het bestaande rooster.
- **Per regel, compact:** tijd · team · trainer, met maximaal drie statuslabels en één regel over de open afspraak.
  - *Observatie gepland* / *Geen observatie* / *Observatie afgerond*
  - *Voorbereiding gedeeld* / *Training gedeeld (vrijwillig)* / *nog niet gedeeld*
  - *Voorfeedback van jou verwacht* (alleen als er een observatie is en de voorbereiding is gedeeld)
  - *Reflectie trainer: open / ingevuld*
  - *Open afspraak: … · vorige keer: deels teruggezien*
- Een tik opent het begeleidingsmoment (met de gedeelde training en de vorige afspraak), anders het snelvenster van de trainer.

## 4. Concept: trainersvoorbereiding met delen

![Trainer: voorbereiding delen](2-trainer-delen-390.jpg)

- **Waar:** in de planner (bestaat) en vanaf Home (*Mijn volgende training*).
- **Bij een gepland bezoek:** bovenaan *Je begeleider komt kijken* en een korte lijst *Voor je begeleider*: voetbalprobleem, doel, oefenvormen (verplicht) en zijn ontwikkelafspraak (ter herinnering). Eén knop **Training delen met [begeleider]**.
- **Zonder bezoek:** dezelfde knop, vrijwillig, onder *⋯* in de planner.
- **Delen = een kopie** van deze ene training (*gedeelde versie*), met de oefenvormen en tekeningen die erin staan. De vormenbank en andere trainingen blijven privé. Wijzigt de trainer daarna nog iets, dan ziet de begeleider *er is een nieuwere versie* en kan de trainer opnieuw delen.
- **Wat de begeleider ziet:** voetbalprobleem, teamfunctie en teamtaak (als het profiel ze heeft), doelstelling, oefenvormen, tekeningen, coachaccenten (als ingevuld). **Alleen lezen.** Feedback schrijft hij in het begeleidingsmoment, niet in de training.

## 5. Koppeling met het begeleidingsmoment

![Moment: vorige afspraak en gedeelde training](3-moment-vorige-afspraak-390.jpg)

- **Bestaat al:** een moment verwijst naar een activiteit (`actId`). De training van de trainer verwijst naar dezelfde activiteit. De koppeling is dus al te leggen via de activiteit, zonder nieuw veld.
- **HJO → training:** in het moment *Gedeelde training · gedeeld op … · versie n* met *Training openen*.
- **Trainer → moment:** in de planner en op Home bij die training: *Je begeleider komt kijken*, later *Feedback beschikbaar*.

**Drie versies, uit elkaar gehouden:**
| Versie | Wat | Van wie | Verandert? |
|---|---|---|---|
| Actuele voorbereiding | de training in de planner | trainer, privé | ja, altijd |
| Gedeelde versie | kopie bij *Delen* | trainer deelt | alleen door opnieuw delen |
| Vastgelegde versie | kopie die bij de observatie hoort (op het moment dat de praktijk begint of het verslag wordt gedeeld) | hoort bij het begeleidingsmoment | nee |

**Beleidsbesluit nodig: wat gebeurt er als de trainer het delen intrekt?** (geen automatische keuze)
| Optie | Gedeelde versie | Vastgelegde versie bij een observatie | Voordeel | Nadeel |
|---|---|---|---|---|
| A | verdwijnt | **blijft** bij het verslag, tot het einde van het traject of seizoen | het verslag blijft begrijpelijk | de trainer kan zijn eigen tekst niet helemaal terugnemen |
| B | verdwijnt | verdwijnt; het verslag houdt alleen probleem en doel | trainer houdt volledige zeggenschap | het verslag mist de vormen waarover het gesprek ging |
| C | intrekken kan **alleen vóór** de observatie | blijft | duidelijk voor beide | minder vrijheid voor de trainer |

Advies voor de bespreking: **A of C**, met een vaste bewaartermijn (bijvoorbeeld tot het einde van het seizoen) in het privacybeleid. Dit is een keuze voor de club, met een privacytoets.

## 6. De terugkerende ontwikkelafspraak

![Trainer: mijn ontwikkelafspraak](4-trainer-afspraak-390.jpg)

1. **Voorbereiding (HJO):** bovenaan het nieuwe moment *Vorige afspraak (datum): …* (automatisch uit het vorige moment met een afspraak).
2. **Praktijk of direct erna (HJO):** *Teruggezien · Gedeeltelijk · Nog niet · Niet beoordeeld* + één zin: *welk gedrag was waarneembaar?*
3. **Na het reflectiegesprek (HJO, samen):** de afspraak is **afgerond**, **voortgezet** of **aangepast** (dan met de nieuwe tekst).
4. **Zichtbaar voor beide:** de trainer ziet op Home *Mijn ontwikkelafspraak* met de laatste stand; de HJO ziet het in de week en het snelvenster (*vorige afspraak → teruggezien → volgende stap*).

**Gegevens:** past in het bestaande begeleidingsmoment (scope `trainerdossier`: de begeleider schrijft, de trainer leest). Nieuw in de inhoud: `vorigeAfspraak { vanMoment, tekst, teruggezien, toelichting, op }` en `afspraakStatus`. **Geen nieuw recht, geen migratie.**

*Opmerking:* "teruggezien tijdens een volgende training" kan alleen worden vastgelegd als de begeleider er is. Tussen twee bezoeken in is het hoogstens de eigen inschatting van de trainer (optioneel, later).

---

## 7. Rechtenmatrix (voorstel, risicoklasse L — apart besluit)

**Nu** = productie (migraties t/m 031; 032 en 033 niet toegepast). **Voorstel** = wat dit ontwerp vraagt.

| Gegeven | Trainer zelf | HJO/TJC in werkgebied | HJO/TJC buiten werkgebied | Clubbeheerder zonder begeleidersrol | Andere trainer | Andere club |
|---|---|---|---|---|---|---|
| Rooster (datum, tijd, tegenstander) | lezen + schrijven (eigen team) | **Nu:** lezen, hele club · **Voorstel:** lezen, eigen werkgebied | **Nu:** lezen · **Voorstel:** nee | lezen + schrijven | eigen team | nee |
| Persoonlijke voorbereiding (planner) | eigenaar | nee | nee | nee | nee | nee |
| Privé-oefenvormen (vormenbank) | eigenaar | nee | nee | nee | nee | nee |
| **Gedeelde versie** van één training (nieuw) | eigenaar, kan intrekken | **lezen** | nee | nee | nee | nee |
| **Vastgelegde versie** bij een observatie (nieuw) | lezen | lezen (schrijft bij het vastleggen) | nee | nee (open vraag) | nee | nee |
| Voorfeedback en begeleidingsverslag (moment) | lezen | lezen + schrijven | **Nu:** ook · **Voorstel:** nee | **Nu:** ja · **Met 033:** nee | nee | nee |
| Eigen reflectie trainer | eigenaar | lezen | **Nu:** lezen · **Voorstel:** nee | **Nu:** ja · **Met 033:** nee | nee | nee |
| Werkaantekening begeleider | nee | eigen bouw (bestaat) | nee (bestaat) | nee | nee | nee |
| Vorige afspraak + teruggezien | lezen | lezen + schrijven | **Voorstel:** nee | **Met 033:** nee | nee | nee |

**Wat er nu niet klopt met de uitgangspunten** (gevonden in de migraties):
1. **TJC-werkgebied wordt in de database niet afgedwongen.** `priv.cc_begeleider()` geldt voor élke HO of TC in de club. Alleen de werkaantekeningen (`hoprive`) kijken naar de bouw. Dossiers, reflecties en het rooster zijn dus clubbreed leesbaar voor elke begeleider; de beperking per bouw zit alleen in de schermen.
2. **Voorstel 032 opent te veel.** Met `trainerplan` ziet een begeleider **alle** trainingen van een trainer met een traject, zodra de club meekijken aanzet. Het uitgangspunt is nu: **alleen wat expliciet gedeeld is**. Daarnaast heeft 032 het eerder gevonden gat (*Scope wijzigen mag niet* bij bestaande trainingen).
3. **Zonder 033** kan een HO de reflectie van een trainer wijzigen, en kan een clubbeheerder zonder begeleidersrol dossiers lezen.

**Voorstel voor het technische ontwerp (later, L):**
- **Delen als kopie-rij** (nieuwe soort, bijvoorbeeld `gedeeldeTraining`, eigenaar = trainer, nieuwe scope *gedeeld met begeleiders in het werkgebied*). Intrekken = die rij verwijderen. Geen scope-wijziging van bestaande rijen nodig (dus geen botsing met `cc_bewaak`). Vormen in de training gaan als inhoud mee in de kopie; de vormenbank blijft `eigen`.
- **Werkgebied in de database:** een functie *is deze persoon begeleider van deze trainer* (rol HO/TC én de bouw van het team van de trainer in de bouwen van de rol; leeg = hele club). Te gebruiken voor rooster, dossier, reflectie en de gedeelde training.
- **Clubscheiding** blijft via `club_id` en `priv.cc_club()` (bestaat, getest).
- **Testen** zoals bij 033: lokale rechtentest, met personen in en buiten het werkgebied, een clubbeheerder zonder rol, een andere club.

---

## 8. Wat bestaat en wat werkelijk nieuw is

| Onderdeel | Bestaat | Aanpassen | Nieuw |
|---|---|---|---|
| Vijf fasen in het begeleidingsmoment | ✓ | | |
| Voetbaldoel, leerdoel trainer, doel HO, terugblik HO | ✓ | beter zichtbaar (drie doelen apart) | |
| Vragenlijst vooraf, observatie, vier vakken, verslag delen, volgend moment | ✓ | | |
| Week van de begeleider | PR #108 (open) | statuslabels per regel | |
| Mijn volgende training (trainer) | | demo-ontwerp | Home-indeling (presentatie) |
| Vorige afspraak + teruggezien + afronden/voortzetten/aanpassen | | | ✓ (in het bestaande moment, geen nieuw recht) |
| Reflectie vóór het gesprek | ✓ (3 vragen) | moment van vragen (na de training) | statuslogica |
| Training delen (één training, kopie) | | | ✓ **nieuw recht (L)** |
| Vastgelegde versie bij observatie | | | ✓ + **beleidsbesluit intrekken** |
| Voorfeedback bij de gedeelde training | als bericht | | veld in het moment |
| TJC/HO-werkgebied in de database | alleen werkaantekeningen | | ✓ **(L)** |
| Zes Swift-criteria in de observatie | | | na de pilot (Spoor 2) |

## Afhankelijkheden en voorgestelde volgorde

| | Wat | Hangt af van |
|---|---|---|
| 0 | **033** toepassen (trainersreflectie beschermd) | eigen akkoord; basis voor *door jou* |
| 1 | **PR #108** (week van de begeleider) | eigen akkoord; basis voor §3 |
| 2 | **Vorige afspraak**-lus (§6) | 1 (voor de week); geen nieuw recht |
| 3 | Reflectie vóór het gesprek | Spoor 2 akkoord op de volgorde; 0 |
| 4 | **Rechtenvoorstel (L):** delen als kopie + werkgebied in de database; **vervangt 032** | 0; beleidsbesluit intrekken (§5) |
| 5 | Delen en voorfeedback in de app | 4 |
| 6 | Zes Swift-criteria | pilot Spoor 2 |

**Open beslissingen voor de initiatiefnemer:**
1. Intrekken na een observatie: optie A, B of C (§5), en de bewaartermijn.
2. Mag een clubbeheerder zonder begeleidersrol de vastgelegde versie zien? (advies: nee)
3. Wordt 032 vervangen door *delen als kopie*? (advies: ja)
4. Reflectie vóór het gesprek: schriftelijk direct na de training (ronde 5, keuze B), of mondeling aan het begin van het gesprek?
