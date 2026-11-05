# Minder klikken: welke techniek waar? (5 november 2026)

*Spoor 3 — ClubComm. Alleen onderzoek: er is niets veranderd aan de app, de database of productie. Gemeten in de demo (verzonnen namen) op een telefoon van 390 × 844 px; `meting.json` en `nu-*.jpg` in deze map.*

## 1. Hoeveel staat er nu op een pagina? (gemeten)

*Woorden* = alles op de pagina; *in beeld* = wat je ziet zonder te scrollen (boven de tabbalk); *schermen* = lengte van de pagina.

| Rol · pagina | Hoe vaak | Woorden | In beeld | Knoppen (in beeld) | Schermen | Oordeel |
|---|---|---|---|---|---|---|
| Ouder · Home | dagelijks | 118 | 108 | 18 (12) | 1,1 | ✅ |
| Ouder · Planning | wekelijks | 147 | 98 | 19 (10) | 1,5 | ✅ |
| Trainer · Home | dagelijks | 131 | 90 | 17 (9) | 1,4 | ✅ |
| Trainer · Aanwezigheid | elke training | 110 | 89 | 29 (20) | 1,4 | ✅ |
| Trainer · Speeltijd | elke wedstrijd | 186 | 106 | 10 (5) | 1,4 | ◐ veel tekst |
| Teamleider · Home | wekelijks | 76 | 69 | 12 (8) | 1,0 | ✅ |
| HJO · Home (club met alles) | dagelijks | 166 | 72 | 24 (13) | 1,9 | ◐ te lang |
| HJO · Inzicht | maandelijks | 115 | 49 | 49 (20) | 1,9 | ◐ veel knoppen |
| HO · Home (pakket, Besluit 166) | dagelijks | 60 | 56 | 9 (5) | 1,0 | ✅ |
| HO · Trainers (pakket) | wekelijks | 204 | 94 | 29 (15) | 1,9 | ◐ |
| HO · Teams (pakket) | per maand | 204 | 86 | 25 (11) | 2,0 | ◐ |
| Trainer in traject · Home | wekelijks | 84 | 80 | 8 (5) | 1,0 | ✅ |
| Beheerder · Seizoen | paar keer per jaar | 369 | 94 | 40 (11) | **3,5** | ✖ te lang |
| Beheerder · Rollen | paar keer per maand | 213 | 59 | **138** (13) | **3,2** | ✖ te lang |

*Meetgrens:* bij Regels telt *in beeld* ook tekst in ingeklapte blokken mee; dat getal is daar niet betrouwbaar.

**Conclusie.** De **dagelijkse pagina's zijn al rustig** (ongeveer 1 scherm, 60–130 woorden). De winst zit bij de **lange lijsten** voor beheer (Seizoen, Rollen, Trainers, Teams) en de HJO-Home van een club die alles gebruikt.

## 2. Voorstel voor een vaste maat (toetsbaar)

| Soort pagina | Woorden in beeld | Hele pagina | Knoppen in beeld |
|---|---|---|---|
| **Home** (dagelijks) | ≤ 90 | ≤ 1 scherm, ≤ 120 woorden | ≤ 10 |
| **Werkpagina** (wekelijks) | ≤ 100 | ≤ 1,5 scherm | ≤ 15 |
| **Beheer** (soms) | ≤ 100 | mag langer, maar **ingeklapt per groep** | ≤ 15 |

**Wat zichtbaar moet zijn:** wat vandaag of deze week actie vraagt, en de knop om dat te doen.
**Wat opgezocht mag worden:** geschiedenis, instellingen, uitleg, lijsten van alle mensen of teams. Opzoeken via zoeken of een uitklapper, nooit via een verborgen menu.

## 3. De technieken, beoordeeld voor ClubComm

Cijfer 1–10 = hoe goed de techniek ClubComm **nu** helpt (minder klikken, zonder dat iets verstopt raakt). Getoetst aan Principe 10 en de vuistregels van Besluit 30 en 34 (actie eerst, elke actie één vaste plek, informatie is geen taak) en aan Besluit 113 (drie lagen: tabblad → venster → pagina).

| # | Techniek | Cijfer | Waar wel | Waar niet / waarom |
|---|---|---|---|---|
| 4 | **Inschuifpaneel (sheet)** | **9** | Al de standaard (Besluit 113). Regel vastleggen: **kijken = venster, werken = pagina**. Nog toepassen: dossier van een trainer eerst als venster met de trainingen erin. | Lange formulieren blijven een pagina. |
| 1 | **Uitklapmenu (accordion)** | **8** | **Rollen** gegroepeerd per rol (*Trainers 15 · Teamleiders 6 · Ouders 120*) met zoeken; **Seizoen** teams per bouw ingeklapt; HJO-Home *Ter informatie* ingeklapt. | Niet voor wat vandaag actie vraagt (dat moet zichtbaar blijven). |
| 3 | **Gesplitst scherm (master-detail)** | **8 (laptop)** · 2 (telefoon) | Laptop vanaf 900 px: **Trainers** (lijst links, dossier rechts), **Berichten**, **Rollen**, **Vormenbank**. Scheelt per item een tik plus *terug*. | Op de telefoon is er geen ruimte; daar blijft lijst → venster. |
| 2 | **Wizard (stappenplan)** | **6** | Alleen voor **zeldzame, vaste volgordes**: *Club inrichten* (teams → schema → wedstrijden → trainers uitnodigen) voor een nieuwe club met het pakket; *Traject starten* (kennismaking → plan → eerste moment). | Niet voor dagelijks werk: een wizard dwingt een volgorde af en kost klikken. Besluit 120 heeft al een startlijst; de wizard zou die vervangen. |
| 3 | **One-page scroll met vaste sprongknoppen** | **5** | Trainingsplan op de telefoon: vaste rij *Start · A · B · Partij* bovenaan om te springen. Seizoen (als het lang blijft). | Niet op Home (die is al één scherm). |
| 2 | **Broodkruimelpad** | **3** | Hoogstens op de laptop in Training (*Lijn › Week › Training*). | ClubComm heeft hoogstens drie lagen; de terugpijl met titel is genoeg. Op de telefoon kost het ruimte. |
| 1 | **Zijbalk** | **2 (telefoon)** · al gebouwd op laptop | Op de laptop staat het menu al links (Besluit 122, 131). | Op de telefoon is de tabbalk onderaan beter: altijd zichtbaar, met de duim bereikbaar. |
| 3 | **Tegellayout (dashboard)** | **2** | Hoogstens *Inzicht* voor de beheerder (staat er al). | Snelknoppen en tegels zijn bewust weggehaald (Besluit 30: dubbel met de tabbalk). Tegels tonen informatie als taak (Besluit 34). |
| 2 | **Carrousel / slider** | **2** | Alleen dagen vegen in de week (de dagknoppen bestaan al). | Wat je wegveegt, zie je niet meer; slecht te vinden en lastig met *Beperk beweging*. |
| 1 | **Hamburgermenu** | **1** | Nergens. | Verstopt de functies: gebruikers vinden ze minder vaak. Strijdig met *elke actie één vaste plek*. De rol wisselen staat al in de kop (Besluit 104). |

## 4. Top 5 om te doen (met mijn cijfer)

| # | Voorstel | Cijfer | Tikken nu → straks | Inspanning | Risico |
|---|---|---|---|---|---|
| 1 | **Rollen per rol ingeklapt + zoeken** (138 knoppen → ±15 in beeld) | 8 | iemand vinden: scrollen 3 schermen → 1 tik (zoeken) | S | laag |
| 2 | **Seizoen: teams per bouw ingeklapt** (3,5 → ±1 scherm) | 8 | team openen: scrollen → 1 tik bouw + 1 tik team | S | laag |
| 3 | **Laptop: lijst en detail naast elkaar** voor Trainers en Berichten (HO werkt vaak op de laptop) | 7 | trainer bekijken: 2 tikken + terug → 1 tik | M | laag |
| 4 | **Wizard *Club inrichten*** voor een nieuwe club met het pakket | 6 | nu verspreid over Teams en Rollen → één pad van 4 stappen | M | middel (dubbel met de startlijst van Besluit 120) |
| 5 | **Sprongknoppen in het trainingsplan** op de telefoon | 5 | naar Partij: 2–3 keer scrollen → 1 tik | S | laag |

**Niet doen:** hamburgermenu, tegels op Home, carrousel, broodkruimels op de telefoon.

## 5. Beslispunten

1. De vaste maat uit hoofdstuk 2 als regel vastleggen (dan meten de tests het voortaan mee)?
2. Welke van de top 5 eerst? Mijn advies: **1 en 2 samen** (klein, groot effect voor de beheerder), daarna **3**.
