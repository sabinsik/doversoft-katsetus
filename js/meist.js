/* ==========================================================
   meist.js — "Meist" lehe interaktiivsus:
   numbrite üleslugemine, ostutingimuste akordion, kontaktivormi kontroll.
   Branch: feature/meist
   Allikad:
   - IntersectionObserver: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
   - requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
   - vormi kontroll: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
   - kood on kirjutatud meie tiimi poolt Claude'i (AI) abiga
   ========================================================== */

// ---------- Numbrite üleslugemine ----------
// Loeb elemendi arvu nullist kuni data-loe väärtuseni umbes 1,2 sekundiga
function loeYles(element) {
  const siht = Number(element.dataset.loe);
  const kestus = 1200;
  const algus = performance.now();

  function samm(praegu) {
    // Kui suur osa ajast on möödas (0 kuni 1)
    const osa = Math.min((praegu - algus) / kestus, 1);
    element.textContent = Math.round(siht * osa).toLocaleString("et-EE");
    if (osa < 1) {
      requestAnimationFrame(samm);
    }
  }
  requestAnimationFrame(samm);
}

// Alustame lugemist alles siis, kui numbrid on ekraanil näha
const numbrid = document.querySelectorAll("[data-loe]");
if ("IntersectionObserver" in window) {
  const vaatleja = new IntersectionObserver((kirjed) => {
    kirjed.forEach((kirje) => {
      if (kirje.isIntersecting) {
        loeYles(kirje.target);
        vaatleja.unobserve(kirje.target); // iga number loetakse ainult üks kord
      }
    });
  });
  numbrid.forEach((n) => vaatleja.observe(n));
} else {
  // Vana brauser: näitame kohe lõppväärtust
  numbrid.forEach((n) => {
    n.textContent = Number(n.dataset.loe).toLocaleString("et-EE");
  });
}

// ---------- Ostutingimuste akordion ----------
// Küsimusele vajutades avaneb vastus, teised vastused sulguvad
const osad = document.querySelectorAll(".akordion-osa");
osad.forEach((osa) => {
  const nupp = osa.querySelector(".akordion-nupp");
  nupp.addEventListener("click", () => {
    const oliLahti = osa.classList.contains("lahti");
    // Sulgeme kõik
    osad.forEach((teine) => {
      teine.classList.remove("lahti");
      teine.querySelector(".akordion-nupp").setAttribute("aria-expanded", "false");
    });
    // Avame vajutatu, kui see polnud juba lahti
    if (!oliLahti) {
      osa.classList.add("lahti");
      nupp.setAttribute("aria-expanded", "true");
    }
  });
});

// Kui keegi tuleb lingiga meist.html#tingimused, avame esimese vastuse
if (location.hash === "#tingimused" && osad.length > 0) {
  osad[0].querySelector(".akordion-nupp").click();
}

// ---------- Kontaktivormi kontroll ----------
const vorm = document.querySelector("#kontakt-vorm");

// Näitab välja all veateadet (või kustutab selle, kui tekst on tühi)
function maraViga(valjaId, tekst) {
  const vali = document.querySelector("#" + valjaId).closest(".vali");
  vali.classList.toggle("vigane", tekst !== "");
  vali.querySelector(".vea-tekst").textContent = tekst;
  return tekst === "";
}

if (vorm) {
  vorm.addEventListener("submit", (sundmus) => {
    // Päris serverit meil pole, seega ei lase brauseril vormi ära saata
    sundmus.preventDefault();

    const nimi = vorm.nimi.value.trim();
    const email = vorm.email.value.trim();
    const sonum = vorm.sonum.value.trim();

    // Lihtne e-posti kuju kontroll: midagi@midagi.midagi
    const emailKorras = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const korras = [
      maraViga("k-nimi", nimi.length < 2 ? "Palun sisesta oma nimi." : ""),
      maraViga("k-email", emailKorras ? "" : "Palun sisesta korrektne e-posti aadress."),
      maraViga("k-sonum", sonum.length < 10 ? "Sõnum peab olema vähemalt 10 tähemärki." : "")
    ].every(Boolean);

    if (korras) {
      vorm.reset();
      document.querySelector("#vorm-valmis").hidden = false;
    }
  });
}
