import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Terminal, 
  Layers, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Copy, 
  Check, 
  Zap, 
  ExternalLink,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

// --- TYPES ---
interface MediaItem {
  id: number;
  type: 'video' | 'audio' | 'image' | 'unknown';
  url: string;
  quality: string;
  extension: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: {
    source: string;
    title: string;
    author: string;
    media: any[];
  }
}

// --- CONSTANTS ---
const API_BASE = "https://nqduan.id.vn/api/downall?url=";

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);
  const [introStep, setIntroStep] = useState<'idle' | 'appear' | 'fire' | 'impact' | 'shatter'>('idle');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse['data'] | null>(null);
  const [logs, setLogs] = useState<string>("// AWAITING API RESPONSE...");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // --- REFS ---
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- INTRO SEQUENCE ---
  useEffect(() => {
    // 1. Initial delay
    const t1 = setTimeout(() => setIntroStep('appear'), 300);
    // 2. Fire gun
    const t2 = setTimeout(() => setIntroStep('fire'), 1200);
    // 3. Impact + Crack
    const t3 = setTimeout(() => setIntroStep('impact'), 1650);
    // 4. Shatter shards
    const t4 = setTimeout(() => setIntroStep('shatter'), 2100);
    // 5. Finalize
    const t5 = setTimeout(() => setIntroFinished(true), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // --- LISTENERS ---
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- HANDLERS ---
  const handleFetch = async () => {
    if (!url.trim()) {
      setError("// ERROR: NO URL PROVIDED");
      return;
    }

    setLoading(true);
    setError(null);
    setLogs("// FETCHING DATA... PLEASE WAIT");

    try {
      const response = await fetch(API_BASE + encodeURIComponent(url));
      const json: ApiResponse = await response.json();
      setLogs(JSON.stringify(json, null, 2));

      if (!json.success || !json.data) {
        throw new Error(json.message || "// INVALID RESPONSE");
      }

      setData(json.data);
    } catch (err: any) {
      setError(err.message || "// UNKNOWN ERROR");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (id !== undefined) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    });
  };

  const getNormalizedMedia = (): MediaItem[] => {
    if (!data?.media) return [];
    return data.media.map((item, idx) => {
      const rawType = String(item.type || 'unknown').toLowerCase();
      const type = rawType === 'photo' ? 'image' : (rawType as MediaItem['type']);
      
      return {
        id: idx + 1,
        type: ['video', 'audio', 'image'].includes(type) ? type : 'unknown',
        url: item.url || '',
        quality: item.quality || 'Standard',
        extension: item.extension || (type === 'image' ? 'jpg' : type === 'audio' ? 'mp3' : 'mp4')
      };
    });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- RENDER HELPERS ---
  const mediaItems = getNormalizedMedia();

  return (
    <div className={`min-h-screen bg-void relative selection:bg-accent selection:text-white ${!introFinished ? 'intro-active' : ''}`}>
      
      {/* ATMOSPHERE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(220,38,38,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,white_1px,white_2px)] bg-[length:100%_4px]" />
      </div>

      {/* GLOWING CURSOR */}
      <div 
        className="fixed pointer-events-none z-[7777] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
        style={{ 
          background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)',
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* --- INTRO OVERLAY --- */}
      <AnimatePresence>
        {!introFinished && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 z-1 pointer-events-none opacity-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(220,38,38,0.03)_2px,rgba(220,38,38,0.03)_4px)]" />
            
            <div className="relative w-[340px] h-[340px] flex items-center justify-center">
              <motion.div 
                className={`relative z-10 ${introStep === 'fire' ? 'gun-fire' : ''} ${introStep === 'appear' || introStep === 'fire' || introStep === 'impact' ? 'gun-appear' : ''}`}
                initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                animate={introStep !== 'shatter' ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <defs>
                    <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#1a1a1a"/>
                      <stop offset="100%" stopColor="#000000"/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur"/>
                      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect x="100" y="92" width="80" height="16" rx="3" fill="url(#metalGrad)" stroke="#444" strokeWidth="0.5"/>
                  <path d="M70 88 L110 88 L115 108 L110 130 L68 130 L60 115 Z" fill="url(#metalGrad)" stroke="#333" strokeWidth="0.8"/>
                  <path d="M68 130 L58 130 L44 158 L62 170 L78 158 L80 130 Z" fill="#030d18" stroke="#333" strokeWidth="0.8"/>
                  <line x1="88" y1="130" x2="86" y2="142" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="182" cy="100" r="4" fill="#dc2626" opacity="0.6" filter="url(#glow)"/>
                </svg>
                
                <div className={`muzzle-flash absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 rounded-full opacity-0 pointer-events-none translate-x-[60px] -translate-y-[10px] bg-[radial-gradient(circle,#fff_0%,#dc2626_30%,transparent_70%)] ${introStep === 'fire' ? 'flash-on' : ''}`} />
                <div className={`bullet absolute w-[6px] h-[6px] rounded-full bg-white opacity-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_12px_4px_#dc2626,0_0_24px_8px_#ffffff88] ${introStep === 'fire' ? 'bullet-fire' : ''}`} />
              </motion.div>
            </div>

            <div className={`absolute top-1/2 left-1/2 w-[10px] h-[10px] -mt-[5px] -ml-[5px] rounded-full border-2 border-accent opacity-0 pointer-events-none z-[9999] ${introStep === 'impact' ? 'ring-expand' : ''}`} />

            <motion.svg className="fixed inset-0 z-[9997] pointer-events-none" initial={{ opacity: 0 }} animate={introStep === 'impact' || introStep === 'shatter' ? { opacity: 1 } : { opacity: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M50,50 L15,5" stroke="white" strokeWidth="0.1" opacity="0.4" fill="none"/>
              <path d="M50,50 L5,38" stroke="white" strokeWidth="0.1" opacity="0.3" fill="none"/>
              <path d="M50,50 L22,95" stroke="white" strokeWidth="0.1" opacity="0.4" fill="none"/>
              <path d="M50,50 L82,98" stroke="white" strokeWidth="0.1" opacity="0.4" fill="none"/>
              <path d="M50,50 L100,70" stroke="white" strokeWidth="0.1" opacity="0.3" fill="none"/>
              <path d="M50,50 L95,20" stroke="white" strokeWidth="0.1" opacity="0.4" fill="none"/>
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={introFinished ? { opacity: 1 } : { opacity: 0 }}
        className="max-w-6xl mx-auto px-10 py-12 relative z-10"
      >
        {/* HEADER HUT NAVIGATION */}
        <header className="flex items-center justify-between border-b border-white/10 pb-8 mb-16 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border border-accent flex items-center justify-center rotate-45 transform transition-transform hover:rotate-0">
              <div className="w-3 h-3 bg-accent -rotate-45" />
            </div>
            <div>
              <h1 className="font-orbitron font-black text-xl tracking-[0.3em] uppercase text-white shadow-accent/40 drop-shadow-lg">
               NeonX
              </h1>
              <p className="text-[10px] text-accent font-mono tracking-widest leading-none mt-1">SYSTEMS: ACTIVE</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium font-sans">
            <span className="text-accent cursor-default">// MEDIA EXTRACTION SYSTEM v2.0</span>
          </nav>
          <div className="text-right font-mono font-light text-white/50">
            <div className="text-[10px] uppercase opacity-40">SECURE_LINK</div>
            <div className="text-[11px] text-accent font-medium">ESTABLISHED</div>
          </div>
        </header>

        {/* HERO AREA */}
        <section className="mb-16">
          <div className="font-mono text-accent text-[11px] tracking-[0.4em] uppercase mb-4 flex items-center gap-3">
             OPERATION: EXTRACT <div className="h-[1px] w-12 bg-accent/30" />
          </div>
          <h2 className="font-orbitron font-black text-5xl md:text-7xl mb-8 leading-[0.9] italic tracking-tighter uppercase">
            <span className="block text-white">Multimedia</span>
            <span className="block text-accent">Downloader</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <p className="text-white/60 text-base leading-relaxed max-w-xl font-light font-sans italic border-l border-white/10 pl-6">
              🌐 Nền tảng tải đa phương tiện all-in-one .
Hỗ trợ download video, hình ảnh, âm thanh từ nhiều nguồn cực nhanh và dễ dàng 🚀
            </p>



            {/* SIDE METRICS */}
            <div className="flex gap-8 border-l border-white/5 pl-8">
              <div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Impact</div>
                <div className="text-2xl font-mono text-white">1240 <span className="text-[10px] opacity-40">m/s</span></div>
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Status</div>
                <div className="text-2xl font-mono text-emerald-500">STABLE</div>
              </div>
            </div>
          </div>

          {/* INPUT HUD ZONE */}
          <div className="mt-12 relative">
            <div className="absolute top-0 right-0 px-3 py-1 bg-accent text-[8px] font-bold text-white tracking-widest uppercase skew-x-[-15deg] transform -translate-y-full">
              Target Identification
            </div>
            <div className="relative flex flex-col md:flex-row bg-[#080808] border border-white/10 rounded-sm overflow-hidden backdrop-blur-xl">
              <div className="flex-1 relative">
                <input 
                  type="text" ``
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                  placeholder="DEPLOY RESOURCE URL HERE..."
                  className="w-full bg-transparent border-none py-6 px-8 text-white font-mono text-sm focus:ring-0 outline-none placeholder:text-white/10 tracking-widest uppercase"
                />
              </div>
              <div className="flex">
                <button 
                  onClick={async () => setUrl(await navigator.clipboard.readText())}
                  className="px-8 py-4 font-bold text-[11px] tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all font-mono uppercase"
                >
                  [love u]
                </button>
                <button 
                  onClick={handleFetch}
                  disabled={loading}
                  className="px-12 py-4 bg-accent text-white font-orbitron font-black text-xs tracking-[0.3em] hover:bg-red-700 transition-all disabled:opacity-50 skew-x-[-12deg] transform translate-x-3"
                >
                  <span className="skew-x-[12deg] block">{loading ? 'FETCHING...' : 'EXECUTE'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ERROR STATUS */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="mt-6 p-4 bg-accent/5 border-l-4 border-accent flex items-center gap-4 text-accent font-mono text-xs uppercase tracking-widest"
            >
              <AlertCircle size={16} />
              SYSTEM FAILURE: {error}
            </motion.div>
          )}
        </section>

        {/* HUD LAYOUT GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* TACTICAL SIDEBAR */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div className="bg-white/5 border border-white/10 rounded-sm p-8 backdrop-blur-2xl relative">
              <div className="absolute top-0 left-0 w-8 h-[1px] bg-accent" />
              <div className="absolute top-0 left-0 w-[1px] h-8 bg-accent" />
              
              <div className="font-orbitron text-[10px] font-bold text-accent tracking-[0.3em] mb-8 uppercase flex items-center gap-4">
                INTELLIGENCE <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              {!data ? (
                <div className="text-center py-16 opacity-10 font-mono text-[10px] tracking-[0.4em] italic uppercase">
                  Awaiting Deployment...
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-square bg-black border border-white/10 p-1 relative group overflow-hidden">
                    <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-100 transition-opacity">
                      {mediaItems.length > 0 && (mediaItems[0].type === 'image' ? (
                        <img src={mediaItems[0].url} alt="p" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
                      ) : (
                        <video src={mediaItems[0].url} className="w-full h-full object-cover filter grayscale" muted loop autoPlay />
                      ))}
                    </div>
                    <div className="relative z-10 w-full h-full border border-white/5 flex items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all">
                       <Zap className="text-accent/40" size={32} />
                    </div>
                  </div>
                  
                  <div className="grid gap-6">
                    {[
                      { label: 'Tactical Source', value: data.source },
                      { label: 'Intel Title', value: data.title },
                      { label: 'Payload Carrier', value: data.author }
                    ].map(info => (
                      <div key={info.label} className="border-b border-white/5 pb-4 last:border-0">
                        <div className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em] mb-1">{info.label}</div>
                        <div className="text-sm font-medium text-white/90 font-sans tracking-tight break-words">{info.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ARMORY STATUS / LOGS */}
            <div className="p-8 bg-[#080808] border border-white/5 rounded-sm relative">
              <div className="flex items-center justify-between mb-6">
                <div className="font-orbitron font-bold text-[9px] text-white/40 tracking-[0.3em] uppercase">System Logs</div>
                <button onClick={() => copyToClipboard(logs)} className="text-white/20 hover:text-accent transition-colors"><Terminal size={14} /></button>
              </div>
              <div className="bg-black/40 p-4 border border-white/5 max-h-[240px] overflow-auto scrollbar-hide">
                <pre className="text-[10px] font-mono text-accent/60 leading-relaxed whitespace-pre-wrap selection:bg-accent selection:text-white">
                  {logs}
                </pre>
              </div>
            </div>
          </div>

          {/* MAIN DEPLOYMENT AREA */}
          <div className="lg:col-span-8">
            <div className="font-orbitron text-[10px] font-bold text-white tracking-[0.3em] mb-10 flex items-center gap-6 uppercase">
              RESOURCES <div className="h-[1px] flex-1 bg-white/10" />
              <span className="font-mono text-accent text-[11px]">{mediaItems.length} UNITS</span>
            </div>

            {mediaItems.length === 0 ? (
              <div className="border border-white/5 border-dashed rounded-sm py-40 flex flex-col items-center justify-center group">
                 <div className="w-16 h-16 border border-white/10 flex items-center justify-center rotate-45 mb-8 group-hover:rotate-180 transition-all duration-1000">
                    <Layers className="-rotate-45 text-white/10" />
                 </div>
                 <div className="font-mono text-white/10 text-[10px] uppercase tracking-[0.5em] italic">
                   Empty Armory
                 </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mediaItems.map((item) => (
                  <motion.div 
                    key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="group bg-[#080808] border border-white/10 hover:border-accent/40 transition-all duration-500 rounded-sm overflow-hidden p-1"
                  >
                    <div className="relative border border-white/5 group-hover:border-accent/10 transition-all">
                      <div className="p-4 flex justify-between items-center border-b border-white/5">
                        <span className={`text-[8px] font-bold font-mono tracking-[0.3em] uppercase px-3 py-1 ${
                          item.type === 'video' ? 'bg-white/5 text-purple-400' :
                          item.type === 'image' ? 'bg-white/5 text-accent' :
                          'bg-white/5 text-yellow-500'
                        }`}>
                          {item.type}
                        </span>
                        <div className="flex gap-1">
                          <div className="w-1 h-3 bg-accent/40" />
                          <div className="w-1 h-3 bg-accent/40" />
                        </div>
                      </div>
                      
                      <div className="aspect-video bg-black relative overflow-hidden">
                        {item.type === 'image' && <img src={item.url} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />}
                        {item.type === 'video' && <video src={item.url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" muted autoPlay loop />}
                        {item.type === 'audio' && (
                          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
                             <Music size={40} className="text-white" />
                             <div className="w-32 h-[2px] bg-accent/20" />
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                         <div className="flex justify-between items-end mb-6">
                            <div>
                               <div className="text-[8px] font-mono opacity-30 uppercase tracking-widest mb-1">Tactical Spec</div>
                               <div className="text-sm font-bold tracking-tight text-white/80">{item.extension.toUpperCase()} // {item.quality}</div>
                            </div>
                            <div className="text-[20px] font-mono text-accent/20 leading-none">#{item.id.toString().padStart(2, '0')}</div>
                         </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <a 
                            href={item.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-3 py-3 bg-white text-black font-orbitron font-black text-[10px] tracking-[0.2em] rounded-sm transition-all hover:bg-accent hover:text-white"
                          >
                            <Download size={14} /> DEPLOY
                          </a>
                          <button 
                            onClick={() => copyToClipboard(item.url, item.id)}
                            className={`flex items-center justify-center gap-3 py-3 border border-white/10 font-mono text-[10px] tracking-widest uppercase transition-all ${
                              copiedId === item.id ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />} LINK
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* HUD FOOTER */}
        <footer className="mt-24 pt-10 border-t border-white/10 flex flex-col md:flex-row items-end justify-between gap-10">
          <div className="max-w-xs text-left">
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-30 mb-4 font-bold font-mono">Bio</p>
            <p className="text-[11px] leading-relaxed text-white/50 italic border-l border-accent/40 pl-6">
      Tải video, ảnh, voice và nhiều định dạng đa phương tiện chỉ với 1 click . |
Nhanh • Miễn phí • Chất lượng cao • Không watermark

            </p>
          </div>
          
          <div className="flex gap-12 items-end">
             <div className="text-right">
                <div className="text-[9px] uppercase tracking-widest opacity-30 font-bold mb-2">Developed By</div>
                <div className="text-xl font-orbitron font-black text-white hover:text-accent transition-colors">NqN</div>
             </div>
             <div className="flex gap-4">
                <a href="https://profile-nqnin.rf.gd/?i=2" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-accent text-white text-[10px] font-orbitron font-black tracking-[0.3em] hover:bg-red-700 transition-all skew-x-[-12deg]">
                  <span className="skew-x-[12deg] block">Developer profile</span>
                </a>
             </div>
          </div>
        </footer>
      </motion.div>

      {/* SCROLL TOP HUD */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 z-[100] w-12 h-12 bg-white/5 border border-white/10 hover:border-accent transition-all flex items-center justify-center text-accent shadow-[0_0_30px_rgba(255,255,255,0.05)] rotate-45"
          >
            <ChevronUp className="-rotate-45" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
