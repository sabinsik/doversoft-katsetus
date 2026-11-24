# Doversoft — kontori- ja koolitarvete e-pood

Tartu Ülikooli aine **Sissejuhatus erialasse (LTAT.03.002)** veebilehe rühmatöö.

**Leht internetis:** https://sabinsik.github.io/doversoft-katsetus/index.html

## Mida veebileht tutvustab? (eesmärk)

Doversoft OÜ on ettevõte, mis müüb kontori- ja koolitarbeid (paber, kirjatarbed, kaustad, nõud jne).
See on **õppeprojekt** — Doversofti e-poe uus kujundus, mitte päris e-pood. Tellimusi ei saadeta kuhugi.
Lehe eesmärk on aidata ettevõttel end klientidele tutvustada ja lihtsustada tellimist:

- **Pealeht** (`index.html`) — slaider, nädala toode koos taimeriga, kiirtellimus tootekoodiga, populaarsed tooted ja kategooriad.
- **Kataloog** (`kataloog.html`) — kõik ~730 toodet; filtreerimine kategooria (ja alamkategooria), kaubamärgi ja hinna järgi, otsing, sorteerimine ja "Näita rohkem".
- **Toode** (`toode.html?id=...`) — ühe toote pilt, kirjeldus, tehnilised andmed, variandi valik ja sama kategooria tooted.
- **Ostukorv** (`ostukorv.html`) — koguste muutmine, summa koos KM-i ja tarnega, tellimuse vorm koos andmete kontrolliga.
- **Meist** (`meist.html`) — info firma kohta, ostutingimused (avanevad küsimused) ja kontaktid koos kontaktivormiga.

Kõikide lehtede päises on **toodete rippmenüü** kõigi kategooriatega ja link ostukorvile.

Kui sama toode on eri värvi või suurusega (nt marker must/sinine/punane), on see **üks toode**, mille variandi saab valida rippmenüüst.

Ostukorv püsib lehtede vahel liikudes alles (brauseri `localStorage`).

## Tiimiliikmed

Rühm **surts**:

| Nimi | GitHub | Vastutusala (rühmatöö plaanist) |
|------|--------|-------------------------------|
| Loreta | [@loretaa7](https://github.com/loretaa7) | infovahetus, koosolekud, tähtajad, plaan ja vahearuanne |
| Delia | [@Deliaa-saa](https://github.com/Deliaa-saa) | tehniline arendus, GitHubi repositoorium |
| Sabina Sumštšenko | [@sabinsik](https://github.com/sabinsik) | disain, sisu loomine, kodu.ut.ee leht |

## Tööjaotus

Iga suurem osa tehti eraldi harus (*feature branching*) ja liideti seejärel `main` harru.

| Branch | Mis seal tehti | Vastutaja |
|--------|----------------|----------|
| `feature/disain` | ühine stiil (`css/yhine.css`), päis, toodete rippmenüü, jalus, logo ja pildid, ühine JS (`js/yhine.js`), toodete andmed (`js/tooted.js`) | Sabina |
| `feature/pealeht` | `index.html`, `css/pealeht.css`, `js/pealeht.js` — slaider, nädala pakkumise taimer, kiirtellimus | Delia |
| `feature/kataloog` | `kataloog.html`, `css/kataloog.css`, `js/kataloog.js` — filtrid, otsing, sorteerimine | Delia |
| `feature/ostukorv` | `ostukorv.html`, `css/ostukorv.css`, `js/ostukorv.js` — korv, tarne, tellimusvorm | Delia |
| `feature/meist` | `meist.html`, `css/meist.css`, `js/meist.js` — firmast, ostutingimused, kontakt | Loreta, Sabina |
| `docs/readme` | see README | Loreta |

## Failide struktuur

```
index.html          pealeht
kataloog.html       kataloog
ostukorv.html       ostukorv
toode.html          ühe toote leht
meist.html          firmast, ostutingimused, kontakt
css/
  yhine.css         kõigi lehtede ühine stiil
  pealeht.css       ainult pealehe stiil
  kataloog.css      ainult kataloogi stiil
  ostukorv.css      ainult ostukorvi stiil
  meist.css         ainult "Meist" lehe stiil
  toode.css         ainult tootelehe stiil
js/
  tooted.js         toodete andmed (kategooriad, tooted, variandid) — tehtud automaatselt
  yhine.js          ostukorv, tootekaart koos variandi valikuga, rippmenüü, teated
  pealeht.js
  kataloog.js
  ostukorv.js
  meist.js          numbrid, ostutingimuste akordion, kontaktivormi kontroll
  toode.js          tootelehe täitmine ja variandi valik
img/                logo ja ikoonid (SVG)
img/tooted/         tootepildid doversoft.ee-st
```

## Tehnoloogiad

Puhas HTML, CSS ja JavaScript — ilma raamistiketa. Font: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).
JS-failide allikad on kirjas iga faili alguses kommentaarides.

## Tooteandmete allikas

Tootenimed, hinnad, kirjeldused, tehnilised andmed ja pildid on võetud Doversoft OÜ e-poest
[doversoft.ee](http://www.doversoft.ee). Need kuuluvad Doversoft OÜ-le ja tootjatele ning on siin
kasutatud ainult õppeprojekti jaoks. Fail `js/tooted.js` on koostatud Pythoni skriptiga, mis
rühmitab sama toote eri värvid ja suurused üheks tooteks.
