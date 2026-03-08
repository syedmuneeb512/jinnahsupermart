
-- Create mart-gallery storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('mart-gallery', 'mart-gallery', true);

-- Allow anyone to view mart gallery images
CREATE POLICY "Anyone can view mart gallery" ON storage.objects FOR SELECT USING (bucket_id = 'mart-gallery');

-- Only admins can upload/delete mart gallery images
CREATE POLICY "Admins can upload mart gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mart-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete mart gallery" ON storage.objects FOR DELETE USING (bucket_id = 'mart-gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update mart gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'mart-gallery' AND public.has_role(auth.uid(), 'admin'));
