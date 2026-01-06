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
            ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md py-3 md:py-4 border-b border-black/5 dark:border-white/5' 
            : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="relative z-[110]">
            <img 
              src="https://advedasolutions.in/sc.png" 
              alt="Shriya's Logo" 
              className={`transition-all duration-500 ${scrolled || isLoginPage ? 'h-10 md:h-12' : 'h-14 md:h-16'}`}
              style={{ filter: theme === 'dark' ? 'none' : 'none' }}
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

          {/* Mobile Actions Header - Exact match to Screenshot 1 */}
          <div className="lg:hidden relative z-[110] flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-slate-600 dark:text-white/60 hover:text-premium-accent dark:hover:text-white transition-colors p-2"
            >
              {theme === 'dark' ? <Sun size={24} strokeWidth={2} /> : <Moon size={24} strokeWidth={2} />}
            </button>
            
            <Link 
              to="/login" 
              className="bg-white text-black px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl"
            >
              LOG IN
            </Link>

            <button 
              onClick={() => setIsOpen(true)} 
              className="p-2 focus:outline-none"
            >
              <Menu size={36} strokeWidth={1} className="text-slate-900 dark:text-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Exact match to Screenshot 2 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col h-[100dvh] overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)} 
              className="fixed top-8 right-6 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-2xl z-[11000]"
            >
              <X size={32} className="text-black" strokeWidth={3} />
            </button>

            <div className="h-24 shrink-0" />

            <motion.div 
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex-1 overflow-y-auto px-8 md:px-12 flex flex-col space-y-12 pb-24"
            >
              <motion.div variants={itemVariants}>
                <Link to="/" onClick={() => setIsOpen(false)} className="text-6xl serif-font text-premium-accent font-light italic">
                  Home
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col items-start gap-4">
                 <button 
                    onClick={() => toggleSubmenu('Boards')}
                    className="text-6xl serif-font text-white font-light flex items-center gap-4"
                  >
                    Boards <ChevronDown size={28} className={activeSubmenu === 'Boards' ? 'rotate-180' : ''} />
                  </button>
                  {activeSubmenu === 'Boards' && (
                    <div className="pl-6 flex flex-col gap-4">
                      <Link to="/cbse" onClick={() => setIsOpen(false)} className="text-3xl text-white/50 serif-font">CBSE</Link>
                      <Link to="/icse" onClick={() => setIsOpen(false)} className="text-3xl text-white/50 serif-font">ICSE</Link>
                      <Link to="/state-board" onClick={() => setIsOpen(false)} className="text-3xl text-white/50 serif-font">State Board</Link>
                    </div>
                  )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <button 
                  onClick={() => toggleSubmenu('About')}
                  className="text-6xl serif-font text-white font-light flex items-center gap-4"
                >
                  About Us <ChevronDown size={28} className={activeSubmenu === 'About' ? 'rotate-180' : ''} />
                </button>
                {activeSubmenu === 'About' && (
                  <div className="pl-6 flex flex-col gap-4">
                    <Link to="/why-us" onClick={() => setIsOpen(false)} className="text-3xl text-white/50 serif-font">Why Us</Link>
                    <Link to="/vision" onClick={() => setIsOpen(false)} className="text-3xl text-white/50 serif-font">Vision</Link>
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/contact" onClick={() => setIsOpen(false)} className="text-6xl serif-font text-white font-light">
                  Connect
                </Link>
              </motion.div>
              
              <div className="pt-12 flex flex-col gap-10">
                 <motion.div variants={itemVariants}>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-3xl font-black uppercase tracking-[0.3em] text-white">LOG IN</Link>
                 </motion.div>
                 <motion.div variants={itemVariants}>
                    <Link to="/pay-fees" onClick={() => setIsOpen(false)} className="text-3xl font-black uppercase tracking-[0.3em] text-premium-accent">PAY FEES</Link>
                 </motion.div>
              </div>
            </motion.div>

            {/* Menu Footer */}
            <div className="shrink-0 py-8 px-8 border-t border-white/10 flex items-center justify-between">
               <div className="flex gap-6">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">PRIVACY</span>
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">T&C</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">DEVELOPED BY</span>
                  <div className="bg-white/10 p-1 rounded">
                    <img src="https://advedasolutions.in/logo.png" className="h-4 w-auto dark:invert" />
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