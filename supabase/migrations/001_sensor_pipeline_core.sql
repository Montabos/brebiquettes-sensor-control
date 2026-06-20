-- Bloc 3 — Pipeline capteurs temps réel (projet Brebiquettes sensors control)
-- Tables dimensions, staging, facts, monitoring + vues mart

-- Dimensions
CREATE TABLE IF NOT EXISTS dim_zone (
  zone_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_code text NOT NULL UNIQUE,
  zone_label text NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS dim_sensor (
  sensor_id text PRIMARY KEY,
  zone_code text NOT NULL REFERENCES dim_zone(zone_code),
  metric text NOT NULL CHECK (metric IN ('temperature', 'humidity')),
  unit text NOT NULL,
  normal_min numeric NOT NULL,
  normal_max numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

-- Raw / staging / facts
CREATE TABLE IF NOT EXISTS raw_sensor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  topic text NOT NULL DEFAULT 'sensor_readings',
  partition_id integer,
  offset_id bigint,
  payload jsonb NOT NULL,
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stg_sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  sensor_id text NOT NULL,
  zone_code text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  measured_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'simulated_sensor',
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fact_sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  sensor_id text NOT NULL REFERENCES dim_sensor(sensor_id),
  zone_code text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  measured_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'simulated_sensor',
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fact_sensor_readings_sensor_measured
  ON fact_sensor_readings (sensor_id, measured_at DESC);

-- Dead letter queue
CREATE TABLE IF NOT EXISTS dead_letter_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text,
  topic text,
  payload jsonb,
  rejection_reason text NOT NULL,
  rejected_at timestamptz NOT NULL DEFAULT now(),
  replayed_at timestamptz,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'replayed', 'discarded'))
);

-- Alertes métier
CREATE TABLE IF NOT EXISTS fact_quality_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id text NOT NULL,
  zone_code text NOT NULL,
  metric text NOT NULL,
  value numeric NOT NULL,
  threshold_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('watch', 'critical')),
  message text NOT NULL,
  event_id text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'acknowledged', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_fact_quality_alerts_status_created
  ON fact_quality_alerts (status, created_at DESC);

-- Monitoring pipeline
CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL DEFAULT 'consumer',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running', 'success', 'failed', 'partial')),
  records_read integer NOT NULL DEFAULT 0,
  records_inserted integer NOT NULL DEFAULT 0,
  records_rejected integer NOT NULL DEFAULT 0,
  errors_count integer NOT NULL DEFAULT 0,
  error_message text,
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS data_quality_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name text NOT NULL,
  check_category text NOT NULL,
  status text NOT NULL CHECK (status IN ('pass', 'fail', 'warn')),
  details jsonb,
  checked_at timestamptz NOT NULL DEFAULT now()
);

-- RLS (lecture anon initiale — restreint en migration 002)
ALTER TABLE dim_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE dim_sensor ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_sensor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE stg_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_quality_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_dim_zone ON dim_zone FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_dim_zone ON dim_zone FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_dim_sensor ON dim_sensor FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_dim_sensor ON dim_sensor FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_raw_sensor_events ON raw_sensor_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_raw_sensor_events ON raw_sensor_events FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_stg_sensor_readings ON stg_sensor_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_stg_sensor_readings ON stg_sensor_readings FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_fact_sensor_readings ON fact_sensor_readings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_fact_sensor_readings ON fact_sensor_readings FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_dead_letter_events ON dead_letter_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_dead_letter_events ON dead_letter_events FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_fact_quality_alerts ON fact_quality_alerts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_fact_quality_alerts ON fact_quality_alerts FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_pipeline_runs ON pipeline_runs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_pipeline_runs ON pipeline_runs FOR ALL TO service_role USING (true);

CREATE POLICY anon_read_data_quality_results ON data_quality_results FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY service_role_all_data_quality_results ON data_quality_results FOR ALL TO service_role USING (true);

-- Seed dimensions
INSERT INTO dim_zone (zone_code, zone_label, description) VALUES
  ('cave_affinage_1', 'Cave affinage 1', 'Cave fromages affinés'),
  ('cave_affinage_2', 'Cave affinage 2', 'Seconde cave affinage'),
  ('frigo_lait', 'Frigo lait', 'Conservation lait cru'),
  ('laboratoire', 'Laboratoire', 'Atelier transformation')
ON CONFLICT (zone_code) DO NOTHING;

INSERT INTO dim_sensor (sensor_id, zone_code, metric, unit, normal_min, normal_max) VALUES
  ('CAVE_01_TEMP', 'cave_affinage_1', 'temperature', 'celsius', 10, 14),
  ('CAVE_01_HUM', 'cave_affinage_1', 'humidity', 'percent', 85, 95),
  ('CAVE_02_TEMP', 'cave_affinage_2', 'temperature', 'celsius', 10, 14),
  ('CAVE_02_HUM', 'cave_affinage_2', 'humidity', 'percent', 85, 95),
  ('FRIGO_LAIT_TEMP', 'frigo_lait', 'temperature', 'celsius', 2, 4),
  ('LABO_TEMP', 'laboratoire', 'temperature', 'celsius', 16, 22)
ON CONFLICT (sensor_id) DO NOTHING;

-- Vues mart
CREATE OR REPLACE VIEW mart_live_quality_status AS
SELECT
  s.sensor_id,
  s.zone_code,
  z.zone_label,
  s.metric,
  s.unit,
  s.normal_min,
  s.normal_max,
  r.value AS last_value,
  r.measured_at AS last_measured_at,
  CASE
    WHEN r.measured_at IS NULL THEN NULL::numeric
    ELSE round(EXTRACT(epoch FROM now() - r.measured_at) / 60.0, 1)
  END AS minutes_since_reading,
  CASE
    WHEN r.measured_at IS NULL THEN 'unknown'::text
    WHEN EXTRACT(epoch FROM now() - r.measured_at) > 900::numeric THEN 'unknown'::text
    WHEN r.value < s.normal_min OR r.value > s.normal_max THEN 'critical'::text
    WHEN r.value < (s.normal_min + (s.normal_max - s.normal_min) * 0.15)
      OR r.value > (s.normal_max - (s.normal_max - s.normal_min) * 0.15) THEN 'watch'::text
    ELSE 'ok'::text
  END AS status_level,
  COALESCE(a.open_alerts_count, 0) AS open_alerts_count
FROM dim_sensor s
JOIN dim_zone z ON z.zone_code = s.zone_code
LEFT JOIN LATERAL (
  SELECT f.value, f.measured_at
  FROM fact_sensor_readings f
  WHERE f.sensor_id = s.sensor_id
  ORDER BY f.measured_at DESC
  LIMIT 1
) r ON true
LEFT JOIN LATERAL (
  SELECT count(*)::integer AS open_alerts_count
  FROM fact_quality_alerts qa
  WHERE qa.sensor_id = s.sensor_id AND qa.status = 'open'::text
) a ON true
WHERE s.is_active = true;

CREATE OR REPLACE VIEW mart_pipeline_health AS
SELECT
  run_id,
  run_type,
  started_at,
  finished_at,
  status,
  records_read,
  records_inserted,
  records_rejected,
  errors_count,
  error_message,
  CASE
    WHEN finished_at IS NOT NULL THEN EXTRACT(epoch FROM finished_at - started_at)
    ELSE NULL::numeric
  END AS duration_seconds,
  (SELECT count(*) FROM raw_sensor_events) AS total_raw_events,
  (SELECT count(*) FROM dead_letter_events WHERE status = 'pending'::text) AS pending_dead_letters,
  (SELECT max(measured_at) FROM fact_sensor_readings) AS last_reading_at,
  (SELECT count(*) FROM fact_quality_alerts WHERE status = 'open'::text) AS open_alerts
FROM pipeline_runs pr
ORDER BY started_at DESC
LIMIT 50;

CREATE OR REPLACE VIEW mart_recent_readings AS
SELECT
  f.event_id,
  f.sensor_id,
  f.zone_code,
  z.zone_label,
  f.metric,
  f.value,
  f.unit,
  f.measured_at,
  f.source,
  CASE
    WHEN f.value < s.normal_min OR f.value > s.normal_max THEN 'critical'::text
    WHEN f.value < (s.normal_min + (s.normal_max - s.normal_min) * 0.15)
      OR f.value > (s.normal_max - (s.normal_max - s.normal_min) * 0.15) THEN 'watch'::text
    ELSE 'ok'::text
  END AS status_level
FROM fact_sensor_readings f
JOIN dim_sensor s ON s.sensor_id = f.sensor_id
JOIN dim_zone z ON z.zone_code = f.zone_code
ORDER BY f.measured_at DESC
LIMIT 100;
