# Plan van aanpak: van pilot naar product (10 oktober 2026)

*Werkdocument van de ClubComm-adviseur. Volgt de afspraken in `docs/besluiten.md` (principe 10: overzichtelijk en precies, nooit een overkill). Wat af is, vinken we af in Openstaand (`docs/productie-en-groei.md`).*

## De logica
Elke stap bouwt op de vorige. Een document maken over iets dat nog verandert, is dubbel werk.

```
A. Product af  ──►  B. Product beschrijven  ──►  C. Prijs en groei  ──►  D. Verkopen  ──►  E. Invoeren bij een club
 (app, schaal)       (handboek, overzicht)        (kosten, model)        (pitch, demo)       (handleidingen per rol)
```

**Vaste data:** fase 2 met wedstrijden start **za 31 oktober** · **december** terugkijken met de pilot · **januari 2027** SCPB erbij (Besluit 84).

---

## A. Product af: de app klaar voor een hele club
**Doel:** de app werkt net zo goed voor 1 team als voor **50 teams, 800 spelers en 60 trainers**, voor elke rol.

### A1. Pilot met wedstrijden (nu t/m november)
- Generale repetitie, dan fase 2 in het echt; fouten in `pilotlog.md`, verbeteringen als besluit.
- Sportlink-koppeling (sleutel via DCG, alleen in het dashboard).

### A2. De app op schaal (de analyse)
De app is gebouwd en getest met één team. Hieronder wat er gebeurt bij een club van 50 teams.

**Achterkant (database en server)**
| Wat nu | Probleem bij 50 teams | Oplossing |
|---|---|---|
| De app haalt elke 30 s **alle** gegevens op (DCG nu 70 kB) | HO en clubbeheerder zien alles: 10–20 MB per keer eind seizoen. Te zwaar voor telefoon en abonnement. | **Alleen wijzigingen ophalen** (sinds het laatste tijdstip, of Supabase Realtime). Eén keer alles bij het openen. |
| Alles van het hele seizoen staat in het geheugen | Groeit elke week (aanwezigheid, berichten) | **Per seizoen laden**; oude seizoenen alleen opvragen bij Inzicht of de spelerpagina. |
| De automaat rekent elk kwartier de hele club door | Bij veel clubs te traag binnen het kwartier | **Per club** laten lopen, verdeeld over het kwartier. |
| E-mail via het gratis plan (300 per dag) | Eén noodbericht aan een hele club is al 600 mails | Betaald plan bij Brevo **vóór de eerste grote club**. |
| Eén club in de database | Meer clubs, één persoon soms bij twee clubs | **Rol boven de clubs** (ClubComm-adviseur) en één account bij meerdere clubs (Besluit 84). |

**Voorkant (schermen)**
| Scherm | Bij 2 teams | Bij 50 teams | Oplossing |
|---|---|---|---|
| Teams (HO, coördinator) | Korte lijst | Lange lijst | Per **bouw of lichting** ingeklapt, met een teller; zoeken; eerst wat aandacht vraagt. |
| Te doen (HO, coördinator) | Een paar regels | Tientallen | **Gebundeld per soort** ("4 trainers met een signaal"); tik opent de lijst. Nooit 50 losse regels. |
| Rapport Trainers (HO, nieuw) | 2 trainers | 60 trainers | Per lichting en team, in- en uitklapbaar (Besluit 95); alleen wie aandacht vraagt open. |
| Inzicht | Eén blok per team | 50 blokken | Eerst de club, dan per bouw, dan per team (drie lagen). |
| Berichten van de staf | Paar per week | Veel | "Ter informatie" blijft ingeklapt en telt niet als nieuw (Besluit 57); de HO krijgt geen organisatiemeldingen (Besluit 95). |
| Staf, ouders, spelers zoeken | Scrollen | Onmogelijk | Altijd een zoekveld bovenaan. |

**Hoe we het bewijzen:** een **grote democlub** (verzonnen, 50 teams) als testdata. De automatische tests meten dan per rol:
- hoe lang het openen duurt;
- hoeveel er wordt opgehaald;
- hoe lang elk scherm wordt.

Een scherm dat te lang wordt, is een fout, net als een foutmelding. Dit wordt een vaste toets: *"werkt dit scherm met 50 teams?"*

### A3. HO afbouwen (Besluit 95)
- **Stap 2:** Home van de HO en rapport Trainers, meteen ontworpen voor 50 teams.
- **Stap 3:** signaal "geen aanwezigheid opgenomen".
- **Stap 4:** module Trainers begeleiden. Het evaluatieformulier gaat dan van `/evaluatie` de app in.
- **Later:** technisch coördinator per bouw.

### A4. Kwaliteit en papierwerk (uit de beoordeling van 27-09)
- **Inlogduur instellen.** Besluit 1 zegt 30 dagen voor de HO, maar dat is niet ingebouwd.
- **Testen op een echte iPhone en in Safari.**
- **Meten welke functies gebruikt worden.** Alleen tellen, zonder persoonsgegevens (de beoordeling gaf hier een 3).
- **AVG:**
  - verwerkersovereenkomsten (Supabase, Vercel, Brevo);
  - risicoanalyse (DPIA);
  - verwerkersovereenkomst met de club.

**Klaar als:** elke rol op de lijst "product af" groen staat, ook in de grote democlub.

---

## B. Product beschrijven (de bron)
- ✅ **Productoverzicht** "Wat kan ClubComm" (PowerPoint, 17 dia's).
- **Handboek voor de ClubComm-adviseur:** de volledige uitleg van de app, met inleiding en hoofdstukken:
  1. idee en principes;
  2. rollen en de twee lijnen;
  3. per rol alle schermen;
  4. wat de app zelf doet;
  5. regels en instellingen;
  6. signalen en opschaling;
  7. berichten;
  8. privacy en techniek;
  9. inrichten van een club;
  10. veelgestelde vragen.

  Bijgewerkt na A3, zodat het klopt.

---

## C. Prijs en groei
- **Kosten op een rij** bij 1, 10 en 50 clubs: Supabase, Vercel, Brevo, domein, verzekering, en **de tijd van de ClubComm-adviseur per club** (inrichten, aanleren, bellen).
- **Verdienmodel kiezen** (voorstel: `docs/onderzoek/verdienmodel-2026-09.md`). Dan besluit en één prijsblad. Voor de pilotclubs geldt al: gratis tot de zomer van 2027.
- **Groeiplan:**
  - hoeveel clubs kan één adviseur aan;
  - wanneer komt er een stappenplan waarmee clubs het zelf doen (Besluit 84: pas bij veel clubs);
  - wanneer is er een tweede adviseur nodig.

---

## D. Verkopen
- **Spoorboekje eerste gesprek** (PowerPoint, voor de ClubComm-adviseur):
  1. het verhaal;
  2. de piramide van rollen;
  3. demo: wat laat je wanneer zien;
  4. de vragen uit het stappenplan (`taken-per-rol.md` §6);
  5. de prijs;
  6. de afspraken.
- **Bestuurspitch:** PowerPoint, plus een **demo-PDF** met schermafbeeldingen voor wie niet kan kijken. Gemaakt uit de bestaande kennismaking (`maak.js clubs`).
- **Demo bijwerken:** de coördinator en de HO in de rondleiding (Besluit 89), zodat de twee lijnen te zien zijn.

## E. Invoeren bij een club
- **Handleidingen per rol** als PowerPoint (ook als PDF):
  - ouder, trainer, teamleider (bestaan al, bijwerken);
  - nieuw: coördinator, HO en clubbeheerder.
- **Inrichtingslijst** voor de clubbeheerder.
- **Evaluatie na vier weken** (stap 9 van het stappenplan).

---

## Volgorde en planning
| Wanneer | Wat |
|---|---|
| **Nu – 31 okt** | A1 (wedstrijden voorbereiden) · A2 schaalanalyse en grote democlub · A3 stap 2 (HO-Home en rapport Trainers, voor 50 teams) |
| **November** | A1 fase 2 in het echt · A2 alleen wijzigingen ophalen, per seizoen laden · A3 stap 3 en 4 · A4 |
| **Begin december** | B handboek · C kosten en prijs (besluit) |
| **December** | Terugkijken met de pilot · A2 rol boven de clubs · D spoorboekje, bestuurspitch, demo |
| **Januari 2027** | E handleidingen per rol · SCPB inrichten met het spoorboekje |

## Open vragen
Zie de lijst in het gesprek van 10 oktober. De antwoorden komen als besluit in `besluiten.md`.
