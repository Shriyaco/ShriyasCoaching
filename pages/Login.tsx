import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck, Hexagon, Fingerprint, ScanEye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Icosahedron, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Security Scene Component ---
const LoginSecurityScene = () => {
  const outerRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (outerRef.current) {
        outerRef.current.rotation.x = t * 0.2;
        outerRef.current.rotation.y = t * 0.3;
    }
    if (innerRef.current) {
        innerRef.current.rotation.x = -t * 0.5;
        innerRef.current.rotation.z = Math.sin(t) * 0.5;
    }
    if (ringRef.current) {
        ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.2;
        ringRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Outer Tech Shell */}
        <Icosahedron ref={outerRef} args={[2.2, 0]}>
            <meshStandardMaterial 
                color="#00E5FF" 
                wireframe 
                transparent 
                opacity={0.15} 
                roughness={0} 
                metalness={1} 
            />
        </Icosahedron>

        {/* Orbiting Security Ring */}
        <Torus ref={ringRef} args={[3, 0.02, 16, 100]}>
             <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={2} toneMapped={false} />
        </Torus>

        {/* Inner Security Core */}
        <Icosahedron ref={innerRef} args={[1, 0]}>
             <MeshDistortMaterial
                color="#0f172a"
                emissive="#00E5FF"
                emissiveIntensity={0.8}
                distort={0.4}
                speed={2}
                roughness={0.2}
                metalness={1}
                wireframe={false}
             />
        </Icosahedron>
        
        {/* Holographic Label */}
        <Html position={[0, -2.5, 0]} center transform sprite>
            <div className="bg-black/50 backdrop-blur-md border border-cyan-500/30 px-3 py-1 rounded-full">
                <p className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/> System Secure
                </p>
            </div>
        </Html>
    </Float>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'user' | 'pass' | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const user = await db.login(username, password);
        if (user) {
          sessionStorage.setItem('sc_user', JSON.stringify(user));
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'student') navigate('/student');
          else if (user.role === 'teacher') navigate('/teacher');
          else navigate('/');
        } else {
          setError('Access Denied. Invalid Credentials.');
        }
    } catch (err) {
        setError('Connection Failure. Please retry.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden flex relative selection:bg-cyan-500 selection:text-black">
      
      {/* --- LEFT SIDE: 3D Visualization (Hidden on Mobile) --- */}
      <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-slate-900 to-[#0B1120] border-r border-white/5">
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
         <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         
         <Canvas camera={{ position: [0, 0, 6] }} className="z-10 relative">
             {/* @ts-ignore */}
            <ambientLight intensity={0.5} />
             {/* @ts-ignore */}
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#00E5FF" />
             {/* @ts-ignore */}
            <pointLight position={[-10, -5, -5]} intensity={1} color="#6366f1" />
            <LoginSecurityScene />
         </Canvas>
         
         {/* Industrial Overlay UI */}
         <div className="absolute top-10 left-10 z-20">
             <div className="flex items-center gap-3">
                 <Hexagon className="text-cyan-500 animate-spin-slow" size={32} strokeWidth={1.5} />
                 <div>
                     <h2 className="text-xl font-bold font-[Poppins] tracking-tight">Shriya's Coaching</h2>
                     <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Secure Portal v2.0</p>
                 </div>
             </div>
         </div>
         
         <div className="absolute bottom-10 left-10 z-20 max-w-sm">
             <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Authorized Personnel Only</h3>
             <p className="text-gray-500 text-sm leading-relaxed">
                 Access to Student Management System, Learning Resources, and Administrative Controls is restricted and monitored.
             </p>
         </div>
      </div>

      {/* --- RIGHT SIDE: Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          {/* Mobile Background Elements */}
          <div className="lg:hidden absolute inset-0 bg-[#020617]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
              <div className="mb-10 lg:hidden text-center">
                   <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 mb-4 shadow-lg shadow-cyan-500/10">
                       <Hexagon className="text-cyan-400" size={32} />
                   </div>
                   <h2 className="text-3xl font-bold font-[Poppins]">Welcome Back</h2>
                   <p className="text-gray-400 text-sm mt-2">Enter your credentials to continue</p>
              </div>

              {/* Card Container */}
              <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                  {/* Neon Glow Line Top */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                  
                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-500/10 rounded-tr-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-indigo-500/10 rounded-bl-3xl pointer-events-none" />

                  <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                      
                      {/* Username Field */}
                      <div className="space-y-2">
                          <label className={`text-xs font-bold tracking-widest uppercase transition-colors ${focusedField === 'user' ? 'text-cyan-400' : 'text-gray-500'}`}>
                              User Identification
                          </label>
                          <div className={`relative flex items-center bg-[#020617] border rounded-xl transition-all duration-300 ${focusedField === 'user' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-white/10'}`}>
                              <div className="pl-4 text-gray-400">
                                  <ScanEye size={20} className={`${focusedField === 'user' ? 'text-cyan-400' : ''} transition-colors`} />
                              </div>
                              <input 
                                  type="text"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  onFocus={() => setFocusedField('user')}
                                  onBlur={() => setFocusedField(null)}
                                  className="w-full bg-transparent text-white p-4 outline-none placeholder-gray-600 font-mono text-sm"
                                  placeholder="ENTER ID / USERNAME"
                                  autoComplete="off"
                              />
                              {username && <div className="pr-4 text-emerald-500"><ShieldCheck size={16} /></div>}
                          </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                          <label className={`text-xs font-bold tracking-widest uppercase transition-colors ${focusedField === 'pass' ? 'text-indigo-400' : 'text-gray-500'}`}>
                              Security Key
                          </label>
                          <div className={`relative flex items-center bg-[#020617] border rounded-xl transition-all duration-300 ${focusedField === 'pass' ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-white/10'}`}>
                              <div className="pl-4 text-gray-400">
                                  <Fingerprint size={20} className={`${focusedField === 'pass' ? 'text-indigo-400' : ''} transition-colors`} />
                              </div>
                              <input 
                                  type="password"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  onFocus={() => setFocusedField('pass')}
                                  onBlur={() => setFocusedField(null)}
                                  className="w-full bg-transparent text-white p-4 outline-none placeholder-gray-600 font-mono text-sm"
                                  placeholder="••••••••••••"
                              />
                          </div>
                      </div>

                      {/* Error Message */}
                      <AnimatePresence>
                          {error && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-mono flex items-center gap-2"
                              >
                                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                  {error}
                              </motion.div>
                          )}
                      </AnimatePresence>

                      {/* Submit Button */}
                      <button 
                          type="submit"
                          disabled={loading}
                          className="w-full relative group overflow-hidden bg-white text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-indigo-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wider text-sm">
                              {loading ? 'Authenticating...' : <>Initialize Session <ArrowRight size={18} /></>}
                          </span>
                      </button>

                      <div className="text-center pt-2">
                          <a href="#" className="text-xs text-gray-500 hover:text-cyan-400 transition-colors border-b border-transparent hover:border-cyan-400 pb-0.5">Forgot Credentials?</a>
                      </div>
                  </form>
              </div>

              <div className="mt-8 text-center text-gray-600 text-[10px] font-mono uppercase tracking-wider">
                  System Status: <span className="text-emerald-500">Operational</span> | Encrypted Connection
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;