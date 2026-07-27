# Releases — τι λείπει (note, όχι κώδικας)

`src/data/releases.json` έχει ήδη 7 releases live (Jazz Bar, Den me noiazei, Χαμόγελα Μου, Fiesta, Κενό, Selini, Apothimeno) — audio σε R2, Lemon Squeezy checkout wired, streaming links. Αυτό το αρχείο είναι μόνο σημείωμα, δεν επηρεάζει τίποτα στο site.

## Κομμάτια που λείπουν εντελώς από το `releases.json`
- Glykia Zalada
- Check
- Alpha
- Fiesta Reimagined
- Atmo
- Rantevou sta vathia — masters στο Drive είναι μόνο "live edit", όχι studio master. Χρειάζεται το πραγματικό master πριν μπει.

## altVersions (Slowed+Reverb / Sped Up) — σκόπιμα χωρίς audioSrc εδώ
Κάθε release έχει `altVersions: [{label:"Slowed + Reverb"}, {label:"Sped Up"}]` χωρίς `audioSrc` — αυτό είναι **σωστό, όχι bug**. Το `releases.json` είναι public/client-side, άρα δεν μπαίνει εκεί direct link σε bonus αρχείο. Ο chatbot ξέρει ότι υπάρχουν (για να τα αναφέρει), αλλά τα ίδια τα αρχεία δίνονται μόνο μετά από αγορά, όχι δημόσια από το site. Delivery mechanism μετά την αγορά (Lemon Squeezy fulfillment/email) — δεν το ψάξαμε ακόμα, ίσως χρειάζεται να επιβεβαιωθεί ότι είναι στημένο.
