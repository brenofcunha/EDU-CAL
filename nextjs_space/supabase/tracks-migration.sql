-- Execute uma vez no SQL Editor do Supabase para habilitar trilhas gerenciáveis.

CREATE TABLE IF NOT EXISTS public.tracks (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '∫',
  color TEXT NOT NULL DEFAULT 'from-blue-500 to-indigo-600',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.tracks (slug, label, description, icon, color, order_index)
VALUES
  ('calculo1', 'Cálculo I', 'Limites, derivadas e integrais', '∫', 'from-blue-500 to-indigo-600', 0),
  ('calculo2', 'Cálculo II', 'Séries, sequências e integrais múltiplas', '∑', 'from-purple-500 to-pink-600', 1),
  ('calculo3', 'Cálculo III', 'Cálculo multivariável avançado', '∇', 'from-emerald-500 to-teal-600', 2),
  ('calculovetorial', 'Cálculo Vetorial', 'Campos vetoriais, fluxo e circulação', '→', 'from-amber-500 to-orange-600', 3)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_track_check;
ALTER TABLE public.topics DROP CONSTRAINT IF EXISTS topics_track_fkey;
ALTER TABLE public.topics
  ADD CONSTRAINT topics_track_fkey FOREIGN KEY (track) REFERENCES public.tracks(slug) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tracks are publicly readable" ON public.tracks;
CREATE POLICY "Tracks are publicly readable" ON public.tracks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert tracks" ON public.tracks;
CREATE POLICY "Admins can insert tracks" ON public.tracks FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can update tracks" ON public.tracks;
CREATE POLICY "Admins can update tracks" ON public.tracks FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can delete tracks" ON public.tracks;
CREATE POLICY "Admins can delete tracks" ON public.tracks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert topics" ON public.topics;
CREATE POLICY "Admins can insert topics" ON public.topics FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can update topics" ON public.topics;
CREATE POLICY "Admins can update topics" ON public.topics FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can delete topics" ON public.topics;
CREATE POLICY "Admins can delete topics" ON public.topics FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
