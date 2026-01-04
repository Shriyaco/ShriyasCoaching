
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, CreditCard, LogIn, Sun, Moon, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTheme } from '../App';
import { db } from '../services/db';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  // Badge State
  const [pendingPaymentCount, setPendingPaymentCount] = useState(0);
  
  const { theme, toggleTheme } = useTheme();
  
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/student') || location.pathname.startsWith('/teacher');
  const isLoginPage = location.pathname === '/login';

  // Check for student login and updates
  useEffect(() => {
    const checkBadge = async () => {
        const storedUser = sessionStorage.getItem('sc_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === 'student') {
                const orders = await db.getOrders(user.id);
                // Fix: changed 'Awaiting Payment' to 'Payment Pending' to match Order status type
                const count = orders.filter(o => o.status === 'Payment Pending').length;
                setPendingPaymentCount(count);
            }
        } else {
            setPendingPaymentCount(0);
        }
    };

    checkBadge();
    // Re-check periodically or on specific events
    const interval = setInterval(checkBadge, 10000);
    return () => clearInterval(interval);
  }, [location.pathname]); // Re-check when route changes

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

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
      path: '/#about', 
      dropdown: ['ICSE', 'CBSE', 'State Board'] 
    },
    { 
      name: 'About Us', 
      path: '/#about',
      dropdown: ['Why Us', 'Our Vision'] 
    },
    { name: 'Contact Us', path: '/contact' }
  ];

  // --- Animation Variants ---

  const menuContainerVariants: Variants = {
    closed: {
      opacity: 0,
      x: "100%", 
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: "afterChildren",
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.4
      }
    }
  };

  const menuItemVariants: Variants = {
    closed: {
      x: 50,
      opacity: 0,
      rotateX: -20,
      transition: { duration: 0.3 }
    },
    open: {
      x: 0,
      opacity: 1,
      rotateX: 0,
      transition: { duration: 0.5, type: "spring", stiffness: 100 }
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? 'bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-slate-200 dark:border-[#00E5FF]/20 shadow-lg py-3'
          : 'bg-transparent py-6'
      } ${isLoginPage ? 'lg:hidden' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative z-50">
            <div className="relative z-10 bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.4)] border border-[#00E5FF]/30 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="https://advedasolutions.in/sc.png" 
                  alt="Shriya's Coaching" 
                  className="h-8 md:h-12 w-auto object-contain" 
                />
            </div>
            <span className="font-bold text-lg md:text-xl text-slate-800 dark:text-white hidden sm:block font-[Poppins]">Shriya's</span>
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
                  className="flex items-center text-slate-700 dark:text-gray-300 hover:text-black dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors font-[Poppins] relative overflow-hidden"
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
                        className="absolute top-full left-0 w-56 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border border-slate-200 dark:border-[#00E5FF]/20 rounded-xl shadow-xl dark:shadow-[0_0_30px_rgba(0,229,255,0.1)] overflow-hidden pt-2 p-2 mt-2"
                      >
                        {link.dropdown.map((item) => (
                          <a 
                            key={item} 
                            href={link.path} 
                            className="block px-4 py-3 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-[#00E5FF]/10 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] rounded-lg transition-all"
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
            
            {/* Shop Link with Badge */}
            <Link 
                to="/shop"
                className="flex items-center text-slate-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 px-3 py-2 text-sm font-medium transition-colors font-[Poppins] relative"
            >
                <ShoppingBag size={18} className="mr-1"/> Shop
                {pendingPaymentCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold animate-pulse">
                        {pendingPaymentCount}
                    </span>
                )}
            </Link>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-300 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

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

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center gap-3 z-50">
             <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-300 hover:text-[#00E5FF] transition-colors"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`text-slate-700 dark:text-white hover:text-[#00E5FF] transition-colors p-2 rounded-full ${isOpen ? 'bg-slate-100 dark:bg-white/10 text-red-500' : ''}`}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- 3D Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="mobile-menu"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuContainerVariants}
            className="md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-2xl flex flex-col pt-24 px-6 h-screen overflow-y-auto"
            style={{ perspective: "1000px" }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF] rounded-full filter blur-[100px] opacity-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full filter blur-[80px] opacity-10 pointer-events-none" />

            <div className="flex flex-col space-y-2 pb-10">
              {navLinks.map((link, idx) => (
                <motion.div 
                  key={link.name} 
                  variants={menuItemVariants}
                >
                  <Link 
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between py-4 text-2xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/5 hover:text-[#00E5FF] transition-colors font-[Poppins]"
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00E5FF]"/>
                  </Link>
                  
                  {/* Nested Links */}
                  {link.dropdown && (
                    <div className="pl-4 mt-2 space-y-3 mb-4 border-l-2 border-slate-100 dark:border-white/10 ml-2">
                      {link.dropdown.map((item, subIdx) => (
                         <Link
                            key={item}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="block text-slate-500 dark:text-gray-400 text-lg hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors"
                         >
                           {item}
                         </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}

              <motion.div variants={menuItemVariants}>
                  <Link 
                    to="/shop"
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between py-4 text-2xl font-bold text-purple-600 dark:text-purple-400 border-b border-slate-100 dark:border-white/5 hover:text-[#00E5FF] transition-colors font-[Poppins]"
                  >
                    <span className="flex items-center gap-2">
                         <ShoppingBag size={24}/> Shop
                         {pendingPaymentCount > 0 && (
                            <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                                {pendingPaymentCount}
                            </span>
                        )}
                    </span>
                    <ArrowRight size={20} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#00E5FF]"/>
                  </Link>
              </motion.div>

              <motion.div variants={menuItemVariants} className="pt-8 space-y-4">
                 <Link 
                    to="/pay-fees" 
                    onClick={() => setIsOpen(false)} 
                    className="w-full flex items-center justify-center gap-3 py-4 border border-[#00E5FF] text-[#00E5FF] rounded-2xl font-bold text-lg hover:bg-[#00E5FF]/5 transition-colors"
                 >
                    <CreditCard size={20} /> Pay Fees
                 </Link>
                 
                 <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)} 
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#00E5FF] to-cyan-600 text-[#020617] rounded-2xl font-bold text-lg shadow-lg hover:shadow-[#00E5FF]/20"
                 >
                    <LogIn size={20} /> Login Portal
                 </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
