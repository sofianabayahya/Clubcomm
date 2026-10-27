# App-analyse 27 oktober 2026

*Gemeten in de demo op telefoonformaat (390 × 844). "Schermen" = hoe vaak je moet scrollen: 1,0 is één scherm. Dit is een voorstel, geen besluit. Eerdere analyses: `app-analyse-2026-09.md`, de beoordeling van 24-10 (cijfers) en het verbeterplan van 17-10.*

## 1. Metingen per rol

| Rol | Tabbladen | Langste scherm | Opvallend |
|---|---|---|---|
| Ouder | Home · Planning · Vervoer · Berichten · Taken | Taken 1,7 | Home toont het programma én Planning ook: dubbel. Elk tabblad heeft een rood getal én Home heeft dezelfde drie punten onder *Actie nodig* |
| Trainer | Home · Aanwezigheid · Berichten · Spelers · Speeltijd | Speeltijd 1,7 | *Speeltijd* is alleen op een wedstrijddag nodig, maar heeft een vaste plek. Voor de trainingsmodule is geen plek meer |
| Teamleider | Home · Wedstrijd · Berichten · Team | Team 2,3 | Berichten staat op plek 3 (bij de ouder op plek 4, bij HO en coördinator op 5) |
| HO | Home · Trainers · Teams · Inzicht · Berichten | **Inzicht 5,7** (41 knoppen) | Home 2,0 schermen. *Inzicht* is te lang |
| Coördinator | Home · Teams · Planning · Inzicht · Berichten | **Inzicht 4,6** | zelfde Inzicht als de HO |
| Clubbeheerder | Home · Seizoen · Regels · Rollen · Modules | **Regels 6,2** · Rollen 3,2 (49 knoppen) | geen Berichten. Besluit 120 maakt hier *Inrichten* van |

- **Techniek:** 32 losse scripts, samen ± 0,9 MB. De app haalt elke 30 seconden álle gegevens van de club opnieuw op. Dat is goed voor één team, maar niet voor 50 teams (fase 0 in Besluit 121 lost dat op).
- **Fouten tijdens het doorklikken:** geen.
- **Gerepareerd in deze ronde:** bij de HO en de clubbeheerder stond de clubnaam twee keer in de kop. Nu één keer, met een test erbij.

## 2. Wat goed is
- **Actie eerst:** elke Home begint met wat nu moet ("Aanwezigheid opnemen", "Ik neem over"). Afmelden kost 3 tikken.
- **De lagen kloppen:** tabblad → venster → pagina (Besluit 113).
- **Rechten:** elke nacht getest (Besluit 119).
- **Rollen zijn scherp:** de teamleider beoordeelt de trainer niet, de HO ziet geen losse spelers.

## 3. Wat beter kan

### Tabbladen
1. **Dezelfde plek voor hetzelfde:** Home links en Berichten rechts, bij elke rol. Staat al in *Layout naar een 9*.
2. **Trainer: *Speeltijd* weg als vast tabblad.** Op een wedstrijddag kom je er via de wedstrijd op Home al. De wedstrijdpagina opent dan als eigen pagina, en het seizoensoverzicht van de speeltijd verhuist naar *Spelers*. De vrije plek wordt **Training**: aanwezigheid, week en vormenbank (Besluit 121). Zo krijgt de trainingsmodule een plek zonder zesde tabblad.
3. **Ouder: *Planning* en Home overlappen.** Optie: Home toont alleen deze week, Planning de rest. Of Planning gaat op in Home met "Toon meer".

### Signalen (Principe 10: één keer)
4. **Dubbel signaleren:** een rood getal op het tabblad én hetzelfde onder *Actie nodig*. Voorstel: getallen alleen op Berichten (ongelezen). Vervoer en Taken staan al op Home.

### Lange schermen
5. **Inzicht (HO 5,7, coördinator 4,6) en Regels (6,2):** staan al bij *Layout naar een 9*, eerst na 31 oktober.

### Meerdere rollen
6. **Rolwissel:** jij hebt vier rollen (trainer, ouder, HO, clubbeheerder). Nu wissel je via de kop. Optie: één Home met blokken per rol, alleen wat nu aandacht vraagt.

### Efficiëntie
7. **Laden per soort** (fase 0) eerst. Daarna pas de vormenbank.

### Vensters
8. Spelerskaart en trainerkaart zijn vensters (goed). **Een wedstrijd en een training openen nog als pagina.** Op de telefoon is dat prima. Op de laptop kan het een venster in het midden worden, net als de kaarten.

## 4. Vragen aan de initiatiefnemer
1. **Trainer:** mag *Speeltijd* van de tabbalk, zodat **Training** die plek krijgt?
2. **Ouder:** de rode getallen alleen op *Berichten*, of ook op Vervoer en Taken laten staan?
3. **Ouder:** Planning samenvoegen met Home, of Home alleen "deze week"?
4. **Meerdere rollen:** is wisselen via de kop goed genoeg, of wil je één Home voor al je rollen? Bij clubs hebben veel vrijwilligers twee of drie rollen.
5. **Teamleider:** wat doet een teamleider het vaakst in de week? Dan zetten we dat bovenaan Home. Het tabblad Team is nu het langst (2,3).
6. **Na 31 oktober:** wat merk jij zelf bij de eerste wedstrijd? Die ervaring gaat vóór de layout-ronde (pilotlog).
