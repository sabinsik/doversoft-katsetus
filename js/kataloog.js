/* ==========================================================
   kataloog.js — toodete filtreerimine, otsing ja sorteerimine
   Branch: feature/kataloog
   Allikad:
   - URLSearchParams (?kat=paber lugemine): https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
   - Array.filter ja Array.sort: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

// Lehe elemendid, mida kasutame
const katValikud = document.getElementById("kat-valikud");
const maxHind = document.getElementById("max-hind");
const hinnaNaidik = document.getElementById("hind-naidik");
const ainultSoodus = document.getElementById("ainult-soodus");
const ainultUued = document.getElementById("ainult-uued");
const otsinguVali = document.getElementById("kataloog-otsi");
const sorteeri = document.getElementById("sorteeri");
const toodeteKoht = document.getElementById("kataloogi-tooted");

/* ---------- 1) Kategooriate märkeruudud ---------- */
katValikud.innerHTML = KATEGOORIAD.map((kat) => {
  const arv = TOOTED.filter((t) => t.kat === kat.id).length;
  return `<label class="valik"><input type="checkbox" value="${kat.id}"> ${kat.nimi} <small>${arv}</small></label>`;
}).join("");

/* ---------- 2) Loeme URL-ist algsed filtrid ---------- */
// Näiteks kataloog.html?kat=paber või kataloog.html?otsi=pilot või ?soodus=1
const url = new URLSearchParams(window.location.search);
if (url.get("kat")) {
  const ruut = katValikud.querySelector(`input[value="${url.get("kat")}"]`);
  if (ruut) ruut.checked = true;
}
if (url.get("otsi")) {
  otsinguVali.value = url.get("otsi");
  document.getElementById("otsi").value = url.get("otsi"); // ka päise otsingusse
}
if (url.get("soodus")) {
  ainultSoodus.checked = true;
}

/* ---------- 3) Põhifunktsioon: filtreeri, sorteeri, näita ---------- */
function naitaTooteid() {
  // Millised kategooriad on valitud?
  const valitudKat = [...katValikud.querySelectorAll("input:checked")].map((r) => r.value);
  const otsing = otsinguVali.value.trim().toLowerCase();
  const piir = Number(maxHind.value);

  hinnaNaidik.textContent = piir + " €";

  // Filtreerime: toode jääb alles ainult siis, kui vastab KÕIGILE tingimustele
  let tulemus = TOOTED.filter((t) => {
    if (valitudKat.length > 0 && !valitudKat.includes(t.kat)) return false;
    if (t.hind > piir) return false;
    if (ainultSoodus.checked && t.silt !== "soodus") return false;
    if (ainultUued.checked && t.silt !== "uus") return false;
    if (otsing) {
      const tekst = (t.nimi + " " + t.brand + " " + t.kood).toLowerCase();
      if (!tekst.includes(otsing)) return false;
    }
    return true;
  });

  // Sorteerime vastavalt valikule
  if (sorteeri.value === "odav") tulemus.sort((a, b) => a.hind - b.hind);
  if (sorteeri.value === "kallis") tulemus.sort((a, b) => b.hind - a.hind);
  if (sorteeri.value === "nimi") tulemus.sort((a, b) => a.nimi.localeCompare(b.nimi, "et"));
  if (sorteeri.value === "populaarne") tulemus.sort((a, b) => (b.silt === "top") - (a.silt === "top"));

  // Näitame tulemused
  toodeteKoht.innerHTML = tulemus.map(tooteKaart).join("");
  document.getElementById("tulemuste-arv").textContent = tulemus.length + (tulemus.length === 1 ? " toode" : " toodet");
  document.getElementById("tyhi").hidden = tulemus.length > 0;

  uuendaPealkirja(valitudKat);
  naitaKiipe(valitudKat, otsing);
}

/* ---------- 4) Pealkiri sõltub valitud kategooriast ---------- */
function uuendaPealkirja(valitudKat) {
  let pealkiri = "Kõik tooted";
  if (valitudKat.length === 1) {
    pealkiri = KATEGOORIAD.find((k) => k.id === valitudKat[0]).nimi;
  } else if (ainultSoodus.checked) {
    pealkiri = "Soodustused";
  }
  document.getElementById("kataloogi-pealkiri").textContent = pealkiri;
  document.getElementById("leivapuru-kat").textContent = pealkiri;
  document.title = pealkiri + " — Doversoft";
}

/* ---------- 5) Aktiivsete filtrite kiibid (klikk eemaldab filtri) ---------- */
function naitaKiipe(valitudKat, otsing) {
  const kiibid = [];
  valitudKat.forEach((id) => {
    const nimi = KATEGOORIAD.find((k) => k.id === id).nimi;
    kiibid.push(`<button type="button" class="kiip" data-eemalda="kat:${id}">${nimi} ✕</button>`);
  });
  // Kasutaja teksti ei pane otse HTML-i (turvalisus): asendame < ja > jne ohutute märkidega
  const ohutu = otsing.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]);
  if (otsing) kiibid.push(`<button type="button" class="kiip" data-eemalda="otsing">„${ohutu}“ ✕</button>`);
  if (ainultSoodus.checked) kiibid.push(`<button type="button" class="kiip" data-eemalda="soodus">Soodustused ✕</button>`);
  if (ainultUued.checked) kiibid.push(`<button type="button" class="kiip" data-eemalda="uued">Uued ✕</button>`);
  document.getElementById("aktiivsed-filtrid").innerHTML = kiibid.join("");
}

document.getElementById("aktiivsed-filtrid").addEventListener("click", (sundmus) => {
  const kiip = sundmus.target.closest("[data-eemalda]");
  if (!kiip) return;
  const mida = kiip.dataset.eemalda;
  if (mida.startsWith("kat:")) katValikud.querySelector(`input[value="${mida.slice(4)}"]`).checked = false;
  if (mida === "otsing") otsinguVali.value = "";
  if (mida === "soodus") ainultSoodus.checked = false;
  if (mida === "uued") ainultUued.checked = false;
  naitaTooteid();
});

/* ---------- 6) Kuulajad: iga muudatus näitab tooted uuesti ---------- */
document.getElementById("filtri-vorm").addEventListener("input", naitaTooteid);
otsinguVali.addEventListener("input", naitaTooteid);
sorteeri.addEventListener("change", naitaTooteid);

// "Tühjenda filtrid" nupp: vorm tühjendatakse, siis näitame uuesti
document.getElementById("filtri-vorm").addEventListener("reset", () => {
  otsinguVali.value = "";
  setTimeout(naitaTooteid, 0); // ootame, kuni brauser on vormi tühjendanud
});
document.getElementById("tyhi-nupp").addEventListener("click", () => {
  document.getElementById("filtri-vorm").reset();
});

// Päise otsing kataloogilehel: otsime kohe, ilma lehte uuesti laadimata
document.querySelector(".pais .otsing").addEventListener("submit", (sundmus) => {
  sundmus.preventDefault();
  otsinguVali.value = document.getElementById("otsi").value;
  naitaTooteid();
});

// Esimene kuvamine lehe avamisel
naitaTooteid();
