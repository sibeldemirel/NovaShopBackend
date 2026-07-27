# ADR 001 — Choix de la stack technique

**Projet :** NovaShop — plateforme e-commerce
**Statut :** Adopté
**Date :** Jour 1

## Contexte

Le cahier des charges impose l'architecture (front/back séparés en multi-repo, API REST,
conteneurisation Docker + docker-compose, hébergement GitHub, CI/CD GitHub Actions,
DevSecOps, paiement Stripe, tests automatisés à tous les niveaux), mais laisse chaque
groupe libre du langage, du framework, de la base de données, de l'ORM et des outils de
test, à condition de les justifier (§2 du cahier des charges).

Le projet est réalisé en solo sur un format de 4 journées, ce qui impose de partir d'une
base productive rapidement plutôt que d'investir du temps d'apprentissage sur une stack
inconnue.

## Décision

| Choix | Techno retenue |
|---|---|
| Langage / runtime back-end | Node.js 20 |
| Framework back-end | Express |
| Base de données | PostgreSQL 16 |
| ORM / accès aux données | Prisma |
| Front-end | HTML/CSS/JS statique, servi par Nginx |
| Reverse proxy | Nginx |
| Gestionnaire de paquets | npm |
| Tests unitaires | Jest |
| Tests d'intégration | Jest + Supertest |
| Lint / format | ESLint + Prettier |
| Conteneurisation | Docker multi-stage (back), image Nginx alpine (front) |
| Orchestration locale | docker-compose (services `backend`, `frontend`, `db`) |

## Justification

- **Node.js / Express** : framework minimaliste, peu de boilerplate, adapté au périmètre
  "cœur" du projet (catalogue, panier, commande, paiement) dans un délai de 4 jours.
  C'est aussi la stack du starter kit fourni, ce qui évite de perdre du temps de mise en
  place pour se concentrer sur les compétences évaluées (tests, CI/CD, DevSecOps).
- **PostgreSQL** : base relationnelle, recommandée par le cahier des charges pour le
  paiement (cohérence transactionnelle sur commande/stock/paiement). Déjà configurée
  dans le `docker-compose.yml` (service `db`, volume `dbdata` pour la persistance).
- **Prisma** : ORM avec migrations générées et client typé, ce qui réduit le code
  d'accès aux données à écrire à la main — pertinent en solo sur un format de 4 jours,
  où le temps gagné sur la couche données peut être réinvesti dans les tests et le
  paiement Stripe. Les migrations sont versionnées automatiquement (`prisma/migrations/`),
  ce qui répond directement à l'exigence de traçabilité du schéma (§12.4 : versionnement
  et changelog).
- **Nginx pour le front** : sert le statique et fait office de reverse proxy vers l'API
  (`/api` → `backend:3000`), conforme à l'architecture imposée (§3).
- **Jest + Supertest** : couverture de code intégrée à Jest (exigence ≥ 80 % du cœur
  métier, §13), Supertest permet de tester les routes Express sans serveur réellement
  démarré, ce qui simplifie l'intégration en CI.
- **Docker multi-stage** : image de build (`deps`) séparée de l'image d'exécution,
  réduit la taille de l'image finale et la surface d'attaque (moins de dépendances de
  build en prod) — cohérent avec les exigences DevSecOps (§8, scan d'image).

## Conséquences

- Positives : mise en route immédiate (starter déjà fonctionnel), stack homogène en
  JavaScript (un seul langage front/back), image Docker légère, bonne testabilité.
- Négatives / risques : Prisma génère un client binaire spécifique à l'OS/l'architecture
  — l'image Docker (`node:20-alpine`) nécessite une configuration adaptée
  (`binaryTargets` incluant la cible `linux-musl`, génération du client avant la copie
  finale dans le Dockerfile multi-stage) ; à vérifier dès la première build pour éviter
  un blocage tardif.
- Le paiement Stripe imposera une table `Payment` liée à `Order` avec statut et
  idempotence (§5, §12) — à modéliser dès le Jour 2 pour éviter une reprise du schéma.

## Alternatives envisagées

- **node-postgres (`pg`) en accès direct** (SQL manuel, sans ORM) : envisagé dans une
  première itération, écarté au profit de Prisma pour gagner du temps sur les
  migrations et la couche d'accès aux données, plus critique en solo qu'en groupe.
- **Framework front (React/Vue)** : rejeté pour rester sur le starter fourni (front
  statique via Nginx) et concentrer le temps disponible sur le cœur métier, les tests
  et le paiement plutôt que sur l'outillage front.
