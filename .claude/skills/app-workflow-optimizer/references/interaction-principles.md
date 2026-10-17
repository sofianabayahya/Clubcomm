# Interactieprincipes voor HTML-apps

1. **Herkenning boven onthouden:** toon relevante context naast acties; geef begrijpelijke labels.
2. **Progressive disclosure:** toon noodzakelijke informatie eerst, geavanceerde opties op het juiste moment.
3. **Voorkom dubbel werk:** hergebruik bekende waarden alleen als dat verwacht en controleerbaar is.
4. **Slimme standaardwaarden:** standaardwaarden zijn zichtbaar en eenvoudig aanpasbaar, nooit misleidend.
5. **Feedback op elke actie:** onderscheid opslaan, bezig, voltooid, mislukt en offline.
6. **Herstelbaarheid:** voorzie undo waar mogelijk; vraag bevestiging bij onomkeerbare acties.
7. **Validatie:** valideer vroeg genoeg om fouten te voorkomen, maar onderbreek typen niet onnodig; leg fouten in gewone taal uit.
8. **Toegankelijkheid:** semantische HTML, toetsenbord, zichtbare focus, labels, leesbare contrasten, geen uitsluitend kleurgebaseerde status; richt op WCAG 2.2 AA.
9. **Responsive taakgericht:** mobiele schermen prioriteren hoofdacties boven volledige desktopdichtheid.
10. **Beveiliging en privacy:** server-side autorisatie, minimale persoonsgegevens, geen onbedoelde lekken via lijsten, exports of notificaties.
11. **Afspraken en tijdzones:** correcte lokale tijden en expliciete omgang met overlap, no-shows en wijzigingen.
12. **Automatisering met controle:** automatisering is uitlegbaar, instelbaar en eenvoudig te corrigeren.

## Red flags
- Te veel modals achter elkaar; verborgen primaire CTA's; dubbele bevestigingen voor gewone acties; onduidelijke opslagstatus; navigatie zonder terugweg; toestemming of autorisatie gebaseerd op uitsluitend frontend; niet-omkeerbare bulkacties zonder controle.
