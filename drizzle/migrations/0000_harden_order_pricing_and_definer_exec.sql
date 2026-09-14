-- 1. Orders: ignore client-supplied total; server recalculates from order_items
CREATE OR REPLACE FUNCTION public.enforce_order_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Force new orders to always start as 'pending'
  NEW.status := 'pending';

  -- Never trust a client-supplied total; it is recalculated by
  -- recalculate_order_total() from authoritative order_items prices.
  NEW.total := 0;

  RETURN NEW;
END;
$function$;

-- 2. Prevent users from tampering with totals/status on existing orders
CREATE OR REPLACE FUNCTION public.enforce_order_update_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    NEW.total := OLD.total;
    NEW.status := OLD.status;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_enforce_order_update_guard ON public.orders;
CREATE TRIGGER trg_enforce_order_update_guard
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_update_guard();

REVOKE ALL ON FUNCTION public.enforce_order_update_guard() FROM PUBLIC, anon, authenticated;