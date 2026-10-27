// ClubComm — tekentool voor oefenvormen (trainingsmodule, stap 3). Overgenomen uit de ART-app van de initiatiefnemer
// (repo sofianabayahya/art-spelersvolgsysteem, index.html, blok "var DrawTool"), met dank. Vanilla JS + SVG, geen libraries.
// Geeft DrawTool.open(initial, onSave) en DrawTool.staticSvg(json). onSave(blob, data): blob = JPEG, data = { field, items, zoom }.
// Nodig in de pagina: de markup van #drawOverlay (zie tekenen.html) en tekentool.css. Zie docs/trainingsmodule.md.
(function () {
  var esc = (window.CC && window.CC.esc) || function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var showToast = function (t) { if (window.CC && window.CC.toast) window.CC.toast(t, 'fout'); else window.alert(t); };
  window.DrawTool = (function(){
    var FIELDS = {
      liggend: { w: 1050, h: 680, label: "11x11 liggend" },
      staand:  { w: 680, h: 1050, label: "11x11" },
      f8:      { w: 520, h: 740, label: "8x8" },
      f6:      { w: 420, h: 580, label: "6x6" },
      half:    { w: 680, h: 525, label: "Half veld" },
      vak:     { w: 800, h: 560, label: "Vak" }
    };
    var SHIRT = { oranje: "#F57C00", blauw: "#1E4FD8", geel: "#F2C200", zwart: "#1A1A1A" }; // oude tekeningen
    // Spelers: 4 kleuren in 2 vormen (rondje/driehoek), plus trainer (T) en keeper (K). Tekstkleur voor leesbaarheid.
    var TEAM = {
      rood:       { shape: "c", fill: "#E53935", ink: "#fff" },
      lichtblauw: { shape: "c", fill: "#8FD3F0", ink: "#0b2230" },
      geel:       { shape: "t", fill: "#F2D100", ink: "#1a1400" },
      blauw:      { shape: "t", fill: "#1E88E5", ink: "#fff" },
      trainer:    { shape: "t", fill: "#1A1A1A", ink: "#fff", letter: "T" },
      keeper:     { shape: "t", fill: "#1A1A1A", ink: "#fff", letter: "K" }
    };
    // Trainingshoedjes (ø 30 cm) in de kleuren die ART gebruikt; oude pionnen zonder kleur worden oranje.
    var HAT = { oranje: "#F26A1B", blauw: "#1F4FD1", rood: "#D91E1E", geel: "#F5D90A", groen: "#4CD137", roze: "#E91E8C" };
    function hatSvg(c, k){
      k = k || 1;
      var f = HAT[c] || HAT.oranje, m = function(n){ return Math.round(n * k * 10) / 10; };
      return '<path d="M ' + m(-14) + ' ' + m(7) + ' Q 0 ' + m(10.5) + ' ' + m(14) + ' ' + m(7) + ' L ' + m(3.2) + ' ' + m(-10) + ' Q 0 ' + m(-11.5) + ' ' + m(-3.2) + ' ' + m(-10) + ' Z" fill="' + f + '" stroke="rgba(0,0,0,.4)" stroke-width="1"/>' +
        '<path d="M ' + m(-9.5) + ' ' + m(1) + ' Q 0 ' + m(3.5) + ' ' + m(9.5) + ' ' + m(1) + '" stroke="rgba(0,0,0,.22)" stroke-width="1" fill="none"/>' +
        '<ellipse cx="' + m(-5) + '" cy="' + m(4.6) + '" rx="' + m(1.9) + '" ry="' + m(2.2) + '" fill="rgba(255,255,255,.9)"/>' +
        '<ellipse cx="' + m(5) + '" cy="' + m(4.6) + '" rx="' + m(1.9) + '" ry="' + m(2.2) + '" fill="rgba(255,255,255,.9)"/>' +
        '<ellipse cx="0" cy="' + m(-2.5) + '" rx="' + m(1.5) + '" ry="' + m(1.7) + '" fill="rgba(255,255,255,.85)"/>';
    }
    // Bal: wit met zachte naden en schaduw.
    function ballSvg(k){
      k = k || 1;
      var r = 7 * k;
      return '<circle r="' + r + '" fill="#fff" stroke="#1a1a1a" stroke-width="' + (1.4 * k) + '"/>' +
        '<path d="M ' + (-r * 0.35) + ' ' + (-r * 0.45) + ' L ' + (r * 0.35) + ' ' + (-r * 0.45) + ' L ' + (r * 0.55) + ' ' + (r * 0.15) + ' L 0 ' + (r * 0.55) + ' L ' + (-r * 0.55) + ' ' + (r * 0.15) + ' Z" fill="none" stroke="#b9b9b9" stroke-width="' + (0.9 * k) + '"/>' +
        '<path d="M ' + (-r * 0.55) + ' ' + (r * 0.62) + ' A ' + r + ' ' + r + ' 0 0 0 ' + (r * 0.62) + ' ' + (r * 0.5) + '" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="' + (1.6 * k) + '"/>';
    }
    var DISH = { wit: "#F4F4F4", geel: "#F2C200", oranje: "#F57C00", roze: "#E0409A", rood: "#D91E1E" };
    var TOOLS = [
      { group: "Spelers", items: [
        { t: "p", c: "rood", label: "Speler rood (rondje)", key: "1" }, { t: "p", c: "lichtblauw", label: "Speler lichtblauw (rondje)", key: "2" },
        { t: "p", c: "geel", label: "Speler geel (driehoek)", key: "3" }, { t: "p", c: "blauw", label: "Speler blauw (driehoek)", key: "4" },
        { t: "p", c: "trainer", label: "Trainer", key: "T" }, { t: "p", c: "keeper", label: "Keeper", key: "K" } ] },
      { group: "Spullen", items: [
        { t: "ball", label: "Bal", key: "B" }, { t: "hatzone", label: "Vak met hoedjes: sleep een rechthoek, op elke hoek komt een hoedje (kleur van het laatst gekozen hoedje)", key: "V" },
        { t: "cone", c: "oranje", label: "Hoedje oranje" }, { t: "cone", c: "blauw", label: "Hoedje blauw" },
        { t: "cone", c: "rood", label: "Hoedje rood" }, { t: "cone", c: "geel", label: "Hoedje geel" },
        { t: "cone", c: "groen", label: "Hoedje groen" }, { t: "cone", c: "roze", label: "Hoedje roze" },
        { t: "dish", c: "wit", label: "Schijfje wit" }, { t: "dish", c: "geel", label: "Schijfje geel" },
        { t: "dish", c: "oranje", label: "Schijfje oranje" }, { t: "dish", c: "roze", label: "Schijfje roze" }, { t: "dish", c: "rood", label: "Schijfje rood" },
        { t: "goal", s: "M", label: "Pupillendoel (5x2 m)", key: "D" }, { t: "goal", s: "S", label: "Minidoel (2x1 m)", key: "M" },
        { t: "board", label: "Kaatsbord" } ] },
      { group: "Pijlen en lijnen", items: [
        { t: "arrow", k: "run", label: "Loopactie (stippel)", key: "L" }, { t: "arrow", k: "pass", label: "Pass", key: "P" },
        { t: "arrow", k: "dribble", label: "Dribbel", key: "R" }, { t: "arrow", k: "shot", label: "Schot", key: "S" },
        { t: "wall", label: "Muur / lijn" } ] },
      { group: "Volgorde en markeren", items: [ { t: "num", label: "Nummer" }, { t: "zone", label: "Vak markeren" }, { t: "text", label: "Tekst (bv. 5P)" } ] }
    ];
    var st = null; // { field, items, tool, sel, drag, undo, onSave, num, vormen }
    // Besluit 125: per tekening kiezen welk team een rondje of een driehoek is ({ rood: "t", geel: "c" }); trainer en keeper blijven driehoek.
    function vormVan(c){ var tm = TEAM[c] || TEAM.rood; return !tm.letter && st && st.vormen && st.vormen[c] ? st.vormen[c] : tm.shape; }
    // Besluit 125: de nummerbalk in- en uitklappen (onthouden op dit apparaat)
    var nrDicht = (function(){ try { return localStorage.getItem("cc-draw-nummers") === "dicht"; } catch(e){ return false; } })();
    var lastHat = "oranje"; // kleur voor "Vak met hoedjes" en sneltoets H
    function flatTools(){ var flat = []; TOOLS.forEach(function(g){ flat = flat.concat(g.items); }); return flat; }
    function isDragTool(t){ return /arrow|wall|zone|hatzone/.test(t.t); }

    function el(id){ return document.getElementById(id); }
    function svgPt(evt){
      var svg = el("drawSvg"), pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      var p = pt.matrixTransform(svg.getScreenCTM().inverse());
      return { x: Math.round(p.x), y: Math.round(p.y) };
    }
    function snapshot(){ st.undo.push(JSON.stringify({ field: st.field, items: st.items })); if (st.undo.length > 60) st.undo.shift(); st.redo = []; }

    function fieldSvg(){
      var f = FIELDS[st.field], w = f.w, h = f.h, s = "", n = 10, i;
      var vertical = st.field === "staand" || st.field === "f8" || st.field === "f6";
      for (i = 0; i < n; i++){
        var c = i % 2 ? "#5DAE5F" : "#67B769";
        s += vertical ? '<rect x="0" y="' + (h / n * i) + '" width="' + w + '" height="' + (h / n + 1) + '" fill="' + c + '"/>'
                      : '<rect x="' + (w / n * i) + '" y="0" width="' + (w / n + 1) + '" height="' + h + '" fill="' + c + '"/>';
      }
      var L = 'stroke="#fff" stroke-width="3" fill="none" opacity=".9"', m = 20;
      s += '<rect x="' + m + '" y="' + m + '" width="' + (w - 2 * m) + '" height="' + (h - 2 * m) + '" ' + L + '/>';
      if (st.field === "liggend"){
        s += '<line x1="' + w / 2 + '" y1="' + m + '" x2="' + w / 2 + '" y2="' + (h - m) + '" ' + L + '/><circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="90" ' + L + '/>' +
          '<rect x="' + m + '" y="' + (h / 2 - 200) + '" width="160" height="400" ' + L + '/><rect x="' + (w - m - 160) + '" y="' + (h / 2 - 200) + '" width="160" height="400" ' + L + '/>' +
          '<rect x="' + m + '" y="' + (h / 2 - 90) + '" width="55" height="180" ' + L + '/><rect x="' + (w - m - 55) + '" y="' + (h / 2 - 90) + '" width="55" height="180" ' + L + '/>';
      } else if (vertical){
        // 11x11, 8x8 en 6x6 staand: zelfde opbouw, geschaald naar de veldmaat.
        var cr = st.field === "staand" ? 90 : (st.field === "f8" ? 62 : 48);
        var pbw = Math.round((w - 2 * m) * 0.62), pbh = Math.round(h * 0.155), gaw = Math.round((w - 2 * m) * 0.28), gah = Math.round(h * 0.052);
        s += '<line x1="' + m + '" y1="' + h / 2 + '" x2="' + (w - m) + '" y2="' + h / 2 + '" ' + L + '/><circle cx="' + w / 2 + '" cy="' + h / 2 + '" r="' + cr + '" ' + L + '/>' +
          '<rect x="' + (w / 2 - pbw / 2) + '" y="' + m + '" width="' + pbw + '" height="' + pbh + '" ' + L + '/><rect x="' + (w / 2 - pbw / 2) + '" y="' + (h - m - pbh) + '" width="' + pbw + '" height="' + pbh + '" ' + L + '/>' +
          '<rect x="' + (w / 2 - gaw / 2) + '" y="' + m + '" width="' + gaw + '" height="' + gah + '" ' + L + '/><rect x="' + (w / 2 - gaw / 2) + '" y="' + (h - m - gah) + '" width="' + gaw + '" height="' + gah + '" ' + L + '/>';
      } else if (st.field === "half"){
        s += '<rect x="' + (w / 2 - 200) + '" y="' + m + '" width="400" height="160" ' + L + '/><rect x="' + (w / 2 - 90) + '" y="' + m + '" width="180" height="55" ' + L + '/>' +
          '<path d="M ' + (w / 2 - 90) + ' ' + (h - m) + ' A 90 90 0 0 1 ' + (w / 2 + 90) + ' ' + (h - m) + '" ' + L + '/>';
      }
      return s;
    }
    // Besluit 126: een pijl mag een boog hebben (controlepunt cx, cy; kwadratische bezier). Punt op de lijn bij t (0..1).
    function punt(it, t){
      var u = 1 - t;
      return it.cx == null ? { x: it.x1 + (it.x2 - it.x1) * t, y: it.y1 + (it.y2 - it.y1) * t }
        : { x: u * u * it.x1 + 2 * u * t * it.cx + t * t * it.x2, y: u * u * it.y1 + 2 * u * t * it.cy + t * t * it.y2 };
    }
    function lijnD(it){ return it.cx == null ? "M " + it.x1 + " " + it.y1 + " L " + it.x2 + " " + it.y2 : "M " + it.x1 + " " + it.y1 + " Q " + it.cx + " " + it.cy + " " + it.x2 + " " + it.y2; }
    // Dribbel als golflijn langs de (eventueel gebogen) lijn; de laatste 22 punten recht, voor de pijlpunt.
    function wavyIt(it){
      var N = 60, pts = [{ p: punt(it, 0), l: 0 }], len = 0, i, j = 1;
      for (i = 1; i <= N; i++){ var q = punt(it, i / N), v = pts[i - 1].p; len += Math.sqrt((q.x - v.x) * (q.x - v.x) + (q.y - v.y) * (q.y - v.y)); pts.push({ p: q, l: len }); }
      var stop = Math.max(0, len - 22), steps = Math.max(4, Math.floor(stop / 7)), d = "M " + it.x1 + " " + it.y1;
      for (i = 1; i <= steps; i++){
        var doel = stop * i / steps; while (j < N && pts[j].l < doel) j++;
        var a0 = pts[j - 1], a1 = pts[j], fr = a1.l > a0.l ? (doel - a0.l) / (a1.l - a0.l) : 0;
        var x = a0.p.x + (a1.p.x - a0.p.x) * fr, y = a0.p.y + (a1.p.y - a0.p.y) * fr, tx = a1.p.x - a0.p.x, ty = a1.p.y - a0.p.y, tl = Math.sqrt(tx * tx + ty * ty) || 1;
        var off = Math.sin(i * Math.PI / 2) * 7;
        d += " L " + (x - ty / tl * off).toFixed(1) + " " + (y + tx / tl * off).toFixed(1);
      }
      return d + " L " + it.x2 + " " + it.y2;
    }
    function wavy(x1, y1, x2, y2){
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len, px = -uy, py = ux;
      var steps = Math.max(4, Math.floor((len - 22) / 7)), d = "M " + x1 + " " + y1, i;
      for (i = 1; i <= steps; i++){
        var t = (len - 22) * i / steps, off = Math.sin(i * Math.PI / 2) * 7;
        d += " L " + (x1 + ux * t + px * off).toFixed(1) + " " + (y1 + uy * t + py * off).toFixed(1);
      }
      return d + " L " + x2 + " " + y2;
    }
    function itemSvg(it, i){
      var a = ' data-i="' + i + '"', sel = st.sel === i || (!!st.multi && st.multi.indexOf(i) !== -1);
      var hl = sel ? ' filter="url(#drawSel)"' : '';
      switch (it.t){
        case "shirt":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')"><circle r="16" fill="' + SHIRT[it.c] + '" stroke="#fff" stroke-width="3"/>' +
            (it.n ? '<text y="6" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#fff">' + esc(String(it.n)) + '</text>' : '') + '</g>';
        case "p":
          var tm = TEAM[it.c] || TEAM.rood, lab = tm.letter || (it.n ? String(it.n) : "");
          // Spelers een kwart kleiner dan eerst, zodat doelen in verhouding zichtbaar blijven.
          var vorm = vormVan(it.c), shape = vorm === "c" ? '<circle r="12.5" fill="' + tm.fill + '" stroke="#fff" stroke-width="2"/>'
            : '<path d="M 0 -16 L 14.5 10 L -14.5 10 Z" fill="' + tm.fill + '" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>';
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')">' + shape +
            (lab ? '<text y="' + (vorm === "c" ? 4.5 : 7) + '" text-anchor="middle" font-family="Arial" font-weight="700" font-size="' + (lab.length > 1 ? 10.5 : 13) + '" fill="' + tm.ink + '">' + esc(lab) + '</text>' : '') + '</g>';
        case "board":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ') rotate(' + (it.r || 0) + ')"><rect x="-36" y="-8" width="72" height="16" rx="2" fill="#3b3b3b" stroke="#fff" stroke-width="2.5"/></g>';
        case "text":
          return '<text' + a + hl + ' x="' + it.x + '" y="' + it.y + '" text-anchor="middle" font-family="Arial" font-weight="700" font-size="22" fill="#111" stroke="#fff" stroke-width="4" paint-order="stroke">' + esc(it.s) + '</text>';
        case "ball":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')">' + ballSvg(1) + '</g>';
        case "cone":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')">' + hatSvg(it.c, 0.85) + '</g>';
        case "dish":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')"><ellipse rx="12" ry="6" fill="' + DISH[it.c] + '" stroke="#555" stroke-width="1.2"/></g>';
        case "goal":
          // Ongeveer 10 beeldpunten per meter: pupillendoel 5x2 m, minidoel 2x1 m (L = groot doel uit oude tekeningen).
          var gw = it.s === "L" ? 74 : (it.s === "M" ? 54 : 26), gh = it.s === "L" ? 20 : (it.s === "M" ? 16 : 11);
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ') rotate(' + (it.r || 0) + ')"><rect x="' + (-gw / 2) + '" y="' + (-gh / 2) + '" width="' + gw + '" height="' + gh + '" fill="url(#drawNet)" stroke="#fff" stroke-width="3"/></g>';
        case "num":
          return '<g' + a + hl + ' transform="translate(' + it.x + ' ' + it.y + ')"><circle r="14" fill="#fff" stroke="#111" stroke-width="2.5"/><text y="5.5" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#111">' + it.n + '</text></g>';
        case "zone":
          var zx = Math.min(it.x1, it.x2), zy = Math.min(it.y1, it.y2), zw = Math.abs(it.x2 - it.x1), zh = Math.abs(it.y2 - it.y1);
          // Maat in meters (ongeveer 10 beeldpunten per meter); nieuwe vakken tonen hem (oude tekeningen niet), bij "vak met hoedjes" alleen tijdens het slepen.
          var maat = ((it.maat === true || it.hz) && zw >= 30 && zh >= 20) ? '<text pointer-events="none" x="' + (zx + zw / 2) + '" y="' + (zy + zh / 2 + 7) + '" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#111" stroke="#fff" stroke-width="4" paint-order="stroke">' + Math.round(zw / 10) + ' x ' + Math.round(zh / 10) + ' m</text>' : '';
          return '<g' + a + hl + '><rect x="' + zx + '" y="' + zy + '" width="' + zw + '" height="' + zh + '" fill="' + (it.hz ? 'none' : 'rgba(245,124,0,.18)') + '" stroke="#F57C00" stroke-width="3" stroke-dasharray="10 7"/>' + maat + '</g>';
        case "wall":
          return '<line' + a + hl + ' x1="' + it.x1 + '" y1="' + it.y1 + '" x2="' + it.x2 + '" y2="' + it.y2 + '" stroke="#111" stroke-width="8" stroke-linecap="round"/>';
        case "arrow":
          var common = ' stroke="#111" fill="none" marker-end="url(#drawHead)"';
          // Brede onzichtbare lijn eronder: een pijl is makkelijker aan te klikken.
          var zicht = it.k === "dribble" ? '<path d="' + wavyIt(it) + '" stroke-width="3"' + common + '/>'
            : '<path d="' + lijnD(it) + '"' + common + ' stroke-width="' + (it.k === "shot" ? 6 : 3) + '"' + (it.k === "run" ? ' stroke-dasharray="10 8"' : '') + '/>';
          return '<g' + a + hl + '><path d="' + lijnD(it) + '" stroke="transparent" stroke-width="18" fill="none"/>' + zicht + '</g>';
      }
      return "";
    }
    // Grepen bij een gekozen pijl of lijn: uiteinden slepen = langer, korter of draaien; middelste greep = boog.
    function grepenSvg(){
      var it = st.sel != null && !(st.multi && st.multi.length > 1) ? st.items[st.sel] : null;
      if (!it || (it.t !== "arrow" && it.t !== "wall")) return "";
      var g = function(h, x, y, midden){ return '<circle data-h="' + h + '" cx="' + Math.round(x) + '" cy="' + Math.round(y) + '" r="' + (midden ? 9 : 10) + '" fill="' + (midden ? "#00B3FF" : "#fff") + '" stroke="' + (midden ? "#fff" : "#00B3FF") + '" stroke-width="3" style="cursor:' + (midden ? "grab" : "move") + '"/>'; };
      var m = punt(it, 0.5);
      return '<g class="draw-grepen">' + g("1", it.x1, it.y1) + g("2", it.x2, it.y2) + (it.t === "arrow" ? g("c", m.x, m.y, true) : "") + '</g>';
    }
    function render(){
      var f = FIELDS[st.field], svg = el("drawSvg");
      svg.setAttribute("viewBox", "0 0 " + f.w + " " + f.h);
      svg.innerHTML = '<defs><pattern id="drawNet" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e9e9e9"/><path d="M0 0 L6 6 M6 0 L0 6" stroke="#9a9a9a" stroke-width="1"/></pattern>' +
        '<marker id="drawHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#111"/></marker>' +
        '<filter id="drawSel" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00E5FF" flood-opacity="1"/></filter></defs>' +
        '<g>' + fieldSvg() + '</g><g>' +
        // Vakken onderop, daarna de rest (volgorde in de lijst blijft gelijk, dus data-i klopt).
        st.items.map(function(it, i){ return it.t === "zone" ? itemSvg(it, i) : ""; }).join("") +
        st.items.map(function(it, i){ return it.t === "zone" ? "" : itemSvg(it, i); }).join("") + '</g>' +
        (st.guides && st.drag ? '<g pointer-events="none">' +
          (st.guides.x != null ? '<line x1="' + st.guides.x + '" y1="0" x2="' + st.guides.x + '" y2="' + f.h + '" stroke="#00B3FF" stroke-width="2" stroke-dasharray="8 6"/>' : '') +
          (st.guides.y != null ? '<line x1="0" y1="' + st.guides.y + '" x2="' + f.w + '" y2="' + st.guides.y + '" stroke="#00B3FF" stroke-width="2" stroke-dasharray="8 6"/>' : '') + '</g>' : '') +
        grepenSvg() +
        (st.drag && st.drag.mode === "box" ? '<rect pointer-events="none" x="' + Math.min(st.drag.x0, st.drag.x1) + '" y="' + Math.min(st.drag.y0, st.drag.y1) + '" width="' + Math.abs(st.drag.x1 - st.drag.x0) + '" height="' + Math.abs(st.drag.y1 - st.drag.y0) + '" fill="rgba(0,179,255,.12)" stroke="#00B3FF" stroke-width="2" stroke-dasharray="6 5"/>' : '');
      if (st.multi) st.multi = st.multi.filter(function(i){ return i < st.items.length; });
      var meer = !!st.multi && st.multi.length > 1;
      el("drawSelBar").hidden = st.sel == null && !meer;
      el("drawSelCount").hidden = !meer;
      el("drawSelCount").textContent = meer ? st.multi.length + " geselecteerd" : "";
      var it = !meer && st.sel != null ? st.items[st.sel] : null;
      el("drawRotate").hidden = !it || (it.t !== "goal" && it.t !== "board");
      el("drawNumber").hidden = !it || it.t !== "shirt"; // spelers: via de nummerbalk
      renderNummers();
      el("drawEditText").hidden = !it || it.t !== "text";
      if (el("drawRecht")) el("drawRecht").hidden = !it || it.t !== "arrow" || it.cx == null;
      el("drawMaat").hidden = !it || it.t !== "zone";
      if (it && it.t === "zone") el("drawMaat").textContent = it.maat === true ? "Maat verbergen" : "Maat tonen";
      // Kleur achteraf wijzigen: spelers, hoedjes en schijfjes (ook meerdere tegelijk, zelfde soort).
      var gekozen = (meer ? st.multi : (st.sel != null ? [st.sel] : [])).map(function(j){ return st.items[j]; }).filter(Boolean);
      var soort = gekozen.length && gekozen.every(function(g){ return g.t === gekozen[0].t; }) ? gekozen[0].t : null;
      var palet = soort === "p" && gekozen.every(function(g){ return !TEAM[g.c].letter; }) ? { rood: TEAM.rood.fill, lichtblauw: TEAM.lichtblauw.fill, geel: TEAM.geel.fill, blauw: TEAM.blauw.fill }
        : soort === "cone" ? HAT : soort === "dish" ? DISH : null;
      el("drawKleur").hidden = !palet;
      el("drawKleur").innerHTML = palet ? Object.keys(palet).map(function(k){
        return '<button type="button" class="draw-swatch' + (gekozen.every(function(g){ return g.c === k; }) ? ' active' : '') + '" data-kleur="' + k + '" title="' + k + '" style="background:' + palet[k] + '"></button>';
      }).join("") : "";
      Array.prototype.forEach.call(document.querySelectorAll("[data-draw-tool]"), function(b){
        b.classList.toggle("active", st.tool != null && b.getAttribute("data-draw-tool") === String(st.tool));
      });
      renderRail();
      // Selecteren licht op als er geen gereedschap aan staat; de muis laat zien wat er gebeurt.
      var selKnop = document.querySelector("[data-draw-select]");
      if (selKnop) selKnop.classList.toggle("active", st.tool == null);
      var dsvg = el("drawSvg");
      if (dsvg.classList){ dsvg.classList.toggle("plaatsen", st.tool != null); dsvg.classList.toggle("kiezen", st.tool == null); }
      Array.prototype.forEach.call(document.querySelectorAll("[data-draw-field]"), function(b){ b.classList.toggle("active", b.getAttribute("data-draw-field") === st.field); });
      var gk = st.sel != null && !meer ? st.items[st.sel] : null;
      el("drawHint").textContent = gk && (gk.t === "arrow" || gk.t === "wall") && st.tool == null
        ? (gk.t === "arrow" ? "Sleep een wit bolletje om de pijl langer, korter of schuin te maken. Sleep het blauwe bolletje in het midden voor een boog (terug naar het midden = weer recht)." : "Sleep een wit bolletje om de lijn langer of korter te maken.")
        : st.tool != null
        ? (/arrow|wall|zone/.test(toolDef(st.tool).t) ? (toolDef(st.tool).t === "hatzone" ? "Sleep een rechthoek: op elke hoek komt een " + lastHat + " hoedje. Rechtermuisklik of nog een keer op de knop = stoppen." : "Sleep over het veld om te tekenen. Rechtermuisklik of nog een keer op de knop = stoppen.") : "Klik op het veld om neer te zetten. Rechtermuisklik, nog een keer op de knop of Esc = stoppen.")
        : "Klik iets aan om het te verplaatsen of te verwijderen. Sleep over een lege plek om meerdere tegelijk te selecteren (Shift+klik = toevoegen, Cmd/Ctrl+A = alles).";
    }
    function toolDef(idx){ var flat = []; TOOLS.forEach(function(g){ flat = flat.concat(g.items); }); return flat[idx]; }
    function toolIcon(t){
      var s = '<svg viewBox="-20 -20 40 40" width="34" height="34" aria-hidden="true">';
      if (t.t === "p"){
        var tm = TEAM[t.c];
        s += vormVan(t.c) === "c" ? '<circle r="12" fill="' + tm.fill + '" stroke="#333" stroke-width="1"/>' : '<path d="M 0 -14 L 13 10 L -13 10 Z" fill="' + tm.fill + '" stroke="#333" stroke-width="1"/>';
        if (tm.letter) s += '<text y="8" text-anchor="middle" font-size="12" font-weight="700" font-family="Arial" fill="#fff">' + tm.letter + '</text>';
      }
      else if (t.t === "board") s += '<rect x="-15" y="-5" width="30" height="10" rx="2" fill="#3b3b3b"/>';
      else if (t.t === "text") s += '<text y="6" text-anchor="middle" font-size="15" font-weight="700" font-family="Arial" fill="#111">5P</text>';
      else       if (t.t === "shirt") s += '<path d="M-10 -12 L-4 -14 Q0 -10 4 -14 L10 -12 L15 -5 L10 -2 L10 14 L-10 14 L-10 -2 L-15 -5 Z" fill="' + SHIRT[t.c] + '" stroke="#333" stroke-width="1"/>';
      else if (t.t === "ball") s += ballSvg(1.6);
      else if (t.t === "cone") s += hatSvg(t.c, 1.05);
      else if (t.t === "hatzone") s += '<rect x="-11" y="-9" width="22" height="18" fill="none" stroke="#999" stroke-dasharray="3 2"/>' +
        [[-11, -9], [11, -9], [-11, 9], [11, 9]].map(function(q){ return '<g transform="translate(' + q[0] + ' ' + q[1] + ')">' + hatSvg(lastHat, 0.42) + '</g>'; }).join("");
      else if (t.t === "dish") s += '<ellipse rx="13" ry="6" fill="' + DISH[t.c] + '" stroke="#555"/>';
      else if (t.t === "goal"){ var gw = t.s === "M" ? 34 : 17; s += '<rect x="' + (-gw / 2) + '" y="-6" width="' + gw + '" height="12" fill="#ddd" stroke="#777"/>'; }
      else if (t.t === "arrow"){
        s += t.k === "dribble" ? '<path d="M0 14 L3 10 L-3 6 L3 2 L-3 -2 L0 -6" stroke="#111" stroke-width="2" fill="none"/>' :
          '<line x1="0" y1="14" x2="0" y2="-6" stroke="#111" stroke-width="' + (t.k === "shot" ? 4 : 2) + '"' + (t.k === "run" ? ' stroke-dasharray="3 3"' : '') + '/>';
        s += '<path d="M-5 -6 L0 -14 L5 -6 Z" fill="#111"/>';
      }
      else if (t.t === "wall") s += '<line x1="-12" y1="10" x2="12" y2="-10" stroke="#111" stroke-width="5" stroke-linecap="round"/>';
      else if (t.t === "num") s += '<circle r="12" fill="#fff" stroke="#111" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" font-family="Arial">123</text>';
      else if (t.t === "zone") s += '<rect x="-12" y="-10" width="24" height="20" fill="rgba(245,124,0,.2)" stroke="#F57C00" stroke-width="2" stroke-dasharray="4 3"/>';
      return s + '</svg>';
    }
    /* Besluit 126 (ontwerp A): smalle rail met één knop per soort; de varianten (kleuren, soorten pijlen) staan in een
       uitklapmenu. De knop onthoudt de laatst gekozen variant. Veld, opstelling en instellingen staan in de bovenbalk. */
    var RAIL = [
      { id: "spelers", naam: "Spelers", soort: /^p$/ }, { id: "bal", naam: "Bal", soort: /^ball$/ },
      { id: "hoedjes", naam: "Hoedjes", soort: /^(cone|hatzone)$/ }, { id: "schijfjes", naam: "Schijfjes", soort: /^dish$/ },
      { id: "doelen", naam: "Doelen", soort: /^(goal|board)$/ }, { id: "pijlen", naam: "Pijlen", soort: /^(arrow|wall)$/ },
      { id: "markeren", naam: "Markeren", soort: /^(num|zone|text)$/ }
    ];
    var railLaatst = {}, railOpen = null;
    function railTools(r){ return flatTools().map(function(t, n){ return r.soort.test(t.t) ? n : -1; }).filter(function(n){ return n !== -1; }); }
    function railVan(n){ var t = flatTools()[n]; return t ? RAIL.find(function(r){ return r.soort.test(t.t); }) : null; }
    function laatste(r){ var l = railTools(r); return railLaatst[r.id] != null && l.indexOf(railLaatst[r.id]) !== -1 ? railLaatst[r.id] : l[r.id === "hoedjes" ? 1 : 0]; }
    function toolKnop(n){
      var t = flatTools()[n], key = t.key || (t.t === "cone" ? "H" : "");
      return '<button type="button" class="draw-tool" data-draw-tool="' + n + '" title="' + t.label + (key ? " (toets " + key + ")" : "") + '" aria-label="' + t.label + '">' +
        toolIcon(t) + (t.key ? '<span class="draw-key">' + t.key + '</span>' : '') + '</button>';
    }
    function sluitMenus(){
      if (railOpen){ railOpen = null; var f = el("drawFly"); if (f) f.hidden = true; renderRail(); }
      Array.prototype.forEach.call(document.querySelectorAll(".draw-menu[open]"), function(d){ d.open = false; });
    }
    function openRail(id){
      var r = RAIL.find(function(x){ return x.id === id; }), l = railTools(r), f = el("drawFly");
      if (l.length === 1){ sluitMenus(); st.tool = l[0]; st.sel = null; render(); return; }
      if (railOpen === id){ sluitMenus(); return; }
      railOpen = id;
      // Meteen de laatst gebruikte variant kiezen: één tik op Hoedjes = verder met dezelfde kleur.
      // Is er iets gekozen (bijv. een speler voor een ander nummer), dan blijft die gekozen.
      if ((st.sel == null && !(st.multi && st.multi.length > 1)) && (st.tool == null || railVan(st.tool) !== r)){ st.tool = laatste(r); }
      el("drawFlyH").textContent = r.naam;
      el("drawFlyGrid").innerHTML = l.map(toolKnop).join("");
      el("drawNummers").hidden = id !== "spelers";
      var knop = document.querySelector('[data-rail="' + id + '"]'), body = f.parentNode;
      f.hidden = false;
      if (window.matchMedia("(min-width: 900px)").matches){
        var top = knop.getBoundingClientRect().top - body.getBoundingClientRect().top;
        f.style.top = Math.max(8, Math.min(top, body.clientHeight - f.offsetHeight - 8)) + "px";
      } else f.style.top = "";
      render();
    }
    function renderRail(){
      Array.prototype.forEach.call(document.querySelectorAll("[data-rail]"), function(b){
        var r = RAIL.find(function(x){ return x.id === b.getAttribute("data-rail"); });
        var aan = railOpen === r.id || (st && st.tool != null && railVan(st.tool) === r);
        b.classList.toggle("active", !!aan); b.setAttribute("aria-expanded", railOpen === r.id ? "true" : "false");
        b.querySelector(".draw-rail-ic").innerHTML = toolIcon(flatTools()[laatste(r)]);
      });
      var vk = el("drawVeldNaam"); if (vk && st) vk.textContent = FIELDS[st.field].label;
    }
    function buildTools(){
      el("drawTools").innerHTML =
        '<button type="button" class="draw-rail draw-rail-kies" data-draw-select title="Kiezen en verplaatsen (Esc)"><span class="draw-rail-ic"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M5 3l14 8-6 1.6L10 19z" fill="currentColor"/></svg></span><span>Kies</span></button>' +
        RAIL.map(function(r){ return '<button type="button" class="draw-rail" data-rail="' + r.id + '" aria-haspopup="true"><span class="draw-rail-ic"></span><span>' + r.naam + '</span></button>'; }).join("");
      // Uitklapmenu (één voor alle soorten) naast de rail; bij Spelers met de nummerbalk.
      if (!el("drawFly")){
        var f = document.createElement("div"); f.id = "drawFly"; f.className = "draw-fly"; f.hidden = true;
        f.innerHTML = '<div class="draw-fly-h"><b id="drawFlyH"></b><button type="button" class="draw-fly-x" aria-label="Menu sluiten">×</button></div><div class="draw-fly-grid" id="drawFlyGrid"></div><div id="drawNummers" class="draw-nummers"></div>';
        el("drawTools").parentNode.appendChild(f);
        f.addEventListener("click", function(e){
          if (!st) return;
          if (e.target.closest(".draw-fly-x")){ sluitMenus(); return; }
          var tk = e.target.closest("[data-draw-tool]");
          if (tk){ var n = Number(tk.getAttribute("data-draw-tool")), r = railVan(n); railLaatst[r.id] = n; pickTool(n, true); if (r.id !== "spelers") sluitMenus(); return; }
          if (e.target.closest("[data-klap]")){ nrDicht = !nrDicht; try { localStorage.setItem("cc-draw-nummers", nrDicht ? "dicht" : "open"); } catch(x){} renderNummers(); return; }
          var v = e.target.closest("[data-vorm]");
          if (v){ var c = v.getAttribute("data-vorm"); st.vormen[c] = vormVan(c) === "c" ? "t" : "c"; spelerIconen(); render(); return; }
          var b = e.target.closest("[data-nr]"); if (!b) return; var x = b.getAttribute("data-nr").split("|"); tikNummer(x[0], Number(x[1]));
        });
      }
      // Bovenbalk: Veld, Opstelling en instellingen (⚙), vóór Ongedaan maken.
      if (!el("drawVeldMenu")){
        var menus = document.createElement("div"); menus.className = "draw-menus";
        menus.innerHTML =
          '<details class="draw-menu" id="drawVeldMenu"><summary>Veld: <b id="drawVeldNaam"></b> ▾</summary><div class="draw-menu-lijst">' +
            Object.keys(FIELDS).map(function(k){ return '<button type="button" data-draw-field="' + k + '">' + FIELDS[k].label + '</button>'; }).join("") + '</div></details>' +
          '<details class="draw-menu"><summary>Opstelling ▾</summary><div class="draw-menu-lijst">' +
            [["212", "", "6 tegen 6 (2-1-2)"], ["212", "t", "2-1-2 tegenstander"], ["331", "", "8 tegen 8 (3-3-1)"], ["331", "t", "3-3-1 tegenstander"]].map(function(x){
              return '<button type="button" data-draw-form="' + x[0] + '|' + x[1] + '">' + x[2] + '</button>'; }).join("") +
            '<small>Voor 11 tegen 11: kies de nummers bij Spelers.</small></div></details>' +
          '<details class="draw-menu draw-menu-rechts"><summary aria-label="Instellingen" title="Instellingen">⚙</summary><div class="draw-menu-lijst">' +
            '<label class="draw-zoom"><input type="checkbox" id="drawMagneet"' + (magneet ? ' checked' : '') + '> Magneet: netjes uitlijnen<small>Hoedjes en spelers springen op één lijn met wat er al staat. Houd Alt/Option ingedrukt om vrij te plaatsen.</small></label>' +
            '<label class="draw-zoom"><input type="checkbox" id="drawZoom" checked> Opslaan ingezoomd op de spelers<small>Het plaatje toont alleen het stuk waar je getekend hebt.</small></label>' +
            '<button type="button" class="draw-clear" id="drawClear">Alles wissen</button></div></details>';
        var act = el("drawUndo").parentNode; act.insertBefore(menus, el("drawUndo"));
        Array.prototype.forEach.call(menus.querySelectorAll("details"), function(d){
          d.addEventListener("toggle", function(){ if (d.open) Array.prototype.forEach.call(menus.querySelectorAll("details[open]"), function(o){ if (o !== d) o.open = false; }); });
        });
        Array.prototype.forEach.call(menus.querySelectorAll("[data-draw-field]"), function(b){
          b.addEventListener("click", function(){ snapshot(); st.field = b.getAttribute("data-draw-field"); st.sel = null; sluitMenus(); render(); });
        });
        Array.prototype.forEach.call(menus.querySelectorAll("[data-draw-form]"), function(b){
          b.addEventListener("click", function(){ var x = b.getAttribute("data-draw-form").split("|"); sluitMenus(); zetOpstelling(x[0], x[1] === "t"); });
        });
        el("drawZoom").addEventListener("change", function(){ if (st) st.zoom = this.checked; });
        el("drawMagneet").addEventListener("change", function(){ magneet = this.checked; try { localStorage.setItem("art-draw-magneet", magneet ? "aan" : "uit"); } catch(e){} });
        el("drawClear").addEventListener("click", function(){ if (!st.items.length) return; snapshot(); st.items = []; st.sel = null; st.num = 0; sluitMenus(); render(); });
      }
      // Knop "Recht maken" bij een gebogen pijl
      if (!el("drawRecht")){
        var rb = document.createElement("button"); rb.type = "button"; rb.className = "btn ghost small"; rb.id = "drawRecht"; rb.textContent = "Recht maken"; rb.hidden = true;
        el("drawSelBar").insertBefore(rb, el("drawDelete"));
        rb.addEventListener("click", function(){ var it = st.items[st.sel]; if (!it || it.cx == null) return; snapshot(); delete it.cx; delete it.cy; render(); });
      }
      document.querySelector("[data-draw-select]").addEventListener("click", function(){ sluitMenus(); st.tool = null; render(); });
      Array.prototype.forEach.call(document.querySelectorAll("[data-rail]"), function(b){
        b.addEventListener("click", function(){ openRail(b.getAttribute("data-rail")); });
      });
    }

    /* Magneet: bij neerzetten en slepen springt een hoedje/speler horizontaal of verticaal op één lijn met wat er al
       staat (binnen 12 beeldpunten); tijdens het slepen tonen blauwe hulplijnen de uitlijning. Alt/Option = even vrij. */
    var magneet = (function(){ try { return localStorage.getItem("art-draw-magneet") !== "uit"; } catch(e){ return true; } })();
    var SNAP = 12;
    function snapPt(x, y, skip, evt){
      var gx = null, gy = null;
      if (magneet && !(evt && evt.altKey)){
        var bx = SNAP + 1, by = SNAP + 1;
        st.items.forEach(function(it, i){
          if (i === skip) return;
          ("x" in it ? [[it.x, it.y]] : [[it.x1, it.y1], [it.x2, it.y2]]).forEach(function(q){
            var dx = Math.abs(q[0] - x), dy = Math.abs(q[1] - y);
            if (dx < bx){ bx = dx; gx = q[0]; }
            if (dy < by){ by = dy; gy = q[1]; }
          });
        });
      }
      st.guides = gx != null || gy != null ? { x: gx, y: gy } : null;
      return { x: gx != null ? gx : x, y: gy != null ? gy : y };
    }

    /* Opstellingen met één klik: eigen team (rood) verdedigt onder (staande velden) of links (liggende velden),
       de tegenstander (geel) gespiegeld. Posities als fractie van het speelveld; nummers lopen door per teamkleur. */
    var OPST = { "212": [[0.5, 0.94, "K"], [0.3, 0.8], [0.7, 0.8], [0.5, 0.68], [0.33, 0.56], [0.67, 0.56]],
      "331": [[0.5, 0.94, "K"], [0.2, 0.8], [0.5, 0.82], [0.8, 0.8], [0.25, 0.68], [0.5, 0.7], [0.75, 0.68], [0.5, 0.57]] };
    function zetOpstelling(code, tegen){
      if (!st || !OPST[code]) return;
      var f = FIELDS[st.field], m = 30, staand = /^(staand|f8|f6|half)$/.test(st.field), kleur = tegen ? "geel" : "rood";
      snapshot();
      var n = st.items.reduce(function(mx, x){ return x.t === "p" && x.c === kleur ? Math.max(mx, x.n || 0) : mx; }, 0);
      OPST[code].forEach(function(q){
        var fx = q[0], fy = tegen ? 1 - q[1] : q[1];
        var x = staand ? m + fx * (f.w - 2 * m) : m + (1 - fy) * (f.w - 2 * m);
        var y = staand ? m + fy * (f.h - 2 * m) : m + fx * (f.h - 2 * m);
        st.items.push(q[2] === "K" ? { t: "p", c: "keeper", x: Math.round(x), y: Math.round(y) } : { t: "p", c: kleur, n: ++n, x: Math.round(x), y: Math.round(y) });
      });
      st.tool = null; st.sel = null; render();
    }

    /* Nummerbalk (27-10, ClubComm): per team de rugnummers 1-11 en "zonder nummer". Een nummer tikken zet die speler
       meteen op zijn plek in de 1-4-3-3 (eigen team rood, verdedigt onder of links; tegenstander geel, gedraaid).
       Nog een keer tikken = weg. Is er een speler gekozen, dan krijgt die het nummer (of geen nummer). */
    var NR_PLEK = { 1: [0.5, 0.94], 2: [0.85, 0.78], 3: [0.62, 0.81], 4: [0.38, 0.81], 5: [0.15, 0.78], 6: [0.5, 0.7],
      8: [0.7, 0.63], 10: [0.3, 0.63], 7: [0.82, 0.56], 9: [0.5, 0.54], 11: [0.18, 0.56] };
    var NR_TEAMS = [["rood", "Eigen team", "●"], ["geel", "Tegenstander", "▲"]];
    function plekOpVeld(fx, fy, tegen){
      var f = FIELDS[st.field], m = 30, staand = /^(staand|f8|f6|half)$/.test(st.field);
      if (tegen){ fx = 1 - fx; fy = 1 - fy; }
      return staand ? { x: Math.round(m + fx * (f.w - 2 * m)), y: Math.round(m + fy * (f.h - 2 * m)) }
        : { x: Math.round(m + (1 - fy) * (f.w - 2 * m)), y: Math.round(m + fx * (f.h - 2 * m)) };
    }
    function gekozenSpeler(){
      var it = st.sel != null && !(st.multi && st.multi.length > 1) ? st.items[st.sel] : null;
      return it && it.t === "p" && TEAM[it.c] && !TEAM[it.c].letter ? it : null;
    }
    function tikNummer(kleur, n){
      var tegen = kleur === "geel", gk = gekozenSpeler();
      snapshot();
      if (gk){
        // Gekozen speler krijgt dit nummer; had een teamgenoot het al, dan ruilen ze.
        if (n){ var ander = st.items.find(function(x){ return x !== gk && x.t === "p" && x.c === gk.c && x.n === n; }); if (ander) ander.n = gk.n || 0; }
        gk.n = n || 0; render(); return;
      }
      if (!n){
        var k = st.items.filter(function(x){ return x.t === "p" && x.c === kleur && !x.n; }).length;
        var q = plekOpVeld(0.2 + (k % 7) * 0.1, 0.66 - Math.floor(k / 7) * 0.08, tegen);
        st.items.push({ t: "p", c: kleur, x: q.x, y: q.y }); render(); return;
      }
      var i = st.items.findIndex(function(x){ return x.t === "p" && x.c === kleur && x.n === n; });
      if (i !== -1){ st.items.splice(i, 1); st.sel = null; st.multi = null; render(); return; }
      var pl = NR_PLEK[n] || [0.5, 0.6], p = plekOpVeld(pl[0], pl[1], tegen);
      st.items.push({ t: "p", c: kleur, n: n, x: p.x, y: p.y }); render();
    }
    // Knoppen bij Spelers (links) tonen dezelfde vorm als op het veld
    function spelerIconen(){
      Array.prototype.forEach.call(document.querySelectorAll("[data-draw-tool]"), function(b){
        var t = toolDef(Number(b.getAttribute("data-draw-tool")));
        if (t && t.t === "p") b.innerHTML = toolIcon(t) + (t.key ? '<span class="draw-key">' + t.key + '</span>' : '');
      });
    }
    function renderNummers(){
      var bak = el("drawNummers"); if (!bak) return;
      var gk = gekozenSpeler();
      var inMenu = !!(bak.closest && bak.closest(".draw-fly")), dicht = nrDicht && !inMenu;
      bak.classList.toggle("dicht", dicht);
      var kop = inMenu ? '<b class="draw-nr-titel">Rugnummers</b>' : '<button type="button" class="draw-nr-klap" data-klap aria-expanded="' + !dicht + '"><b>Rugnummers</b>' + (dicht ? '<small>tik om te openen</small>' : '') + '<span aria-hidden="true">' + (dicht ? '▾' : '▴') + '</span></button>';
      if (dicht){ bak.innerHTML = kop; return; }
      bak.innerHTML = kop + NR_TEAMS.map(function(tm){
        var kleur = tm[0], ink = TEAM[kleur].ink, fill = TEAM[kleur].fill;
        var zonder = st.items.filter(function(x){ return x.t === "p" && x.c === kleur && !x.n; }).length;
        var knop = function(n){
          var aan = gk ? gk.c === kleur && (gk.n || 0) === n : st.items.some(function(x){ return x.t === "p" && x.c === kleur && x.n === n; });
          return '<button type="button" class="draw-nr' + (aan ? ' aan' : '') + '" data-nr="' + kleur + '|' + n + '"' + (aan ? ' style="background:' + fill + ';color:' + ink + ';border-color:' + fill + '"' : '') +
            ' aria-pressed="' + aan + '" aria-label="' + tm[1] + ' nummer ' + n + '">' + n + '</button>';
        };
        var vorm = vormVan(kleur);
        return '<div class="draw-nr-rij"><button type="button" class="draw-nr-vorm" data-vorm="' + kleur + '" title="Rondje of driehoek wisselen" aria-label="' + tm[1] + ': ' + (vorm === "c" ? "rondje" : "driehoek") + ', tik om te wisselen">' +
          '<svg viewBox="-16 -16 32 32" width="22" height="22" aria-hidden="true">' + (vorm === "c" ? '<circle r="11" fill="' + fill + '" stroke="#333" stroke-width="1"/>' : '<path d="M 0 -12 L 11 8 L -11 8 Z" fill="' + fill + '" stroke="#333" stroke-width="1"/>') + '</svg>' +
          '<span>' + tm[1] + '</span><small aria-hidden="true">⇄</small></button><div class="draw-nr-knoppen">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(knop).join("") +
          '<button type="button" class="draw-nr leeg" data-nr="' + kleur + '|0">' + (gk ? 'Zonder nummer' : '+ Zonder nummer' + (zonder ? ' (' + zonder + ')' : '')) + '</button></div></div>';
      }).join("") + '<small>' + (gk ? 'Tik een nummer: de gekozen speler krijgt dat nummer.' : 'Tik een nummer: de speler staat meteen op zijn plek (1-4-3-3). Nog een keer tikken = weg. Tik op ● of ▲ om rondje en driehoek te wisselen.') + '</small>';
    }

    // Knop kiezen; nog een keer dezelfde knop = stoppen. Hoedjeskleur onthouden voor "Vak met hoedjes" en toets H.
    function pickTool(n, vast){
      var t = flatTools()[n], r = railVan(n); if (r) railLaatst[r.id] = n;
      if (t && t.t === "cone" && t.c !== lastHat){
        lastHat = t.c;
        var hz = document.querySelector('[data-draw-tool="' + flatTools().map(function(x){ return x.t; }).indexOf("hatzone") + '"]');
        if (hz) hz.innerHTML = toolIcon({ t: "hatzone" }) + '<span class="draw-key">V</span>';
        railLaatst.hoedjes = n;
      }
      st.tool = st.tool === n && !vast ? null : n; st.sel = null; render();
    }
    function onDown(evt){
      if (evt.button === 2) return; // rechtermuisknop = stoppen (zie contextmenu)
      if (!st) return;
      var p = svgPt(evt), target = evt.target.closest("[data-i]");
      sluitMenus();
      var greep = evt.target.closest("[data-h]");
      if (greep && st.sel != null){ snapshot(); st.drag = { mode: "greep", i: st.sel, h: greep.getAttribute("data-h"), moved: false }; evt.preventDefault(); return; }
      if (st.tool != null && !(target && !isDragTool(toolDef(st.tool)))){
        var t = toolDef(st.tool);
        snapshot();
        if (isDragTool(t)){
          p = snapPt(p.x, p.y, -1, evt);
          var it = t.t === "arrow" ? { t: "arrow", k: t.k, x1: p.x, y1: p.y, x2: p.x, y2: p.y }
            : (t.t === "hatzone" ? { t: "zone", hz: true, x1: p.x, y1: p.y, x2: p.x, y2: p.y } : { t: t.t, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
          if (t.t === "zone") it.maat = true;
          st.items.push(it);
          st.drag = { mode: "draw", i: st.items.length - 1 };
        } else {
          var sp = snapPt(p.x, p.y, -1, evt); st.guides = null;
          var obj = { t: t.t, x: sp.x, y: sp.y };
          if (t.c) obj.c = t.c;
          if (t.s) obj.s = t.s;
          if (t.t === "num") obj.n = ++st.num;
          // Spelers krijgen automatisch het volgende nummer binnen hun team (kleur).
          if (t.t === "p" && !TEAM[t.c].letter) obj.n = 1 + st.items.reduce(function(mx, x){ return x.t === "p" && x.c === t.c ? Math.max(mx, x.n || 0) : mx; }, 0);
          if (t.t === "text"){
            var txt = window.prompt("Tekst op het veld", "5P");
            if (!txt || !txt.trim()){ st.undo.pop(); return; }
            obj.s = txt.trim().slice(0, 30);
          }
          st.items.push(obj);
        }
        render(); evt.preventDefault(); return;
      }
      if (target){
        var i = Number(target.getAttribute("data-i"));
        // Shift+klik: toevoegen aan / halen uit de selectie.
        if (evt.shiftKey){
          var lijst = st.multi ? st.multi.slice() : (st.sel != null ? [st.sel] : []);
          var k = lijst.indexOf(i); if (k === -1) lijst.push(i); else lijst.splice(k, 1);
          st.multi = lijst.length > 1 ? lijst : null; st.sel = lijst.length === 1 ? lijst[0] : null;
          render(); evt.preventDefault(); return;
        }
        // Een van meerdere geselecteerde items vastpakken = de hele groep verschuiven.
        if (st.multi && st.multi.length > 1 && st.multi.indexOf(i) !== -1){
          snapshot(); st.drag = { mode: "group", last: p, moved: false }; render(); evt.preventDefault(); return;
        }
        st.multi = null;
        st.sel = i; snapshot();
        var cur = st.items[i];
        st.drag = { mode: "move", i: i, last: p, moved: false, raw: "x" in cur ? { x: cur.x, y: cur.y } : null };
        render(); evt.preventDefault();
      } else {
        // Lege plek: selectievak trekken (alles wat erin valt wordt geselecteerd).
        st.sel = null; st.multi = null;
        st.drag = { mode: "box", x0: p.x, y0: p.y, x1: p.x, y1: p.y };
        render(); evt.preventDefault();
      }
    }
    function onMove(evt){
      if (!st || !st.drag) return;
      var p = svgPt(evt), it = st.items[st.drag.i];
      if (st.drag.mode === "box"){ st.drag.x1 = p.x; st.drag.y1 = p.y; render(); evt.preventDefault(); return; }
      if (st.drag.mode === "group"){
        var gdx = p.x - st.drag.last.x, gdy = p.y - st.drag.last.y;
        st.multi.forEach(function(j){ var g = st.items[j]; if ("x" in g){ g.x += gdx; g.y += gdy; } else { g.x1 += gdx; g.y1 += gdy; g.x2 += gdx; g.y2 += gdy; if (g.cx != null){ g.cx += gdx; g.cy += gdy; } } });
        st.drag.last = p; st.drag.moved = true; render(); evt.preventDefault(); return;
      }
      if (st.drag.mode === "greep"){
        if (st.drag.h === "c"){
          // De greep blijft onder de muis: controlepunt = 2 x greep - helft van begin + eind. Bijna recht = weer recht.
          var mx = (it.x1 + it.x2) / 2, my = (it.y1 + it.y2) / 2;
          if (Math.abs(p.x - mx) + Math.abs(p.y - my) < 10){ delete it.cx; delete it.cy; }
          else { it.cx = Math.round(2 * p.x - mx); it.cy = Math.round(2 * p.y - my); }
        } else {
          var e3 = snapPt(p.x, p.y, st.drag.i, evt);
          if (st.drag.h === "1"){ it.x1 = e3.x; it.y1 = e3.y; } else { it.x2 = e3.x; it.y2 = e3.y; }
        }
        st.drag.moved = true; render(); evt.preventDefault(); return;
      }
      if (st.drag.mode === "draw"){ var e2 = snapPt(p.x, p.y, st.drag.i, evt); it.x2 = e2.x; it.y2 = e2.y; }
      else {
        var dx = p.x - st.drag.last.x, dy = p.y - st.drag.last.y;
        if (st.drag.raw){
          // Vrije positie bijhouden en die laten "plakken", zodat je ook weer los kunt trekken van de lijn.
          st.drag.raw.x += dx; st.drag.raw.y += dy;
          var q = snapPt(st.drag.raw.x, st.drag.raw.y, st.drag.i, evt); it.x = q.x; it.y = q.y;
        } else { it.x1 += dx; it.y1 += dy; it.x2 += dx; it.y2 += dy; if (it.cx != null){ it.cx += dx; it.cy += dy; } }
        st.drag.last = p; st.drag.moved = true;
      }
      render(); evt.preventDefault();
    }
    function onUp(){
      if (!st || !st.drag) return;
      if (st.drag.mode === "box"){
        var bx0 = Math.min(st.drag.x0, st.drag.x1), bx1 = Math.max(st.drag.x0, st.drag.x1), by0 = Math.min(st.drag.y0, st.drag.y1), by1 = Math.max(st.drag.y0, st.drag.y1);
        var binnen = function(x, y){ return x >= bx0 && x <= bx1 && y >= by0 && y <= by1; };
        var gekozen = (bx1 - bx0) + (by1 - by0) < 8 ? [] : st.items.map(function(g, j){
          var ok = "x" in g ? binnen(g.x, g.y) : binnen((g.x1 + g.x2) / 2, (g.y1 + g.y2) / 2);
          return ok ? j : -1;
        }).filter(function(j){ return j !== -1; });
        st.multi = gekozen.length > 1 ? gekozen : null; st.sel = gekozen.length === 1 ? gekozen[0] : null;
        st.drag = null; render(); return;
      }
      if (st.drag.mode === "group" || st.drag.mode === "greep"){ if (!st.drag.moved) st.undo.pop(); st.drag = null; st.guides = null; render(); return; }
      var it = st.items[st.drag.i];
      // Te kort getrokken lijnen/vakken (per ongeluk klikken) weer weghalen.
      if (st.drag.mode === "draw" && Math.abs(it.x2 - it.x1) + Math.abs(it.y2 - it.y1) < 12){ st.items.splice(st.drag.i, 1); st.undo.pop(); }
      // Vak met hoedjes: de gesleepte rechthoek wordt vier hoedjes op de hoeken.
      else if (st.drag.mode === "draw" && it.hz){
        st.items.splice(st.drag.i, 1);
        [[it.x1, it.y1], [it.x2, it.y1], [it.x1, it.y2], [it.x2, it.y2]].forEach(function(q){ st.items.push({ t: "cone", c: lastHat, x: q[0], y: q[1] }); });
      }
      if (st.drag.mode === "move" && !st.drag.moved) st.undo.pop();
      st.drag = null; st.guides = null; render();
    }
    function removeSel(){
      if (st.multi && st.multi.length){
        snapshot(); var weg = st.multi.slice().sort(function(a, b){ return b - a; });
        weg.forEach(function(j){ st.items.splice(j, 1); }); st.multi = null; st.sel = null; render(); return;
      }
      if (st.sel == null) return; snapshot(); st.items.splice(st.sel, 1); st.sel = null; render();
    }
    function undo(){ var s = st.undo.pop(); if (!s) return; (st.redo = st.redo || []).push(JSON.stringify({ field: st.field, items: st.items })); var o = JSON.parse(s); st.field = o.field; st.items = o.items; st.sel = null; st.multi = null; render(); }
    // Opnieuw: wat met "ongedaan maken" is teruggedraaid weer terugzetten (tot je iets nieuws doet).
    function redo(){ var s = (st.redo || []).pop(); if (!s) return; st.undo.push(JSON.stringify({ field: st.field, items: st.items })); var o = JSON.parse(s); st.field = o.field; st.items = o.items; st.sel = null; st.multi = null; render(); }

    /* Inzoomen bij opslaan: alleen het stuk waar spelers, spullen en pijlen staan (met ruimte eromheen), in 3:2 zoals
       de tegels. Gebruikt de tekening bijna het hele veld (of staat er niets), dan blijft het hele veld zichtbaar. */
    function contentBox(){
      var f = FIELDS[st.field];
      if (!st.items.length) return null;
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      st.items.forEach(function(it){
        ("x" in it ? [[it.x, it.y]] : [[it.x1, it.y1], [it.x2, it.y2]].concat(it.cx != null ? [[punt(it, 0.5).x, punt(it, 0.5).y]] : [])).forEach(function(q){
          x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]);
        });
      });
      var m = 60; x0 -= m; y0 -= m; x1 += m; y1 += m;
      var w = Math.max(x1 - x0, 330), h = Math.max(y1 - y0, 220);
      if (w / h < 1.5) w = h * 1.5; else h = w / 1.5;
      if (w > f.w * 0.8 || h > f.h * 0.8) return null;
      var x = Math.max(0, Math.min(f.w - w, (x0 + x1) / 2 - w / 2)), y = Math.max(0, Math.min(f.h - h, (y0 + y1) / 2 - h / 2));
      return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    }

    // Tekening als JPEG: de SVG op een canvas zetten (2x zo scherp) en wit uitvullen.
    function toBlob(){
      var keepSel = st.sel; st.sel = null; st.tool = null; render();
      var svg = el("drawSvg"), f = FIELDS[st.field];
      var box = st.zoom !== false ? contentBox() : null;
      var b = box || { x: 0, y: 0, w: f.w, h: f.h };
      svg.setAttribute("viewBox", b.x + " " + b.y + " " + b.w + " " + b.h);
      var xml = new XMLSerializer().serializeToString(svg);
      render(); // beeld in de tekentool terug naar het hele veld
      if (xml.indexOf('xmlns="http://www.w3.org/2000/svg"') === -1) xml = xml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      xml = xml.replace("<svg", '<svg width="' + b.w + '" height="' + b.h + '"');
      return new Promise(function(resolve, reject){
        var img = new Image();
        img.onload = function(){
          var c = document.createElement("canvas"), k = Math.min(2.5, 1600 / Math.max(b.w, b.h));
          c.width = Math.round(b.w * k); c.height = Math.round(b.h * k);
          var ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function(b){ st.sel = keepSel; b ? resolve(b) : reject(new Error("Opslaan mislukt")); }, "image/jpeg", 0.88);
        };
        img.onerror = function(){ reject(new Error("Tekening kon niet worden omgezet")); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
      });
    }

    function open(initial, onSave){
      st = { field: (initial && FIELDS[initial.field]) ? initial.field : "liggend", items: initial && initial.items ? JSON.parse(JSON.stringify(initial.items)) : [],
             tool: null, sel: null, drag: null, undo: [], redo: [], onSave: onSave, num: 0, vormen: initial && initial.vormen ? JSON.parse(JSON.stringify(initial.vormen)) : {}, zoom: !(initial && initial.zoom === false) };
      st.items.forEach(function(it){ if (it.t === "num") st.num = Math.max(st.num, it.n); });
      if (!el("drawTools").innerHTML) buildTools();
      spelerIconen();
      el("drawZoom").checked = st.zoom;
      // Telefoon of tablet: advies om op de laptop te tekenen (sluitbaar).
      el("drawPhone").hidden = !window.matchMedia("(max-width: 899px), (pointer: coarse)").matches;
      el("drawOverlay").hidden = false;
      render();
    }
    function close(){ el("drawOverlay").hidden = true; st = null; }

    var svg = el("drawSvg");
    svg.addEventListener("pointerdown", function(e){ svg.setPointerCapture && svg.setPointerCapture(e.pointerId); onDown(e); });
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("contextmenu", function(e){ if (!st) return; e.preventDefault(); st.tool = null; st.sel = null; render(); });
    el("drawDelete").addEventListener("click", removeSel);
    el("drawMaat").addEventListener("click", function(){ var it = st.items[st.sel]; if (!it || it.t !== "zone") return; snapshot(); it.maat = it.maat !== true; render(); });
    el("drawKleur").addEventListener("click", function(e){
      var b = e.target.closest("[data-kleur]"); if (!b) return;
      var k = b.getAttribute("data-kleur"), idx = st.multi && st.multi.length > 1 ? st.multi : (st.sel != null ? [st.sel] : []);
      if (!idx.length) return; snapshot();
      idx.forEach(function(j){
        var g = st.items[j]; if (!g || g.c === k || !/^(p|cone|dish)$/.test(g.t) || (g.t === "p" && TEAM[g.c] && TEAM[g.c].letter)) return;
        // Speler naar een ander team: volgend vrij rugnummer in dat team.
        if (g.t === "p") g.n = 1 + st.items.reduce(function(mx, x){ return x.t === "p" && x.c === k ? Math.max(mx, x.n || 0) : mx; }, 0);
        g.c = k;
        if (g.t === "cone") lastHat = k;
      });
      render();
    });
    el("drawRotate").addEventListener("click", function(){ var it = st.items[st.sel]; if (!it) return; snapshot(); it.r = ((it.r || 0) + 90) % 180; render(); });
    el("drawNumber").addEventListener("click", function(){
      var it = st.items[st.sel]; if (!it) return;
      var n = (Number(it.n) || 0) + 1; snapshot(); it.n = n > 20 ? 0 : n; render();
    });
    // Dupliceren: kopie iets verschoven, en direct geselecteerd (handig voor rijen pionnen).
    function duplicate(){
      if (st.multi && st.multi.length > 1){
        snapshot(); var nieuw = [];
        st.multi.forEach(function(j){
          var c = JSON.parse(JSON.stringify(st.items[j]));
          if ("x" in c){ c.x += 24; c.y += 24; } else { c.x1 += 24; c.y1 += 24; c.x2 += 24; c.y2 += 24; if (c.cx != null){ c.cx += 24; c.cy += 24; } }
          if (c.t === "p" && !TEAM[c.c].letter) c.n = 1 + st.items.reduce(function(mx, x){ return x.t === "p" && x.c === c.c ? Math.max(mx, x.n || 0) : mx; }, 0);
          if (c.t === "num") c.n = ++st.num;
          st.items.push(c); nieuw.push(st.items.length - 1);
        });
        st.multi = nieuw; st.sel = null; render(); return;
      }
      var it = st.sel != null ? st.items[st.sel] : null; if (!it) return;
      snapshot();
      var c = JSON.parse(JSON.stringify(it));
      if ("x" in c){ c.x += 24; c.y += 24; } else { c.x1 += 24; c.y1 += 24; c.x2 += 24; c.y2 += 24; if (c.cx != null){ c.cx += 24; c.cy += 24; } }
      if (c.t === "p" && !TEAM[c.c].letter) c.n = 1 + st.items.reduce(function(mx, x){ return x.t === "p" && x.c === c.c ? Math.max(mx, x.n || 0) : mx; }, 0);
      if (c.t === "num") c.n = ++st.num;
      st.items.push(c); st.sel = st.items.length - 1; render();
    }
    el("drawDup").addEventListener("click", duplicate);
    el("drawEditText").addEventListener("click", function(){
      var it = st.items[st.sel]; if (!it) return;
      var txt = window.prompt("Tekst op het veld", it.s);
      if (txt && txt.trim()){ snapshot(); it.s = txt.trim().slice(0, 30); render(); }
    });
    el("drawUndo").addEventListener("click", undo);
    el("drawRedo").addEventListener("click", redo);
    el("drawPhoneX").addEventListener("click", function(){ el("drawPhone").hidden = true; });
    el("drawCancel").addEventListener("click", close);
    el("drawSave").addEventListener("click", function(){
      var b = el("drawSave"); b.disabled = true;
      var data = { field: st.field, items: st.items, zoom: st.zoom };
      if (Object.keys(st.vormen || {}).length) data.vormen = st.vormen;
      toBlob().then(function(blob){ var cb = st.onSave; close(); cb(blob, data); })
        .catch(function(err){ console.error(err); showToast("Tekening opslaan mislukt"); })
        .then(function(){ b.disabled = false; });
    });
    document.addEventListener("keydown", function(e){
      if (!st || el("drawOverlay").hidden) return;
      if (/INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ""))) return;
      if (e.key === "Delete" || e.key === "Backspace"){ removeSel(); e.preventDefault(); }
      else if (e.key === "Escape" && (railOpen || document.querySelector(".draw-menu[open]"))){ sluitMenus(); e.stopPropagation(); }
      else if (e.key === "Escape"){ if (st.tool != null){ st.tool = null; render(); } else { st.sel = null; st.multi = null; render(); } e.stopPropagation(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a"){ st.tool = null; st.sel = null; st.multi = st.items.map(function(x, j){ return j; }); render(); e.preventDefault(); }
      else if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))){ redo(); e.preventDefault(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z"){ undo(); e.preventDefault(); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d"){ duplicate(); e.preventDefault(); }
      else if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1){
        var k = e.key.toUpperCase(), flat = flatTools(), n = -1;
        if (k === "H") n = flat.findIndex(function(t){ return t.t === "cone" && t.c === lastHat; });
        else n = flat.findIndex(function(t){ return t.key === k; });
        if (n !== -1){ pickTool(n); e.preventDefault(); }
      }
    }, true);

    /* Tekening als losse SVG uit de tekengegevens (tekening_json), zonder de tekentool te openen. Voor vormen zonder
       opgeslagen plaatje (bv. ingevoerd door de beheerder); zelfde inzoomen als bij opslaan. Eigen id's per tekening. */
    var svgSeq = 0;
    function staticSvg(json){
      if (!json || !FIELDS[json.field]) return "";
      var saved = st;
      st = { field: json.field, items: json.items || [], sel: null, zoom: json.zoom !== false, vormen: json.vormen || {} };
      try {
        var f = FIELDS[st.field], b = (st.zoom ? contentBox() : null) || { x: 0, y: 0, w: f.w, h: f.h }, u = "s" + (++svgSeq);
        var inner = '<defs><pattern id="drawNet" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#e9e9e9"/><path d="M0 0 L6 6 M6 0 L0 6" stroke="#9a9a9a" stroke-width="1"/></pattern>' +
          '<marker id="drawHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#111"/></marker></defs>' +
          '<g>' + fieldSvg() + '</g><g>' +
          st.items.map(function(it, i){ return it.t === "zone" ? itemSvg(it, i) : ""; }).join("") +
          st.items.map(function(it, i){ return it.t === "zone" ? "" : itemSvg(it, i); }).join("") + '</g>';
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + b.x + ' ' + b.y + ' ' + b.w + ' ' + b.h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Tekening">' + inner + '</svg>')
          .replace(/drawNet/g, "drawNet" + u).replace(/drawHead/g, "drawHead" + u);
      } finally { st = saved; }
    }
    return { open: open, staticSvg: staticSvg };
  })();
})();
