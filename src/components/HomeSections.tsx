import { ArrowRight, Headphones, PackageCheck, ShoppingBasket, ShoppingBag, SlidersHorizontal, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import essentialsImage from "@/assets/home-essentials.jpg";

interface HomeSectionsProps {
  products: { id: string; name: string; price: number; image: string | null; stock: number }[];
}

const features = [
  { icon: ShoppingBasket, title: "Everyday essentials", description: "Your grocery list, all in one place." },
  { icon: SlidersHorizontal, title: "More choice", description: "Find the size or variant that suits you." },
  { icon: Truck, title: "Home delivery", description: "From our store to your doorstep." },
  { icon: Headphones, title: "Here to help", description: "Get in touch with our store team." },
];

const faqs = [
  { question: "How do I place an order?", answer: "Choose your products, add them to your cart, and continue to checkout. Enter your delivery details and review your order before placing it." },
  { question: "Can I choose a different size or colour?", answer: "For products with options, open the product page and select an available size, colour or variant. The picture and price reflect your selection." },
  { question: "Where can I see my orders?", answer: "Open your Profile and select My Orders to view your orders and their latest status." },
  { question: "How can I contact the store?", answer: "Visit our Contact page for the store's current contact details and available ways to reach our team." },
];

const HomeSections = ({ products }: HomeSectionsProps) => {
  const featuredProducts = products.filter(product => product.stock > 0 && product.image).slice(0, 2);

  return (
    <div className="mt-5">
      <section aria-labelledby="essentials-heading" className="border-t border-border bg-card px-4 py-7">
        <p className="text-xs font-semibold uppercase text-primary">A little more for your everyday</p>
        <h2 id="essentials-heading" className="mt-2 text-2xl font-bold text-foreground">Your everyday essentials</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Stock the kitchen. Fill the pantry. Find your next favourite.</p>
        <img src={essentialsImage} alt="A basket of vegetables, fruit, milk, rice and lentils" loading="lazy" width={1024} height={768} className="mt-5 aspect-[4/3] w-full rounded-lg object-cover" />
        <Button asChild className="mt-4 w-full">
          <Link to="/categories">Explore products <ArrowRight /></Link>
        </Button>

        {featuredProducts.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-foreground">From our shelves</h3>
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="group min-w-0 rounded-lg border border-border p-3 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <img src={product.image ?? ""} alt={product.name} loading="lazy" width={160} height={160} className="aspect-square w-full object-contain transition-transform motion-safe:group-hover:scale-105" />
                  <h4 className="mt-3 break-words text-sm font-semibold leading-snug text-foreground">{product.name}</h4>
                  <p className="mt-1 text-xs font-bold text-primary">PKR {product.price.toLocaleString()}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">View product <ArrowRight size={13} /></span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="features-heading" className="border-t border-border px-4 py-7">
        <p className="text-xs font-semibold uppercase text-primary">Click · Select · Deliver</p>
        <h2 id="features-heading" className="mt-2 text-xl font-bold text-foreground">Shopping, made simple</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="min-w-0">
              <Icon size={25} strokeWidth={1.6} className="mb-3 text-primary" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t border-border bg-card px-4 py-7">
        <div className="flex items-center gap-2 text-primary"><PackageCheck size={18} /><p className="text-xs font-semibold uppercase">Good to know</p></div>
        <h2 id="faq-heading" className="mt-2 text-xl font-bold text-foreground">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map(({ question, answer }, index) => (
            <AccordionItem value={`faq-${index}`} key={question}>
              <AccordionTrigger className="gap-3 text-left text-sm font-semibold">{question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <Button asChild variant="link" className="mt-3 h-auto px-0">
          <Link to="/contact">Still have a question? <ArrowRight /></Link>
        </Button>
      </section>

      <footer className="bg-primary-dark px-4 py-7 text-primary-foreground">
        <Link to="/home" className="inline-flex items-center gap-2 text-base font-bold"><ShoppingBag size={22} />JINNAH SUPER MART</Link>
        <p className="mt-2 text-xs text-primary-foreground/80">Click · Select · Deliver</p>
        <nav aria-label="Footer" className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {[{ to: "/home", label: "Home" }, { to: "/categories", label: "Products" }, { to: "/cart", label: "My cart" }, { to: "/profile", label: "My account" }, { to: "/contact", label: "Contact us" }].map(link => (
            <Link key={link.to} to={link.to} className="w-fit text-primary-foreground/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-lighter">{link.label}</Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-primary-foreground/20 pt-4 text-xs text-primary-foreground/70">© {new Date().getFullYear()} Jinnah Super Mart</div>
      </footer>
    </div>
  );
};

export default HomeSections;