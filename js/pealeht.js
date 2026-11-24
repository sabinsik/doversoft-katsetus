/* ==========================================================
   pealeht.js — pealehe interaktiivsus:
   1) slaider, 2) nädala pakkumise taimer, 3) kiirtellimus koodiga,
   4) populaarsed tooted ja kategooriad, 5) uudiskirja vorm
   Branch: feature/pealeht
   Allikad:
   - setInterval: https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
   - Date objekt: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
   - slaideri idee: https://www.w3schools.com/howto/howto_js_slideshow.asp
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

/* ---------- 1) Slaider ---------- */
const slaidid = document.querySelectorAll(".slaid");
const punktid = document.querySelectorAll(".punkt");
let praeguneSlaid = 0;

// Näitab slaidi numbriga n (0, 1, 2). Kui n läheb üle piiri, alustab otsast.
function naitaSlaidi(n) {
  praeguneSlaid = (n + slaidid.length) % slaidid.length;
  slaidid.forEach((slaid, i) => slaid.classList.toggle("aktiivne", i === praeguneSlaid));
  punktid.forEach((punkt, i) => punkt.classList.toggle("aktiivne", i === praeguneSlaid));
}

document.getElementById("eelmine").addEventListener("click", () => naitaSlaidi(praeguneSlaid - 1));
document.getElementById("jargmine").addEventListener("click", () => naitaSlaidi(praeguneSlaid + 1));
punktid.forEach((punkt, i) => punkt.addEventListener("click", () => naitaSlaidi(i)));

// Slaid vahetub ise iga 6 sekundi järel
setInterval(() => naitaSlaidi(praeguneSlaid + 1), 6000);

/* ---------- 2) Nädala toode ja taimer ---------- */
// Nädala toode valitakse populaarsete toodete seast nädala numbri järgi,
// nii et see vahetub iga esmaspäev ise.
const nadalaValik = GRUPID.filter((g) => g.populaarne && grupiVariandid(g)[0].hind > 0);
const nadalaNr = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
const nadalaToode = nadalaValik[nadalaNr % nadalaValik.length];
if (nadalaToode) {
  const esimene = grupiVariandid(nadalaToode)[0];
  document.getElementById("nadala-link").href = "toode.html?id=" + nadalaToode.id;
  document.getElementById("nadala-pilt").src = esimene.pilt;
  document.getElementById("nadala-pilt").alt = nadalaToode.nimi;
  document.getElementById("nadala-brand").textContent = nadalaToode.brand;
  document.getElementById("nadala-nimi").textContent = nadalaToode.nimi;
  document.getElementById("nadala-hind").textContent = hinnaTekst(esimene.hind);
  document.getElementById("nadala-nupp").dataset.lisa = esimene.kood;
}

// Taimer loeb aega järgmise pühapäeva 23:59:59-ni
function nadalaLopp() {
  const lopp = new Date();
  const paevi = (7 - lopp.getDay()) % 7; // getDay(): 0 = pühapäev
  lopp.setDate(lopp.getDate() + paevi);
  lopp.setHours(23, 59, 59, 0);
  return lopp;
}

const pakkumiseLopp = nadalaLopp();

// Arvutab, palju aega on jäänud, ja kirjutab selle taimerisse
function uuendaTaimerit() {
  const jaanud = Math.max(0, pakkumiseLopp - new Date()); // millisekundid
  const sekundeid = Math.floor(jaanud / 1000);
  document.getElementById("paevad").textContent = Math.floor(sekundeid / 86400);
  document.getElementById("tunnid").textContent = Math.floor((sekundeid % 86400) / 3600);
  document.getElementById("minutid").textContent = Math.floor((sekundeid % 3600) / 60);
  document.getElementById("sekundid").textContent = sekundeid % 60;
}

uuendaTaimerit();
setInterval(uuendaTaimerit, 1000);

/* ---------- 3) Kiirtellimus koodiga ---------- */
document.getElementById("kiir-vorm").addEventListener("submit", (sundmus) => {
  sundmus.preventDefault(); // ei lase vormil lehte uuesti laadida
  const kood = document.getElementById("kiir-kood").value.trim();
  const kogus = parseInt(document.getElementById("kiir-kogus").value, 10) || 1;
  const vastus = document.getElementById("kiir-vastus");
  const toode = leiaToode(kood);

  if (toode) {
    lisaKorvi(toode.kood, kogus);
    vastus.textContent = "✓ " + kogus + " × " + toode.nimi + " lisatud korvi";
    vastus.className = "kiir-vastus ok";
    sundmus.target.reset();
  } else {
    vastus.textContent = "✗ Koodiga „" + kood + "“ toodet ei leitud";
    vastus.className = "kiir-vastus viga";
  }
});

/* ---------- 4) Populaarsed tooted ja kategooriad ---------- */
// Populaarsed on need tooted, mis on ka doversoft.ee avalehel esile tõstetud
const populaarsed = GRUPID.filter((g) => g.populaarne).slice(0, 8);
document.getElementById("populaarsed").innerHTML = populaarsed.map(tooteKaart).join("");

// Iga peakategooria kohta kaart koos toodete arvuga (arvestame ka alamkategooriaid)
function kategooriasTooteid(katId) {
  const alamad = KATEGOORIAD.filter((k) => k.vanem === katId).map((k) => k.id);
  return GRUPID.filter((g) => g.kat === katId).length + alamad.reduce((summa, id) => summa + kategooriasTooteid(id), 0);
}

document.getElementById("kategooriad").innerHTML = KATEGOORIAD.filter((k) => k.tase === 1).map((kat) => `
    <a class="kategooria" href="kataloog.html?kat=${kat.id}">
      <img src="${KATEGOORIA_PILT[kat.id]}" alt="">
      <h3>${ohutu(kat.nimi)}</h3>
      <p>${kategooriasTooteid(kat.id)} toodet</p>
    </a>`).join("");

/* ---------- 5) Uudiskiri ---------- */
document.getElementById("uudiskirja-vorm").addEventListener("submit", (sundmus) => {
  sundmus.preventDefault();
  naitaTeadet("Aitäh! Oled uudiskirjaga liitunud");
  sundmus.target.reset();
});
