-- Accès lecture réservé aux utilisateurs authentifiés (Google OAuth)
-- Les écritures passent par service_role (consumer Python)

DROP POLICY IF EXISTS anon_read_dim_zone ON dim_zone;
DROP POLICY IF EXISTS anon_read_dim_sensor ON dim_sensor;
DROP POLICY IF EXISTS anon_read_raw_sensor_events ON raw_sensor_events;
DROP POLICY IF EXISTS anon_read_stg_sensor_readings ON stg_sensor_readings;
DROP POLICY IF EXISTS anon_read_fact_sensor_readings ON fact_sensor_readings;
DROP POLICY IF EXISTS anon_read_dead_letter_events ON dead_letter_events;
DROP POLICY IF EXISTS anon_read_fact_quality_alerts ON fact_quality_alerts;
DROP POLICY IF EXISTS anon_read_pipeline_runs ON pipeline_runs;
DROP POLICY IF EXISTS anon_read_data_quality_results ON data_quality_results;

CREATE POLICY authenticated_read_dim_zone ON dim_zone
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_dim_sensor ON dim_sensor
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_raw_sensor_events ON raw_sensor_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_stg_sensor_readings ON stg_sensor_readings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_fact_sensor_readings ON fact_sensor_readings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_dead_letter_events ON dead_letter_events
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_fact_quality_alerts ON fact_quality_alerts
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_pipeline_runs ON pipeline_runs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY authenticated_read_data_quality_results ON data_quality_results
  FOR SELECT TO authenticated USING (true);
