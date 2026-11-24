# Doversoft — kontori- ja koolitarvete e-pood

Tartu Ülikooli aine **Sissejuhatus erialasse (LTAT.03.002)** veebilehe rühmatöö.

🔗 **Leht internetis:** https://kodu.ut.ee/~KASUTAJANIMI/ *(lisa siia, kui leht on üleval)*

## Mida veebileht tutvustab? (eesmärk)

Doversoft on väljamõeldud ettevõte, mis müüb kontori- ja koolitarbeid (paber, kirjatarbed, kaustad, kohv jne).
Lehe eesmärk on aidata ettevõttel end klientidele tutvustada ja lihtsustada tellimist:

- **Pealeht** (`index.html`) — pakkumiste slaider, nädala pakkumine koos taimeriga, kiirtellimus tootekoodiga, populaarsed tooted ja kategooriad.
- **Kataloog** (`kataloog.html`) — kõik tooted; filtreerimine kategooria, hinna ja soodustuse järgi, otsing ja sorteerimine.
- **Ostukorv** (`ostukorv.html`) — koguste muutmine, summa koos KM-i ja tarnega, tellimuse vorm koos andmete kontrolliga.
- **Meist** (`meist.html`) — info firma kohta, ostutingimused (avanevad küsimused) ja kontaktid koos kontaktivormiga.

Kõikide lehtede päises on **toodete rippmenüü** kategooriatega ja link ostukorvile.

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
meist.html          firmast, ostutingimused, kontakt
css/
  yhine.css         kõigi lehtede ühine stiil
  pealeht.css       ainult pealehe stiil
  kataloog.css      ainult kataloogi stiil
  ostukorv.css      ainult ostukorvi stiil
  meist.css         ainult "Meist" lehe stiil
js/
  tooted.js         toodete andmed
  yhine.js          ostukorv, tootekaart, teated
  pealeht.js
  kataloog.js
  ostukorv.js
  meist.js          numbrid, ostutingimuste akordion, kontaktivormi kontroll
img/                logo ja tootepildid (SVG)
```

## Tehnoloogiad

Puhas HTML, CSS ja JavaScript — ilma raamistiketa. Font: [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts).
JS-failide allikad on kirjas iga faili alguses kommentaarides.
