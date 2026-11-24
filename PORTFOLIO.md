# Portfolio Hicham Bouchikhi

Refonte Astro statique de `hicham.bouchikhi.net`. Français à `/`, anglais à `/en/`.
Contenu et expériences : `src/data/content.ts`. Références web et présentation :
`src/components/Portfolio.astro`. Styles : `src/styles/global.css`. PDF : `public/cv/`.
Scène 3D : `src/scripts/scene.ts`, chargée à la demande par `interactions.ts`.

## Développement

Node 24 LTS, puis `npm ci`, `npm run dev`. Production : `npm run build`.
`dist/` contient uniquement les fichiers publics ; aucun serveur Node en production.
Astro est verrouillé en version 7.4.13 ; installation propre et audit npm validés.

## Docker et déploiement

Prévisualisation autonome :
`docker compose -f docker-compose.preview.yml up -d --build`.
Adresse : `http://127.0.0.1:28081`.

Serveur confirmé : `esperadoce@173.249.16.82`. NPM utilise l’hôte proxy 20,
avec l’amont `cv-website:8080` sur `nginx_network`. La refonte reprend cet alias ;
aucune modification du routage NPM n’est nécessaire. Le conteneur historique
`cv-website-app` et son Watchtower étaient arrêtés depuis cinq semaines.

Déploiement : `bash deploy-portfolio.sh esperadoce@173.249.16.82`.
Le script utilise explicitement Bash, y compris si le shell SSH est Fish.
Il construit une image datée, lance Compose puis attend le contrôle de santé.
Le service est aussi accessible en local sur le serveur : `127.0.0.1:28081`.

Le déploiement a été réalisé le 24 novembre 2026. Vérifications : page française,
version anglaise, PDF, CSS et réponse 404. Domaine public :
https://hicham.bouchikhi.net/.

Le certificat public Cloudflare est accepté par curl. Le certificat d’origine
NPM 51 reste expiré depuis le 1er juin 2026. Le renouvellement DNS échoue car le
jeton Cloudflare enregistré est invalide ; le test HTTP échoue car aucun service
n’écoute publiquement sur le port 80. Ces paramètres n’ont pas été modifiés.
Il faut remplacer le jeton par un jeton valide autorisé pour cette zone afin de
rétablir le renouvellement automatique. Aucun secret n’est enregistré ici.

Retour arrière initial : arrêter le service portfolio puis redémarrer le conteneur historique ;
son alias réseau et son conteneur restent conservés. Ne pas lancer les deux simultanément
avec l’alias `cv-website`.
Pour une release ultérieure, relancer Compose depuis son ancien répertoire avec
`RELEASE=<ancienne-release>`. Les anciennes images ne sont pas supprimées.

L’ancien workflow `.github/workflows/deploy.yml` publie une image Docker Hub
lors d’un push sur master. Il ne réalise pas de déploiement SSH. La refonte est
sur la branche `feat/portfolio-refonte`, poussée sur GitHub. Aucun Watchtower n’est ajouté.
Utiliser les instructions de ce fichier pour la refonte ; les autres guides
du dépôt décrivent l’ancien site.

## Design et validation

Direction graphite / orange, scène Three.js avec objet métallique et réaction au
pointeur, transitions au défilement et perspective sur les aperçus. Animation limitée
à 30 fps, densité de pixels plafonnée et rendu suspendu hors écran ou en arrière-plan.
Un bouton permet de mettre la scène en pause. La préférence de réduction des animations
évite entièrement son chargement ; un visuel CSS reste disponible sans WebGL.

Captures réelles des sites Emmanuelle Facchineri et Clinika Espoir, prises sur leurs
pages publiques le 24 novembre 2026. Captures des applications reprises de leurs
dépôts. Les interfaces Vortnux utilisent des données de démonstration. Images en WebP.
Les références web sont présentées comme des contributions, sans revendiquer une
réalisation exclusive.

Compilation locale et Docker distant validés. Inspection visuelle en Chromium
sur desktop et mobile ; version anglaise, préférence de mouvement réduit et largeur
320 px vérifiées. Le navigateur partagé étant indisponible, les vérifications utilisent
un navigateur headless isolé, sans intervenir dans les fenêtres de l’utilisateur.
Le parcours reprend les sources locales et conserve « Aujourd’hui » chez Cegid
sans inventer de date d’entrée. Les PDF proviennent du site local existant.
