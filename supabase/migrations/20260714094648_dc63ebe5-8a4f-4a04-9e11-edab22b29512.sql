
-- Server-side price validation for order_items
CREATE OR REPLACE FUNCTION public.enforce_order_item_price()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_price numeric;
  discount_type text;
  discount_value numeric;
  final_price numeric;
BEGIN
  SELECT p.price INTO base_price FROM public.products p WHERE p.id = NEW.product_id;
  IF base_price IS NULL THEN
    RAISE EXCEPTION 'Invalid product_id %', NEW.product_id;
  END IF;

  -- Check for active flash sale on this product
  SELECT fsi.discount_type, fsi.discount_value
    INTO discount_type, discount_value
  FROM public.flash_sale_items fsi
  JOIN public.flash_sales fs ON fs.id = fsi.flash_sale_id
  WHERE fsi.product_id = NEW.product_id
    AND fs.is_active = true
    AND (fs.start_time IS NULL OR fs.start_time <= now())
    AND (fs.end_time IS NULL OR fs.end_time >= now())
  ORDER BY fs.start_time DESC NULLS LAST
  LIMIT 1;

  IF discount_type IS NULL THEN
    final_price := base_price;
  ELSIF discount_type = 'percentage' THEN
    final_price := GREATEST(0, base_price - (base_price * discount_value / 100));
  ELSE
    final_price := GREATEST(0, base_price - discount_value);
  END IF;

  -- Ignore client-submitted price; always use authoritative server price
  NEW.price := final_price;

  IF NEW.quantity IS NULL OR NEW.quantity <= 0 THEN
    RAISE EXCEPTION 'Order item quantity must be greater than zero';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_order_item_price ON public.order_items;
CREATE TRIGGER trg_enforce_order_item_price
BEFORE INSERT OR UPDATE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_item_price();

-- Recalculate the parent order total after order_items changes
CREATE OR REPLACE FUNCTION public.recalculate_order_total()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order uuid;
  subtotal numeric;
  delivery numeric;
BEGIN
  target_order := COALESCE(NEW.order_id, OLD.order_id);

  SELECT COALESCE(SUM(price * quantity), 0)
    INTO subtotal
  FROM public.order_items
  WHERE order_id = target_order;

  IF subtotal > 0 AND subtotal < 2000 THEN
    delivery := 35;
  ELSE
    delivery := 0;
  END IF;

  UPDATE public.orders
     SET total = subtotal + delivery
   WHERE id = target_order;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_order_total ON public.order_items;
CREATE TRIGGER trg_recalculate_order_total
AFTER INSERT OR UPDATE OR DELETE ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.recalculate_order_total();
