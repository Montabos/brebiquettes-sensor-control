# Scénario de démonstration (3–5 min)

## Préparation

1. `docker compose up -d`
2. Vérifier Redpanda Console : http://localhost:8080
3. Copier `.env.example` vers `.env.local` et ajouter `SUPABASE_SERVICE_ROLE_KEY`
4. `pip install -r requirements.txt`
5. `npm install && npm run dev`

## Scénario 1 — Flux normal

```bash
# Terminal 1
python -m python.consumer_to_supabase

# Terminal 2
python -m python.producer_sensors --count 3 --interval 2
```

Vérifier :
- topic `sensor_readings` dans Redpanda Console
- tables `raw_sensor_events` et `fact_sensor_readings` dans Supabase
- dashboard http://localhost:3000/dashboard

## Scénario 2 — Anomalie métier

Le producer envoie automatiquement une température frigo élevée (9,8 °C) tous les 11 cycles.

Vérifier :
- alerte dans `/alertes`
- statut `critical` sur `FRIGO_LAIT_TEMP` dans `/zones`

## Scénario 3 — Événement invalide

Le producer envoie un événement sans `sensor_id` tous les 17 cycles.

Vérifier :
- entrée dans `dead_letter_events`
- pipeline continue (pas de crash)
- section Dead-letter dans `/monitoring`

## Phrase de conclusion

« La démonstration couvre ingestion Redpanda, validation, stockage Supabase, contrôles qualité, alertes métier et observabilité du pipeline. »
