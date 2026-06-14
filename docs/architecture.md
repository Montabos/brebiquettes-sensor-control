# Architecture — Surveillance qualité temps réel (Bloc 3)

**Client :** La Ferme des Brebiquettes  
**Périmètre :** Flux continu capteurs froid, humidité et affinage (caves, frigo lait, laboratoire)

## Contexte

Le Bloc 2 couvre la traite en batch (2 extractions/jour). Le Bloc 3 ajoute une brique **temps réel** uniquement là où le délai compte : une dérive de température ou d'humidité peut impacter un lot avant la prochaine visite terrain.

Les capteurs physiques ne sont pas encore branchés : un **producer Python** simule leurs événements. Le jour du branchement réel, seul le producer change.

## Architecture globale

```
Capteurs simules (producer Python)     [LOCAL]
        ↓
Redpanda topic sensor_readings         [LOCAL Docker]
        ↓
Consumer Python validation + DLQ       [LOCAL]
        ↓
Supabase PostgreSQL                    [CLOUD]
        ↓
Dashboard Next.js                      [CLOUD Vercel]
```

## Stack technique

| Besoin | Choix | Justification |
|--------|-------|---------------|
| Bus événements | Redpanda (Docker local) | Flux continu, offsets, console de monitoring |
| Producer / Consumer | Python 3.11 | Validation Pydantic, intégration Supabase |
| Base de données | PostgreSQL via Supabase | Continuité Bloc 2, raw + staging + marts |
| Dashboard | Next.js sur Vercel | 4 pages métier, déployé en production |
| Monitoring pipeline | `pipeline_runs` + `dead_letter_events` | Observabilité sans Grafana |
| Data quality | `data_quality_results` + tests pytest | Contrôles explicites pour le jury |

## Déploiement

| Composant | Où en démo / oral |
|-----------|-------------------|
| Redpanda + Console | Local (`docker compose up`) |
| Producer + Consumer | Local (terminaux Python) |
| Supabase | Cloud (`Brebiquettes sensors control`) |
| Dashboard | Cloud [brebiquettes-sensor-control.vercel.app](https://brebiquettes-sensor-control.vercel.app) |

## Modèle de données

Trois niveaux logiques dans Supabase :

1. **Référentiel** — `dim_zone`, `dim_sensor`
2. **Pipeline** — `raw_sensor_events` → `stg_sensor_readings` → `fact_sensor_readings`
3. **Monitoring & qualité** — `pipeline_runs`, `dead_letter_events`, `fact_quality_alerts`, `data_quality_results`
4. **Marts** — `mart_live_quality_status`, `mart_pipeline_health`, `mart_recent_readings`

## Diagrammes détaillés

Voir [architecture-pipeline.md](./architecture-pipeline.md) pour tous les schémas Mermaid (soutenance, séquence, ER, déploiement, continuité Bloc 1→3).

## Continuité avec les autres blocs

| Bloc | Sujet | Lien |
|------|-------|------|
| Bloc 1 | Gouvernance data | Températures, lots, traçabilité = données critiques |
| Bloc 2 | Traite batch | `brebiquettes-milking` — 2×/jour, pas de streaming |
| Bloc 3 | Qualité temps réel | Même logique Supabase, + Redpanda pour le flux continu |

## Éléments écartés

| Élément | Raison |
|---------|--------|
| Snowflake | Supabase suffit pour le volume et la cohérence projet |
| Airflow | Consumer continu + contrôles intégrés |
| Grafana | Dashboard métier + tables monitoring |
| Redpanda en cloud (démo) | Docker local suffit pour l'oral ; cloud possible en prod |
| Capteurs IoT réels (phase 1) | Simulateur valide l'architecture avant branchement |
