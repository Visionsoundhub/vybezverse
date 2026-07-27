# Releases — τι λείπει (note, όχι κώδικας)

`src/data/releases.json` έχει ήδη 7 releases live (Jazz Bar, Den me noiazei, Χαμόγελα Μου, Fiesta, Κενό, Selini, Apothimeno) — audio σε R2, Lemon Squeezy checkout wired, streaming links. Αυτό το αρχείο είναι μόνο σημείωμα, δεν επηρεάζει τίποτα στο site.

## Κομμάτια που λείπουν εντελώς από το `releases.json`
- Glykia Zalada
- Check
- Alpha
- Fiesta Reimagined
- Atmo
- Rantevou sta vathia — masters στο Drive είναι μόνο "live edit", όχι studio master. Χρειάζεται το πραγματικό master πριν μπει.

## Κάτι που παρατηρήθηκε στο schema
Κάθε release στο `releases.json` έχει ήδη `altVersions: [{label:"Slowed + Reverb"}, {label:"Sped Up"}]` — αλλά **χωρίς `audioSrc`**. Δηλαδή η θέση για nightcore/slowed-reverb υπάρχει ήδη στο data model, απλά δεν έχει γεμίσει με πραγματικά αρχεία ούτε για τα 7 releases που είναι ήδη live. Άξιζε να το ξέρεις πριν ξεκινήσεις να τα φτιάχνεις ένα-ένα — ίσως χρειάζεται πρώτα να δεις πώς τα διαβάζει το UI (αν τα διαβάζει καθόλου ακόμα) πριν επενδύσεις χρόνο σε όλα τα κομμάτια.
