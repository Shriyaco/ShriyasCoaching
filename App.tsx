import React, { createContext, useContext, useEffect, useState, ErrorInfo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
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
import { AlertCircle } from 'lucide-react';

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
    // Log the error to console for production debugging
    console.error("FATAL ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617] text-slate-800 dark:text-white p-4 font-sans">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-6" />
            <h1 className="text-3xl font-black mb-4 font-[Poppins]">Something went wrong</h1>
            <p className="text-slate-500 dark:text-gray-400 mb-8 leading-relaxed">
              The application encountered an unexpected error. This usually happens due to a temporary connection glitch or a 3D rendering timeout.
            </p>
            {this.state.error && (
              <pre className="text-[10px] bg-red-50 dark:bg-red-950/20 p-4 rounded-xl mb-8 overflow-auto max-h-32 text-left border border-red-100 dark:border-red-900/30 text-red-400">
                {this.state.error.message}
              </pre>
            )}
            <button 
              onClick={() => {
                // Clear any potentially corrupted storage and reload
                try {
                  sessionStorage.removeItem('sc_user');
                } catch(e) {}
                window.location.href = '/';
              }} 
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
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

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <Navbar />
          <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div></div>}>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
