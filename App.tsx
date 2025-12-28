
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll, Float, Environment, Stars, MeshDistortMaterial, Sphere, useScroll, Html, ContactShadows, Sparkles, Torus, Octahedron, Box, Ring, Float as FloatDrei } from '@react-three/drei';
import * as THREE from 'three';
import { Github, Mail, Phone, MapPin, Moon, Sun, MessageSquare, Terminal, Code, ShieldCheck, Zap, Wand2, Sword, Target, Flame } from 'lucide-react';
import { RESUME_DATA } from './constants';
import { LiveAIAgent } from './components/LiveAIAgent';

// --- THEMED 3D COMPONENTS ---

const Omnitrix: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Float speed={3} rotationIntensity={2} floatIntensity={1}>
      <Torus args={[0.7, 0.2, 16, 100]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} wireframe />
      </Torus>
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial color="#111" metalness={1} roughness={0} />
      </Sphere>
      <Ring args={[0.45, 0.5, 4, 1]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={5} />
      </Ring>
    </Float>
    <Sparkles count={50} scale={2} size={2} color="#00ff00" />
  </group>
);

const GoldenSnitch: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wingRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    wingRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 20) * 0.5;
  });
  return (
    <group position={position}>
      <Float speed={5} floatIntensity={2}>
        <Sphere args={[0.2, 32, 32]}>
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} emissive="#ffd700" emissiveIntensity={0.5} />
        </Sphere>
        <group ref={wingRef}>
          <Box args={[1.5, 0.02, 0.3]} position={[0.8, 0, 0]} rotation={[0, -0.5, 0]}>
            <meshStandardMaterial color="#fff" transparent opacity={0.4} />
          </Box>
          <Box args={[1.5, 0.02, 0.3]} position={[-0.8, 0, 0]} rotation={[0, 0.5, 0]}>
            <meshStandardMaterial color="#fff" transparent opacity={0.4} />
          </Box>
        </group>
      </Float>
    </group>
  );
};

const CaptainShield: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position} rotation={[Math.PI / 2, 0, 0]}>
    <Float speed={2} rotationIntensity={1}>
      <Torus args={[0.8, 0.1, 16, 100]}>
        <meshStandardMaterial color="#b91c1c" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus args={[0.65, 0.1, 16, 100]}>
        <meshStandardMaterial color="#f3f4f6" metalness={0.8} roughness={0.2} />
      </Torus>
      <Torus args={[0.5, 0.1, 16, 100]}>
        <meshStandardMaterial color="#b91c1c" metalness={0.8} roughness={0.2} />
      </Torus>
      <Sphere args={[0.4, 32, 32]} scale={[1, 1, 0.2]}>
        <meshStandardMaterial color="#1d4ed8" metalness={0.8} roughness={0.2} />
      </Sphere>
      <Octahedron args={[0.2]} position={[0, 0, 0.1]}>
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} />
      </Octahedron>
    </Float>
  </group>
);

const ArcReactor: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Float speed={4} floatIntensity={0.5}>
      <Torus args={[0.6, 0.05, 16, 100]}>
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} />
      </Torus>
      <Ring args={[0.3, 0.5, 8]}>
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={1} transparent opacity={0.5} />
      </Ring>
      <Sphere args={[0.15, 32, 32]}>
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={5} />
      </Sphere>
    </Float>
    <Sparkles count={30} scale={1.5} size={3} color="#0ea5e9" />
  </group>
);

const SupermanCore: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Float speed={1.5} rotationIntensity={2}>
      <Octahedron args={[1]}>
        <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.1} />
      </Octahedron>
      <Ring args={[0.8, 1.1, 3, 1]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={2} />
      </Ring>
    </Float>
  </group>
);

const StrangerPortal: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Sphere args={[1.5, 64, 64]}>
      <MeshDistortMaterial color="#220000" speed={4} distort={0.7} emissive="#ff0000" emissiveIntensity={0.3} />
    </Sphere>
    <Sparkles count={100} scale={4} size={4} color="#ff0000" speed={2} />
  </group>
);

const PowerTotem: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => (
  <group position={position}>
    <Float speed={3} rotationIntensity={3}>
      <Box args={[0.6, 0.6, 0.6]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </Box>
      <Torus args={[0.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={color} transparent opacity={0.5} />
      </Torus>
    </Float>
  </group>
);

// --- SCENE & CAMERA ---

const MultiverseScene: React.FC = () => {
  const scroll = useScroll();
  const { camera } = useThree();
  const sceneRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const offset = scroll.offset; // 0 to 1
    
    // Smooth camera path through the multiverse
    camera.position.x = Math.sin(offset * Math.PI) * 4;
    camera.position.z = 8 + Math.cos(offset * Math.PI) * 2;
    camera.position.y = -offset * 30; // Move down as we scroll
    camera.lookAt(0, -offset * 30 - 2, 0);

    if (sceneRef.current) {
      sceneRef.current.rotation.y = offset * 0.2;
    }
  });

  return (
    <group ref={sceneRef}>
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={1} fade speed={1} />
      
      {/* Superman/Justice League Zone (Hero Section) */}
      <SupermanCore position={[0, 0, -2]} />
      <Sparkles count={100} scale={10} size={1} color="#ffffff" />
      
      {/* Ben 10 / Potter Zone (Expertise Section) */}
      <Omnitrix position={[-4, -7, -4]} />
      <GoldenSnitch position={[4, -10, -3]} />
      
      {/* Avengers Zone (Experience Section) */}
      <CaptainShield position={[-5, -18, -5]} />
      <ArcReactor position={[5, -22, -4]} />
      <Sphere args={[2, 32, 32]} position={[0, -25, -10]}>
        <meshStandardMaterial color="#166534" emissive="#166534" emissiveIntensity={0.2} wireframe />
      </Sphere>

      {/* Stranger Things Zone (Projects Section) */}
      <StrangerPortal position={[0, -35, -8]} />
      
      {/* Power Rangers Zone (Education/Contact Section) */}
      <group position={[0, -45, -5]}>
        <PowerTotem position={[-3, 0, 0]} color="#ef4444" />
        <PowerTotem position={[-1.5, 1, 0]} color="#3b82f6" />
        <PowerTotem position={[0, 2, 0]} color="#10b981" />
        <PowerTotem position={[1.5, 1, 0]} color="#f59e0b" />
        <PowerTotem position={[3, 0, 0]} color="#ec4899" />
      </group>
      
      <ContactShadows opacity={0.5} scale={30} blur={2} far={10} />
    </group>
  );
};

// --- UI COMPONENTS ---

const MultiverseSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = "", id }) => (
  <section id={id} className={`min-h-screen flex flex-col justify-center px-6 md:px-24 py-20 relative z-10 transition-all duration-700 ${className}`}>
    {children}
  </section>
);

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    fetch('https://api.github.com/users/codgamerofficial/repos?sort=updated&per_page=6')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setRepos(data))
      .catch(console.error);
  }, []);

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDarkMode ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 3D CANVAS LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas shadows camera={{ fov: 45 }}>
          <Suspense fallback={null}>
            <ScrollControls pages={7} damping={0.2}>
              <MultiverseScene />
              <Scroll html>
                <div className="w-screen pointer-events-auto">
                  
                  {/* HERO: Superman/Justice League Theme */}
                  <MultiverseSection className="items-start">
                    <div className="max-w-4xl space-y-6">
                      <div className="inline-block px-4 py-2 rounded-full bg-blue-600/20 border border-blue-500/50 backdrop-blur-md animate-pulse">
                        <span className="text-xs font-black tracking-[0.3em] uppercase text-blue-400">Guardian of the Code • Multiverse Resident</span>
                      </div>
                      <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tighter">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">SASWATA</span>
                        <span className="block opacity-40 ml-4 font-light italic">The Architect</span>
                      </h1>
                      <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                        Defending digital systems with <span className="text-white">Supersonic QA Automation</span> and navigating terrains with <span className="text-blue-500">GIS Spatial Intelligence</span>.
                      </p>
                      <div className="flex gap-4 pt-6">
                        <button className="px-10 py-5 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-110 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                          View Missions
                        </button>
                        <button className="px-10 py-5 border-2 border-white/10 hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest transition-all">
                          Contact Base
                        </button>
                      </div>
                    </div>
                  </MultiverseSection>

                  {/* EXPERTISE: Ben 10 / Potter Theme */}
                  <MultiverseSection id="skills" className="items-end text-right">
                    <div className="max-w-4xl space-y-12">
                      <div>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter flex items-center justify-end gap-6">
                          <Zap className="text-green-500" size={60} />
                          EXPERTISE
                        </h2>
                        <div className="h-1.5 w-48 bg-green-500 ml-auto mt-4"></div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        {[
                          { title: "Manual Mastery", icon: <Target />, color: "text-red-500", desc: "Surgical precision in defect detection and system analysis." },
                          { title: "Arcane Automation", icon: <Wand2 />, color: "text-yellow-500", desc: "Casting Selenium scripts to weave seamless test execution." },
                          { title: "Spatial Sorcery", icon: <MapPin />, color: "text-green-500", desc: "Transmuting GIS data into powerful 3D terrains." },
                          { title: "Omni-Intelligence", icon: <Zap />, color: "text-blue-500", desc: "Multi-modality problem solving across the SDLC." }
                        ].map((skill, i) => (
                          <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-green-500/50 backdrop-blur-xl transition-all group">
                            <div className={`${skill.color} mb-6 group-hover:scale-125 transition-transform inline-block`}>{skill.icon}</div>
                            <h3 className="text-2xl font-bold mb-3">{skill.title}</h3>
                            <p className="text-gray-500 text-sm">{skill.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </MultiverseSection>

                  {/* EXPERIENCE: Avengers Theme */}
                  <MultiverseSection>
                    <div className="max-w-5xl">
                      <h2 className="text-6xl md:text-8xl font-black mb-20 tracking-tighter flex items-center gap-6">
                        <Sword className="text-blue-500" />
                        TIMELINE
                      </h2>
                      <div className="space-y-32">
                        {RESUME_DATA.experience.map((exp, i) => (
                          <div key={i} className="relative pl-12 border-l-4 border-blue-600/30 group">
                            <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,1)] group-hover:scale-150 transition-all"></div>
                            <div className="mb-2 flex items-center gap-4">
                              <span className="text-blue-500 font-black tracking-widest text-sm bg-blue-500/10 px-3 py-1 rounded-lg uppercase">{exp.period}</span>
                              <h3 className="text-4xl font-black text-white group-hover:translate-x-4 transition-transform">{exp.company}</h3>
                            </div>
                            <h4 className="text-xl text-gray-400 font-bold mb-6">{exp.role}</h4>
                            <ul className="grid md:grid-cols-2 gap-4">
                              {exp.description.map((item, j) => (
                                <li key={j} className="text-gray-500 text-sm bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </MultiverseSection>

                  {/* PROJECTS: Stranger Things Theme */}
                  <MultiverseSection id="projects" className="bg-gradient-to-b from-transparent via-red-950/20 to-transparent">
                    <div className="max-w-6xl">
                      <div className="mb-16">
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">LABS</h2>
                        <p className="text-gray-500 mt-2 text-xl font-bold italic">Incidents from the Upside Down...</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        {repos.map((repo, i) => (
                          <a 
                            key={i} 
                            href={repo.html_url} 
                            target="_blank" 
                            className="group relative p-10 rounded-[2.5rem] bg-black border-2 border-red-900/30 hover:border-red-600 transition-all overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all"></div>
                            <h3 className="text-2xl font-black mb-4 group-hover:text-red-500 transition-colors uppercase">{repo.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-3 mb-8 h-12 leading-relaxed">{repo.description || "Experimental classified project files."}</p>
                            <div className="flex items-center justify-between text-xs font-black tracking-tighter text-gray-400">
                              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-600"></div> {repo.language || "Classified"}</span>
                              <span className="px-3 py-1 bg-white/5 rounded-md">★ {repo.stargazers_count}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  </MultiverseSection>

                  {/* CONTACT: Power Rangers / Final Theme */}
                  <MultiverseSection id="contact" className="items-center text-center">
                    <div className="max-w-4xl space-y-12">
                      <div className="space-y-4">
                        <Flame className="mx-auto text-orange-500" size={60} />
                        <h2 className="text-7xl md:text-9xl font-black tracking-tighter">CALL TO ARMS</h2>
                        <p className="text-2xl text-gray-500 font-medium italic">"The world needs heroes. The digital world needs QA."</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8 w-full">
                        <a href={`mailto:${RESUME_DATA.email}`} className="group p-10 rounded-[3rem] bg-blue-600 hover:bg-blue-700 transition-all hover:scale-105 shadow-2xl shadow-blue-500/20">
                          <Mail size={40} className="mb-6 mx-auto" />
                          <div className="text-3xl font-black uppercase">Beam Message</div>
                          <div className="text-blue-200 mt-2 font-medium">{RESUME_DATA.email}</div>
                        </a>
                        <a href={`tel:${RESUME_DATA.phone}`} className="group p-10 rounded-[3rem] bg-white text-black hover:scale-105 transition-all shadow-2xl">
                          <Phone size={40} className="mb-6 mx-auto" />
                          <div className="text-3xl font-black uppercase">Signal Trace</div>
                          <div className="text-gray-600 mt-2 font-medium">{RESUME_DATA.phone}</div>
                        </a>
                      </div>

                      <div className="pt-24 border-t border-white/10 w-full flex flex-col md:flex-row justify-between items-center gap-8">
                        <p className="text-xs font-black tracking-[0.5em] text-gray-700 uppercase">© 2025 Saswata Dey • Multiverse Edition</p>
                        <div className="flex gap-6">
                           <a href={RESUME_DATA.github} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all"><Github /></a>
                           <button onClick={() => setShowVoiceAgent(true)} className="p-4 bg-blue-600 rounded-2xl animate-bounce shadow-xl shadow-blue-500/40"><MessageSquare /></button>
                        </div>
                      </div>
                    </div>
                  </MultiverseSection>

                </div>
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* FIXED UI OVERLAYS */}
      <div className="fixed top-8 right-8 z-50 flex gap-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="fixed bottom-8 left-8 z-50 pointer-events-none">
        <div className="flex items-center gap-4 text-gray-500">
          <div className="w-1.5 h-16 bg-gradient-to-b from-blue-600 to-transparent rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-180 [writing-mode:vertical-lr]">Scroll to Voyage</span>
        </div>
      </div>

      <button 
        onClick={() => setShowVoiceAgent(true)}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-4 bg-white text-black px-8 py-5 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <div className="relative">
          <Zap size={24} className="fill-current" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></span>
        </div>
        <span className="font-black uppercase tracking-widest text-sm">Summon Jervice</span>
      </button>

      {showVoiceAgent && (
        <LiveAIAgent onClose={() => setShowVoiceAgent(false)} />
      )}

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default App;
