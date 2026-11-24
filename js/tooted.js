/* ==========================================================
   tooted.js — toodete ja kategooriate andmed
   Kõik lehed loevad tooteid siit, et andmed oleks ühes kohas.
   Hinnad on KM-ga (24%).
   Branch: feature/disain
   Allikas: andmed koostas meie tiim (Doversoft demo-kataloog).
   ========================================================== */

// Kategooriad: id (kasutatakse lingis ?kat=...), nimi ja vaikimisi pilt
const KATEGOORIAD = [
  { id: "kirjutus", nimi: "Kirjutamine", pilt: "img/pliiats.svg" },
  { id: "paber", nimi: "Paber", pilt: "img/paber.svg" },
  { id: "arhiiv", nimi: "Arhiveerimine", pilt: "img/kaust.svg" },
  { id: "kontor", nimi: "Kontoritarbed", pilt: "img/kaarid.svg" },
  { id: "kool", nimi: "Kool ja hobi", pilt: "img/varvid.svg" },
  { id: "kohv", nimi: "Kohvipaus", pilt: "img/kohv.svg" },
  { id: "puhastus", nimi: "Puhastus", pilt: "img/puhastus.svg" }
];

// Tooted: kood, nimi, bränd, kategooria, hind, vana hind (kui on soodus),
// laoseis, pilt ja silt ("top" = populaarne, "soodus", "uus")
const TOOTED = [
  { kood: "D1001", nimi: "Pastapliiats Cello Wings 0,5 mm sinine", brand: "Cello", kat: "kirjutus", hind: 0.89, laos: 22, pilt: "img/pliiats.svg", silt: "top" },
  { kood: "D1002", nimi: "Pastapliiats Schneider Slider Memo XB must", brand: "Schneider", kat: "kirjutus", hind: 1.80, vanaHind: 2.22, laos: 40, pilt: "img/pliiats.svg", silt: "soodus" },
  { kood: "D1003", nimi: "Geelpliiats Pilot G-2 0,7 mm sinine", brand: "Pilot", kat: "kirjutus", hind: 2.96, laos: 30, pilt: "img/pliiats.svg", silt: "top" },
  { kood: "D1004", nimi: "Tindipliiats Parker IM Fine must", brand: "Parker", kat: "kirjutus", hind: 59.00, laos: 6, pilt: "img/pliiats.svg", silt: "uus" },
  { kood: "D1005", nimi: "Valgetahvlimarker Edding 360 must", brand: "Edding", kat: "kirjutus", hind: 2.67, laos: 38, pilt: "img/pliiats.svg", silt: "top" },
  { kood: "D1006", nimi: "Tekstimarker Stabilo Boss Original kollane", brand: "Stabilo", kat: "kirjutus", hind: 1.48, vanaHind: 1.85, laos: 51, pilt: "img/pliiats.svg", silt: "soodus" },
  { kood: "D2001", nimi: "Koopiapaber Navigator A4 80 g 500 lehte", brand: "Navigator", kat: "paber", hind: 8.00, laos: 63, pilt: "img/paber.svg", silt: "top" },
  { kood: "D2002", nimi: "Klade spiraaliga Oxford A4 joon 90 lehte", brand: "Oxford", kat: "paber", hind: 5.32, laos: 18, pilt: "img/paber.svg", silt: "uus" },
  { kood: "D2003", nimi: "Märkmepaber Post-it 76×76 mm kollane", brand: "Post-it", kat: "paber", hind: 2.34, laos: 28, pilt: "img/markmed.svg", silt: "top" },
  { kood: "D2004", nimi: "Märkmepaber Post-it neoonvärvid 5 plokki", brand: "Post-it", kat: "paber", hind: 10.53, vanaHind: 12.39, laos: 14, pilt: "img/markmed.svg", silt: "soodus" },
  { kood: "D3001", nimi: "Registraator College A4 4 cm sinine", brand: "College", kat: "arhiiv", hind: 2.47, laos: 36, pilt: "img/kaust.svg", silt: "top" },
  { kood: "D3002", nimi: "Registraator Leitz 180° A4 8 cm punane", brand: "Leitz", kat: "arhiiv", hind: 5.69, laos: 12, pilt: "img/kaust.svg", silt: "uus" },
  { kood: "D3003", nimi: "Kilekaaned perforeeritud A4 100 tk", brand: "Esselte", kat: "arhiiv", hind: 8.56, vanaHind: 9.80, laos: 25, pilt: "img/kaust.svg", silt: "soodus" },
  { kood: "D4001", nimi: "Klammerdaja Rapid Classic K1 24/6", brand: "Rapid", kat: "kontor", hind: 18.48, laos: 9, pilt: "img/kaarid.svg", silt: "top" },
  { kood: "D4002", nimi: "Käärid Fiskars Classic 21 cm", brand: "Fiskars", kat: "kontor", hind: 12.28, laos: 60, pilt: "img/kaarid.svg", silt: "top" },
  { kood: "D4003", nimi: "Kleeplint Scotch Magic 19 mm × 33 m", brand: "Scotch", kat: "kontor", hind: 4.33, vanaHind: 4.95, laos: 44, pilt: "img/kaarid.svg", silt: "soodus" },
  { kood: "D4004", nimi: "Kalkulaator Casio FX-82 teaduslik", brand: "Casio", kat: "kontor", hind: 20.46, laos: 11, pilt: "img/kalkulaator.svg", silt: "uus" },
  { kood: "D5001", nimi: "Vesivärvid Faber-Castell 12 värvi", brand: "Faber-Castell", kat: "kool", hind: 1.85, laos: 33, pilt: "img/varvid.svg", silt: "top" },
  { kood: "D5002", nimi: "Värvipliiatsid Faber-Castell Grip 24 värvi", brand: "Faber-Castell", kat: "kool", hind: 14.76, vanaHind: 17.98, laos: 20, pilt: "img/varvid.svg", silt: "soodus" },
  { kood: "D5003", nimi: "Pinal tõmblukuga Herlitz roosa", brand: "Herlitz", kat: "kool", hind: 7.32, laos: 15, pilt: "img/varvid.svg", silt: "uus" },
  { kood: "D6001", nimi: "Kohvioad Paulig Presidentti 1 kg", brand: "Paulig", kat: "kohv", hind: 22.20, laos: 27, pilt: "img/kohv.svg", silt: "top" },
  { kood: "D6002", nimi: "Mineraalvesi Värska 0,5 l 12 tk", brand: "Värska", kat: "kohv", hind: 9.80, laos: 19, pilt: "img/kohv.svg", silt: "uus" },
  { kood: "D7001", nimi: "Universaalne puhastusvahend Estko 1 l", brand: "Estko", kat: "puhastus", hind: 4.33, vanaHind: 4.95, laos: 31, pilt: "img/puhastus.svg", silt: "soodus" },
  { kood: "D7002", nimi: "Paberrätikud Katrin Plus 2 rulli", brand: "Katrin", kat: "puhastus", hind: 6.10, laos: 48, pilt: "img/puhastus.svg", silt: "top" }
];
