import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <nav className="sticky top-0 z-50 bg-[#945b3a]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="text-2xl font-serif tracking-[0.2em] font-medium uppercase text-white">
            SKINORA
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10 text-xs uppercase tracking-widest font-medium text-white/80">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#advantages" className="hover:text-white transition-colors">Features</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5 text-white/90">
            <button className="p-1.5 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-1.5 hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </button>
            <Link to="/checkout" className="relative p-1.5 hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#945b3a] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden text-white focus:outline-none ml-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[#834f31] border-b border-white/10 px-6 py-6 space-y-4 text-center text-xs uppercase tracking-widest text-white/90">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-1 hover:text-white">Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="block py-1 hover:text-white">Shop</Link>
          <a href="#about" onClick={() => setIsOpen(false)} className="block py-1 hover:text-white">About Us</a>
          <a href="#advantages" onClick={() => setIsOpen(false)} className="block py-1 hover:text-white">Features</a>
          <a href="#reviews" onClick={() => setIsOpen(false)} className="block py-1 hover:text-white">Reviews</a>
        </div>
      )}
    </nav>
  );
}