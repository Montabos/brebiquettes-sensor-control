-- Active Supabase Realtime sur les tables du pipeline
ALTER PUBLICATION supabase_realtime ADD TABLE public.fact_sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fact_quality_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dead_letter_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.data_quality_results;
