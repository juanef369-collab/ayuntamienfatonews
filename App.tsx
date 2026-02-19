
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Radio, Send, Zap, Coffee, RefreshCcw, ArrowLeft, Archive, MessageSquare, Scale, Building2, Newspaper, Search, Mail, Twitter, Instagram, Linkedin, Globe, MapPin, User, ChevronRight, AlertTriangle } from 'lucide-react';
import { NewsArticle, AppView, Redactor } from './types';
import { generateBreakingNews, generateNewsFromVoice, generateImage } from './services/gemini';
import ArticleCard from './components/ArticleCard';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Tramitando expediente...');
  const [transcript, setTranscript] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [user, setUser] = useState<Redactor | null>(null);
  const [loginForm, setLoginForm] = useState({ name: '', alias: '', bio: '' });
  
  const [view, setView] = useState<AppView>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  const loadingMessages = [
    "Untando al redactor jefe...",
    "Extorsionando a la máquina de café...",
    "Buscando trapos sucios en la Planta 3...",
    "Traduciendo del 'idioma becario' a titular...",
    "Imprimiendo mentiras piadosas...",
    "Sobornando al guardia de seguridad...",
    "Filtrando audios del concejal...",
    "Robando el tóner de contabilidad...",
    "Esperando a que el jefe termine el solitario..."
  ];

  useEffect(() => {
    const dbData = localStorage.getItem('fatonews_db');
    if (dbData) {
      setArticles(JSON.parse(dbData));
    } else {
      loadInitialContent();
    }
    const savedUser = localStorage.getItem('fatonews_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('fatonews_db', JSON.stringify(articles));
    }
  }, [articles]);

  const loadInitialContent = async () => {
    setIsGenerating(true);
    setLoadingMessage("Iniciando rotativa municipal...");
    try {
      const art = await generateBreakingNews();
      const img = await generateImage(art.imagePrompt);
      setArticles([{ ...art, imageUrl: img }]);
    } catch (e: any) {
      setError("Error municipal grave.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async (text: string) => {
    if (isGenerating || !text.trim()) return;
    setIsGenerating(true);
    
    const interval = setInterval(() => {
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2500);

    try {
      const article = await generateNewsFromVoice(text);
      const finalImg = pendingImage || await generateImage(article.imagePrompt);
      const newArticle = { ...article, imageUrl: finalImg, author: user?.alias || article.author };
      setArticles(prev => [newArticle, ...prev]);
      setTranscript(''); setKeyboardInput(''); setPendingImage(null);
      setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError("La rotativa ha explotado.");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
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

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tickerItems = [
    "ÚLTIMA HORA: SE ACABARON LOS SOBRES DE AZÚCAR EN LA PLANTA 3",
    "ESCÁNDALO: EL JEFE DE SECCIÓN HA SIDO VISTO USANDO CHATGPT PARA EL EMAIL DE BIENVENIDA",
    "EXCLUSIVA: LA MÁQUINA DE CAFÉ EMPIEZA A COBRAR EN CRIPTOMONEDAS",
    "URGENTE: EL BECARIO SABE DEMASIADO SOBRE EL HISTORIAL DEL NAVEGADOR DEL ALCALDE"
  ];

  return (
    <div className="min-h-screen selection:bg-[#5a8a6a] selection:text-white">
      {/* Overlay de Carga Temático */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 z-[200] flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-24 h-24 border-8 border-gray-200 border-t-[#5a8a6a] rounded-full animate-spin mb-8"></div>
          <h2 className="newspaper-font text-4xl md:text-6xl font-black italic text-center text-black mb-4 tracking-tighter">
            {loadingMessage}
          </h2>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">
            La rotativa AFN no descansa
          </p>
        </div>
      )}

      {/* Ticker Superior canalla */}
      <div className="bg-black text-white py-2 overflow-hidden no-print">
        <div className="animate-ticker">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-12 text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
              <AlertTriangle size={12} className="text-yellow-400"/> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Navegación Sticky Moderna */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 md:px-12 flex justify-between items-center no-print sticky top-0 z-[100] transition-all">
        <div className="flex items-center gap-8">
          <button onClick={() => setView('home')} className="newspaper-font text-2xl font-black title-green tracking-tighter hover:opacity-70 transition-opacity">
            AFN
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('home')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#5a8a6a]">Portada</button>
            <button onClick={() => setView('archive')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#5a8a6a]">Hemeroteca</button>
            <button onClick={() => setView('bulo')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#5a8a6a]">El Bulo</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <input 
              type="text" 
              placeholder="Buscar escándalo..." 
              className="bg-gray-100 rounded-full px-4 py-1.5 text-xs font-medium outline-none focus:ring-1 focus:ring-[#5a8a6a] w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          </div>
          {user ? (
            <button onClick={() => setView('profile')} className="flex items-center gap-2 bg-[#5a8a6a]/10 text-[#5a8a6a] px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:bg-[#5a8a6a]/20">
              <span className="w-5 h-5 rounded-full overflow-hidden border border-[#5a8a6a]/30">
                <img src={user.avatarUrl} className="w-full h-full object-cover"/>
              </span>
              {user.alias}
            </button>
          ) : (
            <button onClick={() => setView('login')} className="bg-black text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#5a8a6a] transition-all">Acceso</button>
          )}
        </div>
      </nav>

      <header className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center bg-white">
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Diario Municipal • Desde 1994 • Planta 3</p>
          <h1 className="newspaper-font text-6xl md:text-[160px] font-black title-green leading-[0.8] mb-8 tracking-tighter drop-shadow-sm">
            AYUNTAMIEN<br className="md:hidden" />FATONEWS
          </h1>
          <div className="header-rule flex flex-col md:flex-row justify-between items-center py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-4 gap-4 md:gap-0">
            <span>Vol. LXIX — No. 1.337</span>
            <span className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 italic">
              <Globe size={12}/> www.fato-news.es — {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span>Edición Digital Canalla</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 bg-white min-h-screen">
        {view === 'home' ? (
          <div className="space-y-16 py-8">
            {/* Main Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {articles.length > 0 && (
                <ArticleCard article={articles[0]} isMain={true} onOpen={openArticle} />
              )}
            </div>

            {/* Rogue Generation Box - Estilo Moderno */}
            <section className="bg-black text-white p-10 md:p-16 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
                <Newspaper size={200}/>
              </div>
              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                <h2 className="newspaper-font text-4xl md:text-6xl font-black italic">¿Tienes un chisme que queme?</h2>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Nuestra rotativa no juzga, solo publica.</p>
                
                <div className="flex flex-col md:flex-row gap-4 bg-zinc-900 p-2 rounded-2xl md:rounded-full border border-zinc-800">
                  <input 
                    type="text" 
                    value={keyboardInput}
                    onChange={(e) => setKeyboardInput(e.target.value)}
                    placeholder="Ejem: 'El concejal ha pedido 400 fotocopias de su cara'..."
                    className="flex-1 bg-transparent py-4 px-8 font-bold text-lg outline-none placeholder:text-zinc-700"
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerate(keyboardInput)}
                  />
                  <div className="flex gap-2 p-1">
                    <button 
                      onClick={startVoice} 
                      className={`p-4 rounded-full transition-all ${isRecording ? 'bg-red-600 animate-pulse' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                    >
                      <Mic size={24}/>
                    </button>
                    <button 
                      onClick={() => handleGenerate(keyboardInput)}
                      disabled={isGenerating}
                      className="bg-[#5a8a6a] text-white px-10 rounded-full font-black uppercase text-xs hover:bg-white hover:text-black transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGenerating ? <RefreshCcw className="animate-spin" size={16}/> : <Send size={16}/>}
                      {isGenerating ? 'Enviando...' : 'Publicar'}
                    </button>
                  </div>
                </div>
                {transcript && <div className="text-xs text-[#5a8a6a] animate-pulse">Detectado: "{transcript}"</div>}
              </div>
            </section>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
              {articles.slice(1).map((art) => (
                <ArticleCard key={art.id} article={art} onOpen={openArticle} />
              ))}
            </div>
          </div>
        ) : view === 'article' && selectedArticle ? (
          <div className="max-w-4xl mx-auto py-12 space-y-16">
            <button onClick={() => setView('home')} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
              <ArrowLeft size={16}/> Volver a la portada
            </button>
            
            <header className="space-y-8 text-center">
              <div className="flex justify-center">
                <span className="bg-[#5a8a6a] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">{selectedArticle.category}</span>
              </div>
              <h1 className="newspaper-font text-5xl md:text-[100px] font-black leading-[0.85] uppercase tracking-tighter">
                {selectedArticle.title}
              </h1>
              <p className="text-2xl md:text-4xl font-bold italic text-gray-500 max-w-2xl mx-auto leading-tight">
                "{selectedArticle.subtitle}"
              </p>
            </header>

            <div className="relative group">
              <div className="sello-municipal -top-6 -left-6 scale-150"></div>
              <img src={selectedArticle.imageUrl} className="w-full h-auto grayscale-0 rounded-2xl modern-shadow transition-transform duration-700 hover:scale-[1.01]"/>
              <div className="absolute -bottom-4 -right-4 bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">Evidencia ID: {selectedArticle.id.slice(0,6)}</div>
            </div>

            <div className="news-column news-column-2 font-serif text-2xl leading-relaxed text-gray-800 space-y-8 text-justify first-letter:text-8xl first-letter:font-black first-letter:text-[#5a8a6a] first-letter:mr-3 first-letter:float-left">
              {selectedArticle.content.split('\n').map((p, i) => <p key={i} className="mb-6">{p}</p>)}
            </div>

            <footer className="pt-20 border-t-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 border-4 border-[#5a8a6a]/20 overflow-hidden shadow-inner">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedArticle.author}`} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Escrito por la pluma de</p>
                  <p className="newspaper-font text-3xl font-black text-[#5a8a6a]">{selectedArticle.author}</p>
                </div>
              </div>
              <button onClick={() => window.print()} className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#5a8a6a] transition-all">Imprimir Acta Oficial</button>
            </footer>

            {/* Comentarios canallas */}
            <section className="bg-gray-50 p-12 rounded-3xl space-y-10 no-print">
               <h3 className="newspaper-font text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                 <MessageSquare size={32} className="text-[#5a8a6a]"/> El Murmullo del Pasillo
               </h3>
               <div className="grid gap-6">
                 {selectedArticle.comments?.map((c, i) => (
                   <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-6 items-start">
                     <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatarSeed}`} />
                     </div>
                     <div className="space-y-1">
                       <p className="font-black text-xs uppercase text-[#5a8a6a]">{c.author}</p>
                       <p className="font-serif italic text-lg leading-tight">"{c.text}"</p>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        ) : view === 'login' ? (
          <div className="max-w-md mx-auto py-32 space-y-12">
            <h2 className="newspaper-font text-5xl font-black text-center uppercase tracking-tighter">Ficha de Redactor</h2>
            <form onSubmit={(e) => { e.preventDefault(); /* login logic */ }} className="space-y-6">
              <input type="text" placeholder="Tu Nombre Real (En nómina)" className="w-full bg-gray-100 p-5 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#5a8a6a] transition-all" />
              <input type="text" placeholder="Tu Alias Canalla" className="w-full bg-gray-100 p-5 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#5a8a6a] transition-all" />
              <button className="w-full bg-black text-white p-5 rounded-full font-black uppercase tracking-[0.2em] hover:bg-[#5a8a6a] transition-all">Fichar Entrada</button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <RefreshCcw className="animate-spin text-gray-200" size={64} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">Tramitando expediente en Planta 4...</p>
          </div>
        )}
      </main>

      {/* Footer Periódico Moderno */}
      <footer className="bg-white border-t border-gray-100 pt-32 pb-16 no-print">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2 space-y-8">
              <h2 className="newspaper-font text-6xl font-black title-green tracking-tighter">AYUNTAMIEN<br/>FATONEWS</h2>
              <p className="text-xl font-medium text-gray-400 max-w-md italic leading-tight">
                "La verdad tiene muchas caras, nosotros preferimos la que tiene más gracia."
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#5a8a6a] hover:text-white transition-all"><Twitter size={20}/></a>
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#5a8a6a] hover:text-white transition-all"><Instagram size={20}/></a>
                <a href="#" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#5a8a6a] hover:text-white transition-all"><Linkedin size={20}/></a>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#5a8a6a]">Secciones</h4>
              <ul className="space-y-3 font-bold text-sm uppercase tracking-tighter text-gray-500">
                <li><button onClick={() => setView('home')} className="hover:text-black">Titulares</button></li>
                <li><button onClick={() => setView('archive')} className="hover:text-black">Hemeroteca</button></li>
                <li><button onClick={() => setView('bulo')} className="hover:text-black">El Bulo</button></li>
                <li><button onClick={() => setView('legal')} className="hover:text-black">Ética de Pasillo</button></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#5a8a6a]">Legal</h4>
              <p className="text-xs font-medium text-gray-400">Todo el contenido es satírico. Cualquier parecido con la realidad es un error de la administración.</p>
              <button className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all">Suscripción Premium</button>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">
            <span>© 1994-2024 AyuntamienFatoNews — Todos los derechos burocráticos reservados</span>
            <div className="flex gap-8">
              <span>Planta 3</span>
              <span>Ventanilla 2</span>
              <span>Ext. 404</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
