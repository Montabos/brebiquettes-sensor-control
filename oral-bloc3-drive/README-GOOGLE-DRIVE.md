# Oral Bloc 3 — Dossier Google Drive

Ce dossier est **autonome** : uploade-le tel quel sur Google Drive pour préparer ton oral hors Cursor/VS Code.

## Contenu

```
oral-bloc3-drive/
├── README-GOOGLE-DRIVE.md
├── oral-prep-bloc3.html
├── oral-prep-bloc3.md
├── grille-evaluation-bloc3.md   ← grille RNCP (33 critères numérotés)
├── sources/                     ← sources Mermaid (regénération PNG)
└── images/                      ← 10 schémas PNG
    ├── 01-pipeline-7-etapes.png
    ├── …
    └── 10-redpanda-vs-batch.png
```

## Mise en place sur Google Drive (5 min)

### 1. Upload

1. Glisse le dossier **`oral-bloc3-drive`** entier dans Google Drive.
2. Vérifie que **`images/`** contient **10 fichiers `.png`**.

### 2. Créer le Google Doc

1. Ouvre **`oral-prep-bloc3.html`** dans Chrome.
2. `Ctrl+A` → `Ctrl+C`.
3. Google Drive → **Nouveau → Google Docs** → `Ctrl+V`.
4. Les textes **bleus** sont les placeholders à remplacer.

### 3. Remplacer les placeholders bleus

| Préfixe bleu | Action |
|--------------|--------|
| **📎 IMAGE →** | Insérer l’image depuis Drive ou lien vers le PNG |
| **🔗 LIEN →** | Remplacer par l’URL réelle |

**Variables à définir une fois :**

- `{APP_URL}` = `https://brebiquettes-sensor-control.vercel.app`
- Supabase = `https://supabase.com/dashboard/project/fpnhabujwtjzjuhfvrgx`
- `{REDPANDA_CONSOLE}` = `http://localhost:8080` (démo live locale)

## Pendant l’oral — onglets suggérés

1. Google Doc (antisèche)
2. `images/01-pipeline-7-etapes.png`
3. `{APP_URL}/dashboard`
4. `{APP_URL}/monitoring`
5. Redpanda Console (si démo live)
6. Supabase Table Editor

## Index des images

| Fichier | Quand l’utiliser |
|---------|------------------|
| `01-pipeline-7-etapes.png` | Thème 1 — vue d’ensemble |
| `02-local-vs-cloud.png` | Thème 9 — split local/cloud |
| `03-cycle-evenement.png` | Thème 3 — séquence événement |
| `04-lineage-donnees.png` | Thème 4 — lineage |
| `05-controles-qualite.png` | Thème 7 — data quality |
| `06-modele-donnees-er.png` | Thème 4 — modèle ER |
| `07-zones-surveillees.png` | Thème 2 — zones métier |
| `08-gestion-erreurs.png` | Thème 6 — DLQ |
| `09-continuite-blocs.png` | Thème 8 — continuité blocs |
| `10-redpanda-vs-batch.png` | Thème 5 — vs Bloc 2 |
