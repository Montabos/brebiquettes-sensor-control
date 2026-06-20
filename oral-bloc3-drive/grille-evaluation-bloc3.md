# Grille d'évaluation Bloc 3 — Antisèche oral

**Projet :** Brebiquettes Sensor Control — pipeline capteurs temps réel  
**Usage :** une ligne = un critère RNCP. Colonne 2 = quoi dire. Colonne 3 = quoi montrer.

> Chemins `images/…` = dossier **`images/`** sur Google Drive.  
> `{APP_URL}` = `https://brebiquettes-sensor-control.vercel.app`

---

## Section 1 — Performance du pipeline

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **1.1** — Le pipeline répond-il aux exigences de performance (débit, latence) ? | Environ 6 capteurs, 1 mesure toutes les 5 s → ~1,2 event/s. Traitement consumer < 1 s par batch de 100. Latence bout-en-bout : secondes, pas heures. Adapté au besoin « frigo chaud = alerte immédiate ». | `images/01-pipeline-7-etapes.png` · `{APP_URL}/dashboard` (minutes_since_reading) |
| **1.2** — Gestion des erreurs sans arrêt du pipeline ? | Événement invalide → DLQ `dead_letter_events`, le consumer continue. Compteurs `records_rejected` dans `pipeline_runs`. Le pipeline ne s'arrête pas sur une mauvaise ligne. | `images/08-gestion-erreurs.png` · `{APP_URL}/monitoring` · Supabase → dead_letter_events |
| **1.3** — Précision et qualité des données transformées ? | Validation Pydantic, idempotence `event_id`, chaîne raw→stg→fact, checks `data_quality_results`, seuils métier par capteur. | `images/05-controles-qualite.png` · Supabase → data_quality_results |
| **1.4** — Scalabilité face à un volume croissant ? | 1 partition Redpanda suffit pour 6 capteurs. PostgreSQL Supabase scale pour des années de mesures. Partitionnement Kafka possible si ×100 capteurs — pas nécessaire aujourd'hui. | `images/10-redpanda-vs-batch.png` · argument oral |
| **1.5** — Redondance et haute disponibilité ? | Redpanda acks=all, Supabase et Vercel managés (PaaS). Pas de cluster custom — adapté à une fromagerie artisanale. Consumer local = point unique assumé pour le MVP. | `images/02-local-vs-cloud.png` |

---

## Section 2 — Automatisation

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **2.1** — Collecte automatisée des données ? | Producer Python tourne en continu (intervalle 5 s), publie sur Redpanda sans intervention humaine. | Terminal producer ou `{REDPANDA_CONSOLE}` topic sensor_readings |
| **2.2** — Traitement automatisé ? | Consumer Python poll Redpanda, valide, transforme, charge Supabase automatiquement. | `images/03-cycle-evenement.png` · consumer en terminal |
| **2.3** — Mise à jour automatique du dashboard ? | Vues SQL `mart_*` + Supabase Realtime : le dashboard se rafraîchit quand de nouvelles mesures arrivent. | `{APP_URL}/dashboard` pendant live pipeline |
| **2.4** — Alertes automatiques ? | Alertes **métier** auto dans `fact_quality_alerts` (watch/critical). Pas d'email Resend — alertes dashboard + Realtime. Extension email documentée (Bloc 2). | `{APP_URL}/alertes` · Supabase → fact_quality_alerts |
| **2.5** — Reprise automatique en cas de panne ? | Honnêteté : pas de retry auto si consumer crash. Relance manuelle + offset Kafka. DLQ pour rejouer les rejets. | `images/08-gestion-erreurs.png` · `{APP_URL}/monitoring` runs failed |

---

## Section 3 — Monitoring

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **3.1** — Outils de monitoring adaptés ? | Page `/monitoring` custom + Supabase Table Editor + Redpanda Console + `/api/health` (ping base). | `{APP_URL}/monitoring` · `{APP_URL}/api/health` |
| **3.2** — Métriques pertinentes suivies ? | `pipeline_runs` : lus, insérés, rejetés, durée, statut. DLQ pending. `data_quality_results`. Dernière mesure via `mart_pipeline_health`. | `{APP_URL}/monitoring` · Supabase → pipeline_runs |
| **3.3** — Accessibilité des tableaux de bord ? | Dashboard Vercel responsive, 3 pages métier + détail zone. Auth Google pour accès sécurisé. | `{APP_URL}/dashboard` · `/alertes` · `/monitoring` |
| **3.4** — Alertes proactives ? | Alertes ouvertes visibles sur `/alertes` et compteur sur dashboard. Pas de push email — choix MVP. | `{APP_URL}/alertes` |
| **3.5** — Extensibilité du monitoring ? | Nouvelle métrique = colonne `pipeline_runs` ou nouvelle vue SQL. Pattern documenté dans architecture-pipeline.md. | Supabase SQL Editor · vue mart_pipeline_health |

---

## Section 4 — Qualité du code

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **4.1** — Organisation claire du code ? | `python/` (producer, consumer, schemas), `app/` (dashboard), `supabase/migrations/`, `tests/`. | README repo · structure dossiers |
| **4.2** — Commentaires et documentation ? | README, `docs/architecture-pipeline.md`, tests pytest comme doc vivante. Peu de commentaires inline — code lisible. | `docs/architecture-pipeline.md` |
| **4.3** — Lisibilité et maintenabilité ? | Noms explicites : `consumer_to_supabase`, `mart_live_quality_status`. TypeScript + Python typé (Pydantic). | Mentionner pytest · pas besoin de montrer code à l'oral |
| **4.4** — Documentation technique complète ? | Migrations SQL versionnées (001 core + 002 auth RLS), `.env.example`, docker-compose, oral-bloc3-drive. | `supabase/migrations/001_sensor_pipeline_core.sql` |
| **4.5** — Conventions et tests ? | ESLint Next.js, pytest 3 fichiers (`test_schemas`, etc.). | `npm run lint` · `pytest` (mention oral) |

---

## Section 5 — Compétences orales

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **5.1** — Présentation claire et structurée ? | Script 10 min : accroche → schéma → démo → live → limites. Langage accessible. | `oral-prep-bloc3.html` script en tête |
| **5.2** — Justification des choix techniques ? | Redpanda vs cron Bloc 2, split local/cloud, stack légère pour 6 capteurs. | `images/10-redpanda-vs-batch.png` · `images/02-local-vs-cloud.png` |
| **5.3** — Réponses aux questions du jury ? | S'appuyer sur grille + honnêteté (pas email, pas retry auto). | Antisèche PARTIE 3 |
| **5.4** — Interaction professionnelle ? | Écouter, reformuler, admettre limites avec plan d'évolution. | Comportement oral |
| **5.5** — Gestion du temps ? | 10 min : 4 min démo dashboard, 2 min live pipeline, 2 min schémas, 2 min questions. | Script timing dans antisèche |
| **5.6** — Adaptation au public ? | Métier d'abord (frigo, caves), technique ensuite (Redpanda, DLQ). | `images/07-zones-surveillees.png` |
| **5.7** — Supports visuels efficaces ? | 10 PNG dédiés, 1 idée = 1 image. Démo live > slides. | Dossier `images/` complet |
| **5.8** — Capacité à vulgariser ? | « DLQ » = « boîte aux lettres pour les messages illisibles ». « mart_* » = « tableaux pré-calculés pour le dashboard ». | Schémas simples 01 et 04 |

---

## Section 6 — RGPD et conformité

| Critère | Ce qu'il faut dire | Ce qu'il faut montrer |
|---------|-------------------|----------------------|
| **6.1** — Minimisation des données ? | Seules mesures capteurs (température, humidité) et métadonnées techniques. Pas de nom, pas de géolocalisation perso. | Supabase → fact_sensor_readings (colonnes) |
| **6.2** — Sécurité des accès ? | Google OAuth + RLS authenticated-only (migration 002). Service role isolé côté Python. HTTPS partout. | `{APP_URL}/login` · Supabase → Policies |
| **6.3** — Droits des personnes ? | Données capteurs non personnelles. Utilisateur dashboard = email OAuth, droits gérés via Supabase Auth admin. | Supabase → Authentication → Users |
| **6.4** — Traçabilité ? | `raw_sensor_events` conserve payload JSON + offset Kafka pour audit. `pipeline_runs` trace chaque exécution. | Supabase → raw_sensor_events · pipeline_runs |
| **6.5** — Gestion des violations / hébergement ? | Hébergement UE (Supabase eu-west-3 Paris). Pas de données sensibles type santé. Procédure incident = alerte + coupure consumer si fuite suspectée. | Supabase Settings → région |

---

## Légende

| Format | Signification |
|--------|---------------|
| `images/xx.png` | Fichier dans ce dossier Drive |
| `{APP_URL}/…` | Dashboard Vercel production |
| Supabase → … | Dashboard projet `fpnhabujwtjzjuhfvrgx` |
