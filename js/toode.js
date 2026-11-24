/* ==========================================================
   toode.js — ühe toote leht (toode.html?id=G526)
   Näitab pilti, kirjeldust, tehnilisi andmeid ja variante (värv, suurus).
   Variandi valimisel vahetuvad hind, kood ja pilt.
   Branch: feature/toode
   Allikad:
   - URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
   - history.replaceState (variant jääb lingi sisse): https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

const parameetrid = new URLSearchParams(window.location.search);
const grupp = leiaGrupp(parameetrid.get("id") || "");

if (!grupp) {
  // Vale või puuduv id: peidame tooteinfo ja näitame teadet
  document.getElementById("toote-leht").hidden = true;
  document.getElementById("toote-detailid").hidden = true;
  document.getElementById("sarnased-osa").hidden = true;
  document.getElementById("pole-toodet").hidden = false;
} else {
  naitaToodet(grupp);
}

function naitaToodet(grupp) {
  const variandid = grupiVariandid(grupp);

  // Pealkiri, bränd ja lühikirjeldus
  document.title = grupp.nimi + " — Doversoft";
  document.getElementById("toote-nimi").textContent = grupp.nimi;
  document.getElementById("toote-brand").textContent = grupp.brand;
  document.getElementById("toote-lyhi").textContent = grupp.lyhi;

  // Leivapuru: Avaleht / Kontor / Markerid / Tekstimarkerid
  const rada = [];
  let kat = KATEGOORIAD.find((k) => k.id === grupp.kat);
  while (kat) {
    rada.unshift(kat);
    kat = KATEGOORIAD.find((k) => k.id === kat.vanem);
  }
  document.getElementById("toote-puru").innerHTML =
    '<a href="index.html">Avaleht</a>' +
    rada.map((k) => ` / <a href="kataloog.html?kat=${k.id}">${ohutu(k.nimi)}</a>`).join("");

  // Kirjeldus: pikk tekst lõikudeks; kui seda pole, kasutame lühikirjeldust
  const tekst = grupp.kirjeldus || grupp.lyhi || "Selle toote kohta kirjeldus puudub.";
  document.getElementById("toote-kirjeldus").innerHTML = tekst
    .split("\n")
    .map((loik) => `<p>${ohutu(loik)}</p>`)
    .join("");

  // Tehnilised andmed (kaubamärk, EAN, pakis jne)
  const tunnused = document.getElementById("toote-tunnused");
  if (grupp.tunnused.length) {
    tunnused.innerHTML = grupp.tunnused.map(([nimi, vaartus]) => `<dt>${ohutu(nimi)}</dt><dd>${ohutu(vaartus)}</dd>`).join("");
  } else {
    // Andmeid pole: peidame terve "Tehnilised andmed" veeru
    tunnused.parentElement.hidden = true;
    document.getElementById("toote-detailid").classList.add("ainult-kirjeldus");
  }

  // Variandid nuppudena (raadionupud, et töötaks ka klaviatuuriga)
  if (variandid.length > 1) {
    document.getElementById("toote-variandid").hidden = false;
    document.getElementById("variandi-nupud").innerHTML = variandid
      .map((v) => `
        <label class="variandi-nupp">
          <input type="radio" name="variant" value="${v.kood}">
          <span>${ohutu(v.variant)}</span>
        </label>`)
      .join("");
  }

  // Kui lingis on ?v=D123, valime selle variandi, muidu esimese
  const algne = variandid.find((v) => v.kood === parameetrid.get("v")) || variandid[0];
  valiVariant(algne.kood);

  // Variandi vahetus
  document.getElementById("variandi-nupud").addEventListener("change", (sundmus) => {
    valiVariant(sundmus.target.value);
    // Paneme valitud variandi lingi sisse, et seda saaks jagada
    parameetrid.set("v", sundmus.target.value);
    history.replaceState(null, "", "?" + parameetrid.toString());
  });

  // Korvi lisamine koos kogusega
  document.getElementById("toote-vorm").addEventListener("submit", (sundmus) => {
    sundmus.preventDefault();
    const kogus = parseInt(document.getElementById("toote-kogus").value, 10) || 1;
    lisaKorvi(document.getElementById("toote-kood").textContent, kogus);
  });

  // Samast kategooriast kuni 4 teist toodet
  const sarnased = GRUPID.filter((g) => g.kat === grupp.kat && g.id !== grupp.id).slice(0, 4);
  if (sarnased.length) {
    document.getElementById("sarnased").innerHTML = sarnased.map(tooteKaart).join("");
    document.getElementById("sarnased-link").href = "kataloog.html?kat=" + grupp.kat;
  } else {
    document.getElementById("sarnased-osa").hidden = true;
  }
}

// Näitab valitud variandi hinda, koodi ja pilti
function valiVariant(kood) {
  const toode = leiaToode(kood);
  document.getElementById("toote-hind").textContent = hinnaTekst(toode.hind);
  document.getElementById("toote-kood").textContent = toode.kood;
  const pilt = document.getElementById("toote-pilt");
  pilt.src = toode.pilt;
  pilt.alt = toode.nimi;
  document.getElementById("toote-nupp").disabled = !(toode.hind > 0);
  const raadio = document.querySelector(`input[name="variant"][value="${kood}"]`);
  if (raadio) raadio.checked = true;
}
