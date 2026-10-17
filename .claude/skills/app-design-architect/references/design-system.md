# Design system voor taakgerichte HTML-apps

## Richtlijnen
- Gebruik bestaande merkstijl waar beschikbaar; introduceer anders neutrale basis met maximaal één primaire accentkleur.
- Houd spacing consistent op een 4- of 8-punts ritme (bijv. 4, 8, 12, 16, 24, 32).
- Definieer CSS custom properties voor achtergrond, tekst, grens, accent, succes, waarschuwing, fout, radius, schaduw, spacing en fonts.
- Maak onderscheid tussen paginatitel, sectietitel, veldlabel, ondersteunende tekst en metadata.
- Primary button voor hoofdactie, secondary/tertiary voor ondersteunende acties; destructieve actie duidelijk onderscheiden.
- Componentinventaris: app-shell, navigatie, breadcrumbs, filters, zoekveld, tabel/lijst, formulier, kaarten, modal/drawer, tabs, toasts, empty/loading/error states.
- Vraag bij datadichte schermen: kan een tabel, lijst, kalender of tijdlijn beter werken dan een grid van kaarten?
- Ontwerp mobiel niet automatisch door alle desktopkaarten onder elkaar te stapelen: prioriteer informatie en vaste acties waar zinvol.

## Toegankelijkheid
- Semantische HTML en zichtbare focus; muis, aanraking en toetsenbord ondersteunen.
- Zorg voor toegankelijke namen bij buttons, velden en iconen. Gebruik labels die blijven staan.
- Richt op WCAG 2.2 AA: gangbare minimumcontrasten 4,5:1 voor gewone tekst en 3:1 voor grote tekst en essentiële UI-indicatoren waar toepasbaar.
- Niet alleen kleur gebruiken voor status; voeg tekst, vorm of icoon toe.
- Gebruik `aria-live` voor belangrijke asynchrone feedback waar passend; beheer focus bij modals.
- Animatie functioneel houden en `prefers-reduced-motion` respecteren.

## Gedrag en states
Voor ieder interactief onderdeel expliciet bedenken: idle, hover/focus, loading, success, error, disabled en empty. Voorkom dubbele verzending en laat foutmeldingen herstelbaar zijn.
