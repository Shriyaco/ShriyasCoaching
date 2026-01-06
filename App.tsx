
import React, { createContext, useContext, useEffect, useState, ErrorInfo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppSupport from './components/WhatsAppSupport';
import CustomCursor from './components/CustomCursor';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Login from './pages/Login';
import PayFees from './pages/PayFees';
import ContactUs from './pages/ContactUs';
import Shop from './pages/Shop';
import CBSEBoard from './pages/CBSEBoard';
import ICSEBoard from './pages/ICSEBoard';
import StateBoard from './pages/StateBoard';
import WhyUs from './pages/WhyUs';
import Vision from './pages/Vision';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { AlertCircle } from 'lucide-react';
import { db } from './services/db';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("FATAL ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
    if (error.message.includes('WebGL')) {
      console.warn("Detected WebGL crash. Attempting component-level recovery...");
    }
  }

  render() {
    if (this.state.hasError) {
      const isWebGL = this.state.error?.message.includes('WebGL');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4 font-sans">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto text-[#C5A059] mb-6" />
            <h1 className="text-3xl font-black mb-4 font-[Poppins] uppercase">System Notice</h1>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {isWebGL 
                ? "The high-performance 3D engine encountered a limitation on this device. We recommend refreshing or using a modern browser."
                : "The application encountered an unexpected error."}
            </p>
            <button 
              onClick={() => {
                window.location.reload();
              }} 
              className="px-8 py-4 bg-[#C5A059] text-black rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
            >
              Refresh Experience
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="block w-full mt-4 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Theme Context ---
export const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }: { children?: React.ReactNode }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// --- Global Scripts Loader ---
const GlobalScripts = () => {
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const config = await db.getPageContent('global_config');
        if (config) {
          // Google Analytics
          if (config.gaMeasurementId) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${config.gaMeasurementId}`;
            document.head.appendChild(script);

            const script2 = document.createElement('script');
            script2.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.gaMeasurementId}');
            `;
            document.head.appendChild(script2);
          }

          // Google Search Console Verification
          if (config.gscVerificationCode) {
            let meta = document.querySelector("meta[name='google-site-verification']");
            if (!meta) {
              meta = document.createElement('meta');
              meta.setAttribute('name', 'google-site-verification');
              document.head.appendChild(meta);
            }
            meta.setAttribute('content', config.gscVerificationCode);
          }
        }
      } catch (e) {
        console.error("Failed to load global config", e);
      }
    };
    loadScripts();
  }, []);
  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <GlobalScripts />
          <CustomCursor />
          <Navbar />
          <WhatsAppSupport />
          <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A059]"></div></div>}>
            <Routes>
              <Route path="/" element={<PublicHome />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/pay-fees" element={<PayFees />} />
              <Route path="/why-us" element={<WhyUs />} />
              <Route path="/vision" element={<Vision />} />
              <Route path="/cbse" element={<CBSEBoard />} />
              <Route path="/icse" element={<ICSEBoard />} />
              <Route path="/state-board" element={<StateBoard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/pratikmanage" element={<SuperAdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
