import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../App';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
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
          scrolled || isLoginPage
            ? 'bg-white/90 dark:bg-black/90 backdrop-blur-lg py-3 md:py-4 border-b border-black/5 dark:border-white/5' 
            : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="relative z-[110]">
            <img 
              src="https://advedasolutions.in/sc.png" 
              alt="Shriya's Logo" 
              className={`transition-all duration-500 ${scrolled || isLoginPage ? 'h-10 md:h-12' : 'h-14 md:h-16'}`}
              style={{ filter: theme === 'dark' ? 'invert(1)' : 'invert(0) brightness(0)' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {menuStructure.map((item) => (
              <div key={item.name} className="relative group">
                {item.submenu ? (
                  <button className="text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-premium-accent transition-colors flex items-center gap-2">
                    {item.name} <ChevronDown size={10} className="group-hover:rotate-180 transition-transform" />
                  </button>
                ) : (
                  <Link 
                    to={item.path!} 
                    className="text-slate-900 dark:text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:text-premium-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                )}

                {item.submenu && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
                    <div className="bg-white dark:bg-black/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 min-w-[200px] shadow-2xl flex flex-col space-y-4">
                      {item.submenu.map((sub) => (
                        <Link 
                          key={sub.name} 
                          to={sub.path} 
                          className="text-slate-600 dark:text-white/60 text-[9px] font-bold uppercase tracking-[0.3em] hover:text-premium-accent transition-colors block"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div className="flex items-center gap-6 pl-6 border-l border-slate-200 dark:border-white/10">
              <button 
                onClick={toggleTheme}
                className="text-slate-400 dark:text-white/40 hover:text-premium-accent dark:hover:text-white transition-colors p-2"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
              </button>
              
              <Link to="/login" className="border border-slate-900 dark:border-white/20 text-slate-900 dark:text-white px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                Log in
              </Link>
            </div>
          </div>

          {/* Mobile Actions Header - Exactly as per screenshot */}
          <div className="lg:hidden relative z-[110] flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className="text-slate-600 dark:text-white/60 hover:text-premium-accent dark:hover:text-white transition-colors p-2"
            >
              {theme === 'dark' ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>
            
            <Link 
              to="/login" 
              className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center min-w-[80px]"
            >
              Log in
            </Link>

            {isLoginPage ? (
              <Link 
                to="/" 
                className="w-11 h-11 rounded-full bg-slate-900/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              >
                <X size={24} strokeWidth={2} className="text-slate-900 dark:text-white" />
              </Link>
            ) : (
              <button 
                onClick={() => setIsOpen(true)} 
                className="p-2 focus:outline-none ml-1"
              >
                <Menu size={32} strokeWidth={1} className="text-slate-900 dark:text-white" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-black flex flex-col h-[100dvh] overflow-hidden"
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="fixed top-8 right-6 w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-xl active:translate-y-[2px] transition-all z-[300]"
            >
              <X size={26} className="text-white dark:text-black" strokeWidth={3} />
            </button>

            <div className="h-24 shrink-0" />

            <motion.div 
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex-1 overflow-y-auto px-8 md:px-12 flex flex-col space-y-6 pb-12"
            >
              {menuStructure.map((item) => (
                <motion.div key={item.name} variants={itemVariants} className="flex flex-col items-start">
                  {item.submenu ? (
                    <>
                      <button 
                        onClick={() => toggleSubmenu(item.name)}
                        className={`text-4xl md:text-5xl serif-font font-light tracking-tight flex items-center gap-3 transition-colors ${activeSubmenu === item.name ? 'text-premium-accent' : 'text-slate-900 dark:text-white/90'}`}
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
                            className="overflow-hidden flex flex-col items-start mt-4 space-y-3 pl-6 border-l border-slate-200 dark:border-white/10"
                          >
                            {item.submenu.map((sub) => (
                              <Link 
                                key={sub.name} 
                                to={sub.path} 
                                onClick={() => setIsOpen(false)}
                                className="text-xl md:text-2xl serif-font text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                      className={`text-4xl md:text-5xl serif-font font-light tracking-tight transition-colors ${location.pathname === item.path ? 'text-premium-accent' : 'text-slate-900 dark:text-white/90'}`}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              
              <motion.div variants={itemVariants} className="pt-8 flex flex-col items-start gap-6 border-t border-slate-100 dark:border-white/5">
                 <Link 
                   to="/login" 
                   onClick={() => setIsOpen(false)} 
                   className="text-slate-900 dark:text-white text-[14px] font-black uppercase tracking-[0.4em] hover:text-premium-accent transition-colors"
                 >
                    Account Portal
                 </Link>
                 <Link 
                   to="/pay-fees" 
                   onClick={() => setIsOpen(false)} 
                   className="text-premium-accent text-[14px] font-black uppercase tracking-[0.4em] hover:brightness-125 transition-all"
                 >
                    Financial Hub
                 </Link>
              </motion.div>
            </motion.div>

            <div className="shrink-0 py-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/40 px-8 md:px-12">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 dark:text-white/30 text-[8px] font-bold uppercase tracking-[0.15em]">Privacy</span>
                    <span className="text-slate-400 dark:text-white/30 text-[8px] font-bold uppercase tracking-[0.15em]">Terms</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-white/40 text-[8px] font-bold uppercase tracking-[0.15em]">Designed by</span>
                    <div className="bg-slate-200 dark:bg-white/10 p-1 rounded-md ml-1">
                      <img 
                        src="https://advedasolutions.in/logo.png" 
                        alt="Adveda Solutions" 
                        className="h-3 w-auto object-contain dark:invert" 
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