import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, CreditCard, LogIn, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/student') || location.pathname.startsWith('/teacher');
  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isDashboard) return null;

  const navLinks = [
    { 
      name: 'Boards', 
      path: '#about', 
      dropdown: ['ICSE', 'CBSE', 'State Board'] 
    },
    { 
      name: 'About Us', 
      path: '#about',
      dropdown: ['Why Us', 'Our Vision'] 
    },
    { name: 'Contact Us', path: '#contact' }
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled || isOpen
          ? 'bg-[#020617]/80 backdrop-blur-xl border-b border-[#00E5FF]/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-3'
          : 'bg-transparent py-6'
      } ${isLoginPage ? 'lg:hidden' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group relative">
            <div className="absolute inset-0 bg-[#00E5FF] blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full" />
            <img 
              src="https://advedasolutions.in/sc.png" 
              alt="Shriya's Coaching" 
              className="h-10 md:h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105" 
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div 
                key={link.name} 
                className="relative group"
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Link 
                  to={link.path} 
                  className="flex items-center text-gray-300 hover:text-white px-3 py-2 text-sm font-medium transition-colors font-[Poppins] relative overflow-hidden"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00E5FF] transition-all duration-300 group-hover:w-full box-border shadow-[0_0_10px_#00E5FF]" />
                  {link.dropdown && <ChevronDown size={14} className="ml-1 group-hover:rotate-180 transition-transform text-[#00E5FF]" />}
                </Link>
                
                {/* Dropdown */}
                {link.dropdown && (
                  <AnimatePresence>
                    {hoveredLink === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className="absolute top-full left-0 w-56 bg-[#0B1120]/95 backdrop-blur-xl border border-[#00E5FF]/20 rounded-xl shadow-[0_0_30px_rgba(0,229,255,0.1)] overflow-hidden pt-2 p-2 mt-2"
                      >
                        {link.dropdown.map((item) => (
                          <a 
                            key={item} 
                            href={link.path} 
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] rounded-lg transition-all"
                          >
                            {item}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/pay-fees" 
              className="px-5 py-2 rounded-full border border-[#00E5FF]/30 text-[#00E5FF] font-medium hover:bg-[#00E5FF]/10 transition-colors flex items-center space-x-2 text-sm hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]"
            >
              <CreditCard size={16} />
              <span>Pay Fees</span>
            </Link>
            <Link 
              to="/login" 
              className="relative px-6 py-2 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#0099cc] text-[#020617] font-bold text-sm shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all transform hover:-translate-y-0.5 flex items-center space-x-2 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <LogIn size={16} className="relative z-10" />
              <span className="relative z-10">Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#00E5FF] transition-colors p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#020617]/95 backdrop-blur-xl border-b border-[#00E5FF]/20 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-3 text-base font-medium text-white hover:text-[#00E5FF] border-b border-white/5"
                  >
                    {link.name}
                  </Link>
                  {link.dropdown && (
                    <div className="pl-6 space-y-1 mt-1 bg-white/5 rounded-lg my-1">
                      {link.dropdown.map(item => (
                         <div key={item} className="text-gray-400 text-sm py-2 px-3 border-b border-white/5 last:border-0">{item}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-6 flex flex-col space-y-4 px-2">
                <Link to="/pay-fees" onClick={() => setIsOpen(false)} className="w-full text-center py-3 border border-[#00E5FF] text-[#00E5FF] rounded-xl font-bold">Pay Fees</Link>
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 bg-[#00E5FF] text-[#020617] rounded-xl font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)]">Login</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;