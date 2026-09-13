# Specialized & Personalized Medical Care — Ιστοσελίδα

Στατική ιστοσελίδα (HTML/CSS/JS, χωρίς framework) για τον **Δρ. Μενέλαο Λαμπρόπουλο**
και τη **Δρ. Μαρία Βουγιούκα**, Χειρουργούς Μαιευτήρες Γυναικολόγους —
Εγνατίας 74, Θεσσαλονίκη.
Ίδιο layout & SEO αρχιτεκτονική με το site της Δρ. Μ. Δήμου· διαφορετική παλέτα
(ivory / dusty rose / mauve / deep plum) και εξ ολοκλήρου νέο περιεχόμενο.

## Δομή (28 σελίδες)

```
index.html                     Αρχική
oi-iatroi.html                 Βιογραφικά — Δρ. Λαμπρόπουλος & Δρ. Βουγιούκα
                               (#viografika: αναλυτικά βιογραφικά)
epikoinonia.html               Επικοινωνία + χάρτης
ypiresies/index.html           Όλες οι υπηρεσίες (hub)
ypiresies/<υπηρεσία>.html       10 σελίδες υπηρεσιών
perioches/index.html           Περιοχές εξυπηρέτησης (hub)
perioches/<περιοχή>.html        6 τοπικές σελίδες SEO (Κέντρο, Καλαμαριά, κ.λπ.)
blog/index.html                Blog (hub)
blog/<άρθρο>.html               6 άρθρα (long-tail keywords)
sitemap.xml, robots.txt        Τεχνικό SEO
assets/                        logo.svg (πλήρες lockup), logo-light.svg (για σκούρο
                               φόντο), logo-mark.svg (μονόγραμμα — header),
                               logo-icon.svg (favicon), dr-*.svg (προσωρινά portraits)
styles.css, main.js            Κοινό στυλ & συμπεριφορά
build/                         Γεννήτρια (data.mjs + build.mjs)
```

## SEO που υλοποιήθηκε

- **Πολλαπλές στοχευμένες σελίδες**: 10 υπηρεσίες + 6 τοπικές + 6 άρθρα, με
  μοναδικά keywords, μοναδικό `<title>` & `meta description` ανά σελίδα
  (ελεγμένο: 0 διπλότυπα, 0 σπασμένοι σύνδεσμοι).
- **Structured data (JSON-LD)**: Physician/MedicalBusiness/LocalBusiness
  (διεύθυνση, ωράριο 17:00–21:00, geo, medicalSpecialty), BreadcrumbList παντού,
  MedicalProcedure στις υπηρεσίες, FAQPage, BlogPosting, WebSite/ItemList/Blog.
- **Open Graph & Twitter cards**, canonical URLs, `lang="el"`, semantic HTML,
  internal linking, alt σε εικόνες, breadcrumbs.
- **sitemap.xml** + **robots.txt** έτοιμα για υποβολή στο Google Search Console.
- Mobile-first responsive, γρήγορο, accessible (skip link, aria labels, focus states).
- Ιατρικό disclaimer σε κάθε σελίδα υπηρεσίας & άρθρου.

## Αναγέννηση σελίδων

Όλο το κείμενο/δεδομένα ζουν στο `build/data.mjs`. Μετά από αλλαγή:

```bash
node build/build.mjs
```

Παράγει ξανά όλες τις σελίδες + sitemap + robots. (Το `styles.css` & `main.js`
είναι χειρόγραφα — δεν τα ακουμπά η γεννήτρια.)

## ⚠️ Πριν το live — επιβεβαιώστε/διορθώστε

Τα παρακάτω **δεν** δόθηκαν στη φόρμα πελάτη και έχουν συμπληρωθεί ως πρόταση
CLINICBRAIN. Χρειάζονται έγκριση από τον ιατρό:

1. **Domain**: όλα τα canonical/OG/sitemap URLs χρησιμοποιούν
   `https://menelaoslambropoulos.gr` (πρόταση — το domain δεν έχει κατοχυρωθεί).
   Αλλάξτε το `BASE` στο `build/data.mjs` μόλις οριστικοποιηθεί.
2. **Σλόγκαν**: «Εξατομικευμένη φροντίδα, σε κάθε στάδιο.» — πρόταση.
3. **Υπηρεσίες**: οι 10 υπηρεσίες & τα κείμενά τους είναι πρόταση με βάση τη
   συνήθη πρακτική μαιευτήρα-γυναικολόγου. **Απαιτείται ιατρική επισκόπηση**
   ώστε να αντικατοπτρίζουν όσα πραγματικά προσφέρει το ιατρείο.
4. **Χρώματα**: δεν δόθηκε προτίμηση — παλέτα ivory / dusty rose / mauve / plum.
   Αλλάζει κεντρικά από τις CSS variables στην κορυφή του `styles.css`.
5. **Τ.Κ. & συντεταγμένες**: `54623` και `lat 40.6367 / lng 22.9463` είναι
   προσεγγιστικά για την Εγνατίας 74. Διορθώστε στο `data.mjs` για σωστό pin.
6. **Εικόνες**: το λογότυπο (`logo*.svg`) είναι διανυσματική απόδοση του
   επίσημου λογοτύπου B|L του ιατρείου, στην παλέτα του site. Η μεσαία δοκός του
   «B» έχει σχεδιαστεί ξανά με το χέρι (η αυτόματη διανυσματοποίηση την είχε
   χάσει και το γράμμα διαβαζόταν ως «D»). Τα
   `dr-lampropoulos.svg`, `dr-vougiouka.svg` είναι ακόμη προσωρινά γραφικά.
   Αντικαταστήστε με επαγγελματικές φωτογραφίες
   (portrait ~985×1060) — αρκεί να αλλάξουν τα paths στο `build.mjs`.
7. **Social**: δεν δόθηκαν προφίλ. Συμπληρώστε `instagram` / `facebook` στο
   `data.mjs` και εμφανίζονται αυτόματα σε footer, επικοινωνία & schema.
8. **Βιογραφικό Μ. Βουγιούκα**: υπάρχει μόνο το όνομα & η ειδικότητα. Ζητήστε
   πλήρες βιογραφικό (σπουδές, εξειδικεύσεις) για τη σελίδα «Οι Ιατροί».
9. **Booking**: η διαθεσιμότητα των 30' αναφέρεται ως κείμενο. Αν θέλετε live
   κρατήσεις, χρειάζεται σύνδεση με το ημερολόγιο
   `menelaoslambropoulos@msn.com` (π.χ. Google/Outlook Calendar + booking widget).
10. Μετά το live: υποβολή `sitemap.xml` στο Google Search Console + δημιουργία
    Google Business Profile (δεν υπάρχει ακόμη) για τοπικό SEO.

## Τοπική προεπισκόπηση

Ανοίξτε το `index.html` σε browser, ή σερβίρετε τον φάκελο:
`python3 -m http.server` και επισκεφθείτε `http://localhost:8000`.

---

Made by CLINICBRAIN — https://clinicbrain.gr/
