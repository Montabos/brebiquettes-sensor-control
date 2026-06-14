# Script Loom — Pipeline temps réel Bloc 3 (3 à 5 min)

> **Objectif :** screencast du pipeline en exécution — **Ingestion → Transformation → Chargement → Monitoring / Data Quality** — avec le dashboard en production et la preuve côté Supabase + Redpanda.

**URL prod :** https://brebiquettes-sensor-control.vercel.app  
**Repo :** https://github.com/Montabos/brebiquettes-sensor-control  
**Durée cible :** 4 min (version courte ~3 min, version longue ~5 min)

---

## Préparation (avant d'enregistrer)

### Services à lancer (dans l'ordre)

```bash
cd bloc3
docker compose up -d
python -m python.consumer_to_supabase          # Terminal 1 — laisser tourner
python -m python.producer_sensors --interval 3  # Terminal 2 — lancer au début de la scène 3
```

> Le **dashboard prod** lit Supabase directement — pas besoin de `npm run dev` pour la vidéo.  
> Optionnel : dashboard local http://localhost:3000 en parallèle.

### Onglets à ouvrir

| Onglet | URL / emplacement |
|--------|-------------------|
| Dashboard prod | https://brebiquettes-sensor-control.vercel.app/dashboard |
| Redpanda Console | http://localhost:8080 |
| Supabase | Table Editor → `raw_sensor_events`, `fact_sensor_readings`, `pipeline_runs` |
| Terminal consumer | logs `python -m python.consumer_to_supabase` |
| Terminal producer | logs `python -m python.producer_sensors` |
| GitHub (optionnel) | https://github.com/Montabos/brebiquettes-sensor-control |

### Checklist

- [ ] Docker Desktop démarré, `docker compose up -d` OK
- [ ] `.env.local` avec `SUPABASE_SERVICE_ROLE_KEY` (consumer)
- [ ] Consumer lancé **avant** l'enregistrement
- [ ] Producer **pas encore** lancé (démarrage live en scène 3)
- [ ] Notifications coupées, zoom navigateur ~100 %
- [ ] Loom : écran entier ou fenêtre Chrome + fenêtres terminal visibles (split ou bascule)

### Timing producer pour la démo

Le simulateur injecte automatiquement :
- **Tous les 11 cycles** : frigo à 9,8 °C → alerte `critical` sur `FRIGO_LAIT_TEMP`
- **Tous les 17 cycles** : événement invalide (sans `sensor_id`) → `dead_letter_events`

Avec `--interval 3`, l'anomalie frigo arrive vers **~33 s**, le dead-letter vers **~51 s**.

---

## Script détaillé (avec indications écran)

### Scène 1 — Introduction · ~25 s

**Écran :** titre ou dashboard prod (vide ou données anciennes).

**Narration :**
> Bonjour. Je présente le **pipeline temps réel** de La Ferme des Brebiquettes — Bloc 3. Objectif : surveiller en continu ce qui ne peut pas attendre — température des caves, humidité, frigo lait — pas toute la ferme. Stack : **Redpanda** pour le flux, **Python** pour valider et transformer, **Supabase PostgreSQL** pour stocker, **Next.js sur Vercel** pour le dashboard.

---

### Scène 2 — Architecture local + cloud · ~40 s

**Écran :** diagramme `docs/architecture-pipeline.md` (PNG A + B) **ou** schéma oral avec Redpanda Console + Vercel.

**Narration :**
> Le producteur simule six capteurs sur quatre zones. Les événements passent par Redpanda en local — c'est notre bus de streaming. Le consumer Python lit le flux, valide chaque message, et écrit dans Supabase en cloud. Le dashboard Vercel lit Supabase en temps réel. Redpanda et Python tournent en local pendant la démo ; le dashboard et la base sont en production.

**Écran :** Redpanda Console http://localhost:8080 → topic `sensor_readings`.

**Narration :**
> Ici, Redpanda Console : on voit le topic `sensor_readings` où transitent les mesures avant traitement.

---

### Scène 3 — INGESTION · ~50 s

**Écran :** Terminal producer — lancer la commande **en direct** :

```bash
python -m python.producer_sensors --interval 3
```

**Narration :**
> Je démarre le simulateur de capteurs. Toutes les trois secondes, six mesures partent : deux caves d'affinage, frigo lait, laboratoire — température et humidité.

**Actions :**
1. Montrer les logs `[producer] CAVE_01_TEMP -> 12.3` etc.
2. Basculer sur **Redpanda Console** → Messages → topic `sensor_readings` → messages qui arrivent
3. *(Optionnel)* montrer un message JSON : `event_id`, `sensor_id`, `zone`, `value`, `measured_at`

**Narration :**
> C'est la couche **ingestion** : événements JSON continus, offsets conservés, reprise possible si le consumer s'arrête.

---

### Scène 4 — TRANSFORMATION · ~45 s

**Écran :** Terminal consumer (logs) **ou** fichier `python/schemas.py` / `consumer_to_supabase.py` (10 s max).

**Narration :**
> Le consumer lit chaque message. **Transformation** en trois étapes : validation du schéma Pydantic, règles métier — capteur connu, plages physiques — puis déduplication par `event_id`. Si le message est invalide, il part en dead-letter : le pipeline ne plante pas.

**Écran :** consumer qui traite (pas d'erreur visible = flux normal).

**Narration :**
> Chaque événement valide est nettoyé : unité cohérente, zone reconnue, valeur dans les plages acceptables. Ensuite évaluation des seuils par zone — cave, frigo, labo.

---

### Scène 5 — CHARGEMENT · ~50 s

**Écran :** Supabase Table Editor.

**Ordre des tables :**
1. `raw_sensor_events` — payload JSON brut + offset Kafka → **rafraîchir**, nouvelles lignes
2. `stg_sensor_readings` — champs typés, nettoyés
3. `fact_sensor_readings` — historique exploitable

**Narration :**
> **Chargement** en trois couches. RAW : audit complet, JSON brut. STAGING : données nettoyées. FACT : historique pour le dashboard et les alertes. Même événement, trois niveaux de maturité — comme un entrepôt de données léger.

**Écran :** `pipeline_runs` — run `running` ou `success`, compteurs `records_read` / `records_inserted`.

**Narration :**
> Chaque session consumer est tracée dans `pipeline_runs` : combien lus, insérés, rejetés.

---

### Scène 6 — Dashboard prod (temps réel) · ~55 s

**Écran :** https://brebiquettes-sensor-control.vercel.app/dashboard

**Narration :**
> Le dashboard en production se met à jour en direct via Supabase Realtime — indicateur « Live » en haut à droite.

**Actions :**
1. KPI : Zones OK, Zones critiques, Alertes ouvertes, Dernière mesure
2. Cartes zones : Cave 1, Cave 2, Frigo lait, Labo — statut, valeur, seuil
3. Cliquer sur **Frigo lait** → page détail zone (historique)
4. Section « Mesures récentes » qui se remplit

**Narration :**
> La productrice voit l'état de chaque zone sans recharger la page. Un clic donne l'historique du capteur.

---

### Scène 7 — Anomalie métier · ~40 s

**Écran :** attendre le cycle 11 du producer (~33 s) **ou** couper au moment où le frigo passe en critical.

**Écran :** `/alertes` sur le dashboard prod.

**Narration :**
> Le simulateur envoie automatiquement une température frigo anormale — 9,8 degrés, seuil 2 à 4. Le pipeline crée une alerte `critical` dans `fact_quality_alerts`.

**Actions :**
1. Table alertes : zone, capteur, valeur, sévérité, message
2. Retour `/dashboard` : carte Frigo lait en rouge / critical

**Narration :**
> C'est la **data quality métier** : pas seulement « la donnée arrive », mais « la donnée signale un risque sanitaire ou qualité ».

---

### Scène 8 — Dead-letter + MONITORING · ~50 s

**Écran :** `/monitoring` sur le dashboard prod.

**Narration :**
> Page Monitoring : santé du pipeline technique. Historique des runs, dead-letter queue, contrôles qualité automatiques.

**Actions :**
1. KPI : Dernier run, Événements lus, Dead letters, Dernière mesure
2. Tableau runs : statut `success`, lus / insérés / rejetés
3. Section **Dead-letter** — événement sans `sensor_id` (cycle 17)
4. Section **Contrôles qualité** : complétude, fraîcheur, validité, unicité

**Narration :**
> L'événement invalide est isolé en dead-letter. Le consumer continue. Les contrôles qualité s'exécutent à chaque cycle : fraîcheur des mesures, complétude des champs, unicité des `event_id`.

**Écran :** Supabase `dead_letter_events` + `data_quality_results` (rapide).

---

### Scène 9 — Conclusion · ~25 s

**Écran :** vue d'ensemble dashboard ou diagramme pipeline.

**Narration :**
> En résumé : **ingestion** Redpanda, **transformation** Python avec validation, **chargement** RAW → STAGING → FACT dans Supabase, **monitoring** et **data quality** intégrés au dashboard. Architecture ciblée : du temps réel uniquement là où le délai compte — froid, humidité, affinage — pas de sur-ingénierie sur le reste de la ferme. Merci.

---

## Version courte (~3 min)

| À couper | À garder obligatoirement |
|----------|--------------------------|
| Diagrammes PNG architecture | Intro + lancement producer live |
| Détail `schemas.py` | Redpanda Console (messages) |
| Page détail zone capteur | Supabase raw → fact (rapide) |
| GitHub | Dashboard prod + KPI zones |
| Toutes les tables Supabase | Alertes frigo critical |
| | Monitoring + dead-letter |
| | Conclusion |

**Enchaînement express :** Intro (20 s) → lancer producer → Redpanda (20 s) → Supabase fact (25 s) → Dashboard live (40 s) → Alertes (30 s) → Monitoring (35 s) → Conclusion (15 s).

---

## Phrases-clés jury

- *On ne rend pas toute la ferme temps réel — seulement les signaux critiques : froid, humidité, qualité.*
- *Redpanda en local pour la démo ; en production réelle, même pattern avec capteurs physiques branchés sur le producer.*
- *Dead-letter : un événement pourri ne bloque pas le pipeline — rejet documenté, flux continue.*
- *Trois couches RAW / STG / FACT : traçabilité + données exploitables, sans batch lourd.*
- *Dashboard Vercel + Supabase cloud ; le traitement streaming tourne en local — choix assumé pour la soutenance.*

---

## Checklist post-enregistrement

- [ ] Producer lancé **pendant** la vidéo (pas avant)
- [ ] Messages visibles dans Redpanda Console
- [ ] Lignes qui apparaissent dans `fact_sensor_readings` pendant l'enregistrement
- [ ] Dashboard prod mis à jour (indicateur Live ou horodatage récent)
- [ ] Au moins une alerte `critical` frigo visible
- [ ] Au moins un dead-letter visible (ou mentionné si timing serré)
- [ ] `pipeline_runs` avec statut `success` et compteurs > 0
- [ ] Durée entre 3:30 et 5:00

---

# Téléprompteur — version mot à mot (~4 min)

*Lire d'un trait, sans regarder les indications. Pauses naturelles aux changements d'écran.*

---

Bonjour.

Je présente le pipeline temps réel que nous avons construit pour La Ferme des Brebiquettes — le Bloc 3.

L'objectif n'est pas de tout rendre temps réel. C'est de surveiller en continu ce qui ne peut pas attendre : la température des caves d'affinage, l'humidité, le frigo lait, le laboratoire. Si le frigo dérive, on doit le savoir en minutes, pas demain matin.

L'architecture repose sur quatre briques. Un simulateur Python qui joue le rôle des capteurs. Redpanda, un bus d'événements qui tourne en local via Docker. Un consumer Python qui valide et transforme chaque message. Et Supabase PostgreSQL en cloud, plus un dashboard Next.js déployé sur Vercel.

Le dashboard et la base sont en production. Redpanda et les scripts Python tournent sur ma machine pendant la démo — c'est le traitement continu, pas une application web.

Je commence par l'ingestion.

Je lance le producteur de capteurs. Toutes les trois secondes, six mesures partent vers le topic Redpanda `sensor_readings` : température et humidité pour deux caves, température frigo, température labo.

Dans Redpanda Console, on voit les messages arriver en direct. Chaque événement est un JSON : identifiant unique, capteur, zone, valeur, horodatage. Les offsets sont conservés : si le consumer s'arrête, il reprend où il en était.

Passons à la transformation.

Le consumer lit en continu. Pour chaque message, il valide le schéma avec Pydantic : champs obligatoires, types corrects. Ensuite les règles métier : capteur connu, valeur dans les plages physiques, cohérence unité et métrique. Si le message est invalide, il est envoyé en dead-letter — le pipeline continue, il ne plante pas.

Les événements valides passent par une vérification d'idempotence : un `event_id` déjà vu est ignoré. Puis évaluation des seuils par zone pour détecter les dérives.

Le chargement se fait en trois couches dans Supabase.

D'abord `raw_sensor_events` : le JSON brut, la partition, l'offset — couche d'audit. Ensuite `stg_sensor_readings` : données nettoyées et typées. Enfin `fact_sensor_readings` : l'historique exploitable par le dashboard. Chaque session du consumer est aussi tracée dans `pipeline_runs`.

J'ouvre le dashboard en production.

Les indicateurs se mettent à jour en temps réel grâce à Supabase Realtime. On voit le nombre de zones OK, les zones critiques, les alertes ouvertes, l'heure de la dernière mesure. Chaque carte affiche une zone : valeur actuelle, seuil normal, statut.

Après une trentaine de secondes, le simulateur envoie une anomalie : le frigo monte à 9,8 degrés, hors du seuil 2 à 4. Une alerte critique apparaît dans la page Alertes, et la carte Frigo lait passe en rouge. Ce n'est pas juste de la télémétrie : c'est une alerte métier actionnable.

Sur la page Monitoring, on suit la santé technique du pipeline. Le dernier run est en succès. On voit combien d'événements ont été lus, insérés, rejetés. Dans la dead-letter queue, un événement sans identifiant capteur a été isolé — le producteur l'injecte automatiquement pour tester la résilience. Les contrôles qualité listent la complétude, la fraîcheur des mesures, la validité des plages, l'unicité des identifiants.

Pour résumer : ingestion continue via Redpanda, transformation et validation en Python, chargement structuré RAW puis STAGING puis FACT dans Supabase, monitoring et data quality intégrés au dashboard Vercel. Une architecture volontairement ciblée : du streaming uniquement là où le délai compte, sans complexité inutile sur le reste de l'exploitation.

Merci pour votre attention.

---

## Téléprompteur court (~3 min)

*Version condensée si la contrainte de temps est stricte.*

---

Bonjour. Je présente le pipeline temps réel du Bloc 3 — La Ferme des Brebiquettes : surveillance continue du froid, de l'humidité et de la qualité fromagère.

Architecture : simulateur Python, Redpanda en local, consumer Python, Supabase PostgreSQL en cloud, dashboard Next.js sur Vercel en production.

Je lance le producteur. Les mesures arrivent dans Redpanda — topic `sensor_readings`. C'est l'ingestion.

Le consumer valide chaque message : schéma Pydantic, règles métier, idempotence. Les invalides partent en dead-letter sans bloquer le flux. C'est la transformation.

Les données valides s'écrivent en trois couches : raw, staging, fact — plus le suivi dans `pipeline_runs`. C'est le chargement.

Le dashboard prod se met à jour en direct. KPI zones, cartes capteurs, mesures récentes. Une anomalie frigo à 9,8 degrés déclenche une alerte critique.

La page Monitoring montre les runs, les dead-letters, et les contrôles qualité automatiques.

En résumé : ingestion, transformation, chargement, monitoring — pipeline temps réel ciblé, déployé et fonctionnel. Merci.
