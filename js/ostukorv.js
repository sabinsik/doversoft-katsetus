/* ==========================================================
   ostukorv.js — ostukorvi näitamine, koguste muutmine,
   summade arvutus (KM, tarne) ja tellimuse vormi kontroll
   Branch: feature/ostukorv
   Allikad:
   - vormi kontroll JS-iga: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
   - regulaaravaldis e-posti jaoks: https://www.w3resource.com/javascript/form/email-validation.php
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

const KM_MAAR = 0.24;          // Eesti käibemaks 24%
const TASUTA_TARNE_ALATES = 50; // eurot

const ridadeKoht = document.getElementById("korvi-read");
const vorm = document.getElementById("tellimuse-vorm");

/* ---------- 1) Korvi ridade näitamine ---------- */
function naitaKorvi() {
  const korv = loeKorv();
  const koodid = Object.keys(korv).filter((kood) => leiaToode(kood)); // ainult olemasolevad tooted

  // Tühi korv: peidame read ja näitame "korv on tühi"
  document.getElementById("tyhi-korv").hidden = koodid.length > 0;
  document.getElementById("telli-nupp").disabled = koodid.length === 0;

  ridadeKoht.innerHTML = koodid.map((kood) => {
    const toode = leiaToode(kood);
    const kogus = korv[kood];
    return `
      <div class="korvi-rida">
        <img src="${toode.pilt}" alt="${toode.nimi}">
        <div>
          <h3>${toode.nimi}</h3>
          <small>${toode.brand} · ${toode.kood} · ${hind(toode.hind)} / tk</small>
        </div>
        <div class="kogus">
          <button type="button" data-muuda="-1" data-kood="${kood}" aria-label="Vähenda kogust">−</button>
          <span>${kogus}</span>
          <button type="button" data-muuda="1" data-kood="${kood}" aria-label="Suurenda kogust">+</button>
        </div>
        <span class="rea-summa">${hind(toode.hind * kogus)}</span>
        <button type="button" class="eemalda" data-eemalda="${kood}" aria-label="Eemalda toode">🗑</button>
      </div>`;
  }).join("");

  arvutaSummad();
}

/* ---------- 2) Summade arvutamine ---------- */
function arvutaSummad() {
  const korv = loeKorv();
  let tooted = 0;
  let arv = 0;

  for (const kood in korv) {
    const toode = leiaToode(kood);
    if (toode) {
      tooted += toode.hind * korv[kood];
      arv += korv[kood];
    }
  }

  // Valitud tarne hind; üle 50 € on tarne tasuta
  let tarne = Number(vorm.querySelector('input[name="tarne"]:checked').value);
  if (tooted >= TASUTA_TARNE_ALATES) tarne = 0;

  // Hind sisaldab juba KM-i, seega KM = hind - hind / 1,24
  const km = tooted - tooted / (1 + KM_MAAR);

  document.getElementById("kv-arv").textContent = arv;
  document.getElementById("kv-tooted").textContent = hind(tooted);
  document.getElementById("kv-km").textContent = hind(km);
  document.getElementById("kv-tarne").textContent = tarne === 0 ? "Tasuta" : hind(tarne);
  document.getElementById("kv-kokku").textContent = hind(tooted + tarne);

  // Riba, mis näitab, kui palju on jäänud tasuta tarneni
  const puudu = TASUTA_TARNE_ALATES - tooted;
  document.getElementById("tasuta-tarne").textContent =
    puudu > 0 ? "Lisa veel " + hind(puudu) + " ja tarne on tasuta 🚚" : "🎉 Sul on tasuta tarne!";
  document.getElementById("tasuta-riba").style.width = Math.min(100, (tooted / TASUTA_TARNE_ALATES) * 100) + "%";
}

/* ---------- 3) Koguse muutmine ja eemaldamine ---------- */
ridadeKoht.addEventListener("click", (sundmus) => {
  const korv = loeKorv();
  const muuda = sundmus.target.closest("[data-muuda]");
  const eemalda = sundmus.target.closest("[data-eemalda]");

  if (muuda) {
    const kood = muuda.dataset.kood;
    korv[kood] += Number(muuda.dataset.muuda);
    if (korv[kood] <= 0) delete korv[kood]; // kogus 0 = eemaldame
  }
  if (eemalda) {
    delete korv[eemalda.dataset.eemalda];
  }

  salvestaKorv(korv);
  naitaKorvi();
});

// Tarneviisi muutmisel arvutame summa uuesti
vorm.addEventListener("change", (sundmus) => {
  if (sundmus.target.name === "tarne") arvutaSummad();
});

/* ---------- 4) Vormi kontroll ---------- */
// Kontrollib ühte välja ja näitab vajadusel veateadet
function kontrolliVali(id, kontroll, veateade) {
  const vali = document.getElementById(id);
  const korras = kontroll(vali.value.trim());
  const ymbris = vali.closest(".vali");
  ymbris.classList.toggle("vigane", !korras);
  ymbris.querySelector(".vea-tekst").textContent = korras ? "" : veateade;
  return korras;
}

vorm.addEventListener("submit", (sundmus) => {
  sundmus.preventDefault();

  // Kontrollime kõiki välju (& asemel kasutame massiivi, et KÕIK vead näidataks korraga)
  const tulemused = [
    kontrolliVali("nimi", (v) => v.length >= 2, "Palun sisesta oma nimi"),
    kontrolliVali("email", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Kontrolli e-posti aadressi"),
    kontrolliVali("telefon", (v) => /^\+?[0-9 ]{7,15}$/.test(v), "Telefon peab olema nt +372 5555 5555"),
    kontrolliVali("ettevote", (v) => !document.getElementById("arvega").checked || v.length > 0, "Arvega maksmiseks sisesta ettevõtte nimi")
  ];

  if (tulemused.includes(false)) {
    naitaTeadet("Palun paranda punasega märgitud väljad");
    return;
  }

  // Kõik korras: näitame kinnitust ja tühjendame korvi
  document.getElementById("tellimuse-nr").textContent = "D" + Date.now().toString().slice(-6);
  document.getElementById("kinnitus-email").textContent = document.getElementById("email").value;
  document.getElementById("korv-paigutus").hidden = true;
  document.getElementById("kinnitus").hidden = false;
  document.getElementById("samm-tarne").classList.add("tehtud");
  document.getElementById("samm-valmis").classList.add("tehtud");
  salvestaKorv({});
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Esimene kuvamine
naitaKorvi();
