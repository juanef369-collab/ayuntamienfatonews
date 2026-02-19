import React, { useState, useEffect, useRef } from 'react';
import { Mic, Radio, Send, Zap, AlertCircle, Coffee, RefreshCcw, Quote, Trash2, ArrowLeft, X, Home, User, LogIn, Camera, Image as ImageIcon, Upload, ShieldCheck, Award, MapPin, Printer, Archive, MessageSquare, History, Scale, Phone, Building2, Gavel, Newspaper } from 'lucide-react';
import { NewsArticle, AppView, Redactor } from './types';
import { generateBreakingNews, generateNewsFromVoice, generateImage } from './services/gemini';
import ArticleCard from './components/ArticleCard';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [user, setUser] = useState<Redactor | null>(null);
  const [loginForm, setLoginForm] = useState({ name: '', alias: '', bio: '' });
  
  const [view, setView] = useState<AppView>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const savedArticles = localStorage.getItem('fatonews_articles');
    if (savedArticles) {
      setArticles(JSON.parse(savedArticles));
    } else {
      loadInitialContent();
    }
    const savedUser = localStorage.getItem('fatonews_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('fatonews_articles', JSON.stringify(articles));
    }
  }, [articles]);

  const loadInitialContent = async () => {
    setIsGenerating(true);
    try {
      const art = await generateBreakingNews();
      const img = await generateImage(art.imagePrompt);
      setArticles([{ ...art, imageUrl: img }]);
    } catch (e: any) {
      setError("Error municipal de carga.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.alias) return;
    const newUser: Redactor = {
      id: Math.random().toString(36).substr(2, 9),
      name: loginForm.name,
      alias: loginForm.alias,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginForm.alias}`,
      bio: loginForm.bio || "Corresponsal de pasillo.",
      articlesWritten: 0
    };
    setUser(newUser);
    localStorage.setItem('fatonews_user', JSON.stringify(newUser));
    setView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fatonews_user');
    setView('home');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'article' | 'avatar') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (target === 'article') setPendingImage(base64);
        else if (user) {
          const updatedUser = { ...user, avatarUrl: base64 };
          setUser(updatedUser);
          localStorage.setItem('fatonews_user', JSON.stringify(updatedUser));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoice = () => {
    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) return;
    const recognition = new SpeechRec();
    recognition.lang = 'es-ES';
    recognition.onstart = () => { setIsRecording(true); setError(null); };
    recognition.onresult = (event: any) => setTranscript(event.results[0][0].transcript);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleGenerate = async (text: string) => {
    if (isGenerating || !text.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const article = await generateNewsFromVoice(text);
      const finalImg = pendingImage || await generateImage(article.imagePrompt);
      const newArticle = { ...article, imageUrl: finalImg, author: user?.alias || article.author };
      setArticles(prev => [newArticle, ...prev]);
      setTranscript(''); setKeyboardInput(''); setPendingImage(null);
      if (user) {
        const updatedUser = { ...user, articlesWritten: user.articlesWritten + 1 };
        setUser(updatedUser);
        localStorage.setItem('fatonews_user', JSON.stringify(updatedUser));
      }
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError("Error en la censura.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tickerNews = [
    ...articles.map(a => a.title.toUpperCase()), 
    "ALERTA: EL BECARIO HA CONFUNDIDO EL TONER CON CAFÉ SOLUBLE", 
    "URGENTE: EL AYUNTAMIENTO DECLARA LA GUERRA AL CLIP DE PAPEL",
    "ÚLTIMA HORA: SE FILTRA EL MENÚ DE LA CENA DE EMPRESA Y ES SOLO PAN"
  ];

  return (
    <div className="min-h-screen pb-20 selection:bg-yellow-300">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black text-white px-8 py-3 flex justify-between items-center no-print border-b-4 border-red-600 shadow-2xl">
        <button onClick={() => setView('home')} className="font-black text-xs tracking-widest hover:text-red-500 transition-colors uppercase flex items-center gap-3">
          <Newspaper size={18}/> Portada Municipal
        </button>
        <div className="flex items-center gap-8">
          {user ? (
            <button onClick={() => setView('profile')} className="flex items-center gap-3 bg-white text-black px-4 py-1.5 neo-border-sm font-black text-[10px] hover:bg-yellow-400 transition-all">
              <img src={user.avatarUrl} className="w-6 h-6 rounded-full border border-black"/>
              <span>{user.alias}</span>
            </button>
          ) : (
            <button onClick={() => setView('login')} className="bg-yellow-400 text-black px-6 py-2 neo-border-sm font-black text-[10px] uppercase hover:bg-white transition-all">ACCESO REDACCIÓN</button>
          )}
        </div>
      </nav>

      <div className="ticker-container text-white py-4 overflow-hidden mt-14 no-print relative z-[90]">
        <div className="animate-ticker">
          {[...tickerNews, ...tickerNews].map((text, i) => (
            <span key={i} className="mx-16 font-black text-xs uppercase italic flex items-center gap-5 whitespace-nowrap">
              <Zap size={22} className="text-yellow-400" /> {text}
            </span>
          ))}
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 pt-24 pb-20 text-center no-print relative">
        <div className="cursor-pointer transition-all py-20 border-y-[12px] border-black border-double group relative" onClick={() => setView('home')}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-10 text-[10px] font-black uppercase tracking-[1em]">ESTRENO NACIONAL</div>
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="bg-black text-white px-8 py-2 text-3xl font-black uppercase mb-2 tracking-[0.8em] neo-border-sm">AYUNTAMIEN</span>
            <h1 className="newspaper-font text-[16vw] font-black tracking-tighter text-black uppercase -mt-10 logo-glow">FATONEWS</h1>
            <div className="logo-badge -mt-12 ml-60 animate-bounce">DIARIO DEL CHISME</div>
          </div>
          <p className="newspaper-font text-4xl md:text-7xl font-black italic text-gray-800 mt-16 tracking-tighter group-hover:text-red-600 transition-colors">
            "La verdad es aburrida, nuestra ficción no."
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between border-b-8 border-black py-6 text-xs font-black uppercase mt-10 tracking-widest bg-black text-white px-8">
           <span>CENTRO DE OPERACIONES: PLANTA 3 - DESPACHO 302</span>
           <span className="flex items-center gap-3">
             <Radio size={16} className="animate-pulse text-red-500" /> ROTATIVA: {new Date().toLocaleTimeString('es-ES')}
           </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-16 min-h-[70vh]">
        {view === 'home' ? (
          <>
            <section className="bg-white neo-border p-12 mb-24 no-print relative group overflow-hidden">
               <div className="logo-badge absolute -top-4 -left-4 z-10 scale-125">NUEVA FILTRACIÓN</div>
              <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                <div className="lg:w-1/3">
                  <div className={`relative aspect-square neo-border overflow-hidden bg-gray-50 flex items-center justify-center transition-all ${pendingImage ? 'border-green-600 rotate-1' : 'border-black hover:rotate-2'}`}>
                    {pendingImage ? <img src={pendingImage} className="w-full h-full object-cover" /> : <Building2 size={120} className="text-gray-100" />}
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-8 left-8 right-8 bg-white border-4 border-black p-5 font-black text-xs uppercase hover:bg-yellow-400 transition-all flex items-center justify-center gap-4 shadow-[6px_6px_0px_black]">
                      <Upload size={22}/> {pendingImage ? 'CAMBIAR PRUEBA' : 'SUBIR EVIDENCIA'}
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'article')} />
                  </div>
                </div>
                <div className="lg:w-2/3 space-y-10">
                  <div className="flex items-center justify-between border-b-4 border-black pb-4">
                    <h2 className="text-5xl font-black uppercase tracking-tighter flex items-center gap-4">
                      <Mic className={isRecording ? 'text-red-600 animate-pulse' : 'text-black'} size={40} /> 
                      Mesa de Chismes
                    </h2>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={keyboardInput} 
                      onChange={e => setKeyboardInput(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && handleGenerate(keyboardInput)} 
                      placeholder="¿Qué ha pasado hoy en la oficina?" 
                      className="w-full neo-border px-10 py-8 text-3xl font-black outline-none placeholder:text-gray-200 focus:bg-yellow-50 transition-colors" 
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8">
                    <button onClick={startVoice} disabled={isRecording} className="flex-[2] py-6 neo-border bg-yellow-400 font-black uppercase flex items-center justify-center gap-4 text-xl hover:bg-yellow-300 transition-all">
                      <Radio size={28} /> {isRecording ? 'CAPTANDO RUMOR...' : 'GRAVAR CHISME'}
                    </button>
                    <button onClick={() => handleGenerate(keyboardInput)} className="flex-1 py-6 neo-border bg-black text-white font-black uppercase tracking-widest text-xl hover:bg-red-700 transition-all">
                      PUBLICAR
                    </button>
                  </div>
                  {transcript && <p className="bg-red-50 p-6 neo-border-sm italic font-black text-2xl text-red-800">"{transcript}"</p>}
                </div>
              </div>
              {isGenerating && (
                <div className="absolute inset-0 bg-white/98 z-[100] flex flex-col items-center justify-center animate-fadeIn text-center">
                  <RefreshCcw className="animate-spin mb-10 text-red-600" size={100} />
                  <h3 className="newspaper-font text-8xl font-black italic tracking-tighter">LA ROTATIVA RUGE...</h3>
                  <p className="font-black uppercase text-black tracking-[1em] mt-4 animate-pulse">Imprimiendo la verdad...</p>
                </div>
              )}
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
              {articles.map((art, i) => <ArticleCard key={art.id} article={art} isMain={i === 0} onOpen={openArticle} />)}
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto py-20">
             {/* Aquí irían las otras vistas (article, login, etc) tal cual las teníamos */}
             {selectedArticle && view === 'article' && (
               <article className="print-content space-y-12">
                  <button onClick={() => setView('home')} className="font-black flex items-center gap-3 uppercase text-sm hover:text-red-600 mb-10"><ArrowLeft size={20}/> VOLVER</button>
                  <h1 className="newspaper-font text-7xl md:text-9xl font-black uppercase leading-[0.8] border-b-[16px] border-black pb-12 tracking-tighter">{selectedArticle.title}</h1>
                  <div className="relative">
                    <div className="sello-municipal top-10 right-10 scale-150 z-30 opacity-100 shadow-2xl"></div>
                    <img src={selectedArticle.imageUrl} className="w-full h-auto neo-border" />
                  </div>
                  <p className="text-4xl font-black italic text-gray-500 leading-none">"{selectedArticle.subtitle}"</p>
                  <div className="font-serif text-3xl leading-relaxed space-y-10 first-letter:text-[12rem] first-letter:font-black first-letter:float-left first-letter:mr-8 first-letter:mt-4 first-letter:leading-none">
                    {selectedArticle.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                  </div>
               </article>
             )}
          </div>
        )}
      </main>

      <footer className="mt-80 border-t-[12px] border-black border-double pt-32 pb-20 text-center no-print bg-white/50 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfcf8] px-16">
          <Quote size={80} className="text-black rotate-12 opacity-10" />
        </div>
        <h2 className="newspaper-font text-7xl font-black uppercase tracking-tighter mb-20 drop-shadow-[6px_6px_0px_#ff0000]">AyuntamienFatoNews</h2>
        <div className="flex flex-wrap justify-center gap-20 text-sm font-black uppercase tracking-[0.4em] text-gray-400 mb-24">
          <button onClick={() => setView('bulo')} className="hover:text-red-600 underline decoration-4 underline-offset-8">Historia</button>
          <button onClick={() => setView('legal')} className="hover:text-red-600 underline decoration-4 underline-offset-8">Código Ético</button>
          <button onClick={() => setView('contacto')} className="hover:text-red-600 underline decoration-4 underline-offset-8">Sugerencias</button>
          <button onClick={() => setView('archive')} className="hover:text-red-600 underline decoration-4 underline-offset-8">Hemeroteca</button>
        </div>
        <div className="flex flex-col items-center gap-6 opacity-20">
          <p className="text-[10px] font-black uppercase tracking-[2em]">© {new Date().getFullYear()} FATONEWS MEDIA GROUP INC.</p>
          <div className="flex gap-6"><Building2 size={30}/><Scale size={30}/><Archive size={30}/></div>
        </div>
      </footer>
    </div>
  );
};

export default App;