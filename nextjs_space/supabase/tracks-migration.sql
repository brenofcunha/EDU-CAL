-- Execute uma vez no SQL Editor do Supabase para habilitar trilhas gerenciáveis.

CREATE UNIQUE INDEX IF NOT EXISTS profiles_name_unique_idx
  ON public.profiles (name);

UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE lower(split_part(email, '@', 1)) = 'brenofcunha'
);

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('bug', 'suggestion', 'other')),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 5000),
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_feedback_created_at_idx ON public.user_feedback (created_at DESC);
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;
CREATE POLICY "Users can insert own feedback" ON public.user_feedback FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
CREATE POLICY "Users can view own feedback" ON public.user_feedback FOR SELECT TO authenticated
USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.user_feedback;
CREATE POLICY "Admins can view all feedback" ON public.user_feedback FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
DROP POLICY IF EXISTS "Admins can update feedback" ON public.user_feedback;
CREATE POLICY "Admins can update feedback" ON public.user_feedback FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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
