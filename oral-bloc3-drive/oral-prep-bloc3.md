# Antisèche oral — Bloc 3 (Google Drive)

> **Texte en bleu** = placeholder à remplacer par ton lien Google Drive ou ton URL.  
> Ouvre plutôt **`oral-prep-bloc3.html`** dans Chrome et copie-colle dans Google Docs pour garder la couleur bleue.

---

## Variables (à remplacer en haut)

<span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}</span> — `https://brebiquettes-sensor-control.vercel.app`

<span style="color:#1d4ed8;font-weight:600">🔗 LIEN → https://supabase.com/dashboard/project/fpnhabujwtjzjuhfvrgx</span>

<span style="color:#1d4ed8;font-weight:600">🔗 LIEN → https://supabase.com/dashboard/project/fpnhabujwtjzjuhfvrgx/editor</span>

<span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {REDPANDA_CONSOLE}</span> — `http://localhost:8080` (démo live)

**Rappel :** pipeline **temps réel** capteurs (froid, humidité, affinage). Complète le **batch traite** du Bloc 2.

---

## Script oral (10 min)

| Minute | Thème | Action |
|--------|-------|--------|
| 0–1 | 0 | Accroche frigo chaud = urgence |
| 1–2 | 1 | Schéma pipeline 7 étapes |
| 2–4 | 2 | Démo dashboard + alertes |
| 4–5 | 3 | Monitoring pipeline_runs |
| 5–7 | 4 | Live Docker + consumer + producer |
| 7–8 | 5 | Redpanda vs batch Bloc 2 |
| 8–9 | 6–12 | Limites + RGPD |
| 9–10 | Questions | Pièges |

**Onglets :** ce doc · <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/01-pipeline-7-etapes.png</span> · <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/dashboard</span> · <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {REDPANDA_CONSOLE}</span>

---

# PARTIE 1 — Facile à montrer en live

## Thème 0 — Accroche

**Grille :** 5.1, 5.2

### Ce qu'il faut dire

Au Bloc 2, on historise la traite deux fois par jour. Ici, le problème est différent : si le frigo lait monte à 9 °C, il faut le savoir **maintenant**, pas demain matin. Mon pipeline **streaming** surveille 6 capteurs sur 4 zones (caves, frigo, labo) et déclenche des alertes métier en quelques secondes.

### Montrer

Enchaîner sur <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/01-pipeline-7-etapes.png</span>

---

## Thème 1 — Pipeline 7 étapes

**Grille :** 1.1, 2.1, 2.2, 5.7

### Ce qu'il faut dire

1. **Producer** Python simule les capteurs (toutes les 5 s).  
2. **Redpanda** (Kafka-compatible) reçoit le flux topic `sensor_readings`.  
3. **Consumer** valide chaque événement (Pydantic), isole les erreurs en **DLQ**, insère en base.  
4. Chaîne **raw → stg → fact** + vues **mart_*** pour le dashboard.  
5. **Alertes** si hors seuil (watch / critical).  
6. **pipeline_runs** et **data_quality_results** tracent le pipeline.

### Montrer

1. <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/01-pipeline-7-etapes.png</span>  
2. <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/04-lineage-donnees.png</span>

---

## Thème 2 — Démo dashboard

**Grille :** 3.1, 3.3, 5.7

### Ce qu'il faut dire

**Fromagerie** : statut live par zone (ok / watch / critical / unknown si pas de mesure récente).  
**Alertes** : liste des alertes ouvertes avec sévérité.  
**Zone détail** : historique d’un capteur.  
Connexion **Google OAuth** + **RLS** : seuls les utilisateurs authentifiés lisent les données.

### Montrer

1. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/login</span> puis dashboard  
2. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/dashboard</span>  
3. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/alertes</span>  
4. <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/07-zones-surveillees.png</span>

---

## Thème 3 — Monitoring

**Grille :** 3.1, 3.2, 3.4

### Ce qu'il faut dire

Page **Monitoring** : derniers **pipeline_runs** (lus, insérés, rejetés, statut), **DLQ** pending, checks **data_quality_results**. Pas d’email Resend (contrairement Bloc 2) — alertes **dashboard + Realtime Supabase**.

### Montrer

1. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/monitoring</span>  
2. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → Supabase → pipeline_runs</span>  
3. <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/08-gestion-erreurs.png</span>

---

## Thème 4 — Démo pipeline live

**Grille :** 2.1, 2.2, 1.3

### Ce qu'il faut dire

En local : `docker compose up` (Redpanda), puis consumer et producer Python. Le dashboard se rafraîchit via **Supabase Realtime**. Montrer la **Redpanda Console** : messages qui arrivent sur le topic.

### Montrer

1. Terminal consumer + producer (ou expliquer si pas de live)  
2. <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {REDPANDA_CONSOLE}</span>  
3. <span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/03-cycle-evenement.png</span>

---

# PARTIE 2 — Choix techniques

## Thème 5 — Redpanda vs batch Bloc 2

**Grille :** 1.4, 5.2

### Ce qu'il faut dire

Bloc 2 = **cron 2×/jour** suffisant pour la traite. Bloc 3 = **latence secondes** pour la chaîne du froid. Redpanda = Kafka-compatible, léger en Docker local. Pas de sur-engineering cluster pour 6 capteurs.

### Montrer

<span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/10-redpanda-vs-batch.png</span>

---

## Thème 6 — Gestion erreurs + DLQ

**Grille :** 1.2, 2.5

### Ce qu'il faut dire

Événement invalide → **dead_letter_events**, le pipeline **continue**. **Idempotence** sur `event_id`. Pas de retry auto si le consumer crash — relance manuelle + offset Kafka ; DLQ pour rejouer.

### Montrer

<span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/08-gestion-erreurs.png</span> · Supabase → dead_letter_events

---

## Thème 7 — Contrôles qualité

**Grille :** 1.3, 3.2, 4.5

### Ce qu'il faut dire

Validation **Pydantic** à l’entrée, seuils métier par capteur, freshness (15 min), logs en **data_quality_results**, tests **pytest** (3 fichiers).

### Montrer

<span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/05-controles-qualite.png</span> · Supabase → data_quality_results

---

## Thème 8 — Continuité Bloc 1 → 2 → 3

**Grille :** 5.2

### Ce qu'il faut dire

Même ferme, périmètres complémentaires : fabrication (B1), traite batch (B2), capteurs temps réel (B3), IA prédictive future (B4). Données qualifiées pour usages IA.

### Montrer

<span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/09-continuite-blocs.png</span>

---

## Thème 9 — Local vs cloud

**Grille :** 2.1, 5.2

### Ce qu'il faut dire

Dashboard + PostgreSQL en **cloud** (Vercel + Supabase Paris). Redpanda + Python en **local** pour le MVP académique. Consumer écrit via **service_role** ; dashboard lit via **OAuth + RLS**.

### Montrer

<span style="color:#1d4ed8;font-weight:600">📎 IMAGE → images/02-local-vs-cloud.png</span>

---

# PARTIE 3 — Pièges

## Thème 10 — Pas d’email pipeline

**Grille :** 2.4, 3.4

Alertes **métier** en base + dashboard. Pas d’email Resend sur échec consumer — extension documentée (comme Bloc 2).

---

## Thème 11 — Sécurité et auth

**Grille :** 6.2, 6.3

Google OAuth, RLS **authenticated only** (migration 002). Service role isolé côté Python. Données capteurs = opérationnelles, pas de données perso capteurs.

Montrer : <span style="color:#1d4ed8;font-weight:600">🔗 LIEN → {APP_URL}/login</span> · Supabase → Policies

---

## Thème 12 — RGPD

**Grille :** 6.1, 6.4, 6.5

Pas de données personnelles dans les mesures. Email utilisateur dashboard via OAuth. Traçabilité **raw_sensor_events** (payload JSON + offset). Hébergement **eu-west-3**.

---

## Thème 13 — Reprise auto

**Grille :** 2.5

Relance manuelle consumer. DLQ pour inspection et rejeu futur.

---

## Thème 14 — Pipeline pour l’IA ?

**Grille :** titre RNCP

Qualifie et historise la donnée capteur pour modèles futurs (anomalies, prédiction pannes frigo).

---

## Thème 15 — Code et tests

**Grille :** 4.1–4.5

Python modulaire (`producer`, `consumer`, `schemas`, `sensors`), Next.js dashboard, migrations SQL versionnées, pytest.

---

## Thème 16 — Méta oral

**Grille :** 5.1–5.8

Script 10 min, schémas = 1 PNG = 1 idée, démo live si possible, honnêteté sur limites.

---

## Index images

| Fichier | Thème |
|---------|-------|
| 01-pipeline-7-etapes.png | 1 |
| 02-local-vs-cloud.png | 9 |
| 03-cycle-evenement.png | 4 |
| 04-lineage-donnees.png | 1, 4 |
| 05-controles-qualite.png | 7 |
| 06-modele-donnees-er.png | 4 |
| 07-zones-surveillees.png | 2 |
| 08-gestion-erreurs.png | 3, 6 |
| 09-continuite-blocs.png | 8 |
| 10-redpanda-vs-batch.png | 5 |
