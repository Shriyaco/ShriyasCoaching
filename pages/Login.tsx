// @ts-nocheck
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ArrowRight, User as UserIcon, Lock, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, Sphere, Box, Cylinder, Torus, Cone, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Educational Asset Components ---

const StylizedBook = ({ position, color, rotation }: { position: [number, number, number], color: string, rotation: [number, number, number] }) => {
  return (
    // @ts-ignore
    <group position={position} rotation={rotation}>
      {/* Cover */}
      <Box args={[1.5, 2, 0.3]} position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color={color} roughness={0.4} />
      </Box>
      {/* Pages */}
      <Box args={[1.4, 1.9, 0.25]} position={[0.05, 0, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </Box>
      {/* Spine Detail */}
      <Box args={[0.2, 1.9, 0.32]} position={[-0.7, 0, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color={new THREE.Color(color).multiplyScalar(0.8)} roughness={0.4} />
      </Box>
    </group>
  );
};

const StylizedPencil = ({ position, rotation }: { position: [number, number, number], rotation: [number, number, number] }) => {
  return (
    // @ts-ignore
    <group position={position} rotation={rotation}>
      {/* Body */}
      <Cylinder args={[0.15, 0.15, 2.5, 6]} position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#fbbf24" />
      </Cylinder>
      {/* Tip Wood */}
      <Cone args={[0.15, 0.4, 32]} position={[0, 1.45, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#fde68a" />
      </Cone>
      {/* Lead */}
      <Cone args={[0.05, 0.1, 32]} position={[0, 1.6, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#1e293b" />
      </Cone>
      {/* Eraser Metal */}
      <Cylinder args={[0.16, 0.16, 0.3, 32]} position={[0, -1.3, 0]}>
        {/* @ts-ignore */}
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Eraser */}
      <Cylinder args={[0.15, 0.15, 0.3, 32]} position={[0, -1.55, 0]}>
        {/* @ts-ignore */}
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
        // @ts-ignore
        <group position={position} ref={ref}>
            <Sphere args={[0.3, 32, 32]}>
                {/* @ts-ignore */}
                <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.5} />
            </Sphere>
            {/* @ts-ignore */}
            <group rotation={[Math.PI / 3, 0, 0]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    {/* @ts-ignore */}
                    <meshStandardMaterial color="#a5b4fc" />
                </Torus>
            </group>
             {/* @ts-ignore */}
             <group rotation={[-Math.PI / 3, 0, 0]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    {/* @ts-ignore */}
                    <meshStandardMaterial color="#a5b4fc" />
                </Torus>
            </group>
            {/* @ts-ignore */}
            <group rotation={[0, 0, Math.PI / 2]}>
                <Torus args={[1.2, 0.04, 16, 100]}>
                    {/* @ts-ignore */}
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
      {/* Soft warm lights */}
      {/* @ts-ignore */}
      <ambientLight intensity={0.7} />
      {/* @ts-ignore */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#fff" />
      {/* @ts-ignore */}
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />

      {/* Floating Objects */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <StylizedBook position={[-1.5, 0, 0]} color="#3b82f6" rotation={[0.2, 0.5, -0.1]} />
        <StylizedBook position={[1.2, -0.5, -1]} color="#ec4899" rotation={[-0.1, -0.4, 0.2]} />
        <StylizedBook position={[0, 1.5, -2]} color="#10b981" rotation={[0.5, 0, 0.2]} />
        
        <StylizedPencil position={[1.8, 1, 0]} rotation={[0, 0, -0.5]} />
        
        <Atom position={[-1.5, 1.8, -1]} />
        
        {/* Math Shapes */}
        <Icosahedron args={[0.4]} position={[2, -1.5, 0]}>
            {/* @ts-ignore */}
            <meshStandardMaterial color="#f59e0b" wireframe />
        </Icosahedron>
        
        <Torus args={[0.3, 0.1, 16, 32]} position={[-0.5, -2, 0]} rotation={[1, 1, 0]}>
            {/* @ts-ignore */}
            <meshStandardMaterial color="#8b5cf6" />
        </Torus>
      </Float>

      <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
    </>
  );
};

// --- Main Login Component ---

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
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex overflow-hidden font-sans text-white">
      
      {/* LEFT SIDE: 3D Animation */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center bg-[#020617] border-r border-white/5">
        <div className="absolute inset-0 z-0 opacity-80">
             <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <EducationScene />
             </Canvas>
        </div>
        
        {/* Overlay Text */}
        <div className="absolute bottom-12 left-12 right-12 bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg z-10">
            <h2 className="text-2xl font-bold text-white mb-2 font-[Poppins]">Empowering Young Minds</h2>
            <p className="text-slate-400 leading-relaxed">
                "Education is not the learning of facts, but the training of the mind to think." 
                <span className="block mt-2 text-sm font-bold text-indigo-400">- Albert Einstein</span>
            </p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative bg-[#020617]">
          
          {/* Mobile Background Blob */}
          <div className="lg:hidden absolute inset-0 overflow-hidden z-0">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-900/20 rounded-full blur-[80px] opacity-40" />
              <div className="absolute top-40 -left-20 w-60 h-60 bg-blue-900/20 rounded-full blur-[60px] opacity-40" />
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md relative z-10"
          >
              <div className="text-center mb-10">
                  <h1 className="text-4xl font-black text-white font-[Poppins] tracking-tight">Login</h1>
                  <p className="text-slate-500 mt-2 text-sm">Access your dashboard</p>
              </div>

              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 p-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                      
                      {/* Username */}
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 ml-1 uppercase tracking-wide">Student ID / Username</label>
                          <div className={`flex items-center bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'user' ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}>
                              <UserIcon size={20} className={`mr-3 ${focused === 'user' ? 'text-indigo-500' : 'text-slate-500'}`} />
                              <input 
                                type="text" 
                                placeholder="Enter ID"
                                className="w-full bg-transparent outline-none text-white font-medium placeholder-slate-600"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setFocused('user')}
                                onBlur={() => setFocused(null)}
                              />
                          </div>
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                          <div className="flex justify-between ml-1">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                          </div>
                          <div className={`flex items-center bg-slate-950/50 border-2 rounded-xl px-4 py-3 transition-all duration-300 ${focused === 'pass' ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-800 hover:border-slate-700'}`}>
                              <Lock size={20} className={`mr-3 ${focused === 'pass' ? 'text-indigo-500' : 'text-slate-500'}`} />
                              <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-transparent outline-none text-white font-medium placeholder-slate-600"
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
                                className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-500/20"
                              >
                                  <AlertCircle size={16} /> {error}
                              </motion.div>
                          )}
                      </AnimatePresence>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                              <>Sign In <ArrowRight size={20} /></>
                          )}
                      </button>

                      <div className="text-center">
                          <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors">Forgot Password?</a>
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