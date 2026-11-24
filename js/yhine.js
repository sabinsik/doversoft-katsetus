/* ==========================================================
   yhine.js — kõigi lehtede ühised funktsioonid:
   ostukorv (localStorage), hinna vormistamine, tootekaart, teade.
   Branch: feature/disain
   Allikad:
   - localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   - toLocaleString hinna jaoks: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

// Võti, mille all ostukorvi brauserisse salvestame
const KORVI_VOTI = "doversoft-korv-v2"; // v2: päris tooted, vana demokorv ei segaks

// Loeb ostukorvi brauseri mälust. Korv on objekt kujul { "D1001": 2, "D2003": 1 }
function loeKorv() {
  try {
    return JSON.parse(localStorage.getItem(KORVI_VOTI)) || {};
  } catch (viga) {
    // Kui mälu ei saa lugeda (nt privaatne aken), alustame tühja korviga
    return {};
  }
}

// Salvestab korvi brauseri mällu ja uuendab päises olevat numbrit
function salvestaKorv(korv) {
  try {
    localStorage.setItem(KORVI_VOTI, JSON.stringify(korv));
  } catch (viga) {
    // Salvestamine ei õnnestunud — leht töötab edasi ka ilma
  }
  uuendaKorviArv();
}

// Lisab toote korvi (vaikimisi 1 tk)
function lisaKorvi(kood, kogus = 1) {
  const korv = loeKorv();
  korv[kood] = (korv[kood] || 0) + kogus;
  salvestaKorv(korv);
  const toode = leiaToode(kood);
  naitaTeadet("Lisatud korvi: " + (toode ? toode.nimi : kood));
}

// Leiab toote koodi järgi (tagastab undefined, kui sellist pole)
function leiaToode(kood) {
  return TOOTED.find((t) => t.kood === kood.toUpperCase());
}

// Kirjutab päisesse, mitu toodet korvis on
function uuendaKorviArv() {
  const korv = loeKorv();
  let kokku = 0;
  for (const kood in korv) {
    kokku += korv[kood];
  }
  document.querySelectorAll(".korvi-arv").forEach((el) => {
    el.textContent = kokku;
  });
}

// Vormistab hinna eesti moodi: 1.5 -> "1,50 €"
function hind(summa) {
  return summa.toLocaleString("et-EE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// Teeb teksti HTML-i jaoks ohutuks (tootenimedes võib olla märke nagu " või <)
function ohutu(tekst) {
  return String(tekst).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]);
}

// Leiab tootegrupi (ühe kaardi) id järgi, nt "G526"
function leiaGrupp(id) {
  return GRUPID.find((g) => g.id === id);
}

// Tagastab grupi kõik variandid (värvid, suurused) koos hindadega
function grupiVariandid(grupp) {
  return grupp.variandid.map(leiaToode).filter(Boolean);
}

// Hind tekstina; kui poes hinda pole, kirjutame "Hind päringul"
function hinnaTekst(summa) {
  return summa > 0 ? hind(summa) : "Hind päringul";
}

// Koostab ühe tootekaardi HTML-i (kasutavad pealeht, kataloog ja tootelehe "sarnased tooted").
// Kui tootel on mitu varianti, tuleb kaardile rippmenüü, kust valida värv või suurus.
function tooteKaart(grupp) {
  const variandid = grupiVariandid(grupp);
  const esimene = variandid[0];
  const link = "toode.html?id=" + grupp.id;
  let valik = "";
  if (variandid.length > 1) {
    const valikud = variandid
      .map((v) => `<option value="${v.kood}">${ohutu(v.variant)} — ${hinnaTekst(v.hind)}</option>`)
      .join("");
    valik = `
      <label class="peidetud" for="valik-${grupp.id}">Vali variant</label>
      <select class="variandi-valik" id="valik-${grupp.id}">${valikud}</select>`;
  }
  const silt = grupp.populaarne ? `<span class="silt">Populaarne</span>` : "";
  const arv = variandid.length > 1 ? `<span class="silt silt-valikud">${variandid.length} valikut</span>` : "";
  return `
    <article class="toode" data-grupp="${grupp.id}">
      <a href="${link}" class="toode-pilt">
        ${silt}${arv}
        <img src="${esimene.pilt}" alt="${ohutu(grupp.nimi)}" loading="lazy">
      </a>
      <span class="toode-brand">${ohutu(grupp.brand || "\u00a0")}</span>
      <h3><a href="${link}">${ohutu(grupp.nimi)}</a></h3>
      ${valik}
      <p class="toode-kood">Kood <span class="kaardi-kood">${esimene.kood}</span></p>
      <div class="toode-all">
        <span class="hind kaardi-hind">${hinnaTekst(esimene.hind)}</span>
        <button type="button" class="nupp nupp-sinine" data-lisa="${esimene.kood}"${esimene.hind > 0 ? "" : " disabled"}>Lisa korvi</button>
      </div>
    </article>`;
}

// Kui kaardil valitakse teine variant, vahetame kaardil hinna, koodi, pildi ja korvi nupu
document.addEventListener("change", (sundmus) => {
  const valik = sundmus.target.closest(".variandi-valik");
  if (!valik) return;
  const kaart = valik.closest(".toode");
  const toode = leiaToode(valik.value);
  kaart.querySelector(".kaardi-hind").textContent = hinnaTekst(toode.hind);
  kaart.querySelector(".kaardi-kood").textContent = toode.kood;
  kaart.querySelector(".toode-pilt img").src = toode.pilt;
  const nupp = kaart.querySelector("[data-lisa]");
  nupp.dataset.lisa = toode.kood;
  nupp.disabled = !(toode.hind > 0);
});

// Näitab ekraani allservas lühikest teadet 2,5 sekundiks
function naitaTeadet(tekst) {
  let teade = document.querySelector(".teade");
  if (!teade) {
    teade = document.createElement("div");
    teade.className = "teade";
    document.body.appendChild(teade);
  }
  teade.textContent = tekst;
  teade.classList.add("nahtav");
  clearTimeout(teade.taimer);
  teade.taimer = setTimeout(() => teade.classList.remove("nahtav"), 2500);
}

// Üks kuulaja kogu lehele: iga nupp, millel on data-lisa, lisab toote korvi.
// Nii töötavad ka nupud, mis JS lisab lehele hiljem.
document.addEventListener("click", (sundmus) => {
  const nupp = sundmus.target.closest("[data-lisa]");
  if (nupp) {
    lisaKorvi(nupp.dataset.lisa);
  }
});

// Kui leht on laetud, näitame korvi arvu
document.addEventListener("DOMContentLoaded", uuendaKorviArv);

// ---------- Toodete rippmenüü päises ----------
// Nupule vajutades avame/sulgeme menüü. Kui kasutaja vajutab mujale
// või Esc klahvi, paneme menüü kinni.
// Allikas: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
document.addEventListener("DOMContentLoaded", () => {
  const nupp = document.querySelector("#rippmenyy-nupp");
  if (!nupp) {
    return;
  }
  const menyy = nupp.parentElement;

  // Avab või sulgeb menüü ja ütleb ekraanilugejale, kas see on lahti
  function seaAvatud(avatud) {
    menyy.classList.toggle("avatud", avatud);
    nupp.setAttribute("aria-expanded", avatud);
  }

  nupp.addEventListener("click", () => {
    seaAvatud(!menyy.classList.contains("avatud"));
  });

  // Klõps väljaspool menüüd sulgeb selle
  document.addEventListener("click", (sundmus) => {
    if (!menyy.contains(sundmus.target)) {
      seaAvatud(false);
    }
  });

  // Esc klahv sulgeb menüü
  document.addEventListener("keydown", (sundmus) => {
    if (sundmus.key === "Escape") {
      seaAvatud(false);
    }
  });
});
