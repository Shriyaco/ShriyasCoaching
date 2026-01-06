import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const WhatsAppSupport: React.FC = () => {
  const phoneNumber = "919724111369";
  const message = encodeURIComponent("Hello, I need assistance regarding Shriya's Coaching Platform.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 1 
      }}
      className="fixed bottom-6 right-6 z-[9999] group"
    >
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-[#0A0A0A] border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap">
          Contact Faculty
        </div>
        <div className="w-2 h-2 bg-[#0A0A0A] border-r border-b border-white/10 rotate-45 mx-auto -mt-1 mr-6"></div>
      </div>

      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-black border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-hidden"
      >
        {/* Animated Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-premium-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* The Icon */}
        <MessageCircle 
          size={28} 
          className="text-white/80 group-hover:text-premium-accent transition-colors duration-300 relative z-10" 
          strokeWidth={1.5}
        />

        {/* Pulse Ring */}
        <div className="absolute inset-0 rounded-2xl border border-premium-accent/30 animate-ping opacity-20 pointer-events-none" />
      </motion.a>
    </motion.div>
  );
};

export default WhatsAppSupport;