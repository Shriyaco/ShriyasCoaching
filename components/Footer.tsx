
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020617] text-gray-400 py-16 border-t border-white/5 relative overflow-hidden transition-colors duration-300">
      {/* Top Glowing Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent shadow-[0_0_20px_#00E5FF]" />
      
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-gray-900 to-black p-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.2)] border border-white/10">
              <img src="https://advedasolutions.in/sc.png" alt="Shriya's Coaching" className="h-14 w-auto object-contain" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed max-w-sm text-gray-500">
            The premier destination for primary and middle school education (Grade 1-8). We build the leaders of tomorrow with a strong academic foundation.
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest text-[#00E5FF]">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Home</Link></li>
            <li><Link to="/why-us" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> About Us</Link></li>
            <li><Link to="/vision" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Vision & Mission</Link></li>
            <li><Link to="/login" className="hover:text-[#00E5FF] transition-colors flex items-center gap-2"><ChevronRight size={12}/> Portal Login</Link></li>
          </ul>
        </div>
        <div id="contact">
          <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest text-[#00E5FF]">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3 group">
              <div className="mt-1 text-gray-500 group-hover:text-[#00E5FF] transition-colors"><MapPin size={16}/></div>
              <span>Bungalow no 19, Abhishek Bungalows,<br/>Behind Aman Indian Colony,<br/>Hathijan Circle, Ahmedabad - 382445</span>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="text-gray-500 group-hover:text-[#00E5FF] transition-colors"><Phone size={16}/></div>
              <span className="cursor-pointer hover:text-[#00E5FF] transition-colors">+91 97241 11369</span>
            </li>
            <li className="flex items-center gap-3 group">
              <div className="text-gray-500 group-hover:text-[#00E5FF] transition-colors"><Mail size={16}/></div>
              <span className="cursor-pointer hover:text-[#00E5FF] transition-colors">info@shriyasgurukul.in</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-center text-gray-600">&copy; 2023 Shriya's Coaching. All rights reserved.</p>
        
        <a 
          href="https://www.advedasolutions.in" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-all cursor-pointer group bg-gradient-to-r from-white/5 to-white/10 px-5 py-2.5 rounded-full border border-white/10 hover:border-[#00E5FF]/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-0.5"
        >
          <span className="text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white font-semibold transition-colors">Powered by</span>
          <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-6 w-auto grayscale group-hover:grayscale-0 transition-all" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
