/* ==========================================================
   kataloog.js — toodete filtreerimine, otsing ja sorteerimine
   Branch: feature/kataloog
   Allikad:
   - URLSearchParams (?kat=26 lugemine): https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
   - Array.filter ja Array.sort: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

// Lehe elemendid, mida kasutame
const katValikud = document.getElementById("kat-valikud");
const brandValik = document.getElementById("brand");
const maxHind = document.getElementById("max-hind");
const hinnaNaidik = document.getElementById("hind-naidik");
const otsinguVali = document.getElementById("kataloog-otsi");
const sorteeri = document.getElementById("sorteeri");
const toodeteKoht = document.getElementById("kataloogi-tooted");
const rohkemNupp = document.getElementById("naita-rohkem");

// Mitu toodet korraga näitame; "Näita rohkem" lisab sama palju juurde
const LEHE_SUURUS = 24;
let naidatavaid = LEHE_SUURUS;

/* ---------- Abifunktsioonid ---------- */

// Kategooria ja kõik tema ülemkategooriad, nt Tekstimarkerid -> Markerid -> Kontor
function kategooriaRada(id) {
  const rada = [];
  let kat = KATEGOORIAD.find((k) => k.id === id);
  while (kat) {
    rada.unshift(kat);
    kat = KATEGOORIAD.find((k) => k.id === kat.vanem);
  }
  return rada;
}

// Grupi madalaim hind (kui variandid on erineva hinnaga)
function grupiHind(grupp) {
  const hinnad = grupiVariandid(grupp).map((v) => v.hind).filter((h) => h > 0);
  return hinnad.length ? Math.min(...hinnad) : 0;
}

// Arvutame iga grupi kategooriarajad, hinna ja otsinguteksti üks kord ette
const andmed = GRUPID.map((g) => ({
  grupp: g,
  rada: kategooriaRada(g.kat).map((k) => k.id),
  hind: grupiHind(g),
  otsitav: (g.nimi + " " + g.brand + " " + grupiVariandid(g).map((v) => v.nimi + " " + v.kood).join(" ")).toLowerCase()
}));

/* ---------- 1) Kategooriate puu: peakategooria ja selle alamkategooriad ---------- */
function mituToodet(katId) {
  return andmed.filter((a) => a.rada.includes(katId)).length;
}

// Üks märkeruut kategooria kohta; alamkategooriad (ka 3. tase) tulevad selle alla taandega
function katRuut(kat) {
  const klass = ["", "pea", "alam", "alam2"][kat.tase] || "alam2";
  const alamad = KATEGOORIAD.filter((k) => k.vanem === kat.id).map(katRuut).join("");
  return `<label class="valik ${klass}"><input type="checkbox" value="${kat.id}"> ${ohutu(kat.nimi)} <small>${mituToodet(kat.id)}</small></label>${alamad}`;
}

katValikud.innerHTML = KATEGOORIAD.filter((k) => k.tase === 1)
  .map((pea) => `<div class="kat-grupp">${katRuut(pea)}</div>`)
  .join("");

/* ---------- 2) Kaubamärgid valikusse (kõige rohkem tooteid enne) ---------- */
const brandid = {};
andmed.forEach((a) => {
  if (a.grupp.brand) brandid[a.grupp.brand] = (brandid[a.grupp.brand] || 0) + 1;
});
Object.keys(brandid)
  .sort((x, y) => x.localeCompare(y, "et"))
  .forEach((b) => brandValik.insertAdjacentHTML("beforeend", `<option value="${ohutu(b)}">${ohutu(b)} (${brandid[b]})</option>`));

// Hinnaliugur ulatub kõige kallima tooteni
const korgeimHind = Math.ceil(Math.max(...andmed.map((a) => a.hind)));
maxHind.max = korgeimHind;
maxHind.value = korgeimHind;

/* ---------- 3) Loeme URL-ist algsed filtrid ---------- */
// Näiteks kataloog.html?kat=26 (Markerid) või kataloog.html?otsi=edding
const url = new URLSearchParams(window.location.search);
if (url.get("kat")) {
  const ruut = katValikud.querySelector(`input[value="${CSS.escape(url.get("kat"))}"]`);
  if (ruut) ruut.checked = true;
}
if (url.get("otsi")) {
  otsinguVali.value = url.get("otsi");
  document.getElementById("otsi").value = url.get("otsi"); // ka päise otsingusse
}

/* ---------- 4) Põhifunktsioon: filtreeri, sorteeri, näita ---------- */
function naitaTooteid() {
  const valitudKat = [...katValikud.querySelectorAll("input:checked")].map((r) => r.value);
  const brand = brandValik.value;
  const otsing = otsinguVali.value.trim().toLowerCase();
  const piir = Number(maxHind.value);

  hinnaNaidik.textContent = piir + " €";

  // Toode jääb alles ainult siis, kui vastab KÕIGILE tingimustele
  const tulemus = andmed.filter((a) => {
    if (valitudKat.length > 0 && !valitudKat.some((id) => a.rada.includes(id))) return false;
    if (brand && a.grupp.brand !== brand) return false;
    if (a.hind > piir) return false;
    if (otsing && !otsing.split(/\s+/).every((sona) => a.otsitav.includes(sona))) return false;
    return true;
  });

  // Sorteerime vastavalt valikule
  if (sorteeri.value === "odav") tulemus.sort((x, y) => (x.hind || Infinity) - (y.hind || Infinity));
  if (sorteeri.value === "kallis") tulemus.sort((x, y) => y.hind - x.hind);
  if (sorteeri.value === "nimi") tulemus.sort((x, y) => x.grupp.nimi.localeCompare(y.grupp.nimi, "et"));
  if (sorteeri.value === "populaarne") tulemus.sort((x, y) => y.grupp.populaarne - x.grupp.populaarne);

  // Näitame ainult esimesed N toodet, ülejäänud tulevad "Näita rohkem" nupuga
  toodeteKoht.innerHTML = tulemus.slice(0, naidatavaid).map((a) => tooteKaart(a.grupp)).join("");
  rohkemNupp.hidden = tulemus.length <= naidatavaid;
  rohkemNupp.textContent = `Näita rohkem (${tulemus.length - naidatavaid} veel)`;

  document.getElementById("tulemuste-arv").textContent = tulemus.length + (tulemus.length === 1 ? " toode" : " toodet");
  document.getElementById("tyhi").hidden = tulemus.length > 0;

  uuendaPealkirja(valitudKat);
  naitaKiipe(valitudKat, otsing, brand);
}

// Iga filtri muutus alustab jälle esimesest lehest
function filtrid() {
  naidatavaid = LEHE_SUURUS;
  naitaTooteid();
}

/* ---------- 5) Pealkiri ja leivapuru sõltuvad valitud kategooriast ---------- */
function uuendaPealkirja(valitudKat) {
  let pealkiri = "Kõik tooted";
  let puru = "Kataloog";
  if (valitudKat.length === 1) {
    const rada = kategooriaRada(valitudKat[0]);
    pealkiri = rada[rada.length - 1].nimi;
    puru = rada.map((k) => k.nimi).join(" / ");
  }
  document.getElementById("kataloogi-pealkiri").textContent = pealkiri;
  document.getElementById("leivapuru-kat").textContent = puru;
  document.title = pealkiri + " — Doversoft";
}

/* ---------- 6) Aktiivsete filtrite kiibid (klikk eemaldab filtri) ---------- */
function naitaKiipe(valitudKat, otsing, brand) {
  const kiibid = valitudKat.map((id) => {
    const nimi = KATEGOORIAD.find((k) => k.id === id).nimi;
    return `<button type="button" class="kiip" data-eemalda="kat:${id}">${ohutu(nimi)} ✕</button>`;
  });
  if (brand) kiibid.push(`<button type="button" class="kiip" data-eemalda="brand">${ohutu(brand)} ✕</button>`);
  if (otsing) kiibid.push(`<button type="button" class="kiip" data-eemalda="otsing">„${ohutu(otsing)}“ ✕</button>`);
  document.getElementById("aktiivsed-filtrid").innerHTML = kiibid.join("");
}

document.getElementById("aktiivsed-filtrid").addEventListener("click", (sundmus) => {
  const kiip = sundmus.target.closest("[data-eemalda]");
  if (!kiip) return;
  const mida = kiip.dataset.eemalda;
  if (mida.startsWith("kat:")) katValikud.querySelector(`input[value="${mida.slice(4)}"]`).checked = false;
  if (mida === "brand") brandValik.value = "";
  if (mida === "otsing") otsinguVali.value = "";
  filtrid();
});

/* ---------- 7) Kuulajad: iga muudatus näitab tooted uuesti ---------- */
document.getElementById("filtri-vorm").addEventListener("input", filtrid);
otsinguVali.addEventListener("input", filtrid);
sorteeri.addEventListener("change", filtrid);

rohkemNupp.addEventListener("click", () => {
  naidatavaid += LEHE_SUURUS;
  naitaTooteid();
});

// "Tühjenda filtrid": vorm tühjendatakse, siis näitame uuesti
document.getElementById("filtri-vorm").addEventListener("reset", () => {
  otsinguVali.value = "";
  setTimeout(() => {
    maxHind.value = korgeimHind; // reset paneks HTML-i algväärtuse, mitte kõige kallima hinna
    filtrid();
  }, 0);
});
document.getElementById("tyhi-nupp").addEventListener("click", () => {
  document.getElementById("filtri-vorm").reset();
});

// Päise otsing kataloogilehel: otsime kohe, ilma lehte uuesti laadimata
document.querySelector(".pais .otsing").addEventListener("submit", (sundmus) => {
  sundmus.preventDefault();
  otsinguVali.value = document.getElementById("otsi").value;
  filtrid();
});

// Esimene kuvamine lehe avamisel
naitaTooteid();
