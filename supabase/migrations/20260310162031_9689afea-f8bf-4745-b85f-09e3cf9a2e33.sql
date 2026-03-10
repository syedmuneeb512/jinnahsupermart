
-- Fix 1: Profiles PII over-sharing - restrict SELECT to owner and admins
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Order status constraint - only valid statuses allowed
ALTER TABLE public.orders
  ADD CONSTRAINT orders_valid_status
  CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Fix 3: Force status to 'pending' on insert and validate total > 0
CREATE OR REPLACE FUNCTION public.enforce_order_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Force new orders to always start as 'pending'
  NEW.status := 'pending';
  
  -- Ensure total is positive
  IF NEW.total <= 0 THEN
    RAISE EXCEPTION 'Order total must be greater than zero';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_order_defaults
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_order_defaults();
