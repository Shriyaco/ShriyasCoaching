
// @ts-nocheck
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ArrowRight, User as UserIcon, Lock, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Sphere, Box, Cylinder, Torus, Cone, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const EducationScene = () => (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Icosahedron args={[1, 1]} position={[0, 0, 0]}><meshStandardMaterial color="#C5A059" metalness={0.8} roughness={0.2} /></Icosahedron>
        <Sphere args={[0.3, 32, 32]} position={[2, 1, -1]}><meshStandardMaterial color="#6366f1" /></Sphere>
      </Float>
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
);

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<'user' | 'pass' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const user = await db.login(username, password);
        if (user && user.role === 'admin') {
          sessionStorage.setItem('sc_user', JSON.stringify(user));
          navigate('/admin');
        } else {
          setError('Access Denied. Invalid Admin Credentials.');
        }
    } catch (err) {
        setError('Network connection error.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex overflow-hidden font-sans text-slate-900 dark:text-white relative transition-colors duration-300">
      <button onClick={() => navigate('/')} className="absolute top-6 right-6 z-50 p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all backdrop-blur-md"><X size={24} /></button>

      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-slate-100 dark:bg-[#020617] border-r border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 z-0 opacity-80">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <Suspense fallback={null}><EducationScene /></Suspense>
            </Canvas>
        </div>
        <div className="absolute bottom-12 left-12 right-12 bg-white/60 dark:bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg z-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-[Poppins]">Admin Terminal</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">System administration and infrastructure control.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white dark:bg-[#020617]">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md relative z-10">
              <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white font-[Poppins] tracking-tight">System Core</h1>
                  <p className="text-slate-500 mt-2 text-sm">Enter access keys for portal administration</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Identity</label>
                          <div className={`flex items-center bg-slate-50 dark:bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all ${focused === 'user' ? 'border-blue-500 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}>
                              <UserIcon size={20} className={focused === 'user' ? 'text-blue-500' : 'text-slate-400'} />
                              <input type="text" placeholder="Admin Username" className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-medium pl-3" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={() => setFocused('user')} onBlur={() => setFocused(null)} />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Key</label>
                          <div className={`flex items-center bg-slate-50 dark:bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all ${focused === 'pass' ? 'border-blue-500 dark:border-indigo-500' : 'border-slate-200 dark:border-slate-800'}`}>
                              <Lock size={20} className={focused === 'pass' ? 'text-blue-500' : 'text-slate-400'} />
                              <input type="password" placeholder="••••••••" className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-medium pl-3" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)} />
                          </div>
                      </div>
                      <AnimatePresence>
                          {error && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-500/20"><AlertCircle size={16} /> {error}</motion.div>
                          )}
                      </AnimatePresence>
                      <button type="submit" disabled={loading} className="w-full bg-blue-600 dark:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2">
                          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Initialize Access <ArrowRight size={20} /></>}
                      </button>
                  </form>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
