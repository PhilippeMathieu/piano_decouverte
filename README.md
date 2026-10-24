# Piano découverte

Appli web installable (PWA) pour apprendre le piano à un enfant de 7–9 ans qui n'a jamais joué. Pensée pour l'iPad posé sur le pupitre d'un piano numérique ; marche aussi sur téléphone.

Adresse : https://philippemathieu.github.io/piano_decouverte/ (déployée à chaque push sur `main`).

## Le parcours

Un chemin de 10 étapes. L'accueil propose toujours **la prochaine chose à faire** (« C'est parti ! »). Chaque étape : **Comprendre** (leçons en cartes courtes, à lire ou à écouter) puis **Exercices**. Chaque exercice dit s'il demande le piano : **🎹 Au piano** ou **📱 Sans piano**.

| # | Étape | Leçons | 📱 sans piano | 🎹 au piano |
|---|---|---|---|---|
| 1 | Le clavier | blanches et noires, grave et aigu | 3 | 1 |
| 2 | Do, ré, mi | trouver le do, les 7 notes | 4 | 2 |
| 3 | Mes doigts | numéros des doigts, position de do | 2 | 3 |
| 4 | Le rythme | noire, blanche, ronde ; le silence | 5 | 1 |
| 5 | La portée | la portée, do-ré-mi, fa et sol | 4 | 1 |
| 6 | Mes premières chansons | jouer une chanson | 1 | 5 |
| 7 | La main gauche | position main gauche, clé de fa | 2 | 2 |
| 8 | Plus de notes, plus de chansons | la croche ; la, si, do | 2 | 4 |
| 9 | Les deux mains | une main puis l'autre, ensemble | 1 | 3 |
| 10 | Dièses et accords | touches noires, joyeux/triste, Do-Fa-Sol | 3 | 2 |

21 leçons, 51 exercices (27 sans piano, 24 au piano).

**Objectifs** : 8 bonnes réponses sur 10 (selon l'exercice : 7/8, 5/6, 3 rythmes sur 5…). **Étoiles** : 1 = réussi, 2 = presque parfait, 3 = sans faute. Chansons et suites de notes : étoiles selon les fautes (une seule faute comptée par note). Une étape finie (leçons lues + exercices réussis) donne son **autocollant**. **Objectif du jour** : 2, 3 ou 5 exercices réussis ; **série** de jours.

**Chansons** (domaine public, en do) : Au clair de la lune, Marie avait un agneau, Ode à la joie, Vive le vent, Ah ! vous dirai-je maman, Frère Jacques, Joyeux anniversaire, Au clair de la lune en entier, + 2 versions à deux mains.

## Au piano : le micro

L'iPad écoute le piano au micro (aucun câble). Guidage note à note : la touche à jouer brille avec son doigt ; l'appli avance quand elle entend la bonne note (n'importe quelle octave), et dit « Oups, ré ! Cherche mi » sinon. Accords : les 3 notes vérifiées ensemble.

- Détection reprise de l'appli Harmonie jazz (bruit de fond mesuré, amplification jusqu'à +50 dB). Attaque mesurée sur ≈ 20 ms pour entendre une note rejouée.
- Test : les 8 chansons jouées avec les vrais échantillons de piano, aux 3/4 du tempo : toutes les notes reconnues, dans l'ordre, aucune fausse. Au tempo plein : 7 sur 8.
- **Sans micro** (réglage, ou bouton sur l'écran d'exercice) : un adulte valide (« Réussi / Raté », « Note suivante », note de la chanson).

## Pour l'enfant

- Une couleur par note (do rouge, ré orange, mi jaune, fa vert, sol bleu, la indigo, si violet), sur le clavier, les boutons et la portée.
- Consigne lisible en gros, avec 🔊 pour l'entendre (voix française de l'iPad) ; lecture automatique en option.
- Croche, la mascotte, dit bonjour et félicite.

## Espace parents

Bouton « ⚙️ Parents » à maintenir 1,5 s : prénom, micro ou sans micro, voix, objectif du jour, test du micro, remise à zéro. Tout reste sur l'appareil (pas de compte).

## Installer sur l'iPad

Safari → Partager → « Sur l'écran d'accueil ». Mises à jour automatiques, appliquées sur l'accueil.

## Développement

```
npm install
npm run dev
npm test        # 43 tests, dont les chansons au micro avec les échantillons
npm run build
```

Son : piano Salamander (CC BY 3.0). Portée : glyphes Bravura (SIL OFL 1.1). Polices : Baloo 2 et Andika (SIL OFL).
