
// @ts-nocheck
import React, { useState, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ArrowRight, User as UserIcon, Lock, BookOpen, Sparkles, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Sphere, Box, Cylinder, Torus, Cone, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../App';

// --- 3D Educational Asset Components ---

const StylizedBook = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      <Box args={[1.5, 2, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      <Box args={[1.4, 1.9, 0.25]} position={[0.05, 0, 0]}>
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </Box>
      <Box args={[0.2, 1.9, 0.32]} position={[-0.7, 0, 0]}>
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} roughness={0.4} />
      </Box>
    </group>
  );
};

const StylizedPencil = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    <group position={position} rotation={rotation}>
      <Cylinder args={[0.15, 0.15, 2.5, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#fbbf24" />
      </Cylinder>
      <Cone args={[0.15, 0.4, 32]} position={[0, 1.45, 0]}>
        <meshStandardMaterial color="#fde68a" />
      </Cone>
      <Cone args={[0.05, 0.1, 32]} position={[0, 1.6, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cone>
      <Cylinder args={[0.16, 0.16, 0.3, 32]} position={[0, -1.3, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.15, 0.15, 0.3, 32]} position={[0, -1.55, 0]}>
        <meshStandardMaterial color="#f472b6" />
      </Cylinder>
    </group>
  );
};

const Atom = ({ position }: { position: [number, number, number] }) => {
    const ref = useRef<THREE.Group>(null!);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if(ref.current) {
            ref.current.rotation.y = t * 0.2;
            ref.current.rotation.z = t * 0.1;
        }
    });

    return (
        <group position={position} ref={ref}>
            <Sphere args={[0.3, 32, 32]}>
                <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.5} />
            </Sphere>
            <group rotation={[Math.PI / 3, 0, 0]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    <meshStandardMaterial color="#a5b4fc" />
                </Torus>
            </group>
             <group rotation={[-Math.PI / 3, 0, 0]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    <meshStandardMaterial color="#a5b4fc" />
                </Torus>
            </group>
            <group rotation={[0, 0, Math.PI / 2]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    <meshStandardMaterial color="#a5b4fc" />
                </Torus>
            </group>
        </group>
    )
}

const EducationScene = () => {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <StylizedBook position={[-1.5, 0, 0]} color="#3b82f6" rotation={[0.2, 0.5, -0.1]} />
        <StylizedBook position={[1.2, -0.5, -1]} color="#ec4899" rotation={[-0.1, -0.4, 0.2]} />
        <StylizedBook position={[0, 1.5, -2]} color="#10b981" rotation={[0.5, 0, 0.2]} />
        <StylizedPencil position={[1.8, 1, 0]} rotation={[0, 0, -0.5]} />
        <Atom position={[-1.5, 1.8, -1]} />
        <Icosahedron args={[0.4]} position={[2, -1.5, 0]}>
            <meshStandardMaterial color="#f59e0b" wireframe />
        </Icosahedron>
        <Torus args={[0.3, 0.1, 16, 32]} position={[-0.5, -2, 0]} rotation={[1, 1, 0]}>
            <meshStandardMaterial color="#8b5cf6" />
        </Torus>
      </Float>
      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

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
        if (user) {
          sessionStorage.setItem('sc_user', JSON.stringify(user));
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'student') navigate('/student');
          else if (user.role === 'teacher') navigate('/teacher');
          else navigate('/');
        } else {
          setError('Invalid ID or Password. Please try again.');
        }
    } catch (err) {
        setError('Network error. Check connection.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex overflow-hidden font-sans text-slate-900 dark:text-white relative transition-colors duration-300">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 z-50 p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-full text-slate-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-all backdrop-blur-md"
      >
        <X size={24} />
      </button>

      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-slate-100 dark:bg-[#020617] border-r border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 z-0 opacity-80">
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <Suspense fallback={null}>
                    <EducationScene />
                </Suspense>
             </Canvas>
        </div>
        <div className="absolute bottom-12 left-12 right-12 bg-white/60 dark:bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg z-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-[Poppins]">Empowering Young Minds</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                "Education is not the learning of facts, but the training of the mind to think." 
                <span className="block mt-2 text-sm font-bold text-blue-600 dark:text-indigo-400">- Albert Einstein</span>
            </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-white dark:bg-[#020617]">
          <div className="lg:hidden absolute inset-0 overflow-hidden z-0">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-[80px] opacity-40" />
              <div className="absolute top-40 -left-20 w-60 h-60 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-[60px] opacity-40" />
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md relative z-10"
          >
              <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white font-[Poppins] tracking-tight">Login</h1>
                  <p className="text-slate-500 mt-2 text-sm">Access your dashboard</p>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 dark:border-white/10 p-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wide">Student ID / Username</label>
                          <div className={`flex items-center bg-slate-50 dark:bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'user' ? 'border-blue-500 dark:border-indigo-500 shadow-lg ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                              <UserIcon size={20} className={`mr-3 ${focused === 'user' ? 'text-blue-500 dark:text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                              <input 
                                type="text" 
                                placeholder="Enter ID"
                                className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocused('user')}
                                onBlur={() => setFocused(null)}
                              />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <div className="flex justify-between ml-1">
                             <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                          </div>
                          <div className={`flex items-center bg-slate-50 dark:bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'pass' ? 'border-blue-500 dark:border-indigo-500 shadow-lg ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                              <Lock size={20} className={`mr-3 ${focused === 'pass' ? 'text-blue-500 dark:text-indigo-500' : 'text-slate-400 dark:text-slate-500'}`} />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-transparent outline-none text-slate-800 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-600"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocused('pass')}
                                onBlur={() => setFocused(null)}
                              />
                          </div>
                      </div>
                      <AnimatePresence>
                          {error && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-200 dark:border-red-500/20"
                              >
                                  <AlertCircle size={16} /> {error}
                              </motion.div>
                          )}
                      </AnimatePresence>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 dark:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 dark:hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                              <>Sign In <ArrowRight size={20} /></>
                          )}
                      </button>
                      <div className="text-center">
                          <a href="#" className="text-sm font-medium text-slate-500 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors">Forgot Password?</a>
                      </div>
                  </form>
              </div>
              <div className="mt-8 flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Powered by</span>
                  <img src="https://advedasolutions.in/logo.png" alt="Adveda Solutions" className="h-6 w-auto" />
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
