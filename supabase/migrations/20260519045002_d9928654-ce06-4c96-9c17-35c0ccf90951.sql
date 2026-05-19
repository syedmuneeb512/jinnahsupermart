
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.images IS 'Array of image URLs for product gallery.';
COMMENT ON COLUMN public.products.variants IS 'Array of variant objects: { id, label, size, price, original_price, image, stock }';
