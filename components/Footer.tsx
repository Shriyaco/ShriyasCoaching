
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-premium-black text-premium-muted py-32 px-8 border-t border-white/5">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
          
          <div className="lg:col-span-1">
             <div className="flex items-center gap-4 mb-10">
                <img src="https://advedasolutions.in/sc.png" alt="Shriya's" className="h-12 w-auto invert brightness-0" />
                <span className="text-white text-2xl font-black uppercase tracking-tighter">Shriya's</span>
             </div>
             <p className="text-xs font-black uppercase tracking-[0.3em] leading-loose max-w-xs">
               Excellence in Primary and Middle school education. Redefining academic standards through surgical precision in coaching.
             </p>
          </div>

          <div>
             <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-12">Academic Tracks</h4>
             <ul className="space-y-6 text-[10px] font-black uppercase tracking-[0.3em]">
               <li><Link to="/cbse" className="hover:text-white transition-colors">CBSE Program</Link></li>
               <li><Link to="/icse" className="hover:text-white transition-colors">ICSE Program</Link></li>
               <li><Link to="/state-board" className="hover:text-white transition-colors">State Board Program</Link></li>
               <li><Link to="/vision" className="hover:text-white transition-colors">NEP Integration</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-12">Institutional</h4>
             <ul className="space-y-6 text-[10px] font-black uppercase tracking-[0.3em]">
               <li><Link to="/why-us" className="hover:text-white transition-colors">The Philosophy</Link></li>
               <li><Link to="/vision" className="hover:text-white transition-colors">Our Vision</Link></li>
               <li><Link to="/login" className="hover:text-white transition-colors">Faculty Portal</Link></li>
               <li><Link to="/pay-fees" className="hover:text-white transition-colors">Financial Hub</Link></li>
             </ul>
          </div>

          <div>
             <h4 className="text-white font-black text-[10px] uppercase tracking-[0.5em] mb-12">Connect</h4>
             <ul className="space-y-6 text-[10px] font-black uppercase tracking-[0.3em]">
               <li className="flex items-start gap-4">
                 <MapPin size={16} className="text-premium-accent shrink-0" />
                 <span className="leading-relaxed">Ahmedabad, Gujarat - 382445</span>
               </li>
               <li className="flex items-center gap-4">
                 <Phone size={16} className="text-premium-accent" />
                 <span>+91 97241 11369</span>
               </li>
               <li className="flex items-center gap-4">
                 <Mail size={16} className="text-premium-accent" />
                 <span>info@shriyasgurukul.in</span>
               </li>
             </ul>
          </div>

        </div>

        <div className="mt-40 pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex space-x-12">
              <a href="#" className="text-white hover:text-premium-accent transition-colors"><Instagram size={20} strokeWidth={1} /></a>
              <a href="#" className="text-white hover:text-premium-accent transition-colors"><Twitter size={20} strokeWidth={1} /></a>
              <a href="#" className="text-white hover:text-premium-accent transition-colors"><Facebook size={20} strokeWidth={1} /></a>
           </div>

           <p className="text-[9px] font-black uppercase tracking-[0.6em]">&copy; 2024 Shriya's Academic Group. All Rights Reserved.</p>

           <a href="https://www.advedasolutions.in" target="_blank" rel="noreferrer" className="flex items-center gap-3 group opacity-50 hover:opacity-100 transition-opacity">
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Propelled by</span>
              <img src="https://advedasolutions.in/logo.png" alt="Adveda" className="h-4 w-auto grayscale brightness-200" />
           </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
