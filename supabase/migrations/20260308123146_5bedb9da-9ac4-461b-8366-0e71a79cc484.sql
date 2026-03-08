
CREATE TABLE public.store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage store settings" ON public.store_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.store_settings (key, value) VALUES
  ('whatsapp', '+923106522033'),
  ('phone', '+923106522033'),
  ('email', 'jsmart.store@gmail.com'),
  ('address', 'Jinnah Super Market, Islamabad'),
  ('working_hours', 'Mon - Sat: 10:00 AM - 10:00 PM');
