# Guide d'installation

Ce guide explique comment configurer ce template pour votre propre activité : créer votre projet Firebase, brancher vos propres clés, activer l'envoi d'emails automatique et déployer le site.

> **Important — ce qui est déjà fonctionnel vs. ce qu'il faut configurer**
> - Les **deux formulaires de téléchargement de ressource** (`pages/checklist-ia-pme.html` et `pages/guide-prompts-ia.html`) enregistrent le lead dans Firebase Firestore et déclenchent automatiquement un email (au visiteur + à vous) via l'extension **Trigger Email**. C'est le circuit décrit dans ce guide.
> - Le **formulaire de contact de la page d'accueil** (`#contact-form`) est aujourd'hui une simulation côté navigateur uniquement (message de succès affiché, mais aucune donnée n'est envoyée nulle part). Si vous voulez recevoir ces demandes, adaptez-le sur le même modèle que les formulaires de ressource (voir [Aller plus loin](#aller-plus-loin-brancher-le-formulaire-de-contact)), ou branchez-le sur un service tiers (Formspree, EmailJS, etc.).

---

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Créer son propre projet Firebase](#2-créer-son-propre-projet-firebase)
3. [Configurer les clés Firebase dans le projet](#3-configurer-les-clés-firebase-dans-le-projet)
4. [Configurer l'envoi d'emails (formulaires de ressource / lead magnet)](#4-configurer-lenvoi-demails-formulaires-de-ressource--lead-magnet)
5. [Configurer les règles Firestore](#5-configurer-les-règles-firestore)
6. [Déployer avec firebase deploy](#6-déployer-avec-firebase-deploy)
7. [Dépannage](#7-dépannage)

---

## 1. Prérequis

- Un compte Google (pour Firebase).
- [Node.js](https://nodejs.org/) installé (pour la CLI Firebase).
- La CLI Firebase installée globalement :
  ```bash
  npm install -g firebase-tools
  ```
- Un compte Gmail (ou tout autre fournisseur SMTP) si vous utilisez l'envoi d'email via l'extension Trigger Email.

---

## 2. Créer son propre projet Firebase

1. Rendez-vous sur la [console Firebase](https://console.firebase.google.com/).
2. Cliquez sur **"Ajouter un projet"** et suivez les étapes (nom du projet, Google Analytics optionnel).
3. Une fois le projet créé, ajoutez une **application Web** :
   - Dans les paramètres du projet (⚙️) > **"Vos applications"**, cliquez sur l'icône **Web** (`</>`).
   - Donnez un nom à l'application (ex. le nom de votre site) et cliquez sur **"Enregistrer l'application"**.
   - Firebase affiche un objet de configuration `firebaseConfig` : gardez cette fenêtre ouverte, vous en aurez besoin à l'étape suivante.
4. Activez **Firestore Database** :
   - Menu **"Firestore Database"** > **"Créer une base de données"**.
   - Choisissez **"Commencer en mode production"** (les règles de sécurité sont définies à l'étape 5).
   - Sélectionnez une région proche de vos utilisateurs (ex. `europe-west` pour être conforme RGPD).
5. Connectez le projet à la CLI Firebase en local :
   ```bash
   firebase login
   firebase use --add
   ```
   Sélectionnez votre nouveau projet, puis choisissez un alias (ex. `default`).

   Cela régénère un fichier `.firebaserc` local (celui du dépôt d'origine a été retiré volontairement car il pointait vers le projet Firebase de l'auteur du template).

---

## 3. Configurer les clés Firebase dans le projet

Le site utilise le SDK Firebase côté client. La configuration se trouve dans **`assets/js/main.js`**, dans la constante `FIREBASE_CONFIG` (recherchez `FIREBASE_CONFIG` dans le fichier) :

```javascript
const FIREBASE_CONFIG = {
    apiKey: "[FIREBASE_API_KEY]",
    authDomain: "[FIREBASE_PROJECT_ID].firebaseapp.com",
    projectId: "[FIREBASE_PROJECT_ID]",
    storageBucket: "[FIREBASE_PROJECT_ID].firebasestorage.app",
    messagingSenderId: "[FIREBASE_MESSAGING_SENDER_ID]",
    appId: "[FIREBASE_APP_ID]",
    measurementId: "[FIREBASE_MEASUREMENT_ID]"
};
```

Remplacez chaque valeur `[ENTRE_CROCHETS]` par celle de votre `firebaseConfig` (récupérable à tout moment dans **Paramètres du projet > Vos applications**).

---

## 4. Configurer l'envoi d'emails (formulaires de ressource / lead magnet)

### Méthode utilisée par le template : extension Firebase "Trigger Email"

À chaque téléchargement de ressource, le site crée un document dans la collection Firestore `mail`. L'extension **Trigger Email** surveille cette collection et envoie automatiquement l'email correspondant (au visiteur ET une notification à vous).

1. **Installer l'extension**
   - Dans la console Firebase, allez dans **"Extensions"** > **"Parcourir le catalogue"**.
   - Recherchez **"Trigger Email"** et cliquez sur **"Installer"**.

2. **Configurer le SMTP (envoi via Gmail, exemple)**
   - Créez un mot de passe d'application Gmail : https://myaccount.google.com/apppasswords
   - Renseignez dans le formulaire d'installation de l'extension :
     - **Collection path** : `mail`
     - **Location** : la même région que Firestore (ex. `europe-west`)
     - **SMTP connection URI** :
       ```
       smtps://VOTRE_EMAIL@gmail.com:VOTRE_MOT_DE_PASSE_APPLICATION@smtp.gmail.com:465
       ```
     - **From email address** : votre adresse d'envoi
     - **From display name** : le nom de votre entreprise
   - Cliquez sur **"Installer l'extension"**.

   > Le contenu de l'email (sujet, texte, HTML) est déjà généré directement par le code JavaScript (`assets/js/main.js`) au moment de la création du document — vous n'avez rien d'autre à configurer côté template pour le contenu de l'email. Pensez à remplacer les placeholders `[NOM_ENTREPRISE]`, `[EMAIL_CONTACT]`, `[VOTRE_TAGLINE]` et `[NOM_DE_DOMAINE]` dans ce fichier (voir section 3 et le README).

3. **Vérifier l'adresse de notification**
   - Dans `assets/js/main.js`, la section qui crée l'email de notification utilise `to: ['[EMAIL_CONTACT]']` : remplacez `[EMAIL_CONTACT]` par votre adresse email réelle.

### Alternative : EmailJS

Si vous préférez ne pas utiliser Firestore + l'extension Trigger Email, [EmailJS](https://www.emailjs.com/) est une alternative simple (gratuite jusqu'à 100 emails/mois) qui envoie l'email directement depuis le navigateur, sans backend :

1. Créez un compte sur https://www.emailjs.com/.
2. Dans **"Email Services"**, ajoutez un service (Gmail, Outlook...) et connectez votre compte. Notez le **Service ID**.
3. Dans **"Email Templates"**, créez un template avec les variables `{{resource}}`, `{{prenom}}`, `{{email}}`, `{{entreprise}}`, `{{date}}`. Notez le **Template ID**.
4. Dans **"Account" > "General"**, copiez votre **Public Key**.
5. Installez le SDK EmailJS et remplacez la logique `saveToFirestore()` de `assets/js/main.js` par un appel `emailjs.send(serviceId, templateId, templateParams, publicKey)`.

D'autres alternatives sans backend existent également : [Formspree](https://formspree.io/) (gratuit jusqu'à 50 soumissions/mois) ou un webhook Zapier/Make.

### Aller plus loin : brancher le formulaire de contact

Le formulaire de contact de la page d'accueil (`#contact-form`) n'envoie actuellement aucune donnée (voir l'encart en haut de ce guide). Pour le rendre fonctionnel, dupliquez la logique déjà utilisée pour les formulaires de ressource (`resourceForm.addEventListener('submit', ...)` dans `assets/js/main.js`) : récupérez les champs du formulaire, créez un document dans la collection `mail` avec les champs `to`, `message.subject`, `message.text`, `message.html`, et laissez l'extension Trigger Email s'occuper de l'envoi.

---

## 5. Configurer les règles Firestore

Par défaut, Firestore en mode production bloque toute écriture. Le formulaire du site doit pouvoir créer un document dans la collection `mail` sans authentification, tout en empêchant la lecture des données par des visiteurs.

1. Dans la console Firebase, allez dans **Firestore Database > Règles**.
2. Remplacez le contenu par :

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Autorise la création de documents dans 'mail' depuis le formulaire du site
       match /mail/{document=**} {
         allow create: if true;   // écriture publique (nécessaire pour un formulaire sans authentification)
         allow read: if false;    // empêche la lecture des données par un tiers
         allow update: if false;
         allow delete: if false;
       }
     }
   }
   ```

3. Cliquez sur **"Publier"**. Les règles ne sont actives qu'une fois publiées.

---

## 6. Déployer avec firebase deploy

Le fichier `firebase.json` du template est déjà configuré pour de l'hébergement statique (Firebase Hosting), avec réécriture SPA sur `index.html` et des en-têtes de cache pour les assets.

1. Associez la CLI à votre projet si ce n'est pas déjà fait (voir étape 2) :
   ```bash
   firebase login
   firebase use --add
   ```
2. Déployez :
   ```bash
   firebase deploy --only hosting
   ```
3. Votre site est en ligne à l'URL affichée dans le terminal (`https://VOTRE_PROJET.web.app` par défaut). Vous pouvez ensuite associer un nom de domaine personnalisé depuis **Hosting > Ajouter un domaine personnalisé** dans la console Firebase.

Pour du développement local sans mise en cache agressive du navigateur, un petit serveur est fourni :
```bash
python3 serve-no-cache.py
```
puis ouvrez http://localhost:8000.

---

## 7. Dépannage

**Rien n'apparaît dans Firestore après un téléchargement**
- Ouvrez la console du navigateur (F12) sur la page de téléchargement et vérifiez les messages : `Firebase initialisé avec succès` doit apparaître au chargement.
- Vérifiez que les règles Firestore ont bien été **publiées** (section 5).
- Vérifiez que `FIREBASE_CONFIG` dans `assets/js/main.js` contient bien vos identifiants (et non les placeholders `[...]`).

**Aucun email n'est envoyé**
- Vérifiez dans la console Firebase que l'extension **Trigger Email** est bien installée et active (**Extensions**).
- Consultez ses logs (**Extensions > Trigger Email > Logs**) pour voir les erreurs d'envoi SMTP.
- Vérifiez que le document a bien été créé dans la collection `mail` (Firestore Database > Data).

**Erreur "Firebase SDK non chargé"**
- Vérifiez que les balises `<script>` du SDK Firebase sont bien présentes dans le `<head>` de la page HTML concernée (elles sont déjà incluses dans `pages/checklist-ia-pme.html` et `pages/guide-prompts-ia.html`).

**Tester une écriture Firestore manuellement**

Dans la console du navigateur (F12), sur une page où Firebase est chargé :
```javascript
const db = firebase.firestore();
db.collection('mail').add({
  to: ['test@exemple.com'],
  message: { subject: 'Test', text: 'Email de test' }
}).then(() => console.log('Document créé avec succès !'))
  .catch((error) => console.error('Erreur :', error));
```
Si le document apparaît dans Firestore mais qu'aucun email n'arrive, le problème vient de la configuration SMTP de l'extension Trigger Email, pas du code du site.
