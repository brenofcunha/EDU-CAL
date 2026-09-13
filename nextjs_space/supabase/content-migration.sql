-- Execute uma vez no SQL Editor do Supabase para habilitar Markdown, fontes e anexos.

ALTER TABLE public.topics
  ADD COLUMN IF NOT EXISTS resources JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS resources JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS resources JSONB NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('content-assets', 'content-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Admins can upload content assets" ON storage.objects;
CREATE POLICY "Admins can upload content assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'content-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Content assets are publicly readable" ON storage.objects;
CREATE POLICY "Content assets are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'content-assets');

DROP POLICY IF EXISTS "Admins can delete content assets" ON storage.objects;
CREATE POLICY "Admins can delete content assets"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'content-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
