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

/* ---------- 2) Nädala pakkumise taimer ---------- */
// Pakkumine lõpeb järgmisel pühapäeval kell 23:59:59
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
// Võtame tooted, millel on silt "top", ja näitame esimest 8
const populaarsed = TOOTED.filter((t) => t.silt === "top").slice(0, 8);
document.getElementById("populaarsed").innerHTML = populaarsed.map(tooteKaart).join("");

// Iga kategooria kohta kaart koos toodete arvuga
document.getElementById("kategooriad").innerHTML = KATEGOORIAD.map((kat) => {
  const arv = TOOTED.filter((t) => t.kat === kat.id).length;
  return `
    <a class="kategooria" href="kataloog.html?kat=${kat.id}">
      <img src="${kat.pilt}" alt="">
      <h3>${kat.nimi}</h3>
      <p>${arv} toodet</p>
    </a>`;
}).join("");

/* ---------- 5) Uudiskiri ---------- */
document.getElementById("uudiskirja-vorm").addEventListener("submit", (sundmus) => {
  sundmus.preventDefault();
  naitaTeadet("Aitäh! Oled uudiskirjaga liitunud");
  sundmus.target.reset();
});
