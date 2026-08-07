// ============================================================
//  Specialized & Personalized Medical Care — static site generator
//  Δρ. Μενέλαος Λαμπρόπουλος, Γυναικολόγος
//  Run:  node build/build.mjs
// ============================================================
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, BIZ, SERVICES, AREAS, POSTS } from "./data.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (p, html) => {
  const full = resolve(ROOT, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html.trimStart() + "\n");
};

// depth-aware helpers -------------------------------------------------
// pathDepth = number of "../" needed to reach site root
const rel = (depth, p) => "../".repeat(depth) + p;
const abs = (p) => `${BASE}/${p}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");

// Τα social προφίλ δεν έχουν δοθεί ακόμη — εμφανίζονται μόνο όταν συμπληρωθούν.
const SOCIALS = [
  ["Instagram", BIZ.instagram],
  ["Facebook", BIZ.facebook],
].filter(([, url]) => url);

// ---- structured data: the practice (LocalBusiness / Physician) -------
const clinicLD = {
  "@type": ["Physician", "MedicalBusiness", "LocalBusiness"],
  "@id": `${BASE}/#clinic`,
  name: BIZ.name,
  alternateName: BIZ.legalName,
  slogan: BIZ.tagline,
  url: BASE + "/",
  telephone: BIZ.phoneIntl,
  email: BIZ.email,
  image: abs("assets/logo.svg"),
  logo: abs("assets/logo.svg"),
  medicalSpecialty: "ObstetricsAndGynecology",
  priceRange: "€€",
  currenciesAccepted: "EUR",
  address: {
    "@type": "PostalAddress",
    streetAddress: BIZ.street,
    addressLocality: BIZ.city,
    addressRegion: BIZ.region,
    postalCode: BIZ.postal,
    addressCountry: BIZ.country,
  },
  geo: { "@type": "GeoCoordinates", latitude: BIZ.lat, longitude: BIZ.lng },
  hasMap: `https://www.google.com/maps?q=${encodeURIComponent(BIZ.street + ", " + BIZ.city + " " + BIZ.postal)}`,
  areaServed: ["Θεσσαλονίκη", "Καλαμαριά", "Τούμπα", "Χαριλάου", "Πυλαία", "Πανόραμα", "Εύοσμος", "Σταυρούπολη"],
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "17:00", closes: "22:00",
  }],
  ...(SOCIALS.length ? { sameAs: SOCIALS.map(([, u]) => u) } : {}),
  founder: {
    "@type": "Person",
    name: BIZ.doctorFull,
    jobTitle: BIZ.role,
  },
};

const jsonLd = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const breadcrumbLD = (depth, trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: t.path ? abs(t.path) : undefined,
  })),
});

const faqLD = (faq) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

// ---- <head> ---------------------------------------------------------
function head({ depth, title, desc, canonical, keywords, ld = [], image = "assets/logo.svg", type = "website" }) {
  const r = (p) => rel(depth, p);
  const ldTags = ld.map(jsonLd).join("\n  ");
  return `
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}" />
  ${keywords ? `<meta name="keywords" content="${attr(keywords)}" />` : ""}
  <meta name="author" content="${attr(BIZ.legalName)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <meta name="theme-color" content="#f4ebf1" />
  <link rel="canonical" href="${abs(canonical)}" />

  <meta property="og:site_name" content="${attr(BIZ.name)}" />
  <meta property="og:locale" content="el_GR" />
  <meta property="og:type" content="${type}" />
  <meta property="og:title" content="${attr(title)}" />
  <meta property="og:description" content="${attr(desc)}" />
  <meta property="og:url" content="${abs(canonical)}" />
  <meta property="og:image" content="${abs(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${attr(title)}" />
  <meta name="twitter:description" content="${attr(desc)}" />
  <meta name="twitter:image" content="${abs(image)}" />

  <link rel="icon" type="image/svg+xml" href="${r("assets/logo.svg")}" />
  <link rel="apple-touch-icon" href="${r("assets/logo.svg")}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${r("styles.css")}" />
  ${ldTags ? "\n  " + ldTags : ""}
</head>
<body>`;
}

// ---- header ---------------------------------------------------------
function header(depth, active = "") {
  const r = (p) => rel(depth, p);
  const on = (k) => (active === k ? ' aria-current="page"' : "");
  const svcLinks = SERVICES.map(
    (s) => `<li><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a></li>`
  ).join("\n            ");
  return `
  <a class="skip-link" href="#main">Μετάβαση στο περιεχόμενο</a>
  <header class="site-header" id="top">
    <nav class="nav container" aria-label="Κύρια πλοήγηση">
      <a href="${r("index.html")}" class="brand" aria-label="${attr(BIZ.name)} — Αρχική">
        <img src="${r("assets/logo.svg")}" alt="${attr(BIZ.name)}" class="brand-logo" width="120" height="120" />
      </a>
      <button class="nav-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="${r("index.html")}"${on("home")}>Αρχική</a></li>
        <li><a href="${r("oi-iatroi.html")}"${on("about")}>Οι Ιατροί</a></li>
        <li><a href="${r("index.html#clinic-space")}">Ο χώρος μας</a></li>
        <li class="has-sub">
          <a href="${r("ypiresies/index.html")}"${on("services")}>Υπηρεσίες</a>
          <ul class="sub">
            ${svcLinks}
          </ul>
        </li>
        <li><a href="${r("perioches/index.html")}"${on("areas")}>Περιοχές</a></li>
        <li><a href="${r("blog/index.html")}"${on("blog")}>Blog</a></li>
        <li><a href="${r("epikoinonia.html")}"${on("contact")}>Επικοινωνία</a></li>
        <li><a href="${r("epikoinonia.html")}" class="btn btn-nav">Ραντεβού</a></li>
      </ul>
    </nav>
  </header>`;
}

// ---- breadcrumb visual ---------------------------------------------
function crumbs(depth, trail) {
  const r = (p) => rel(depth, p);
  const items = trail
    .map((t, i) =>
      i === trail.length - 1
        ? `<span aria-current="page">${esc(t.name)}</span>`
        : `<a href="${r(t.rel)}">${esc(t.name)}</a><span class="sep">/</span>`
    )
    .join(" ");
  return `<nav class="crumbs container" aria-label="Breadcrumb">${items}</nav>`;
}

// ---- CTA band -------------------------------------------------------
function ctaBand(depth) {
  const r = (p) => rel(depth, p);
  return `
  <section class="cta-band">
    <div class="container cta-inner">
      <div>
        <p class="eyebrow">Κλείστε το ραντεβού σας</p>
        <h2 class="cta-title">Η υγεία σας, με χρόνο και προσοχή.</h2>
        <p class="cta-sub">Κάθε ραντεβού διαρκεί ${esc(BIZ.slot)} — ${esc(BIZ.hoursShort)}.</p>
      </div>
      <div class="cta-actions">
        <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
        <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Στοιχεία Επικοινωνίας</a>
      </div>
    </div>
  </section>`;
}

// ---- footer ---------------------------------------------------------
function footer(depth) {
  const r = (p) => rel(depth, p);
  const svcCols = SERVICES.map(
    (s) => `<a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.nav)}</a>`
  ).join("\n          ");
  const socialBlock = SOCIALS.length
    ? `
        <div class="footer-social">
          ${SOCIALS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${attr(n)}">${esc(n)}</a>`).join("\n          ")}
        </div>`
    : "";
  return `
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <img src="${r("assets/logo.svg")}" alt="${attr(BIZ.name)}" class="footer-logo" width="120" height="120" />
        <p class="footer-tag">${esc(BIZ.tagline)}</p>
        <p class="footer-addr">
          ${esc(BIZ.street)}<br />
          ${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}
        </p>${socialBlock}
      </div>

      <div class="footer-col">
        <h3>Υπηρεσίες</h3>
        <nav aria-label="Υπηρεσίες" class="footer-links">
          ${svcCols}
        </nav>
      </div>

      <div class="footer-col">
        <h3>Εξερεύνηση</h3>
        <nav aria-label="Πλοήγηση" class="footer-links">
          <a href="${r("index.html")}">Αρχική</a>
          <a href="${r("oi-iatroi.html")}">Οι Ιατροί</a>
          <a href="${r("index.html#clinic-space")}">Ο χώρος μας</a>
          <a href="${r("ypiresies/index.html")}">Όλες οι Υπηρεσίες</a>
          <a href="${r("perioches/index.html")}">Περιοχές που Εξυπηρετούμε</a>
          <a href="${r("blog/index.html")}">Blog</a>
          <a href="${r("epikoinonia.html")}">Επικοινωνία</a>
        </nav>
      </div>

      <div class="footer-col">
        <h3>Επικοινωνία</h3>
        <nav aria-label="Επικοινωνία" class="footer-links">
          <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>
          <a href="tel:${BIZ.mobileIntl}">${esc(BIZ.mobileDisplay)}</a>
          <a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a>
        </nav>
        <p class="footer-hours">${esc(BIZ.hours)}</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">© <span id="year">2026</span> ${esc(BIZ.legalName)}. Με επιφύλαξη παντός δικαιώματος.</p>
      <p class="cb-credit">Made by <a href="https://clinicbrain.gr/?utm_source=client-site&amp;utm_medium=footer&amp;utm_campaign=made-by" target="_blank" rel="noopener noreferrer">CLINICBRAIN</a></p>
    </div>
  </footer>
  <script src="${r("main.js")}" defer></script>
</body>
</html>`;
}

// ====================================================================
//  PAGE: HOME
// ====================================================================
function pageHome() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const svcCards = SERVICES.map(
    (s, i) => `
        <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
          <span class="svc-icon" aria-hidden="true">${s.icon}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(s.h1)}</h3>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Μάθετε περισσότερα →</span>
        </a>`
  ).join("");

  const spacePhotos = [
    ["assets/clinic-space-1.jpg", "Εξεταστήριο γυναικολογικού ιατρείου", 1200, 1600],
    ["assets/clinic-space-2.jpg", "Χώρος υποδοχής του ιατρείου", 1200, 1600],
    ["assets/clinic-space-3.jpg", "Χώρος αναμονής του ιατρείου", 1200, 1600],
    ["assets/clinic-space-4.jpg", "Καθιστικό και διακόσμηση στον χώρο αναμονής", 1600, 1200],
  ].map(([src, alt, width, height]) => `
          <figure class="space-photo reveal">
            <img src="${r(src)}" alt="${attr(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async" />
          </figure>`).join("");

  const ld = [
    { "@context": "https://schema.org", ...clinicLD },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BIZ.name,
      url: BASE + "/",
      inLanguage: "el",
    },
    breadcrumbLD(depth, [{ name: "Αρχική", path: "index.html" }]),
  ];

  return head({
    depth,
    title: `Γυναικολόγος Θεσσαλονίκη | Δρ. Μενέλαος Λαμπρόπουλος — Εγνατίας 74`,
    desc: `Δρ. Μενέλαος Λαμπρόπουλος M.D., MSc — Μαιευτήρας Χειρουργός Γυναικολόγος, Εγνατίας 74, Θεσσαλονίκη. Γυναικολογικός έλεγχος, εγκυμοσύνη, χειρουργική, υπογονιμότητα.`,
    canonical: "index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη, μαιευτήρας Θεσσαλονίκη, γυναικολόγος Εγνατίας, test pap, εγκυμοσύνη, λαπαροσκοπική χειρουργική, υπογονιμότητα, εμμηνόπαυση, Μενέλαος Λαμπρόπουλος",
    ld,
  }) +
    header(depth, "home") +
    `
  <main id="main">
    <section class="hero" id="hero">
      <div class="hero-inner container">
        <p class="eyebrow reveal">Μαιευτήρας – Χειρουργός Γυναικολόγος · Θεσσαλονίκη</p>
        <h1 class="hero-title reveal">Specialized<span class="hero-title-sub">&amp; Personalized Care</span></h1>
        <p class="hero-tagline reveal">Εξατομικευμένη φροντίδα, σε κάθε <em>στάδιο.</em></p>
        <p class="hero-lead reveal">Δεκαετίες κλινικής και χειρουργικής εμπειρίας, σε ένα ιατρείο που δίνει σε κάθε γυναίκα τον χρόνο που της αναλογεί.</p>
        <div class="hero-actions reveal">
          <a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a>
          <a href="${r("ypiresies/index.html")}" class="btn btn-ghost">Οι Υπηρεσίες μας</a>
        </div>
      </div>
      <div class="hero-scroll" aria-hidden="true"><span></span></div>
    </section>

    <div class="strip" aria-hidden="true">
      <div class="strip-track">
        <span>Πρόληψη &amp; Έλεγχος</span><span class="dot">•</span>
        <span>Μαιευτική Παρακολούθηση</span><span class="dot">•</span>
        <span>Λαπαροσκοπική Χειρουργική</span><span class="dot">•</span>
        <span>Εξατομικευμένη Φροντίδα</span><span class="dot">•</span>
        <span>Πρόληψη &amp; Έλεγχος</span><span class="dot">•</span>
        <span>Μαιευτική Παρακολούθηση</span><span class="dot">•</span>
        <span>Λαπαροσκοπική Χειρουργική</span><span class="dot">•</span>
        <span>Εξατομικευμένη Φροντίδα</span><span class="dot">•</span>
      </div>
    </div>

    <section class="about" id="about">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r("assets/dr-lampropoulos.svg")}" alt="Δρ. Μενέλαος Λαμπρόπουλος, Μαιευτήρας Χειρουργός Γυναικολόγος — Θεσσαλονίκη" width="984" height="1050" />
          <div class="about-badge">
            <span class="about-badge-num">M.D.</span>
            <span class="about-badge-label">Συντονιστής Διευθυντής<br />Χειρουργικού Τομέα</span>
          </div>
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Ο Ιατρός</p>
          <h2 class="section-title reveal">Δρ. Μενέλαος Λαμπρόπουλος</h2>
          <p class="about-role reveal">M.D., MSc · Μαιευτήρας – Χειρουργός Γυναικολόγος</p>
          <p class="reveal">Συντονιστής Διευθυντής στο Νοσοκομείο «Ο Άγιος Δημήτριος» Θεσσαλονίκης, Πρόεδρος του Χειρουργικού Τομέα και Πρόεδρος του Επιστημονικού Συμβουλίου — με μακρά διαδρομή στη μαιευτική και τη γυναικολογική χειρουργική.</p>
          <p class="reveal">Στο ιατρείο της Εγνατίας 74 τον πλαισιώνει η γυναικολόγος <strong>Μαρία Βουγιούκα</strong>, ώστε κάθε γυναίκα να έχει διπλή ματιά και συνεχή παρακολούθηση, σε όλα τα στάδια της ζωής της.</p>
          <a href="${r("oi-iatroi.html")}" class="btn btn-ghost reveal">Τα πλήρη βιογραφικά →</a>
        </div>
      </div>
    </section>

    <section class="services" id="services">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Υπηρεσίες</p>
          <h2 class="section-title">Ολοκληρωμένη φροντίδα,<br />σε κάθε ηλικία</h2>
        </div>
        <div class="services-grid">${svcCards}
        </div>
      </div>
    </section>

    <section class="philosophy" id="philosophy">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow">Η Φιλοσοφία μας</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Η ιατρική δεν είναι μόνο διάγνωση και θεραπεία — είναι και <em>χρόνος</em>. Χρόνος να ακούσεις, να εξηγήσεις και να αποφασίσεις μαζί με την ασθενή, όχι για εκείνη.</blockquote>
        <cite class="philosophy-cite">Δρ. Μενέλαος Λαμπρόπουλος · Μαιευτήρας – Χειρουργός Γυναικολόγος</cite>
      </div>
    </section>

    <section class="clinic-space" id="clinic-space">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Ο χώρος μας</p>
          <h2 class="section-title">Ένας ήρεμος και φροντισμένος χώρος για κάθε επίσκεψη</h2>
        </div>
        <div class="space-grid">
${spacePhotos}
        </div>
      </div>
    </section>

    <section class="areas-teaser">
      <div class="container">
        <div class="section-head reveal">
          <p class="eyebrow">Περιοχές</p>
          <h2 class="section-title">Στο κέντρο, κοντά σε όλη τη Θεσσαλονίκη</h2>
        </div>
        <div class="chips reveal">
          ${AREAS.map((a) => `<a href="${r("perioches/" + a.slug + ".html")}" class="chip">${esc(a.name)}</a>`).join("\n          ")}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: ABOUT (the two doctors)
// ====================================================================
function pageAbout() {
  const depth = 0;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Οι Ιατροί", rel: "oi-iatroi.html", path: "oi-iatroi.html" },
  ];
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: BIZ.doctorFull,
      jobTitle: BIZ.role,
      medicalSpecialty: "ObstetricsAndGynecology",
      image: abs("assets/dr-lampropoulos.svg"),
      url: abs("oi-iatroi.html"),
      worksFor: { "@id": `${BASE}/#clinic` },
      ...(SOCIALS.length ? { sameAs: SOCIALS.map(([, u]) => u) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "Physician",
      name: BIZ.doctor2,
      jobTitle: BIZ.role2,
      medicalSpecialty: "ObstetricsAndGynecology",
      image: abs("assets/dr-vougiouka.svg"),
      url: abs("oi-iatroi.html"),
      worksFor: { "@id": `${BASE}/#clinic` },
    },
  ];
  return head({
    depth,
    title: "Δρ. Μενέλαος Λαμπρόπουλος & Μαρία Βουγιούκα — Γυναικολόγοι Θεσσαλονίκη",
    desc: "Γνωρίστε τον Δρ. Μενέλαο Λαμπρόπουλο M.D., MSc — Συντονιστή Διευθυντή & Πρόεδρο Χειρουργικού Τομέα — και τη γυναικολόγο Μαρία Βουγιούκα, στο ιατρείο της Εγνατίας 74.",
    canonical: "oi-iatroi.html",
    keywords: "Μενέλαος Λαμπρόπουλος γυναικολόγος, Μαρία Βουγιούκα γυναικολόγος, βιογραφικό γυναικολόγου Θεσσαλονίκη, συντονιστής διευθυντής Άγιος Δημήτριος",
    image: "assets/dr-lampropoulos.svg",
    ld,
    type: "profile",
  }) +
    header(depth, "about") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="about about-page">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r("assets/dr-lampropoulos.svg")}" alt="Δρ. Μενέλαος Λαμπρόπουλος, Μαιευτήρας Χειρουργός Γυναικολόγος" width="984" height="1050" />
          <div class="about-badge"><span class="about-badge-num">M.D.</span><span class="about-badge-label">MSc · Χειρουργός<br />Γυναικολόγος</span></div>
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Ο Ιατρός</p>
          <h1 class="section-title reveal">Δρ. Μενέλαος Λαμπρόπουλος</h1>
          <p class="about-role reveal">M.D., MSc · Μαιευτήρας – Χειρουργός Γυναικολόγος</p>
          <p class="reveal">Ο Δρ. Μενέλαος Λαμπρόπουλος είναι Μαιευτήρας – Χειρουργός Γυναικολόγος με πολυετή κλινική και χειρουργική εμπειρία στη Θεσσαλονίκη, τόσο στον δημόσιο όσο και στον ιδιωτικό τομέα.</p>
          <p class="reveal">Υπηρετεί ως <strong>Συντονιστής Διευθυντής</strong> στο Νοσοκομείο «Ο Άγιος Δημήτριος» Θεσσαλονίκης, θέση που συνδυάζει την καθημερινή κλινική πράξη με την οργάνωση και εποπτεία της λειτουργίας της κλινικής.</p>
          <p class="reveal">Παράλληλα διατελεί <strong>Πρόεδρος του Χειρουργικού Τομέα</strong> και <strong>Πρόεδρος του Επιστημονικού Συμβουλίου</strong> του νοσοκομείου — ρόλοι που αντανακλούν τόσο τη χειρουργική του εμπειρία όσο και τη διαρκή ενασχόλησή του με την επιστημονική τεκμηρίωση και την εκπαίδευση.</p>
          <p class="reveal">Στο ιατρείο του, στην Εγνατίας 74, μεταφέρει την ίδια νοσοκομειακή αυστηρότητα σε ένα πλαίσιο προσωπικό και ήρεμο: ραντεβού διάρκειας ${esc(BIZ.slot)}, αναλυτική εξήγηση κάθε εύρηματος και θεραπευτικό πλάνο που αποφασίζεται από κοινού.</p>
        </div>
      </div>
    </section>

    <section class="creds">
      <div class="container">
        <div class="creds-grid">
          <div class="cred reveal"><span class="cred-k">Συντονιστής Διευθυντής</span><span class="cred-v">Νοσοκομείο «Ο Άγιος Δημήτριος», Θεσσαλονίκη</span></div>
          <div class="cred reveal"><span class="cred-k">Πρόεδρος Χειρουργικού Τομέα</span><span class="cred-v">Εποπτεία &amp; συντονισμός χειρουργικών κλινικών</span></div>
          <div class="cred reveal"><span class="cred-k">Πρόεδρος Επιστημονικού Συμβουλίου</span><span class="cred-v">Επιστημονική τεκμηρίωση &amp; εκπαίδευση</span></div>
          <div class="cred reveal"><span class="cred-k">M.D., MSc</span><span class="cred-v">Μαιευτική – Γυναικολογία &amp; μεταπτυχιακή εξειδίκευση</span></div>
        </div>
      </div>
    </section>

    <section class="about about-page about--alt">
      <div class="container about-grid">
        <div class="about-media reveal">
          <img src="${r("assets/dr-vougiouka.svg")}" alt="Μαρία Βουγιούκα, Μαιευτήρας Γυναικολόγος" width="984" height="1050" />
          <div class="about-badge"><span class="about-badge-num">Γυν.</span><span class="about-badge-label">Μαιευτήρας<br />Γυναικολόγος</span></div>
        </div>
        <div class="about-copy">
          <p class="eyebrow reveal">Η Ιατρός</p>
          <h2 class="section-title reveal">Μαρία Βουγιούκα</h2>
          <p class="about-role reveal">Μαιευτήρας – Γυναικολόγος</p>
          <p class="reveal">Η Μαρία Βουγιούκα είναι Μαιευτήρας – Γυναικολόγος και συνεργάζεται στο ιατρείο της Εγνατίας 74, καλύπτοντας όλο το φάσμα της γυναικολογικής και μαιευτικής φροντίδας.</p>
          <p class="reveal">Η παρουσία δύο ιατρών στο ίδιο ιατρείο σημαίνει πρακτικά μεγαλύτερη διαθεσιμότητα ραντεβού, συνέχεια στην παρακολούθηση και τη δυνατότητα κάθε γυναίκα να επιλέξει τον ιατρό με τον οποίο νιώθει πιο άνετα — ιδίως στον τακτικό προληπτικό έλεγχο και στην παρακολούθηση της εγκυμοσύνης.</p>
          <p class="reveal">Τα περιστατικά συζητούνται από κοινού, ώστε το θεραπευτικό πλάνο να προκύπτει από τη σύνθεση δύο κλινικών ματιών.</p>
        </div>
      </div>
    </section>

    <section class="philosophy">
      <div class="container philosophy-inner reveal">
        <p class="eyebrow">Η Φιλοσοφία μας</p>
        <span class="philosophy-mark" aria-hidden="true">&ldquo;</span>
        <blockquote>Η ιατρική δεν είναι μόνο διάγνωση και θεραπεία — είναι και <em>χρόνος</em>. Χρόνος να ακούσεις, να εξηγήσεις και να αποφασίσεις μαζί με την ασθενή.</blockquote>
        <cite class="philosophy-cite">Δρ. Μενέλαος Λαμπρόπουλος · Μαιευτήρας – Χειρουργός Γυναικολόγος</cite>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICES HUB
// ====================================================================
function pageServicesHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
  ];
  const cards = SERVICES.map(
    (s, i) => `
        <a class="svc reveal" href="${r("ypiresies/" + s.slug + ".html")}">
          <span class="svc-icon" aria-hidden="true">${s.icon}</span>
          <span class="svc-num">${String(i + 1).padStart(2, "0")}</span>
          <h2>${esc(s.h1)}</h2>
          <p>${esc(s.lead)}</p>
          <span class="svc-more">Μάθετε περισσότερα →</span>
        </a>`
  ).join("");
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: SERVICES.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.h1,
        url: abs("ypiresies/" + s.slug + ".html"),
      })),
    },
  ];
  return head({
    depth,
    title: "Υπηρεσίες Γυναικολογίας & Μαιευτικής | Θεσσαλονίκη — Δρ. Λαμπρόπουλος",
    desc: "Οι υπηρεσίες του ιατρείου στη Θεσσαλονίκη: γυναικολογικός έλεγχος & Test Pap, κολποσκόπηση, εγκυμοσύνη, λαπαροσκοπική χειρουργική, υπογονιμότητα, εμμηνόπαυση.",
    canonical: "ypiresies/index.html",
    keywords: "υπηρεσίες γυναικολόγου, test pap, κολποσκόπηση, εγκυμοσύνη, υπερηχογράφημα, λαπαροσκόπηση, υστεροσκόπηση, υπογονιμότητα, εμμηνόπαυση Θεσσαλονίκη",
    ld,
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Υπηρεσίες</p>
        <h1 class="page-title reveal">Γυναικολογική &amp; μαιευτική φροντίδα, σε όλο το φάσμα</h1>
        <p class="page-lead reveal">Από τον ετήσιο προληπτικό έλεγχο και την εγκυμοσύνη, μέχρι την ελάχιστα επεμβατική χειρουργική και την εμμηνόπαυση — με ραντεβού ${esc(BIZ.slot)} που δίνουν χώρο για ουσιαστική συζήτηση.</p>
      </div>
    </section>
    <section class="services services--hub">
      <div class="container">
        <div class="services-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: SERVICE DETAIL
// ====================================================================
function pageService(s, idx) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Υπηρεσίες", rel: "ypiresies/index.html", path: "ypiresies/index.html" },
    { name: s.nav, rel: "ypiresies/" + s.slug + ".html", path: "ypiresies/" + s.slug + ".html" },
  ];
  const related = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 4);
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "MedicalProcedure",
      name: s.h1,
      description: s.desc,
      url: abs("ypiresies/" + s.slug + ".html"),
      provider: { "@id": `${BASE}/#clinic` },
    },
    faqLD(s.faq),
  ];
  return head({
    depth,
    title: s.title,
    desc: s.desc,
    canonical: "ypiresies/" + s.slug + ".html",
    keywords: s.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "services") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero page-hero--svc">
      <div class="container">
        <span class="svc-hero-icon" aria-hidden="true">${s.icon}</span>
        <p class="eyebrow reveal">Υπηρεσία ${String(idx + 1).padStart(2, "0")}</p>
        <h1 class="page-title reveal">${esc(s.h1)}</h1>
        <p class="page-lead reveal">${esc(s.lead)}</p>
        <div class="hero-actions reveal"><a href="${r("epikoinonia.html")}" class="btn btn-primary">Κλείστε Ραντεβού</a></div>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          ${s.body.map((p) => `<p class="reveal">${p}</p>`).join("\n          ")}

          <h2 class="reveal">Τι περιλαμβάνει</h2>
          <ul class="ticks">
            ${s.includes.map((i) => `<li class="reveal">${esc(i)}</li>`).join("\n            ")}
          </ul>

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${s.faq
              .map(
                ([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`
              )
              .join("\n            ")}
          </div>

          <p class="article-disclaimer">Οι πληροφορίες αυτής της σελίδας έχουν ενημερωτικό χαρακτήρα και δεν υποκαθιστούν την εξατομικευμένη ιατρική συμβουλή. Για την περίπτωσή σας, απευθυνθείτε στον ιατρό σας.</p>
        </article>

        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Κλείστε ραντεβού</h3>
            <p>Το ιατρείο λειτουργεί κατόπιν ραντεβού, με διαθεσιμότητα ανά ${esc(BIZ.slot)}.</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="tel:${BIZ.mobileIntl}" class="btn btn-ghost btn-block">${esc(BIZ.mobileDisplay)}</a>
            <p class="aside-meta">${esc(BIZ.street)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}<br />${esc(BIZ.hoursShort)}</p>
          </div>
          <div class="aside-card reveal">
            <h3>Άλλες υπηρεσίες</h3>
            <nav class="aside-links">
              ${related.map((x) => `<a href="${r("ypiresies/" + x.slug + ".html")}">${esc(x.nav)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: AREAS HUB
// ====================================================================
function pageAreasHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
  ];
  const cards = AREAS.map(
    (a) => `
        <a class="area-card reveal" href="${r("perioches/" + a.slug + ".html")}">
          <h2>${esc(a.name)}</h2>
          <p>${esc(a.blurb)}</p>
          <span class="svc-more">Δείτε περισσότερα →</span>
        </a>`
  ).join("");
  const ld = [breadcrumbLD(depth, trail)];
  return head({
    depth,
    title: "Περιοχές που Εξυπηρετούμε — Θεσσαλονίκη | Δρ. Μ. Λαμπρόπουλος",
    desc: "Με ιατρείο στην Εγνατίας 74, εξυπηρετούμε το κέντρο Θεσσαλονίκης, Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Πανόραμα, Εύοσμο & Σταυρούπολη.",
    canonical: "perioches/index.html",
    keywords: "γυναικολόγος Θεσσαλονίκη περιοχές, γυναικολόγος Καλαμαριά, Τούμπα, Χαριλάου, Πυλαία, Εύοσμος",
    ld,
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχές</p>
        <h1 class="page-title reveal">Στην Εγνατίας — κοντά σε όλη τη Θεσσαλονίκη</h1>
        <p class="page-lead reveal">Η κεντρική θέση του ιατρείου το καθιστά εύκολα προσβάσιμο τόσο από την ανατολική όσο και από τη δυτική Θεσσαλονίκη.</p>
      </div>
    </section>
    <section class="areas">
      <div class="container">
        <div class="areas-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: AREA DETAIL
// ====================================================================
function pageArea(a) {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Περιοχές", rel: "perioches/index.html", path: "perioches/index.html" },
    { name: a.name, rel: "perioches/" + a.slug + ".html", path: "perioches/" + a.slug + ".html" },
  ];
  const localFaq = [
    [`Πού βρίσκεται το ιατρείο;`, `Το ιατρείο βρίσκεται στην ${BIZ.street}, ${BIZ.city}, Τ.Κ. ${BIZ.postal}, με εύκολη πρόσβαση από ${a.name}.`],
    [`Πώς κλείνω ραντεβού;`, `Καλέστε στο ${BIZ.phoneDisplay} ή στο ${BIZ.mobileDisplay}, ή στείλτε email στο ${BIZ.email}. Το ιατρείο λειτουργεί ${BIZ.hours}, με ραντεβού διάρκειας ${BIZ.slot}.`],
    [`Ποιες υπηρεσίες προσφέρετε;`, `Καλύπτουμε όλο το φάσμα: τακτικό γυναικολογικό έλεγχο και Test Pap, κολποσκόπηση & HPV, παρακολούθηση εγκυμοσύνης, υπερηχογραφήματα, λαπαροσκοπική χειρουργική, υστεροσκόπηση, υπογονιμότητα, εμμηνόπαυση και αντισύλληψη.`],
  ];
  const ld = [
    breadcrumbLD(depth, trail),
    { "@context": "https://schema.org", ...clinicLD, areaServed: a.name },
    faqLD(localFaq),
  ];
  return head({
    depth,
    title: a.title,
    desc: a.desc,
    canonical: "perioches/" + a.slug + ".html",
    keywords: a.keywords,
    ld,
  }) +
    header(depth, "areas") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Περιοχή εξυπηρέτησης</p>
        <h1 class="page-title reveal">${esc(a.h1)}</h1>
        <p class="page-lead reveal">${esc(a.blurb)}</p>
        <div class="hero-actions reveal">
          <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε ${esc(BIZ.phoneDisplay)}</a>
          <a href="${r("epikoinonia.html")}" class="btn btn-ghost">Επικοινωνία &amp; Χάρτης</a>
        </div>
      </div>
    </section>

    <section class="svc-detail">
      <div class="container svc-detail-grid">
        <article class="svc-body">
          <h2 class="reveal">Οι υπηρεσίες μας για γυναίκες από ${esc(a.name)}</h2>
          <ul class="ticks two-col">
            ${SERVICES.map((s) => `<li class="reveal"><a href="${r("ypiresies/" + s.slug + ".html")}">${esc(s.h1)}</a></li>`).join("\n            ")}
          </ul>
          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${localFaq.map(([q, ans]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(ans)}</p></details>`).join("\n            ")}
          </div>
        </article>
        <aside class="svc-aside">
          <div class="aside-card reveal">
            <h3>Στοιχεία επικοινωνίας</h3>
            <p class="aside-meta">${esc(BIZ.street)}<br />${esc(BIZ.city)}, ${esc(BIZ.postal)}</p>
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary btn-block">${esc(BIZ.phoneDisplay)}</a>
            <a href="tel:${BIZ.mobileIntl}" class="btn btn-ghost btn-block">${esc(BIZ.mobileDisplay)}</a>
            <p class="aside-meta">${esc(BIZ.hours)}</p>
          </div>
        </aside>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG HUB
// ====================================================================
function pageBlogHub() {
  const depth = 1;
  const r = (p) => rel(depth, p);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
  ];
  const posts = [...POSTS].sort((x, y) => (x.date < y.date ? 1 : -1));
  const cards = posts.map(
    (p) => `
        <a class="post-card reveal" href="${r("blog/" + p.slug + ".html")}">
          <span class="post-cat">${esc(p.cat)}</span>
          <h2>${esc(p.title)}</h2>
          <p>${esc(p.excerpt)}</p>
          <time datetime="${p.date}">${fmtDate(p.date)}</time>
        </a>`
  ).join("");
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: BIZ.name + " — Blog",
      url: abs("blog/index.html"),
      inLanguage: "el",
    },
  ];
  return head({
    depth,
    title: "Blog — Γυναικολογική Ενημέρωση | Δρ. Μενέλαος Λαμπρόπουλος",
    desc: "Άρθρα & οδηγοί για τη γυναικεία υγεία: προληπτικός έλεγχος, HPV, εγκυμοσύνη, ινομυώματα, υπογονιμότητα και εμμηνόπαυση — με απλά, ξεκάθαρα λόγια.",
    canonical: "blog/index.html",
    keywords: "blog γυναικολογίας, γυναικεία υγεία, ενημέρωση εγκυμοσύνη, HPV, εμμηνόπαυση",
    ld,
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow reveal">Blog</p>
        <h1 class="page-title reveal">Ενημέρωση για τη γυναικεία υγεία</h1>
        <p class="page-lead reveal">Χρήσιμοι οδηγοί και απαντήσεις σε συχνές ερωτήσεις, από τον Δρ. Μενέλαο Λαμπρόπουλο.</p>
      </div>
    </section>
    <section class="posts">
      <div class="container">
        <div class="posts-grid">${cards}
        </div>
      </div>
    </section>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: BLOG POST
// ====================================================================
function pagePost(p) {
  const depth = 1;
  const r = (pp) => rel(depth, pp);
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Blog", rel: "blog/index.html", path: "blog/index.html" },
    { name: p.title, rel: "blog/" + p.slug + ".html", path: "blog/" + p.slug + ".html" },
  ];
  const relatedSvc = SERVICES.find((s) => s.slug === p.related);
  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 3);
  const ld = [
    breadcrumbLD(depth, trail),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: p.title,
      description: p.desc,
      datePublished: p.date,
      dateModified: p.date,
      inLanguage: "el",
      image: abs("assets/logo.svg"),
      mainEntityOfPage: abs("blog/" + p.slug + ".html"),
      author: { "@type": "Person", name: BIZ.doctorFull },
      publisher: { "@id": `${BASE}/#clinic` },
    },
    faqLD(p.faq),
  ];
  const bodyHtml = p.body
    .map(([h, t]) => (h ? `<h2 class="reveal">${esc(h)}</h2>\n          <p class="reveal">${esc(t)}</p>` : `<p class="reveal lead-p">${esc(t)}</p>`))
    .join("\n          ");
  return head({
    depth,
    title: p.metaTitle,
    desc: p.desc,
    canonical: "blog/" + p.slug + ".html",
    keywords: p.keywords,
    ld,
    type: "article",
  }) +
    header(depth, "blog") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <article class="article">
      <header class="article-head">
        <div class="container article-head-inner">
          <span class="post-cat reveal">${esc(p.cat)}</span>
          <h1 class="page-title reveal">${esc(p.title)}</h1>
          <p class="article-meta reveal"><time datetime="${p.date}">${fmtDate(p.date)}</time> · ${esc(BIZ.doctorFull)}</p>
        </div>
      </header>
      <div class="container article-body">
        <div class="article-copy">
          ${bodyHtml}

          <h2 class="reveal">Συχνές ερωτήσεις</h2>
          <div class="faq">
            ${p.faq.map(([q, a]) => `<details class="faq-item reveal"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("\n            ")}
          </div>

          ${relatedSvc ? `<div class="article-cta reveal">
            <p>Σχετική υπηρεσία: <a href="${r("ypiresies/" + relatedSvc.slug + ".html")}"><strong>${esc(relatedSvc.h1)}</strong></a>. Κλείστε ραντεβού στο <a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a>.</p>
          </div>` : ""}

          <p class="article-disclaimer">Το παρόν άρθρο έχει ενημερωτικό χαρακτήρα και δεν υποκαθιστά την εξατομικευμένη ιατρική συμβουλή. Για την περίπτωσή σας, συμβουλευτείτε τον ιατρό σας.</p>
        </div>
        <aside class="article-aside">
          <div class="aside-card reveal">
            <h3>Διαβάστε επίσης</h3>
            <nav class="aside-links">
              ${others.map((o) => `<a href="${r("blog/" + o.slug + ".html")}">${esc(o.title)} →</a>`).join("\n              ")}
            </nav>
          </div>
        </aside>
      </div>
    </article>
  </main>` +
    ctaBand(depth) +
    footer(depth);
}

// ====================================================================
//  PAGE: CONTACT
// ====================================================================
function pageContact() {
  const depth = 0;
  const trail = [
    { name: "Αρχική", rel: "index.html", path: "index.html" },
    { name: "Επικοινωνία", rel: "epikoinonia.html", path: "epikoinonia.html" },
  ];
  const ld = [breadcrumbLD(depth, trail), { "@context": "https://schema.org", ...clinicLD }];
  const socialRow = SOCIALS.length
    ? `
            <li class="reveal"><span class="contact-label">Social</span><span class="contact-value">${SOCIALS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(" · ")}</span></li>`
    : "";
  return head({
    depth,
    title: "Επικοινωνία & Ραντεβού | Γυναικολόγος Θεσσαλονίκη — Εγνατίας 74",
    desc: `Επικοινωνήστε με το ιατρείο. ${BIZ.street}, ${BIZ.city} ${BIZ.postal}. Τηλ. ${BIZ.phoneDisplay} & ${BIZ.mobileDisplay}, ${BIZ.email}. ${BIZ.hours}.`,
    canonical: "epikoinonia.html",
    keywords: "επικοινωνία γυναικολόγος Θεσσαλονίκη, ραντεβού γυναικολόγος, τηλέφωνο γυναικολογικό ιατρείο Εγνατίας",
    ld,
  }) +
    header(depth, "contact") +
    crumbs(depth, trail) +
    `
  <main id="main">
    <section class="contact" id="contact">
      <div class="container contact-grid">
        <div class="contact-copy">
          <p class="eyebrow reveal">Επικοινωνία</p>
          <h1 class="section-title reveal">Κλείστε το ραντεβού σας</h1>
          <p class="contact-note reveal">Το ιατρείο λειτουργεί <strong>κατόπιν ραντεβού</strong>, με διαθεσιμότητα ανά <strong>${esc(BIZ.slot)}</strong>. Επικοινωνήστε τηλεφωνικά ή με email για να κανονίσουμε την επίσκεψή σας.</p>
          <ul class="contact-list">
            <li class="reveal"><span class="contact-label">Ωράριο</span><span class="contact-value">${esc(BIZ.hoursShort)}<br /><em>κατόπιν ραντεβού · κλειστά Σάββατο &amp; Κυριακή</em></span></li>
            <li class="reveal"><span class="contact-label">Διεύθυνση</span><span class="contact-value">${esc(BIZ.street)}<br />${esc(BIZ.city)}, Τ.Κ. ${esc(BIZ.postal)}</span></li>
            <li class="reveal"><span class="contact-label">Τηλέφωνο</span><span class="contact-value"><a href="tel:${BIZ.phoneIntl}">${esc(BIZ.phoneDisplay)}</a></span></li>
            <li class="reveal"><span class="contact-label">Κινητό</span><span class="contact-value"><a href="tel:${BIZ.mobileIntl}">${esc(BIZ.mobileDisplay)}</a></span></li>
            <li class="reveal"><span class="contact-label">Email</span><span class="contact-value"><a href="mailto:${BIZ.email}">${esc(BIZ.email)}</a></span></li>
            <li class="reveal"><span class="contact-label">Ιατροί</span><span class="contact-value">${esc(BIZ.doctorFull)}<br />${esc(BIZ.doctor2)}, ${esc(BIZ.role2)}</span></li>${socialRow}
          </ul>
          <div class="contact-actions reveal">
            <a href="tel:${BIZ.phoneIntl}" class="btn btn-primary">Καλέστε μας</a>
            <a href="mailto:${BIZ.email}" class="btn btn-ghost">Στείλτε Email</a>
          </div>
        </div>
        <div class="contact-map reveal">
          <iframe title="Χάρτης — ${attr(BIZ.street + ", " + BIZ.city)}" src="https://www.google.com/maps?q=${encodeURIComponent(BIZ.street + ", " + BIZ.city + " " + BIZ.postal)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
      </div>
    </section>
  </main>` +
    footer(depth);
}

// ---- utils ----------------------------------------------------------
function fmtDate(iso) {
  const months = ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${months[m - 1]} ${y}`;
}

// ====================================================================
//  SITEMAP + ROBOTS
// ====================================================================
function buildSitemap() {
  const urls = [
    { loc: "index.html", pr: "1.0", cf: "weekly" },
    { loc: "oi-iatroi.html", pr: "0.8", cf: "monthly" },
    { loc: "ypiresies/index.html", pr: "0.9", cf: "monthly" },
    ...SERVICES.map((s) => ({ loc: "ypiresies/" + s.slug + ".html", pr: "0.9", cf: "monthly" })),
    { loc: "perioches/index.html", pr: "0.7", cf: "monthly" },
    ...AREAS.map((a) => ({ loc: "perioches/" + a.slug + ".html", pr: "0.7", cf: "monthly" })),
    { loc: "blog/index.html", pr: "0.7", cf: "weekly" },
    ...POSTS.map((p) => ({ loc: "blog/" + p.slug + ".html", pr: "0.6", cf: "monthly", lm: p.date })),
    { loc: "epikoinonia.html", pr: "0.8", cf: "yearly" },
  ];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${abs(u.loc)}</loc><lastmod>${u.lm || today}</lastmod><changefreq>${u.cf}</changefreq><priority>${u.pr}</priority></url>`
    )
    .join("\n");
  const ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${ns}">\n${body}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`;
}

// ====================================================================
//  RUN
// ====================================================================
let n = 0;
const write = (p, html) => { out(p, html); n++; };

write("index.html", pageHome());
write("oi-iatroi.html", pageAbout());
write("epikoinonia.html", pageContact());
write("ypiresies/index.html", pageServicesHub());
SERVICES.forEach((s, i) => write("ypiresies/" + s.slug + ".html", pageService(s, i)));
write("perioches/index.html", pageAreasHub());
AREAS.forEach((a) => write("perioches/" + a.slug + ".html", pageArea(a)));
write("blog/index.html", pageBlogHub());
POSTS.forEach((p) => write("blog/" + p.slug + ".html", pagePost(p)));
out("sitemap.xml", buildSitemap());
out("robots.txt", buildRobots());

console.log(`✓ Generated ${n} HTML pages + sitemap.xml + robots.txt`);
