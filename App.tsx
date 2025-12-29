
import React, { useState, useEffect, Suspense, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  SafeAreaView, 
  StatusBar,
  Animated,
  TextInput,
  Linking
} from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Stars, MeshDistortMaterial, Sphere, Html, Sparkles, Torus, Octahedron, Box, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Github, 
  Mail, 
  Zap, 
  Wand2, 
  Target, 
  Flame, 
  Scan, 
  ExternalLink,
  MessageSquare,
  User,
  LayoutGrid,
  MapPin,
  Music,
  Search,
  X,
  Play
} from 'lucide-react';
import { RESUME_DATA } from './constants';
import { LiveAIAgent } from './components/LiveAIAgent';

const { width, height } = Dimensions.get('window');

// --- 3D MOBILE COMPONENTS ---

const SonicCore: React.FC<{ position: [number, number, number], active: boolean }> = ({ position, active }) => {
  const meshRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time * 0.8) * 0.2;
      meshRef.current.rotation.y += active ? 0.05 : 0.01;
      meshRef.current.scale.setScalar(active ? 1.2 + Math.sin(time * 10) * 0.05 : 1);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Float speed={4} rotationIntensity={active ? 5 : 1} floatIntensity={1}>
        <Sphere args={[0.6, 64, 64]}>
          <meshStandardMaterial 
            color={active ? "#a855f7" : "#3b82f6"} 
            emissive={active ? "#a855f7" : "#3b82f6"} 
            emissiveIntensity={active ? 10 : 2} 
            wireframe 
          />
        </Sphere>
        <Torus args={[1, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#fff" transparent opacity={0.3} />
        </Torus>
      </Float>
      <Sparkles count={active ? 100 : 20} scale={3} size={active ? 4 : 2} color={active ? "#a855f7" : "#ffffff"} />
    </group>
  );
};

const ProfileHologram: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.15;
      meshRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Box args={[2.5, 3.5, 0.1]} position={[0, 0, -0.1]}>
          <meshStandardMaterial color="#000" metalness={1} roughness={0} />
        </Box>
        <Torus args={[2.2, 0.005, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={5} transparent opacity={0.2} />
        </Torus>
        <Html transform distanceFactor={5.5} position={[0, 0, 0.05]}>
          <View style={styles.hologramContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop' }} 
              style={styles.hologramImage}
            />
            {/* Using className for the animation defined in index.html */}
            <div className="scan-line" />
            <View style={styles.hologramOverlay}>
              <View style={styles.hologramHeader}>
                <Scan size={12} color="#3b82f6" />
                <Text style={styles.hologramID}>ID: 022-SD</Text>
              </View>
              <View style={styles.hologramFooter}>
                <Text style={styles.hologramName}>SASWATA DEY</Text>
                <Text style={styles.hologramRole}>ARCHITECT</Text>
              </View>
            </View>
          </View>
        </Html>
      </Float>
    </group>
  );
};

const SupermanCore: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Float speed={1.5} rotationIntensity={2}>
      <Octahedron args={[0.8]}>
        <meshStandardMaterial color="#1d4ed8" metalness={0.9} roughness={0.1} />
      </Octahedron>
      <Ring args={[0.7, 0.9, 3, 1]} rotation={[0, 0, Math.PI]}>
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={2} />
      </Ring>
    </Float>
  </group>
);

const StrangerPortal: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <Sphere args={[2, 64, 64]}>
      <MeshDistortMaterial color="#1a0000" speed={5} distort={0.6} emissive="#440000" emissiveIntensity={0.5} />
    </Sphere>
    <Sparkles count={150} scale={5} size={4} color="#ff3333" speed={1.2} />
  </group>
);

const MusicSearchModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [platforms] = useState([
    { name: 'Spotify', color: '#1DB954', url: 'https://open.spotify.com/search/' },
    { name: 'Apple Music', color: '#FC3C44', url: 'https://music.apple.com/search?term=' },
    { name: 'YouTube Music', color: '#FF0000', url: 'https://music.youtube.com/search?q=' },
    { name: 'JioSaavn', color: '#00d08d', url: 'https://www.jiosaavn.com/search/' },
    { name: 'Gaana', color: '#e72c33', url: 'https://gaana.com/search/' },
    { name: 'Amazon Music', color: '#00A8E1', url: 'https://music.amazon.com/search/' },
  ]);

  const handleSearch = (platformUrl: string) => {
    if (!query.trim()) return;
    const fullUrl = platformUrl + encodeURIComponent(query);
    Linking.openURL(fullUrl).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>SONIC SEARCH</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#666" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search song, artist, or dimension..."
            placeholderTextColor="#444"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Text style={styles.platformLabel}>CHOOSE YOUR STREAMING REALM</Text>
        
        <View style={styles.platformGrid}>
          {platforms.map((p, i) => (
            <TouchableOpacity 
              key={i} 
              style={[styles.platformCard, { borderColor: p.color + '44' }]}
              onPress={() => handleSearch(p.url)}
            >
              <View style={[styles.platformIndicator, { backgroundColor: p.color }]} />
              <Text style={styles.platformName}>{p.name}</Text>
              <Play size={12} color={p.color} fill={p.color} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [showMusicSearch, setShowMusicSearch] = useState(false);
  const [repos, setRepos] = useState<any[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetch('https://api.github.com/users/codgamerofficial/repos?sort=updated&per_page=6')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setRepos(data))
      .catch(console.error);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 3D BACKGROUND LAYER */}
      <View style={StyleSheet.absoluteFill}>
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Suspense fallback={null}>
            <Environment preset="night" />
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={1} fade speed={1} />
            <group position={[0, 0, 0]}>
              <SupermanCore position={[-2, 1, -2]} />
              <ProfileHologram position={[1.5, -0.5, 0]} />
              <SonicCore position={[3, 2, -1]} active={showMusicSearch} />
              <StrangerPortal position={[0, -15, -5]} />
            </group>
          </Suspense>
        </Canvas>
      </View>

      {/* MOBILE UI LAYER */}
      <Animated.ScrollView 
        style={styles.uiScroll}
        contentContainerStyle={styles.uiContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.section}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>MULTIVERSE GUARDIAN</Text>
          </View>
          <Text style={styles.heroTitle}>SASWATA</Text>
          <Text style={styles.heroSubtitle}>THE ARCHITECT</Text>
          <Text style={styles.heroDesc}>
            Deploying <Text style={styles.highlight}>QA Automation</Text> with superhuman speed and <Text style={styles.highlightBlue}>GIS Intelligence</Text> across digital dimensions.
          </Text>
          
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>MISSIONS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>SIGNAL</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>POWERS</Text>
          <View style={styles.skillsGrid}>
            {[
              { title: "Manual", icon: <Target color="#ef4444" size={24} />, desc: "Precision Bug Detection" },
              { title: "Arcane", icon: <Wand2 color="#f59e0b" size={24} />, desc: "Selenium Sorcery" },
              { title: "Spatial", icon: <MapPin color="#10b981" size={24} />, desc: "GIS Manipulation" },
              { title: "Omni", icon: <Zap color="#3b82f6" size={24} />, desc: "Full Stack Defense" }
            ].map((skill, i) => (
              <View key={i} style={styles.skillCard}>
                <View style={styles.skillIcon}>{skill.icon}</View>
                <Text style={styles.skillTitle}>{skill.title}</Text>
                <Text style={styles.skillDesc}>{skill.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>TIMELINE</Text>
          {RESUME_DATA.experience.map((exp, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineLine} />
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelinePeriod}>{exp.period}</Text>
                <Text style={styles.timelineCompany}>{exp.company}</Text>
                <Text style={styles.timelineRole}>{exp.role}</Text>
                <View style={styles.timelineDesc}>
                   {exp.description.map((d, j) => (
                     <Text key={j} style={styles.timelineDescText}>• {d}</Text>
                   ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: '#dc2626' }]}>THE LABS</Text>
          <View style={styles.labsGrid}>
            {repos.map((repo, i) => (
              <TouchableOpacity key={i} style={styles.labCard}>
                <View style={styles.labHeader}>
                   <Text style={styles.labName}>{repo.name}</Text>
                   <ExternalLink size={16} color="#444" />
                </View>
                <Text style={styles.labDesc} numberOfLines={2}>{repo.description || 'Classified Research Files'}</Text>
                <View style={styles.labFooter}>
                   <View style={styles.labStatus} />
                   <Text style={styles.labLang}>{repo.language || 'Artifact'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Flame color="#f97316" size={48} />
          <Text style={styles.footerText}>READY FOR DEPLOYMENT</Text>
          <View style={styles.footerSocials}>
            <TouchableOpacity style={styles.socialIcon}><Github color="white" /></TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}><Mail color="white" /></TouchableOpacity>
          </View>
          <Text style={styles.copyright}>© 2025 Saswata Dey • Multiverse Native</Text>
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* MOBILE ACTION DOCK */}
      <View style={styles.dock}>
        <TouchableOpacity style={styles.dockItem} onPress={() => setActiveTab('hero')}>
          <User size={20} color={activeTab === 'hero' ? '#3b82f6' : '#666'} />
          <Text style={[styles.dockText, activeTab === 'hero' && styles.activeDockText]}>Hero</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dockItem} onPress={() => setShowMusicSearch(true)}>
          <Music size={20} color={showMusicSearch ? '#a855f7' : '#666'} />
          <Text style={[styles.dockText, showMusicSearch && { color: '#a855f7' }]}>Music</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dockMainItem} 
          onPress={() => setShowVoiceAgent(true)}
        >
          <MessageSquare color="white" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dockItem} onPress={() => setActiveTab('labs')}>
          <LayoutGrid size={20} color={activeTab === 'labs' ? '#3b82f6' : '#666'} />
          <Text style={[styles.dockText, activeTab === 'labs' && styles.activeDockText]}>Labs</Text>
        </TouchableOpacity>
      </View>

      {showVoiceAgent && (
        <LiveAIAgent onClose={() => setShowVoiceAgent(false)} />
      )}

      {showMusicSearch && (
        <MusicSearchModal onClose={() => setShowMusicSearch(false)} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  uiScroll: {
    flex: 1,
    zIndex: 10,
  },
  uiContent: {
    paddingHorizontal: 24,
  },
  section: {
    minHeight: height * 0.8,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 20,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -2,
    lineHeight: 64,
  },
  heroSubtitle: {
    fontSize: 32,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  heroDesc: {
    fontSize: 18,
    color: '#999',
    lineHeight: 28,
  },
  highlight: { color: 'white', fontWeight: 'bold' },
  highlightBlue: { color: '#3b82f6', fontWeight: 'bold' },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 40,
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  secondaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryBtnText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 2,
  },
  sectionHeader: {
    fontSize: 48,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -2,
    marginBottom: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  skillCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  skillIcon: {
    marginBottom: 16,
  },
  skillTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skillDesc: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 48,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -48,
    width: 2,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    borderWidth: 4,
    borderColor: '#000',
    zIndex: 2,
  },
  timelineContent: {
    marginLeft: 20,
    flex: 1,
  },
  timelinePeriod: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  timelineCompany: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
  },
  timelineRole: {
    color: '#999',
    fontSize: 16,
    marginBottom: 16,
  },
  timelineDesc: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
    borderRadius: 20,
  },
  timelineDescText: {
    color: '#777',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  labsGrid: {
    gap: 16,
  },
  labCard: {
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 32,
    padding: 24,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labName: {
    color: '#dc2626',
    fontSize: 20,
    fontWeight: '900',
  },
  labDesc: {
    color: '#555',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  labFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  labLang: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
  },
  footer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 20,
    marginBottom: 40,
  },
  footerSocials: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  socialIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyright: {
    color: '#333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dock: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    height: 80,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 100,
  },
  dockItem: {
    alignItems: 'center',
    width: 60,
  },
  dockMainItem: {
    width: 70,
    height: 70,
    backgroundColor: '#2563eb',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  dockText: {
    color: '#666',
    fontSize: 8,
    fontWeight: '900',
    marginTop: 4,
  },
  activeDockText: {
    color: '#3b82f6',
  },
  hologramContainer: {
    width: 250,
    height: 350,
    backgroundColor: 'black',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.2)',
    position: 'relative'
  },
  hologramImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  hologramOverlay: {
    position: 'absolute',
    inset: 0,
    padding: 20,
    justifyContent: 'space-between',
  },
  hologramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hologramID: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 8,
  },
  hologramFooter: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 16,
  },
  hologramName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
  hologramRole: {
    color: '#0ea5e9',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#050505',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    padding: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  closeBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 60,
    color: 'white',
    fontSize: 16,
  },
  platformLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 20,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    width: '48%',
    justifyContent: 'space-between',
  },
  platformIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformName: {
    color: '#ddd',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  }
});

export default App;
