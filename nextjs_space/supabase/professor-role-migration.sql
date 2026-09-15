-- Habilita o nível Professor para usuários existentes.
-- Execute este arquivo uma vez no SQL Editor do Supabase.

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'professor', 'admin'));
