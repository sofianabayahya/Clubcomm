# ClubComm — Design system (DESIGN.md)

> De vaste huisstijl van ClubComm voor alle clubs. Vastgelegd in **Besluit NNN** (`docs/besluiten.md`). Bij twijfel geldt het besluit; dit document werkt het uit.
> Voorbeeld om naast te leggen: `docs/onderzoek/merkidentiteit/c21/c21.html` (standaard de gekozen variant: witte navigatie met lichtblauw accent). Beelden: `docs/onderzoek/merkidentiteit/c21/beelden/definitief/`.
> Onderzoek en afwegingen: `docs/onderzoek/merkidentiteit/` (README, `c21/REVIEW.md`, `c21/KLEUR-NAVIGATIE.md`).

## 1. Het merk in één alinea
ClubComm is het vriendelijke, rustige gereedschap van de jeugdvoetbalclub. Je herkent het aan **het bestaande logo** (de bal in een tekstwolk, logo-blauw), **een witte navigatie** waarin het logo het sterkste kleuraccent is, **één eigen letter** en **een functionele voetbalbeeldtaal**: een pion voor "wacht op jou", haltes voor stappen, krijtlijnen tussen regels en de trainingsbalk in minuten. Kleur betekent altijd iets.

**Drie principes**
1. **Actie eerst** (Besluit 30 en 34): wat je moet doen staat bovenaan; informatie is geen taak.
2. **Eén teken, één betekenis**: elke kleur en elke vorm betekent overal hetzelfde (§5).
3. **Vormen dragen informatie, geen versiering**: geen voetbalicoontjes, velden of strepen om het mooi te maken (Principe 10).

## 2. Merklagen: ClubComm en de club
| Laag | Van wie | Wat | Nooit |
|---|---|---|---|
| **ClubComm** | vast, alle clubs | logo, letter, kleuren, componenten, indeling, beweging | — |
| **Club** | per vereniging | **clubembleem** (schildvorm, rechts in de kop en onderaan het menu), clubnaam, **thuis-teken** bij wedstrijden | knoppen, status, menu, letters |

- **Logo:** altijd links, ongewijzigd (`public/assets/clubcomm-logo.jpg`), op wit of licht. Niet op blauw: dan valt het weg (1,6:1).
- **Clubembleem:** altijd rechts, schildvorm met een witte rand, in de clubkleur. Haalt de clubkleur geen 3:1 op wit, dan gebruikt ClubComm een donkerdere tint.
- Geen inhoud uit Spoor 1 (DCG-methodiek) of Spoor 2 (Swift) als ontwerpstandaard.

## 3. Tokens
Als CSS-variabelen in `public/app/app.css`. Waar een waarde al bestaat, blijft de naam bestaan; nieuw is gemarkeerd.

**Kleur**
| Token | Waarde | Gebruik | Nu |
|---|---|---|---|
| `--blauw` | `#0869C2` | doen en kiezen: hoofdknop, gekozen, link (wit erop 5,3:1) | bestaat |
| `--blauw-d` | `#07589F` | ingedrukt, tekst van gekozen items | bestaat |
| `--blauw-logo` | `#0D88F9` | alleen vormen (logo-zone, "vandaag"); nooit kleine tekst (3,4:1) | bestaat |
| `--blauw-l` | `#E7F2FE` | gekozen vlak (menu-item, filter, rij) | bestaat |
| `--inkt` | `#0B2545` | navy: tekst en kleine informatievlakken (melding *Opgeslagen*); **geen** grote navigatievlakken | bestaat |
| `--zacht` | `#4A5B70` | hulptekst (6,9:1 op wit) | **was `#5b6b7f`** |
| `--lijn` | `#D3DEEB` | randen, krijtlijnen | **was `#e3e9f1`** (te licht als scheiding) |
| `--grond` | `#F5F7FA` | werkgebied | bestaat |
| `--vlak` | `#FFFFFF` | navigatie, blokken | bestaat |
| `--pion` | `#EA580C` | de pion "wacht op jou" (3,1–3,6:1 op alle gebruikte achtergronden) | **nieuw** |
| `--oranje` | `#A84D08` | oranje tekst (5,6:1) | bestaat |
| `--groen` | `#137333` | klaar (vinkje), B-blok | bestaat |
| `--rood` | `#DC2626` | fout, afgelast, verwijderen | bestaat |
| `--kaart-oranje` | `#F97316` | blijft voor de afmeldkaarten (Besluit 32); niet voor de pion | bestaat |
| bloksoorten | Start `#94A3B8`, A `#0869C2`, B `#137333`, S `#F5B041`, P `#0B4F7A` | trainingsbalk (`training.js`, `BLOKKLEUR`) | bestaat, wordt variabele |

**Letter, maat en ruimte**
| Token | Waarde |
|---|---|
| `--font` | `'Archivo', system-ui, sans-serif` (**nieuw**, lokaal bestand) |
| Maten | in `rem` (1rem = 16 px), zodat de tekstgrootte van telefoon en browser doorwerkt |
| Ruimte | stappen van .25rem: .25 · .5 · .75 · 1 · 1.25 · 1.5 · 2 |
| `--r` | .625rem voor blokken en het gekozen menu-item; .5rem voor knoppen; 999px alleen voor filterchips |
| Schaduw | alleen tussen navigatie en werkgebied (zacht); blokken krijgen een rand, geen schaduw |

## 4. Typografie
- **Archivo** (variabel: gewicht 400–900, breedte 62–125 %), **lokaal**: `fonts/archivo-latin.woff2` (90 kB, alleen Latijn, `font-display: swap`, licentie OFL). Nooit via Google Fonts (privacy).
- **Koppen:** 800, breedte 110–115 %. Paginatitel 2,25rem (telefoon 1,75rem), bloktitel 1,375rem.
- **Codes en minuten** (A1, 12′): 800, breedte 85 %.
- **Leestekst:** 1rem (16 px), 400; vet 700. Hulptekst ook 1rem, in `--zacht`.
- **Uitzondering:** labels .875rem en menulabels .8125rem. Nooit voor zinnen.
- **Hoofdletters:** nooit als label. Lange woorden mogen afbreken (`overflow-wrap: anywhere`).
- **E-mail:** systeemletter, omdat mailprogramma's eigen letters niet betrouwbaar tonen.

## 5. Kleur en betekenis
| Teken | Betekent | Nooit voor |
|---|---|---|
| Blauwe knop | de hoofdactie (één per scherm) | status, versiering |
| Lichtblauw vlak + blauwe tekst | gekozen (menu-item, tab, filter, rij) | knoppen |
| Oranje pion + woord | wacht op jou | knoppen, "nu", versiering |
| Grijze pion + woord | wacht op een ander | teksten zoals een afspraak |
| Groen vinkje | klaar (Besluit 100) | knoppen |
| Blauwe ring | nu of gepland (Besluit 100) | klaar |
| Grijs | open, nog niet | — |
| Rood | fout, afgelast, verwijderen (altijd met bevestiging) | "wacht op jou" |
| Groen in de balk / in een tekening | B-blok / het veld (bestaand) | status |
| Clubkleur | de club (embleem, thuis-teken) | alles van ClubComm |

**Kleur is nooit het enige signaal:** altijd een woord, een vorm of een streep erbij. Afgelast is ook doorgestreept.

## 6. Indeling
- **Navigatie wit**, het werkgebied lichtgrijs (`--grond`). De scheiding is een rand (`--lijn`) met een zachte schaduw. Geen grote gekleurde navigatievlakken.
- **Telefoon** (tot 900 px): kop (logo links, rol, clubembleem rechts) en een menubalk onderaan met de tabbladen van de rol (zoals nu per rol). Safe area boven en onder.
- **Laptop** (vanaf 900 px): menu links (84 px breed, icoon + woord, logo boven, clubembleem onder). Vanaf 1100 px lijst en detail naast elkaar waar dat al zo is (Besluit 171).
- **Gekozen menu-item:** één afgeronde rechthoek in `--blauw-l` om icoon en woord, met tekst in `--blauw-d`. Geen losse streep ernaast.
- **"Wacht op jou" in het menu:** een kleine pion bij Home, met een woord voor voorleessoftware.
- **Blokken:** één wit vlak per onderwerp met een rand; binnen een vlak gestippelde krijtlijnen tussen de regels. Geen losse kaarten met schaduw.
- **Werkt met 100 items:** lange lijsten krijgen zoeken of een filter (bestaand).

## 7. Componenten
Iconen blijven de bestaande **Lucide**-set (één stijl). Elk component: tikvlak ≥ 44 px, zichtbare focus.

| Component | Vorm | Staten |
|---|---|---|
| **Knop** | hoofd: blauw vlak, witte tekst; tweede: wit met blauwe rand; gevaar: wit met rode rand; stil: blauwe onderstreepte tekst. Hoogte 3rem (in een rij 2,75rem). | gewoon, ingedrukt (1 px omlaag), uit (grijs), bezig ("Bezig…") |
| **Rij** (`h.rij`) | links pion, vinkje of persoon; titel vet, regel eronder in `--zacht`; rechts een pijl als de hele rij tikbaar is. Een rij met knoppen heeft geen pijl. | gewoon, gekozen (lichtblauw), uit |
| **Blok** | wit vlak, rand, kop (titel + aantal) | leeg, laden, fout, klaar (§7b) |
| **Persoon** | rondje met initialen, altijd `--blauw-l` met navy letters | — (status staat ernaast, nooit in het rondje) |
| **Pion** | driehoek in `--pion` (jij) of grijs (ander), altijd met een woord | — |
| **Haltes** | genummerde rondjes met een lijn: groen vinkje = klaar, blauwe ring = nu of gepland, grijs = open (Besluit 100) | ① tot ④ (Besluit 177), traject 1/2 |
| **Trainingsbalk** | dezelfde rekenregel als nu (veldtijd − organisatie = oefentijd), vakken naar minuten in bloksoortkleur, code alleen als het vak breed genoeg is, grijs gestreept = organisatie, oranje gestreept = te veel, donkere streep = einde oefentijd | leeg, geen kalendertijd, te veel, na verplaatsen (*Ongedaan maken*) |
| **Filterchip / tab** | wit met rand; gekozen = lichtblauw vlak met blauwe rand | — |
| **Label** | klein grijs vlak, .875rem; *thuis* met een schildje in clubkleur | — |
| **Melding** (`CC.toast`) | navy, witte tekst, eventueel *Ongedaan maken* | — |

**§7b Staten:**
- **Leeg:** één zin + de knop naar waar je iets kunt doen.
- **Laden:** *Bezig met laden…* + een rustige glans.
- **Fout:** een vriendelijke zin + **Opnieuw**.
- **Klaar:** groen vinkje of de melding *Opgeslagen*.

## 8. Beeldtaal
- **Wel:** de pion, de haltes, de krijtlijnen en de trainingsbalk. Het groene veld **alleen in tekeningen**, waar het echt het veld is.
- **Niet:** decoratieve velden, middencirkels, ballen of streepjes; gradiënten; getallentegels zonder actie; gekleurde strepen links aan blokken.

## 9. Beweging
- **Eén moment:** bij openen lopen de gevulde haltes één keer vol (600 ms).
- **Indrukken:** een knop zakt 1 px (80 ms). Vensters schuiven 220 ms omhoog (bestaand).
- **Beperk beweging:** alles staat meteen stil. Niets in het merk hangt af van beweging.

## 10. Toon en woorden
Korte zinnen, gewone woorden, je spreekt de gebruiker aan. Vaste woorden: *trainer, traject, begeleidingsmoment, vorm, Op het veld, Voorbereiden, Vormen, Seizoen* (Besluit 176). Geen nieuwe woorden voor bestaande dingen.

## 11. Toegankelijkheid (checklist per scherm, uit `docs/app-controle.md`)
- tikvlak ≥ 44 px
- tekstcontrast ≥ 4,5:1, vormen ≥ 3:1
- leestekst 16 px
- **200 % tekst zonder dat iets buiten beeld valt** (getest op 360/390/430)
- safe area
- *Beperk beweging*
- dubbel tikken kan niet
- icoonknoppen hebben een naam
- kleur nooit als enig signaal

## 12. Invoeren en bijhouden
**Invoeren in vijf stappen, elk een eigen pull request** met voor- en na-schermen op 390 px en de volledige test:
1. **Fundament:** tokens (§3), Archivo lokaal, `rem`-maten. Daarna ziet alles er iets anders uit, terwijl de werking hetzelfde blijft. Laadtijd meten (LCP < 2,5 s, niets verspringt).
2. **Bouwstenen:**
   - kop en menu (wit, gekozen item, pion bij Home);
   - `h.rij`, knoppen en chips;
   - nieuw `h.haltes`;
   - de trainingsbalk.
3. **Home-schermen:** HJO/HO, TC, trainer, ouder en teamleider.
4. **Trainers, Teams, Training** (alle vier de tabbladen) en de tekentool.
5. **De rest:** Berichten, Aanwezigheid, Beheer, print en e-mails, plus een controle met 200 % tekst over alle schermen.

**Nieuw component:** eerst hier beschrijven (doel, vorm, staten), dan bouwen. Een afwijking van dit document vraagt een besluit. **Functionele wijzigingen** (zoals F1–F5 in `c21/REVIEW.md`) horen niet bij de huisstijl en krijgen elk een eigen besluit.
