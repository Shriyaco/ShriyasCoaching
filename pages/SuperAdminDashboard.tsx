
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Lock, Save, Globe, Code, Image as ImageIcon, Layout, Terminal, LogOut, Search, TrendingUp, FileText, Upload, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULTS: any = {
    home: {
        heroTitle1: 'Future',
        heroTitle2: 'Crafted here.',
        heroTagline: 'The Zenith of Learning',
        tickerText: 'ADMISSION OPENS FOR 2026-27. LIMITED SEATS AVAILABLE.',
        philHeading: 'Precision \n Mastery.',
        philDesc: "The most sophisticated coaching environment for primary years. Our collective experience and tailored methodology elevate education to a whole new level. We don't just teach; we sculpt intellects.",
        philImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000",
        seoTitle: "Shriya's Coaching | Excellence Redefined",
        seoDesc: "A high-performance educational platform for Grades 1st to 8th.",
        seoKeywords: "education, coaching, cbse, icse, state board, ahmedabad"
    },
    cbse: {
        heroTitle: 'CBSE Board',
        heroSubtitle: 'NCERT-aligned coaching for future academic leadership.',
        mainDesc: "Our CBSE program is meticulously structured around the NCERT framework, ensuring students don't just memorize but master the core concepts. We provide a bridge between regular schooling and competitive national standards.",
        quoteText: "Excellence is not an act, but a habit of continuous conceptual evolution.",
        seoTitle: 'CBSE Coaching',
        seoDesc: 'Top CBSE Coaching in Ahmedabad for grades 1-8.',
        seoKeywords: 'cbse, coaching, ahmedabad, ncert'
    },
    icse: {
        heroTitle: 'ICSE Curriculum',
        heroSubtitle: 'Comprehensive learning emphasizing English proficiency and subject depth.',
        approachHeading: 'Our Approach',
        approachDesc: "We don't believe in surface-level teaching. ICSE requires deep analytical involvement, and our pedagogy is designed to meet those rigorous standards while keeping students engaged.",
        seoTitle: 'ICSE Coaching',
        seoDesc: 'Specialized ICSE coaching focusing on English mastery and conceptual depth.',
        seoKeywords: 'icse, coaching, english literature, science, ahmedabad'
    },
    state: {
        heroTitle: 'State Boards',
        heroSubtitle: 'Dedicated coaching for Gujarat and Maharashtra students, aligned with NEP 2020.',
        seoTitle: 'State Board Coaching',
        seoDesc: 'GSEB and MSBSHSE coaching with focus on bridge courses and scholarship exams.',
        seoKeywords: 'gseb, msbshse, state board, gujarat board, maharashtra board'
    },
    'why-us': {
        heroTitle: 'Deep Integrity.',
        heroSubtitle: 'Combining ancient wisdom with the tech of tomorrow.',
        rootsTitle: 'Our Roots',
        rootsDesc: 'Building character and discipline alongside academic excellence. Every child receives 1-on-1 guidance during critical years.',
        quoteText: "To transform each student by providing a culture of excellence and human values.",
        seoTitle: 'Why Choose Us',
        seoDesc: 'Discover our Gurukul heritage combined with modern technology.',
        seoKeywords: 'gurukul, values, mentorship, technology, education'
    },
    vision: {
        heroTitle: 'Enlighten Future.',
        quoteText: "To be the learning center that bridges ancient wisdom with global excellence.",
        seoTitle: 'Our Vision',
        seoDesc: 'Empowering minds and fostering holistic growth.',
        seoKeywords: 'vision, mission, holistic growth, empowerment'
    },
    contact: {
        heroTitle: 'Connect.',
        heroSubtitle: 'Building foundations for future excellence through personal mentorship.',
        email: 'info@shriyasgurukul.in',
        phone: '+91 97241 11369',
        address: 'Bungalow no 19, Abhishek Bungalows, Hathijan Circle, Ahmedabad - 382445',
        seoTitle: 'Contact Us',
        seoDesc: 'Get in touch for admissions and enquiries.',
        seoKeywords: 'contact, address, phone, email, admission'
    },
    global_config: {
        gaMeasurementId: '',
        gscVerificationCode: ''
    }
};

export default function SuperAdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // CMS State
    const [activePage, setActivePage] = useState('global_config');
    const [content, setContent] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        const session = sessionStorage.getItem('superadmin_session');
        if (session === 'active') {
            setIsAuthenticated(true);
            loadPageContent('global_config');
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Pratik' && password === 'Reset@852') {
            sessionStorage.setItem('superadmin_session', 'active');
            setIsAuthenticated(true);
            loadPageContent('global_config');
        } else {
            setError('ACCESS DENIED: Invalid Credentials');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('superadmin_session');
        setIsAuthenticated(false);
        setUsername('');
        setPassword('');
    };

    const loadPageContent = async (page: string) => {
        setIsLoading(true);
        setActivePage(page);
        try {
            const data = await db.getPageContent(page);
            // Merge fetched data with defaults to ensure all fields are present
            const defaults = DEFAULTS[page] || {};
            setContent({ ...defaults, ...(data || {}) });
        } catch (e) {
            console.error(e);
            setContent(DEFAULTS[page] || {});
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setContent({ ...content, [field]: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const saveContent = async () => {
        setIsLoading(true);
        try {
            await db.updatePageContent(activePage, content);
            setNotification('SYSTEM UPDATE: Success');
            setTimeout(() => setNotification(''), 3000);
        } catch (e) {
            setNotification('SYSTEM ERROR: Write Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const NavButton = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => loadPageContent(id)}
            className={`w-full text-left px-4 py-3 rounded-lg text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activePage === id ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
            <Icon size={14} /> {label}
        </button>
    );

    const FormInput = ({ label, field, placeholder, type = "text" }: any) => (
        <div>
            <label className="block text-[10px] uppercase text-gray-500 mb-1 tracking-widest">{label}</label>
            {type === 'textarea' ? (
                <textarea 
                    value={content[field] || ''} 
                    onChange={e => setContent({...content, [field]: e.target.value})} 
                    placeholder={placeholder}
                    className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-green-500 text-white h-24 resize-none font-medium"
                />
            ) : (
                <input 
                    type={type}
                    value={content[field] || ''} 
                    onChange={e => setContent({...content, [field]: e.target.value})} 
                    placeholder={placeholder}
                    className="w-full bg-black border border-white/10 p-3 text-sm outline-none focus:border-green-500 text-white font-medium"
                />
            )}
        </div>
    );

    const SEOGroup = () => (
        <div className="p-6 border border-blue-500/20 rounded-xl bg-blue-500/5 mb-8">
            <h3 className="text-sm font-bold text-blue-400 uppercase mb-6 flex items-center gap-2"><Search size={16}/> Page SEO Settings</h3>
            <div className="space-y-4">
                <FormInput label="Meta Title" field="seoTitle" placeholder="Page Browser Title" />
                <FormInput label="Meta Description" field="seoDesc" placeholder="Description for Google Search results..." type="textarea" />
                <FormInput label="Keywords" field="seoKeywords" placeholder="comma, separated, keywords" />
            </div>
        </div>
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4">
                <div className="w-full max-w-md border border-green-500/30 p-8 rounded-lg bg-black relative overflow-hidden shadow-[0_0_50px_rgba(0,255,0,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />
                    <h1 className="text-2xl font-bold mb-8 tracking-widest flex items-center gap-3">
                        <Terminal size={24} /> ROOT ACCESS
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] opacity-70">Identity</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-black border border-green-500/30 p-3 outline-none focus:border-green-500 transition-colors text-white" autoFocus />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-[0.2em] opacity-70">Key</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-green-500/30 p-3 outline-none focus:border-green-500 transition-colors text-white" />
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>}
                        <button className="w-full bg-green-500/10 border border-green-500 text-green-500 py-3 hover:bg-green-500 hover:text-black transition-all font-bold uppercase tracking-widest">Initialize Session</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-black border-b md:border-r border-white/10 p-6 flex flex-col overflow-y-auto">
                <div className="mb-10 flex items-center gap-3 text-green-500">
                    <Code size={24} />
                    <span className="font-bold tracking-widest">DEV.CONSOLE</span>
                </div>
                
                <nav className="flex-1 space-y-2 pb-10">
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-4 tracking-widest">Global</p>
                    <NavButton id="global_config" label="SEO & Analytics" icon={Globe} />
                    
                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-4 mt-8 tracking-widest">Pages</p>
                    <NavButton id="home" label="Home Page" icon={Layout} />
                    <NavButton id="cbse" label="CBSE Board" icon={FileText} />
                    <NavButton id="icse" label="ICSE Board" icon={FileText} />
                    <NavButton id="state" label="State Board" icon={FileText} />
                    <NavButton id="why-us" label="Why Us" icon={FileText} />
                    <NavButton id="vision" label="Vision" icon={FileText} />
                    <NavButton id="contact" label="Contact Us" icon={FileText} />
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 text-xs uppercase tracking-widest text-red-500 hover:text-red-400">
                    <LogOut size={14} /> Terminate
                </button>
            </aside>

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Globe size={16} className="text-gray-500" />
                        <span className="text-sm font-bold uppercase text-gray-300">Editing: <span className="text-white">{activePage}</span></span>
                    </div>
                    {notification && <span className="text-xs font-bold text-green-400 animate-pulse">{notification}</span>}
                    <button onClick={saveContent} disabled={isLoading} className="flex items-center gap-2 bg-green-600 text-black px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-all">
                        {isLoading ? 'Processing...' : <><Save size={14} /> Commit Changes</>}
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    
                    {activePage === 'global_config' && (
                        <div className="max-w-3xl space-y-8">
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6 flex items-center gap-2"><TrendingUp size={16}/> Google Analytics (GA4)</h3>
                                <div className="space-y-4">
                                    <FormInput label="Measurement ID (G-XXXXXXXX)" field="gaMeasurementId" placeholder="G-ABC123456" />
                                    <p className="text-[10px] text-gray-500">The script will be automatically injected into the head of every page.</p>
                                </div>
                            </div>
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6 flex items-center gap-2"><Search size={16}/> Google Search Console</h3>
                                <div className="space-y-4">
                                    <FormInput label="Verification Code (Meta Tag Content)" field="gscVerificationCode" placeholder="Paste the content attribute string here" />
                                    <p className="text-[10px] text-gray-500">Example: If tag is &lt;meta name="google-site-verification" content="XYZ" /&gt;, paste <b>XYZ</b>.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'home' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Hero Section</h3>
                                <div className="space-y-4">
                                    <FormInput label="Main Heading 1" field="heroTitle1" />
                                    <FormInput label="Main Heading 2" field="heroTitle2" />
                                    <FormInput label="Tagline" field="heroTagline" />
                                    <FormInput label="Ticker Text" field="tickerText" />
                                </div>
                            </div>
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6 flex items-center gap-3"><ImageIcon size={18}/> Philosophy Section</h3>
                                <div className="space-y-6">
                                    <FormInput label="Heading" field="philHeading" />
                                    <FormInput label="Description" field="philDesc" type="textarea" />
                                    
                                    <div className="space-y-4 p-6 bg-black/40 rounded-2xl border border-white/5">
                                        <label className="block text-[10px] uppercase text-gray-500 mb-1 tracking-widest font-black">Section Imagery</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center relative hover:bg-white/10 transition-all cursor-pointer group">
                                                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'philImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                <Upload className="mx-auto text-green-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                <p className="text-[10px] font-bold uppercase text-gray-400">Upload from Gallery</p>
                                            </div>
                                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center relative hover:bg-white/10 transition-all cursor-pointer group">
                                                <input type="file" accept="image/*" capture="environment" onChange={e => handleImageUpload(e, 'philImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                <Camera className="mx-auto text-indigo-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                                                <p className="text-[10px] font-bold uppercase text-gray-400">Capture from Camera</p>
                                            </div>
                                        </div>
                                        <FormInput label="Manual Image URL" field="philImage" placeholder="https://..." />
                                        {content.philImage && (
                                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                                                <img src={content.philImage} className="w-full h-full object-cover opacity-60" />
                                                <button onClick={() => setContent({...content, philImage: ''})} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black transition-all"><X size={14}/></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'cbse' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Hero Heading" field="heroTitle" />
                                    <FormInput label="Hero Subtitle" field="heroSubtitle" />
                                    <FormInput label="Main Description" field="mainDesc" type="textarea" />
                                    <FormInput label="Quote Text" field="quoteText" type="textarea" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'icse' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Hero Heading" field="heroTitle" />
                                    <FormInput label="Hero Subtitle" field="heroSubtitle" />
                                    <FormInput label="Approach Heading" field="approachHeading" />
                                    <FormInput label="Approach Description" field="approachDesc" type="textarea" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'state' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Hero Heading" field="heroTitle" />
                                    <FormInput label="Hero Subtitle" field="heroSubtitle" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'why-us' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Page Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Main Heading" field="heroTitle" />
                                    <FormInput label="Sub Tagline" field="heroSubtitle" />
                                    <FormInput label="Roots Section Heading" field="rootsTitle" />
                                    <FormInput label="Roots Description" field="rootsDesc" type="textarea" />
                                    <FormInput label="Quote Text" field="quoteText" type="textarea" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'vision' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Page Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Main Heading" field="heroTitle" />
                                    <FormInput label="Quote Text" field="quoteText" type="textarea" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'contact' && (
                        <div className="max-w-3xl space-y-8">
                            <SEOGroup />
                            <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                                <h3 className="text-sm font-bold text-green-500 uppercase mb-6">Page Content</h3>
                                <div className="space-y-4">
                                    <FormInput label="Main Heading" field="heroTitle" />
                                    <FormInput label="Sub Heading" field="heroSubtitle" type="textarea" />
                                    <FormInput label="Email Address" field="email" />
                                    <FormInput label="Phone Number" field="phone" />
                                    <FormInput label="Physical Address" field="address" type="textarea" />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
