# Portfolio Hicham Bouchikhi

Refonte Astro statique de `hicham.bouchikhi.net`. Français à `/`, anglais à `/en/`.
Contenu : `src/data/content.ts`. Présentation : `src/components/Portfolio.astro`
et `src/styles/global.css`. PDF : `public/cv/`.

## Développement

Node 24 LTS, puis `npm ci`, `npm run dev`. Production : `npm run build`.
`dist/` contient uniquement les fichiers publics ; aucun serveur Node en production.
Le lien `node_modules` de cette copie réutilise une installation locale existante
pour compiler malgré les restrictions réseau. Une installation normale utilise
le lockfile versionné et `npm ci`.

## Docker et déploiement

Prévisualisation autonome :
`docker compose -f docker-compose.preview.yml up -d --build`.
Adresse : `http://127.0.0.1:28081`.

Le serveur `173.249.16.82` apparaît dans la documentation locale d’un autre
service. Sa responsabilité pour ce domaine reste à confirmer par inspection.
Ne pas déduire le routage du domaine de cette seule adresse.

1. Inspecter en SSH les conteneurs, réseaux, ports et l’hôte proxy NPM pour
   `hicham.bouchikhi.net`. Identifier l’amont actuel et conserver sa configuration.
2. Lancer `bash deploy-portfolio.sh user@server` sur le serveur confirmé.
   Le script prépare un candidat isolé, conserve les répertoires de releases,
   vérifie la santé du conteneur et les deux langues. Il ne modifie pas NPM.
3. Vérifier via tunnel : `ssh -L 28081:127.0.0.1:28081 user@server`.
4. Configurer l’hôte proxy existant : HTTP, `portfolio-hicham`, port `8080`,
   réseau partagé `nginx_network`. Conserver le domaine et le certificat
   existants, vérifier leur validité et le DNS ; préserver les autres hôtes.
5. Vérifier publiquement HTTPS, `/`, `/en/`, les PDF et une URL inexistante (404).

Retour arrière initial : rétablir l’amont NPM précédent ; son conteneur reste intact.
Pour une release ultérieure, relancer Compose depuis son ancien répertoire avec
`RELEASE=<ancienne-release>`. Les anciennes images ne sont pas supprimées.

L’ancien workflow `.github/workflows/deploy.yml` publie une image Docker Hub
lors d’un push sur master. Il ne réalise pas de déploiement SSH. La refonte est
sur une branche dédiée et n’a pas été poussée. Aucun Watchtower n’est ajouté.
Utiliser les instructions de ce fichier pour la refonte ; les autres guides
du dépôt décrivent l’ancien site.

## Limites de validation

Compilation Astro réalisée localement. Docker, SSH et NPM doivent être vérifiés
sur le serveur : le socket Docker et les connexions SSH sont refusés dans
l’environnement de préparation. Le site n’est pas déclaré déployé.
Les miniatures sont des illustrations CSS, pas des captures des applications.
Le parcours reprend les sources locales et conserve « Aujourd’hui » chez Cegid
sans inventer de date d’entrée. Les PDF proviennent du site local existant.
