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
const KORVI_VOTI = "doversoft-korv";

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

// Koostab ühe tootekaardi HTML-i (kasutavad pealeht ja kataloog)
function tooteKaart(toode) {
  const sildid = { top: "Populaarne", soodus: "Soodus", uus: "Uus" };
  const vana = toode.vanaHind ? `<span class="vana-hind">${hind(toode.vanaHind)}</span>` : "";
  return `
    <article class="toode">
      <div class="toode-pilt">
        <span class="silt silt-${toode.silt}">${sildid[toode.silt]}</span>
        <img src="${toode.pilt}" alt="${toode.nimi}">
      </div>
      <span class="toode-brand">${toode.brand}</span>
      <h3>${toode.nimi}</h3>
      <p class="toode-laos">Laos: ${toode.laos} tk · kood ${toode.kood}</p>
      <div class="toode-all">
        <div><span class="hind">${hind(toode.hind)}</span>${vana}</div>
        <button type="button" class="nupp nupp-sinine" data-lisa="${toode.kood}">Lisa korvi</button>
      </div>
    </article>`;
}

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
