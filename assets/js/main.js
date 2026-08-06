// ========================================
// TEMPLATE SITE VITRINE - MAIN JAVASCRIPT
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();

    // Elements
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contact-form');
    const resourceForm = document.getElementById('resource-form');
    const themeToggle = document.getElementById('theme-toggle');

    // ========================================
    // DARK MODE
    // ========================================
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        lucide.createIcons();
    });

    // ========================================
    // HEADER SCROLL EFFECT
    // ========================================
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        updateActiveNavLink();
    });

    // ========================================
    // MOBILE MENU
    // ========================================
    burger.addEventListener('click', function() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // ACTIVE NAV LINK
    // ========================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + header.offsetHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.service-card, .process-step, .about-content > *').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // ========================================
    // FIREBASE INIT
    // Utilisé à la fois par le formulaire de contact et par les
    // formulaires de téléchargement de ressource ci-dessous.
    // ========================================
    if (contactForm || resourceForm) {
        // Remplacez ces valeurs par la configuration de VOTRE projet Firebase
        // (Console Firebase > Paramètres du projet > Vos applications > Config)
        // Voir INSTALLATION.md pour la marche à suivre complète.
        const FIREBASE_CONFIG = {
            apiKey: "[FIREBASE_API_KEY]",
            authDomain: "[FIREBASE_PROJECT_ID].firebaseapp.com",
            projectId: "[FIREBASE_PROJECT_ID]",
            storageBucket: "[FIREBASE_PROJECT_ID].firebasestorage.app",
            messagingSenderId: "[FIREBASE_MESSAGING_SENDER_ID]",
            appId: "[FIREBASE_APP_ID]",
            measurementId: "[FIREBASE_MEASUREMENT_ID]"
        };

        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
                console.log('✅ Firebase initialisé avec succès');
            } else {
                console.log('✅ Firebase déjà initialisé');
            }
        } else {
            console.error('❌ Firebase SDK non chargé ! Vérifiez que les scripts sont présents dans les pages HTML.');
        }
    }

    // Crée un document dans la collection Firestore 'mail'.
    // L'extension Firebase "Trigger Email" (voir INSTALLATION.md) surveille
    // cette collection et envoie l'email correspondant automatiquement.
    async function sendViaFirestoreMail(mailDoc, fallbackData) {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase non chargé. Les données ne seront pas enregistrées.');
            console.log('Données du formulaire :', fallbackData);
            return false;
        }

        try {
            const db = firebase.firestore();
            await db.collection('mail').add({
                ...mailDoc,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erreur lors de la création du document d\'email dans Firestore :', error);
            console.log('Données du formulaire :', fallbackData);
            return false;
        }
    }

    // ========================================
    // CONTACT FORM
    // ========================================
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone') || 'Non renseigné';
            const typeSelect = contactForm.querySelector('select[name="type"]');
            const typeLabel = typeSelect.options[typeSelect.selectedIndex].textContent;
            const message = formData.get('message');

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Loading state
            submitBtn.textContent = 'Envoi en cours...';
            submitBtn.disabled = true;

            const formattedDate = new Date().toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // --- Email de confirmation envoyé au visiteur ---
            const confirmationSubject = `Votre demande a bien été reçue - [NOM_ENTREPRISE]`;
            const confirmationText = `
Bonjour ${name},

Merci pour votre message ! Voici un récapitulatif de votre demande :
- Type de demande : ${typeLabel}
- Message : ${message}
- Date : ${formattedDate}

Je reviens vers vous rapidement.

À très bientôt,
[VOTRE_NOM]
[NOM_ENTREPRISE]
            `.trim();

            const confirmationHtml = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${confirmationSubject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0A1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0A1628;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;background:linear-gradient(135deg,#0A1628,#111D2E);color:#ffffff;">
                <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="left" style="font-size:20px;font-weight:700;">
                      [NOM_ENTREPRISE]
                    </td>
                    <td align="right" style="font-size:12px;color:#CBD5E0;">
                      ${formattedDate}
                    </td>
                  </tr>
                </table>
                <h1 style="margin:16px 0 0 0;font-size:24px;font-weight:700;color:#F7FAFC;">
                  Votre message a bien été reçu
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 16px 32px;color:#2D3748;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Bonjour ${name},
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Merci pour votre message, je reviens vers vous rapidement. Voici un récapitulatif de votre demande :
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%%" style="margin:0 0 16px 0;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;width:140px;">Type de demande</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${typeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Téléphone</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${phone}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Message</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${message}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Date</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${formattedDate}</td>
                  </tr>
                </table>
                <p style="margin:0 0 8px 0;font-size:13px;color:#A0AEC0;line-height:1.6;">
                  Cet email vous a été envoyé suite à votre demande sur [NOM_DE_DOMAINE]. Vos données ne sont jamais revendues et sont utilisées uniquement pour vous recontacter dans le cadre de votre demande.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;background-color:#F7FAFC;color:#718096;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} [NOM_ENTREPRISE] — [VOTRE_TAGLINE]
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
            `.trim();

            // --- Email de notification envoyé au propriétaire du site ---
            const notificationSubject = `📩 Nouvelle demande de contact - ${typeLabel}`;
            const notificationText = `
Nouvelle demande de contact !

Nom : ${name}
Email : ${email}
Téléphone : ${phone}
Type de demande : ${typeLabel}
Message : ${message}
Date : ${formattedDate}
            `.trim();

            const notificationHtml = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${notificationSubject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F7FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F7FAFC;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding:32px;background:linear-gradient(135deg,#FF6B35,#FF8C61);color:#ffffff;">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
                  📩 Nouvelle demande de contact
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:16px;background-color:#F7FAFC;border-radius:8px;border-left:4px solid #FF6B35;">
                      <p style="margin:0 0 8px 0;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;">Type de demande</p>
                      <p style="margin:0;font-size:18px;color:#2D3748;font-weight:600;">${typeLabel}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Nom</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${name}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Email</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">
                        <a href="mailto:${email}" style="color:#FF6B35;text-decoration:none;">${email}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Téléphone</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${phone}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Message</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${message}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding:24px 0 0 0;">
                      <a href="mailto:${email}?subject=Re: ${typeLabel}" style="display:inline-block;padding:14px 32px;background-color:#FF6B35;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
                        📧 Répondre à cette personne
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
            `.trim();

            const fallbackData = { name, email, phone, type: typeLabel, message, date: formattedDate };

            (async () => {
                try {
                    // 1. Email de confirmation au visiteur
                    await sendViaFirestoreMail({
                        to: [email],
                        message: { subject: confirmationSubject, text: confirmationText, html: confirmationHtml },
                        data: fallbackData
                    }, fallbackData);

                    // 2. Email de notification au propriétaire du site
                    await sendViaFirestoreMail({
                        to: ['[EMAIL_CONTACT]'],
                        message: { subject: notificationSubject, text: notificationText, html: notificationHtml },
                        data: { ...fallbackData, type_: 'notification' }
                    }, fallbackData);

                    // Success state
                    submitBtn.textContent = '✓ Message envoyé !';
                    submitBtn.style.background = 'var(--color-success)';
                    contactForm.reset();
                } catch (error) {
                    console.error('Erreur lors de l\'envoi du formulaire de contact :', error);
                    alert('Une erreur est survenue lors de l\'envoi de votre message. Merci de réessayer ou de nous contacter directement par email.');
                } finally {
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            })();
        });
    }

    // ========================================
    // RESOURCE DOWNLOAD FORMS
    // ========================================
    if (resourceForm) {
        const resourceType = resourceForm.getAttribute('data-resource');
        const successMessage = document.getElementById('success-message');

        resourceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(resourceForm);
            const prenom = formData.get('prenom');
            const email = formData.get('email');
            const entreprise = formData.get('entreprise');

            // Validate form
            if (!prenom || !email || !entreprise) {
                alert('Veuillez remplir tous les champs obligatoires.');
                return;
            }

            if (!resourceForm.querySelector('input[name="rgpd"]').checked) {
                alert('Veuillez accepter les conditions d\'utilisation des données.');
                return;
            }

            const submitBtn = resourceForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Loading state
            submitBtn.textContent = 'Traitement en cours...';
            submitBtn.disabled = true;

            // Determine PDF path and resource name
            let pdfPath = '';
            let resourceName = '';
            if (resourceType === 'checklist-ia-pme') {
                pdfPath = '../assets/Ressources/Votre-PME-est-elle-prete-pour-lIA .pdf';
                resourceName = 'Checklist IA pour PME';
            } else if (resourceType === 'guide-prompts-ia') {
                pdfPath = '../assets/Ressources/5-PROMPTS-IA-PRETS-A-LEMPLOI .pdf';
                resourceName = 'Guide des Prompts IA';
            }

            // Function to créer un document d'email dans Firestore
            // L'extension Trigger Email enverra ensuite l'email automatiquement
            const saveToFirestore = async () => {
                if (typeof firebase === 'undefined') {
                    console.warn('Firebase non chargé. Les données ne seront pas enregistrées.');
                    console.log('Données du téléchargement :', {
                        prenom: prenom,
                        email: email,
                        entreprise: entreprise,
                        resource: resourceName,
                        date: new Date().toLocaleString('fr-FR')
                    });
                    return false;
                }

                try {
                    console.log('🔄 Tentative d\'enregistrement dans Firestore...');
                    const db = firebase.firestore();
                    console.log('✅ Firestore DB obtenue');

                    // Date formatée en français pour l'email
                    const formattedDate = new Date().toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // Sujet de l'email envoyé au prospect
                    const subject = `Votre ressource \"${resourceName}\" - [NOM_ENTREPRISE]`;

                    // Version texte brut (fallback)
                    const text = `
Merci pour votre intérêt pour ${resourceName} !

Voici un récapitulatif de votre demande :
- Prénom : ${prenom}
- Email : ${email}
- Entreprise : ${entreprise}
- Ressource : ${resourceName}
- Date : ${formattedDate}

Si vous avez des questions ou si vous souhaitez aller plus loin, vous pouvez me répondre directement à cet email.

À très bientôt,
[VOTRE_NOM]
[NOM_ENTREPRISE]
                    `.trim();

                    // Version HTML avec une mise en forme proche de la charte du site
                    const html = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0A1628;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#0A1628;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 32px;background:linear-gradient(135deg,#0A1628,#111D2E);color:#ffffff;">
                <table width="100%%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td align="left" style="font-size:20px;font-weight:700;">
                      [NOM_ENTREPRISE]
                    </td>
                    <td align="right" style="font-size:12px;color:#CBD5E0;">
                      ${formattedDate}
                    </td>
                  </tr>
                </table>
                <h1 style="margin:16px 0 0 0;font-size:24px;font-weight:700;color:#F7FAFC;">
                  Merci pour votre intérêt
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 16px 32px;color:#2D3748;">
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Bonjour ${prenom},
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Merci pour votre intérêt pour la ressource <strong>${resourceName}</strong>. Votre téléchargement est disponible sur le site, et vous pouvez y revenir à tout moment.
                </p>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Voici un récapitulatif de vos informations :
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%%" style="margin:0 0 16px 0;">
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;width:140px;">Prénom</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${prenom}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Email</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Entreprise</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${entreprise}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Ressource</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${resourceName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;font-size:14px;color:#718096;">Date</td>
                    <td style="padding:8px 0;font-size:14px;color:#2D3748;">${formattedDate}</td>
                  </tr>
                </table>
                <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">
                  Si vous avez des questions ou si vous souhaitez échanger sur votre projet, vous pouvez me répondre directement à cet email ou réserver un créneau pour en discuter.
                </p>
                <p style="margin:0 0 24px 0;">
                  <a href="mailto:[EMAIL_CONTACT]" style="display:inline-block;padding:12px 24px;background-color:#FF6B35;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
                    Échanger sur votre projet
                  </a>
                </p>
                <p style="margin:0 0 8px 0;font-size:13px;color:#A0AEC0;line-height:1.6;">
                  Cet email vous a été envoyé suite au téléchargement d'une ressource sur [NOM_DE_DOMAINE]. Vos données ne sont jamais revendues et sont utilisées uniquement pour vous recontacter dans le cadre de votre demande.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 24px 32px;background-color:#F7FAFC;color:#718096;font-size:12px;text-align:center;">
                © ${new Date().getFullYear()} [NOM_ENTREPRISE] — [VOTRE_TAGLINE]
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
                    `.trim();

                    // 1. Création du document pour l'email au prospect
                    console.log('📝 Création du document email pour le prospect...');
                    const docRefProspect = await db.collection('mail').add({
                        to: [email],
                        message: {
                            subject: subject,
                            text: text,
                            html: html
                        },
                        data: {
                            prenom: prenom,
                            email: email,
                            entreprise: entreprise,
                            resource: resourceName,
                            resourceType: resourceType,
                            date: formattedDate
                        },
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Email prospect créé avec ID:', docRefProspect.id);

                    // 2. Création du document pour l'email de notification à vous
                    const notificationSubject = `📥 Nouveau téléchargement PDF - ${resourceName}`;
                    const notificationText = `
Nouveau téléchargement PDF !

Ressource : ${resourceName}
Prénom : ${prenom}
Email : ${email}
Entreprise : ${entreprise}
Date : ${formattedDate}

Vous pouvez recontacter cette personne pour proposer vos services.
                    `.trim();

                    const notificationHtml = `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${notificationSubject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#F7FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F7FAFC;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding:32px;background:linear-gradient(135deg,#FF6B35,#FF8C61);color:#ffffff;">
                <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
                  📥 Nouveau téléchargement PDF
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 24px 0;font-size:16px;color:#2D3748;line-height:1.6;">
                  Une nouvelle personne a téléchargé une de vos ressources.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:16px;background-color:#F7FAFC;border-radius:8px;border-left:4px solid #FF6B35;">
                      <p style="margin:0 0 8px 0;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;">Ressource</p>
                      <p style="margin:0;font-size:18px;color:#2D3748;font-weight:600;">${resourceName}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Prénom</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${prenom}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Email</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">
                        <a href="mailto:${email}" style="color:#FF6B35;text-decoration:none;">${email}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;border-bottom:1px solid #E2E8F0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Entreprise</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${entreprise}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0;">
                      <p style="margin:0;font-size:14px;color:#718096;">Date</p>
                      <p style="margin:4px 0 0 0;font-size:16px;color:#2D3748;font-weight:500;">${formattedDate}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center" style="padding:24px 0 0 0;">
                      <a href="mailto:${email}?subject=Re: ${resourceName}" style="display:inline-block;padding:14px 32px;background-color:#FF6B35;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">
                        📧 Contacter cette personne
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
                    `.trim();

                    console.log('📝 Création du document email de notification pour vous...');
                    const docRefNotification = await db.collection('mail').add({
                        to: ['[EMAIL_CONTACT]'],
                        message: {
                            subject: notificationSubject,
                            text: notificationText,
                            html: notificationHtml
                        },
                        data: {
                            prenom: prenom,
                            email: email,
                            entreprise: entreprise,
                            resource: resourceName,
                            resourceType: resourceType,
                            date: formattedDate,
                            type: 'notification'
                        },
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Email notification créé avec ID:', docRefNotification.id);

                    console.log('📧 Les deux emails seront envoyés automatiquement par l\'extension Trigger Email.');
                    return true;
                } catch (error) {
                    console.error('Erreur lors de la création du document d\'email dans Firestore :', error);
                    console.log('Données du téléchargement :', {
                        prenom: prenom,
                        email: email,
                        entreprise: entreprise,
                        resource: resourceName
                    });
                    return false;
                }
            };

            // Process form submission
            (async () => {
                try {
                    // Save to Firestore (Trigger Email extension will send email automatically)
                    await saveToFirestore();

                    // Trigger PDF download
                    if (pdfPath) {
                        // Encode URL to handle spaces in filenames
                        const pathParts = pdfPath.split('/');
                        const encodedPath = pathParts.map((part, index) => {
                            if (part === '..' || index === 0) return part;
                            return encodeURIComponent(part);
                        }).join('/');

                        const link = document.createElement('a');
                        link.href = encodedPath;
                        // Clean filename for download (remove trailing spaces)
                        const filename = pdfPath.split('/').pop().trim();
                        link.download = filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }

                    // Hide form and show success message
                    resourceForm.style.display = 'none';
                    if (successMessage) {
                        successMessage.style.display = 'block';
                    }

                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue. Le PDF sera téléchargé, mais l\'email n\'a peut-être pas été envoyé.');

                    // Still trigger PDF download even if email fails
                    if (pdfPath) {
                        const link = document.createElement('a');
                        link.href = pdfPath;
                        link.download = pdfPath.split('/').pop();
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }

                    resourceForm.style.display = 'none';
                    if (successMessage) {
                        successMessage.style.display = 'block';
                    }
                } finally {
                    // Reset button (in case form is shown again)
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    }, 2000);
                }
            })();
        });
    }
});
