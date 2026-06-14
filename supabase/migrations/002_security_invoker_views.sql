-- Corrige les alertes Supabase "Security Definer View" (lint 0010)
-- Les vues respectent le RLS de l'utilisateur qui interroge (anon / authenticated).

ALTER VIEW public.mart_live_quality_status SET (security_invoker = on);
ALTER VIEW public.mart_pipeline_health SET (security_invoker = on);
ALTER VIEW public.mart_recent_readings SET (security_invoker = on);
