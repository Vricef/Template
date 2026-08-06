# [NOM_ENTREPRISE] — Template de site vitrine

Template de site vitrine one-page, prêt à personnaliser, pour entrepreneurs indépendants, consultants et petites entreprises. Structure HTML/CSS/JS légère (pas de framework, pas de build), avec un formulaire de capture d'email fonctionnel branché sur Firebase.

## Fonctionnalités

- **Site vitrine one-page** : hero, services (3 offres), à propos, méthodologie en 4 étapes, ressources téléchargeables, formulaire de contact — le tout en une seule page avec navigation par ancre.
- **Mode sombre / clair** avec mémorisation du choix (localStorage).
- **Responsive** : navigation burger sur mobile, grilles adaptatives, breakpoints jusqu'à 480px.
- **Pages de téléchargement de ressources (lead magnet)** : deux pages dédiées (`pages/`) avec formulaire prénom/email/entreprise, qui enregistrent le lead dans Firebase Firestore et déclenchent automatiquement un email de confirmation (au visiteur) et de notification (à vous) via l'extension Firebase **Trigger Email**. Fonctionnel dès que vous branchez votre propre projet Firebase (voir [INSTALLATION.md](./INSTALLATION.md)).
- **Pages légales RGPD incluses** : `mentions-legales.html` et `politique-confidentialite.html`, avec toute la structure juridique (RGPD, cookies, droits des utilisateurs, CNIL) déjà rédigée — il ne reste qu'à compléter vos informations d'entreprise (placeholders `[ENTRE_CROCHETS]`).
- **Palette de couleurs centralisée** : deux couleurs (primaire + secondaire) définies en variables CSS en haut de `assets/css/main.css`. Modifier ces quelques lignes suffit à rebrander l'intégralité du site (boutons, liens, icônes, dégradés, mode sombre inclus).
- **Icônes** via [Lucide](https://lucide.dev/) (chargées en CDN, aucune installation requise).

> ℹ️ Le formulaire de contact de la page d'accueil (`#contact-form`) est aujourd'hui une simulation côté navigateur (pas d'envoi réel). Seuls les formulaires de téléchargement de ressource sont branchés sur Firebase par défaut. Voir [INSTALLATION.md](./INSTALLATION.md#aller-plus-loin-brancher-le-formulaire-de-contact) pour l'activer aussi sur le formulaire de contact.

## Stack technique

- HTML5 / CSS3 (variables CSS, Grid, Flexbox) / JavaScript vanilla (aucun framework)
- [Firebase](https://firebase.google.com/) : Hosting (déploiement statique) + Firestore (stockage des leads) + extension Trigger Email (envoi d'emails)
- [Lucide Icons](https://lucide.dev/) et polices Google Fonts (Montserrat / Inter) via CDN

Aucune étape de build n'est nécessaire : ce sont des fichiers statiques que vous pouvez ouvrir tels quels ou déployer directement.

## Démarrage rapide

1. Ouvrez `index.html` dans un navigateur pour prévisualiser le site tel quel (les formulaires de téléchargement ne fonctionneront pas tant que Firebase n'est pas configuré).
2. Remplacez tous les placeholders `[NOM_ENTREPRISE]`, `[VOTRE_TAGLINE]`, `[EMAIL_CONTACT]`, `[VOTRE_VILLE]`, etc. dans les fichiers HTML par vos propres informations (recherchez `[` dans le projet pour tous les retrouver).
3. Remplacez le logo et les photos dans `assets/images/` (voir la liste dans la section [Images à remplacer](#images-à-remplacer)).
4. Suivez le guide **[INSTALLATION.md](./INSTALLATION.md)** pour créer votre projet Firebase, brancher vos clés, configurer l'envoi d'emails et déployer le site.

## Personnaliser les couleurs

Toute la palette est pilotée par des variables CSS en tête de `assets/css/main.css` :

```css
:root {
    --color-primary: #FF6B35;
    --color-primary-rgb: 255, 107, 53;   /* même couleur, en RGB, pour les transparences */
    --color-primary-light: #FF8C61;
    --color-primary-dark: #E55A2B;

    --color-secondary: #0A1628;
    --color-secondary-light: #1E3A5F;
    ...
}
```

Changez ces valeurs (et leur équivalent dans le bloc `[data-theme="dark"]` un peu plus bas si besoin) pour rebrander l'ensemble du site sans toucher au reste du CSS.

## Images à remplacer

Voir le récapitulatif fourni séparément (logo et photos dans `assets/images/`) — ce sont les seuls éléments visuels que vous devez remplacer manuellement, aucune autre image n'est nécessaire.

## Structure du projet

```
index.html                        Page d'accueil (one-page)
mentions-legales.html             Page légale RGPD
politique-confidentialite.html    Page légale RGPD
pages/                            Pages de téléchargement de ressources (lead magnet)
assets/css/main.css               Feuille de style principale (variables de couleur en tête de fichier)
assets/js/main.js                 Logique du site (thème, navigation, formulaires, Firebase)
assets/images/                    Logo et photos (à remplacer)
assets/Ressources/ , ressources/  PDF téléchargeables (à remplacer par vos propres contenus)
firebase.json                     Configuration Firebase Hosting
INSTALLATION.md                   Guide de configuration Firebase / emails / déploiement
```

## Licence d'utilisation

*[LICENCE À DÉFINIR PAR LE VENDEUR — remplacez ce paragraphe avant la mise en vente.]*

Exemple de formulation possible : « Ce template est concédé sous licence d'utilisation unique : l'acheteur est autorisé à l'utiliser et le modifier pour un (1) site de production par achat. La revente ou redistribution du template, modifié ou non, est interdite sans autorisation écrite de l'auteur. »
