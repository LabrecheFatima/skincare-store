import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { mockProducts } from '../mock/products';
import { 
  ArrowRight, 
  ArrowLeft,
  ChevronDown, 
  Star,
  Sparkles,
  ShieldCheck,
  Heart,
  Clock
} from 'lucide-react';
import { useState } from 'react';

const fadeInUp = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

export default function Home() {
  const [activeAccordion, setActiveAccordion] = useState(0);

  const accordionItems = [
    { title: "Carefully Selected Ingredients", content: "Formulated with high-potency botanical extracts and clinical active ingredients designed for maximum skin barrier hydration." },
    { title: "Visible & Fast Results", content: "Noticeable smoothing and radiance restoration within the first two weeks of daily application." },
    { title: "Cruelty-Free & Sustainable", content: "100% cruelty-free formulation packaged in recyclable materials." },
    { title: "Dermatologist Approved", content: "Tested and recommended by certified skin care experts for daily sensitive skin care." }
  ];

  const blogPosts = [
    {
      title: "Essential Skincare Tips For Cold Weather Protection",
      category: "Skin Care",
      image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "How To Choose The Right Serum For Your Skin Type",
      category: "Beauty Secrets",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Daily Morning Skincare Rituals For Radiant Glowing Skin",
      category: "Routine",
      image: "https://images.unsplash.com/photo-1512290900676-26c279c09c31?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="bg-[#fcf8f5] text-skinora-dark font-sans selection:bg-skinora-accent selection:text-white">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-[#945b3a] text-white pt-8 sm:pt-10 pb-16 sm:pb-20 lg:py-20 overflow-hidden">
        {/* Background "SKINORA" Watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.08]">
          <span className="text-[22vw] font-serif font-black tracking-widest text-white leading-none">
            SKINORA
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column Content */}
            <motion.div 
              className="lg:col-span-6 space-y-5 sm:space-y-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Top Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 sm:px-4 py-1.5 rounded-full border border-white/20 text-[10px] sm:text-xs tracking-wider uppercase font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Elevate Your Routine</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 variants={fadeInUp} className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.08] font-normal">
                Elevate Your <br />
                <span className="italic font-light">Skincare Routine</span>
              </motion.h1>

              {/* Pill Callout & Ratings */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <Link 
                  to="/shop" 
                  className="bg-white text-[#945b3a] font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs uppercase tracking-wider hover:bg-white/90 transition-all shadow-md"
                >
                  Shop Now
                </Link>
                <Link 
                  to="/shop" 
                  className="border border-white/40 text-white font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
                >
                  Explore Collection
                </Link>
              </motion.div>

              {/* Customer Avatar Social Proof */}
              <motion.div variants={fadeInUp} className="flex items-center space-x-4 pt-4 border-t border-white/15">
                <div className="flex -space-x-2">
                  <img className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border-2 border-[#945b3a] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop" alt="User" />
                  <img className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border-2 border-[#945b3a] object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop" alt="User" />
                  <img className="w-8 sm:w-9 h-8 sm:h-9 rounded-full border-2 border-[#945b3a] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="User" />
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-amber-300 text-xs">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[11px] text-white/80 mt-0.5">
                    Over 10,000+ Happy Customers WorldWide
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column Image (Updated & Responsive) */}
            <motion.div 
              className="lg:col-span-6 relative flex justify-center w-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/15 bg-white/5">
                <img 
                  src="../assets/image.png" 
                  alt="Skinphy Skincare Hero Model" 
                  className="w-full h-[300px] xs:h-[360px] sm:h-[440px] md:h-[500px] lg:h-[560px] object-cover object-top transition-all duration-300"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= OUR BEST SELLERS ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-skinora-dark font-normal">
              Our <span className="italic font-light">Best Sellers</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-9 h-9 rounded-full border border-skinora-dark/20 flex items-center justify-center hover:bg-skinora-dark hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-[#945b3a] text-white flex items-center justify-center hover:bg-[#7e4b2d] transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {mockProducts.map((product) => {
            const price = product.promo_price ?? product.original_price;
            return (
              <motion.div key={product.id} variants={fadeInUp} className="group relative bg-[#f9f6f1] rounded-2xl p-4 transition-all duration-300 hover:shadow-lg border border-[#eee5dc] flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square rounded-xl bg-[#f0e8e0] overflow-hidden mb-4">
                    <span className="absolute top-3 left-3 bg-white/90 text-skinora-dark text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Best Seller
                    </span>
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Link 
                      to={`/product/${product.slug}`}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-skinora-dark text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      +
                    </Link>
                  </div>
                  <h3 className="font-serif text-base font-medium text-skinora-dark line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-skinora-muted line-clamp-2 mb-3">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#e8ded4]">
                  <span className="font-semibold text-sm text-skinora-dark">{price} DA</span>
                  <Link 
                    to={`/product/${product.slug}`}
                    className="text-xs font-medium text-[#945b3a] hover:underline uppercase tracking-wider"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ================= ABOUT / MISSION BANNER ================= */}
      <section className="bg-[#ede2d8] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="about">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="font-serif text-2xl sm:text-4xl text-skinora-dark leading-relaxed font-normal">
            We <span className="italic font-light">believe</span> skincare should be simple, safe, and effective. Our mission is to create high-quality products that nourish.
          </p>
        </div>

        {/* Rotated Center Card Accent Visual */}
        <div className="mt-10 flex justify-center">
          <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 border-4 border-white">
            <img 
              src="https://images.unsplash.com/photo-1512290900676-26c279c09c31?auto=format&fit=crop&w=600&q=80" 
              alt="Natural Skincare Mission" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none opacity-[0.05]">
          <span className="text-[20vw] font-serif font-black tracking-widest text-skinora-dark">
            SKINORA
          </span>
        </div>
      </section>

      {/* ================= OUR KEY ADVANTAGES ================= */}
      <section className="py-20 bg-white" id="advantages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl text-skinora-dark font-normal">
              Our <span className="italic font-light">Key Advantages</span>
            </h2>
            <p className="text-xs text-skinora-muted mt-2">
              Discover why thousands trust our specialized cold-weather skincare formulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#fbf8f5] border border-[#f0e8e0] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#945b3a]/10 text-[#945b3a] flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-skinora-dark">Eco-Friendly</h3>
              <p className="text-xs text-skinora-muted leading-relaxed">
                Sustainably sourced ingredients packaged with 100% recyclable materials.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#fbf8f5] border border-[#f0e8e0] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#945b3a]/10 text-[#945b3a] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-skinora-dark">100% Organic</h3>
              <p className="text-xs text-skinora-muted leading-relaxed">
                Free from parabens, sulfates, and harsh synthetic preservatives.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#fbf8f5] border border-[#f0e8e0] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#945b3a]/10 text-[#945b3a] flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-medium text-skinora-dark">Fast Acting</h3>
              <p className="text-xs text-skinora-muted leading-relaxed">
                Deep hydration barrier formulas designed for quick visible absorption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TIME TO UPGRADE ACCORDION ================= */}
      <section className="bg-[#945b3a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80" 
                  alt="Upgrade Your Skincare" 
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>

            {/* Right Accordion */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-serif text-4xl sm:text-5xl font-normal leading-tight">
                It's Time to Upgrade <br />
                <span className="italic font-light">Your Skincare</span>
              </h2>
              <p className="text-xs text-white/80 leading-relaxed max-w-md">
                Experience tailored skincare solutions crafted to restore moisture and protect your skin against cold weather elements.
              </p>

              <div className="space-y-3 pt-2">
                {accordionItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="border-b border-white/20 pb-4 transition-all"
                  >
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                      className="w-full text-left flex justify-between items-center font-serif text-lg py-2 font-medium"
                    >
                      <span>{item.title}</span>
                      <ChevronDown className={`w-5 h-5 text-white/70 transition-transform duration-300 ${activeAccordion === idx ? 'rotate-180' : ''}`} />
                    </button>
                    {activeAccordion === idx && (
                      <p className="text-xs text-white/80 mt-2 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL / REVIEWS ================= */}
      <section className="py-20 bg-[#f9f6f1]" id="reviews">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center text-amber-500 mb-6 space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>

          <blockquote className="font-serif text-2xl sm:text-4xl text-skinora-dark leading-snug font-normal mb-8">
            “My skin feels <span className="italic font-light">incredibly soft</span> and hydrated after just a few days. I can actually see the glow coming back.”
          </blockquote>

          <div className="flex items-center justify-center space-x-4">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop" 
              alt="Sara Jahan" 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="text-left">
              <h4 className="font-serif text-base font-semibold text-skinora-dark">Sara Jahan</h4>
              <p className="text-[11px] text-skinora-muted">Verified Buyer</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLOG TIPS & TRENDS ================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-skinora-dark font-normal">
            Skin Care <span className="italic font-light">Tips & Trends</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <div key={idx} className="group cursor-pointer">
              <div className="rounded-2xl overflow-hidden mb-4 bg-[#f0e8e0] aspect-[4/3]">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#945b3a] font-semibold block mb-1">
                {post.category}
              </span>
              <h3 className="font-serif text-lg font-medium text-skinora-dark group-hover:text-[#945b3a] transition-colors leading-snug">
                {post.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#945b3a] text-white pt-16 pb-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/15 text-xs text-white/80">
            <div className="space-y-3">
              <h3 className="font-serif text-xl text-white font-medium tracking-widest uppercase">SKINORA</h3>
              <p className="text-white/70 leading-relaxed">
                Elevating your daily skincare routine with rich organic formulations.
              </p>
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/shop" className="hover:text-white">Shop All</Link></li>
                <li><a href="#about" className="hover:text-white">Our Story</a></li>
                <li><a href="#reviews" className="hover:text-white">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium mb-3">Customer Care</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif text-sm text-white font-medium mb-3">Newsletter</h4>
              <p className="text-white/70 mb-3">Subscribe to get special offers and daily skincare tips.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-white/10 text-white placeholder-white/50 px-3 py-2 text-xs rounded-l-lg focus:outline-none w-full border border-white/20"
                />
                <button className="bg-white text-[#945b3a] px-4 rounded-r-lg font-medium uppercase text-[10px] tracking-wider">
                  Join
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-white/60">
            <p>© 2026 SKINORA. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Large Footer Watermark */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none opacity-[0.06] select-none">
          <span className="text-[18vw] font-serif font-black tracking-widest text-white leading-none">
            SKINORA
          </span>
        </div>
      </footer>

    </div>
  );
}