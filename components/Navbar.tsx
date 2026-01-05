import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/student') || location.pathname.startsWith('/teacher');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (isDashboard) return null;

  const menuStructure = [
    { name: 'Home', path: '/' },
    { 
      name: 'Boards', 
      submenu: [
        { name: 'CBSE', path: '/cbse' },
        { name: 'ICSE', path: '/icse' },
        { name: 'State Board', path: '/state-board' }
      ]
    },
    { 
      name: 'About Us', 
      submenu: [
        { name: 'Why Us', path: '/why-us' },
        { name: 'Vision', path: '/vision' }
      ]
    },
    { name: 'Connect', path: '/contact' }
  ];

  const menuVariants = {
    closed: { opacity: 0 },
    open: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 10 },
    open: { opacity: 1, y: 0 }
  };

  const toggleSubmenu = (name: string) => {
    setActiveSubmenu(activeSubmenu === name ? null : name);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-700 ease-in-out ${
          scrolled ? 'bg-black/90 backdrop-blur-lg py-3 md:py-4' : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Main Logo */}
          <Link to="/" className="relative z-[110]">
            <img 
              src="https://advedasolutions.in/sc.png" 
              alt="Shriya's Logo" 
              className={`transition-all duration-500 ${scrolled ? 'h-10 md:h-12' : 'h-14 md:h-16'}`}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-12">
            {menuStructure.map((item) => (
              <div key={item.name} className="relative group">
                {item.submenu ? (
                  <button className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-premium-accent transition-colors flex items-center gap-2">
                    {item.name} <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
                  </button>
                ) : (
                  <Link 
                    to={item.path!} 
                    className="text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-premium-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                )}

                {item.submenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                    <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-6 min-w-[200px] shadow-2xl flex flex-col space-y-4">
                      {item.submenu.map((sub) => (
                        <Link 
                          key={sub.name} 
                          to={sub.path} 
                          className="text-white/60 text-[9px] font-bold uppercase tracking-[0.3em] hover:text-premium-accent transition-colors block"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/login" className="border border-white/20 text-white px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              Log in
            </Link>
          </div>

          {/* Hamburger Trigger (Only visible when closed) */}
          <div className="lg:hidden relative z-[110]">
            {!isOpen && (
              <button onClick={() => setIsOpen(true)} className="p-2 focus:outline-none">
                <Menu size={32} strokeWidth={1} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] menu-bg-gradient flex flex-col h-[100dvh] overflow-hidden"
          >
            {/* High-Visibility Fixed Close Button */}
            <div className="absolute top-8 right-6 z-[250]">
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-[0_4px_0_#999,0_8px_15px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <X size={26} className="text-black" strokeWidth={3} />
              </button>
            </div>

            {/* Header Spacer */}
            <div className="h-28 shrink-0" />

            {/* Scrollable Content Area - Optimized Spacing */}
            <motion.div 
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex-1 overflow-y-auto px-8 md:px-12 flex flex-col space-y-4 pb-6"
            >
              {menuStructure.map((item) => (
                <motion.div key={item.name} variants={itemVariants} className="flex flex-col items-start text-left">
                  {item.submenu ? (
                    <>
                      <button 
                        onClick={() => toggleSubmenu(item.name)}
                        className={`text-4xl md:text-5xl serif-font font-light tracking-tight transition-all duration-300 flex items-center gap-3 ${activeSubmenu === item.name ? 'text-premium-accent' : 'text-white/90'}`}
                      >
                        {item.name} 
                        <ChevronDown size={20} className={`transition-transform duration-500 ${activeSubmenu === item.name ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeSubmenu === item.name && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col items-start mt-2 space-y-2 pl-6 border-l border-white/10"
                          >
                            {item.submenu.map((sub) => (
                              <Link 
                                key={sub.name} 
                                to={sub.path} 
                                onClick={() => setIsOpen(false)}
                                className="text-xl md:text-2xl serif-font text-white/40 hover:text-white transition-colors"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link 
                      to={item.path!} 
                      onClick={() => setIsOpen(false)}
                      className={`text-4xl md:text-5xl serif-font font-light tracking-tight transition-all duration-300 ${location.pathname === item.path ? 'text-premium-accent' : 'text-white/90'}`}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              
              {/* Stacked: Log in & Pay Fees (Tightized layout to reduce blank space) */}
              <motion.div variants={itemVariants} className="pt-4 flex flex-col items-start gap-3 border-t border-white/5">
                 <Link 
                   to="/login" 
                   onClick={() => setIsOpen(false)} 
                   className="text-white text-[14px] font-bold uppercase tracking-[0.4em] hover:text-premium-accent transition-colors"
                 >
                    Log in
                 </Link>
                 <div className="w-8 h-[1px] bg-white/10" />
                 <Link 
                   to="/pay-fees" 
                   onClick={() => setIsOpen(false)} 
                   className="text-premium-accent text-[14px] font-bold uppercase tracking-[0.4em] hover:brightness-125 transition-all"
                 >
                    Pay Fees
                 </Link>
              </motion.div>
            </motion.div>

            {/* Bottom Menu Footer (The user said this part is "perfect", just ensuring it's properly fixed at the bottom) */}
            <div className="shrink-0 py-4 border-t border-white/5 bg-black/40 backdrop-blur-xl px-8 md:px-12">
               <div className="flex items-center justify-between overflow-hidden">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-white/30 text-[8px] font-bold uppercase tracking-[0.15em]">Policy</span>
                    <span className="text-white/30 text-[8px] font-bold uppercase tracking-[0.15em]">T&C</span>
                  </div>
                  
                  <div className="flex items-center gap-2 whitespace-nowrap ml-4">
                    <span className="text-white/40 text-[8px] font-bold uppercase tracking-[0.15em]">Developed with ♥️ by</span>
                    <div className="bg-white/10 p-1 rounded-md backdrop-blur-md">
                      <img 
                        src="https://advedasolutions.in/logo.png" 
                        alt="Adveda Solutions" 
                        className="h-3.5 w-auto object-contain" 
                      />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;