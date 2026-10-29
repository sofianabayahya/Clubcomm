# Oefenvorm kiezen vanuit een blok in twee tikken (voorstel 29-10-2026)

*Analyse en ontwerp. **Gebouwd op 29-10 als Besluit 137** (met *vorige week ook gedaan*).*

## Hoe het nu werkt (code nagelopen in `public/app/training.js`)
| Stap | Handler | Wat gebeurt er |
|---|---|---|
| Tik op een lege plek (bijv. A2) | `tpOnderdeel` | Venster met minuten, notitie, leerniveau, fase en de knop *Kies een vorm* |
| *Kies een vorm* | `tpVormKiezen` | Lijst van **al je vormen op alfabet**; alleen gefilterd op **aantal spelers** (`past`, `voorAantal`), niet op het leerdoel van het blok |
| Tik op een vorm | `tpVormErbij` → `zetIn` | Vorm in de plek (`vormId`; minuten van het sjabloon blijven, anders de duur van de vorm), `CC.save()` (direct opgeslagen) |
| Laptop: *+* of slepen in *Mijn vormen* | `tpPlaats` → `plekVoor` → `zetIn` | Komt op de eerste lege plek met hetzelfde leerdoel; filters *past bij x* en *A = …* (`pfZet`) |

**Knelpunten:** 3 tikken op de telefoon; de lijst toont niet wat bij A of B past; geen uitleg waarom; geen *ongedaan maken* (alleen opnieuw openen en *Weghalen*); `CC.toast` kent geen knop.

## Ontwerp: twee tikken
1. **Tik op de lege plek** (*Kies oefenvorm*) → het venster **Kies oefenvorm · A2** opent meteen (minuten en notitie via een knop onderaan).
2. **Tik op *Zet in A2*** bij een vorm → klaar, met een melding **In A2 gezet · Ongedaan maken** (8 seconden).

**Wat er in de lijst staat (alleen je eigen vormen, niets verzonnen, niets gedeeld):**
- **Past het best:** vormen met het **leerdoel van het blok** (A of B: `blokDoel`; hoofdleerdoel of *ook*, `koppeling`) én passend bij het **aantal spelers en keepers** (`aantalSp`, `past`, `voorAantal`). Volgorde: aantal past → aanbevolen fase gelijk aan de fase van de plek (`faseVan`) → duur dicht bij de minuten van de plek. Per vorm een paar **redenen** (✓ of oranje), bijv. *A · 1v1 aanvallend ✓ · 10 spelers ✓ · oefenleer (A2 = toepassing)*.
- **Ander aantal spelers:** zelfde leerdoel, maar het aantal past niet. Oranje rand en een duidelijke zin: *"Je hebt er vandaag 10. Bij 10: 5 tegen 5 + 2 keepers op een derde veld"* (uit *minimumvariant* of *Bij dit aantal* van de vorm). De knop heet *Toch in A2 zetten* (trainer beslist; in de training blijft het label *aantal*).
- **Alle vormen:** ingeklapt, met zoeken.
- Start en Partij (geen A/B): eerst vormen van het passende type (warming-up; partij- of wedstrijdvorm), dan de rest.
- Geen passende vorm: *Nog geen vorm voor A · 1v1 aanvallend* met *Nieuwe vorm* (bestaand `vormNieuw`).

**Laptop:** geen venster. Klik op een lege plek: die wordt blauw omrand en de kolom links wordt **Aanbevolen voor A2** met dezelfde kaarten en *Zet in A2*. Slepen blijft werken.

## Voordelen
- Van 3 naar 2 tikken; op de laptop 2 klikken zonder venster.
- Je ziet meteen wat bij het blok past en waarom (ClubComm stelt voor, de trainer kiest: Besluit 121).
- Fouten zijn met één tik terug te draaien.

## Risico's
- **Aanbevelen werkt alleen als vormen een leerdoel hebben.** Vormen zonder leerdoel staan onder *Alle vormen*; de uitleg zegt dat.
- **Weinig vormen** (DCG heeft er nu 5–7): de lijst is soms leeg; dan direct *Nieuwe vorm*.
- **Ongedaan maken** werkt alleen zolang de melding staat; daarna via het venster van de plek (*Weghalen*). Het is al opgeslagen; ongedaan maken slaat opnieuw op.
- **Instellingen van de plek** (minuten, leerniveau) zijn een tik verder weg. Sjabloon-minuten blijven staan, dus meestal hoeft dat niet.

## Benodigde wijzigingen (na akkoord)
1. `training.js`: functie `aanbevolen(S, p, i)` (hergebruikt `blokDoel`, `koppeling`, `aantalSp`, `past`, `voorAantal`, `faseVan`, `typeVan`, `mijnVormen`).
2. Lege plek: `rijHtml` → direct `tpVormKiezen` met `data-i` (in plaats van `tpOnderdeel`); in het venster een knop *Minuten en notitie* (`tpOnderdeel`).
3. `tpVormKiezen` opnieuw opgebouwd (groepen, redenen, *Zet in A2*); `tpVormErbij` bewaart vooraf de oude plek (`vormId`, `min`) voor ongedaan maken.
4. `core.js`: `CC.toast` krijgt een optionele knop (*Ongedaan maken*, 8 seconden, ook goed met *Beperk beweging*).
5. Laptop: geselecteerde plek in `CC.ui.pf.slot`; `bankKolom` toont dan *Aanbevolen voor …*.
6. Tests: twee tikken, filter op leerdoel, oranje melding bij aantal, ongedaan maken, laptop.
**Geen** database- of rechtenwijziging; `vormId`-koppelingen blijven gelijk.

## Besluiten nagelopen
- Past bij Besluit 121 (*ClubComm stelt voor, de trainer kiest*), 128/131/132 (vormen, leerdoel, fase-voorstel, *Mijn vormen* + slepen), 133 (*aantalMin*, *minVariant*), 135 (volgorde Lijn · Plannen · Week · Vormen).
- **Niet in strijd met afgewezen ideeën:** *trainingen die vanzelf klaarstaan of zich aanpassen aan de opkomst* (121) blijft afgewezen: er wordt niets automatisch ingevuld; *methodische fase vast aan een vorm* (131): de fase is alleen een reden, geen regel.
- Gedeelde vormen (clubbank, Besluit 134) staan er pas in na akkoord op de rechten; niets wordt automatisch gedeeld.
