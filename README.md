# La Ferme des Brebiquettes — Surveillance qualité temps réel (Bloc 3)

Pipeline temps réel pour surveiller froid, humidité et affinage. Les capteurs physiques ne sont pas encore connectés : un **simulateur Python** reproduit leurs événements. **Redpanda** gère le flux continu ; **Supabase PostgreSQL** stocke, transforme et expose la donnée au dashboard.

## Architecture

```
Capteurs simulés (producer Python)
        ↓
Redpanda — topic sensor_readings
        ↓
Consumer Python (validation + dead-letter)
        ↓
Supabase PostgreSQL
  raw → staging → fact + alertes + monitoring
        ↓
Dashboard Next.js (Vercel)
```

**Message clé :** on ne rend pas toute la ferme temps réel. On surveille en continu ce qui ne peut pas attendre : température, humidité et qualité.

## Stack

| Couche | Technologie |
|--------|-------------|
| Flux événements | Redpanda (Docker local) |
| Producer / Consumer | Python 3.11+ |
| Base de données | Supabase PostgreSQL |
| Dashboard | Next.js 16 + Tailwind |
| Tests | pytest |

## Supabase

| Paramètre | Valeur |
|-----------|--------|
| Projet | `Brebiquettes sensors control` |
| URL | `https://fpnhabujwtjzjuhfvrgx.supabase.co` |
| Région | `eu-west-3` (Paris) |
| Ref | `fpnhabujwtjzjuhfvrgx` |

> **Note :** la création du projet a nécessité de mettre en pause `ProjectView` (limite 2 projets actifs sur le plan gratuit).

### Clés à configurer

1. `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Settings → API → anon / publishable
2. `SUPABASE_SERVICE_ROLE_KEY` — Settings → API → service_role (requis pour le consumer Python)

## Démarrage rapide

### 1. Installation

```bash
cd bloc3
npm install
pip install -r requirements.txt
cp .env.example .env.local
```

### 2. Redpanda

```bash
docker compose up -d
```

- Broker : `localhost:19092`
- Console : http://localhost:8080

### 3. Lancer le pipeline

```bash
# Terminal 1 — consumer
python -m python.consumer_to_supabase

# Terminal 2 — simulateur capteurs
python -m python.producer_sensors --count 5 --interval 3
```

### 4. Dashboard

```bash
npm run dev
```

Ouvrir http://localhost:3000/dashboard

## Modèle de données

| Table / Vue | Rôle |
|-------------|------|
| `dim_zone`, `dim_sensor` | Référentiel capteurs |
| `raw_sensor_events` | Événements bruts (audit) |
| `stg_sensor_readings` | Données nettoyées |
| `fact_sensor_readings` | Historique exploitable |
| `fact_quality_alerts` | Alertes métier |
| `dead_letter_events` | Événements rejetés |
| `pipeline_runs` | Suivi technique |
| `data_quality_results` | Résultats contrôles qualité |
| `mart_live_quality_status` | Vue dashboard zones |
| `mart_pipeline_health` | Vue monitoring pipeline |

## Contrôles qualité

| Critère | Contrôle |
|---------|----------|
| Complétude | `sensor_id` obligatoire |
| Fraîcheur | dernière mesure &lt; 15 min |
| Validité | plages physiques température / humidité |
| Cohérence | unité et métrique par capteur |
| Unicité | `event_id` unique |
| Exactitude métier | seuils par zone |

## Gestion d'erreurs

- JSON invalide → `dead_letter_events`, pipeline continue
- Capteur inconnu → rejet documenté
- Valeur impossible → rejet ou alerte
- Consumer interrompu → reprise via offsets Redpanda
- Transformation échouée → statut `failed` dans `pipeline_runs`

## Tests

```bash
pytest
```

## Démonstration vidéo

Voir [docs/demo_script.md](docs/demo_script.md).

## Continuité avec les blocs précédents

- **Bloc 1** : données critiques (températures, lots, traçabilité)
- **Bloc 2** : traite batch dans Supabase (`brebiquettes-milking`)
- **Bloc 3** : flux temps réel ciblé sur qualité froid / affinage, même logique de sobriété

## Limites et évolutions

- Capteurs simulés (remplacement direct du producer le jour du branchement réel)
- Alertes email non branchées (extension possible via Resend comme Bloc 2)
- Un seul topic Redpanda (suffisant pour la démo)
