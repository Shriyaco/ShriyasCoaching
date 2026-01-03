import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
        const user = db.login(username, password);
        if (user) {
          sessionStorage.setItem('sc_user', JSON.stringify(user));
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'student') navigate('/student');
          else if (user.role === 'teacher') navigate('/teacher');
          else navigate('/');
        } else {
          setError('Invalid credentials.');
          setLoading(false);
        }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      
      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, 90, 0],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1], 
          rotate: [0, -90, 0],
          x: [0, -50, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
             <Lock className="text-white" size={32} />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white mb-2 tracking-tight"
          >
            Welcome Back
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="text-gray-400 text-sm"
          >
            Enter your secure portal credentials
          </motion.p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Username / ID</label>
            <div className="relative group">
              <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-gray-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all shadow-inner"
                placeholder="Enter your ID"
                required
              />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-gray-700 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all shadow-inner"
                placeholder="Enter your password"
                required
              />
            </div>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-xl text-sm text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
          >
            {loading ? (
                <span>Verifying Access...</span>
            ) : (
                <>Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </motion.button>
        </form>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
            <p className="text-xs text-gray-500">
                Protected by secure enterprise encryption.
            </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;