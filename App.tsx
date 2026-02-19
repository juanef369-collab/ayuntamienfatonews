import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Radio, Send, Zap, AlertCircle, Coffee, RefreshCcw, Quote, Trash2, ArrowLeft, X, Home, User, LogIn, Camera, Image as ImageIcon, Upload, ShieldCheck, Award, MapPin, Printer, Archive, MessageSquare, History, Scale, Phone, Building2, Gavel, Newspaper, ArrowRight, Search, Mail, Twitter, Instagram, Linkedin, ExternalLink } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [user, setUser] = useState<Redactor | null>(null);
  const [loginForm, setLoginForm] = useState({ name: '', alias: '', bio: '' });
  
  const [view, setView] = useState<AppView>('home');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Simulación de Base de Datos
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

  // Sincronización con "Base de Datos" (LocalStorage)
  useEffect(() => {
    if (articles.length > 0) {
      localStorage.setItem('fatonews_db', JSON.stringify(articles));
    }
  }, [articles]);

  const loadInitialContent = async () => {
    setIsGenerating(true);
    try {
      const art = await generateBreakingNews();
      const img = await generateImage(art.imagePrompt);
      const initialArt = { ...art, imageUrl: img };
      setArticles([initialArt]);
    } catch (e: any) {
      setError("Fallo en la conexión con el servidor municipal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("¿Confirmas que deseas DESTRUIR esta evidencia municipal? Esta acción es irreversible.")) {
      const updated = articles.filter(a => a.id !== id);
      setArticles(updated);
      localStorage.setItem('fatonews_db', JSON.stringify(updated));
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  // Filtrado para la Hemeroteca
  const filteredArticles = useMemo(() => {
    return articles.filter(art => 
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [articles, searchTerm]);

  // Agrupación por fechas para el archivo
  const groupedArticles = useMemo(() => {
    return filteredArticles.reduce((acc: any, art) => {
      const date = art.date || 'Sin Fecha';
      if (!acc[date]) acc[date] = [];
      acc[date].push(art);
      return acc;
    }, {});
  }, [filteredArticles]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.name || !loginForm.alias) return;
    const newUser: Redactor = {
      id: Math.random().toString(36).substr(2, 9),
      name: loginForm.name,
      alias: loginForm.alias,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginForm.alias}`,
      bio: loginForm.bio || "Corresponsal de pasillo y experto en café frío.",
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
      setError("Error en la rotativa.");
    } finally {
      setIsGenerating(false);
    }
  };

  const openArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (view) {
      case 'archive':
        return (
          <div className="max-w-7xl mx-auto py-24 px-4">
            <header className="mb-20 text-center">
              <h1 className="text-7xl font-black uppercase mb-8 border-b-[12px] border-black pb-6 tracking-tighter inline-block">Hemeroteca Municipal</h1>
              <div className="max-w-2xl mx-auto mt-10 relative">
                <input 
                  type="text" 
                  placeholder="Buscar escándalo por palabra clave..." 
                  className="w-full neo-border px-12 py-5 text-xl font-black outline-none focus:bg-yellow-50 placeholder:text-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              </div>
            </header>

            {Object.keys(groupedArticles).length > 0 ? (
              <div className="space-y-32">
                {Object.entries(groupedArticles).map(([date, items]: [string, any]) => (
                  <section key={date} className="relative">
                    <div className="flex items-center gap-6 mb-16 border-b-4 border-black pb-4 sticky top-24 bg-[#fdfcf8]/90 backdrop-blur z-40">
                      <Archive className="text-red-600" size={32} />
                      <h2 className="text-4xl font-black uppercase tracking-widest">{date}</h2>
                      <span className="ml-auto bg-black text-white px-4 py-1 font-black text-xs">{items.length} ARCHIVOS</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
                      {items.map((art: NewsArticle) => (
                        <div key={art.id} className="relative group">
                          <ArticleCard article={art} onOpen={openArticle} />
                          <button 
                            onClick={(e) => deleteArticle(art.id, e)}
                            className="absolute top-2 right-2 p-3 bg-white text-red-600 neo-border-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white z-50"
                            title="Destruir evidencia"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-40 neo-border bg-white italic font-black text-4xl text-gray-200 uppercase tracking-widest">
                No hay archivos que coincidan con la búsqueda
              </div>
            )}
          </div>
        );
      case 'login':
        return (
          <div className="max-w-md mx-auto py-24 px-4">
            <div className="neo-border bg-white p-10 relative">
              <div className="absolute -top-6 -left-6 bg-red-600 text-white p-4 neo-border-sm -rotate-12 font-black">ACCESO RESTRINGIDO</div>
              <h2 className="text-4xl font-black uppercase mb-10 text-center border-b-8 border-black pb-4 tracking-tighter">Ficha de Redactor</h2>
              <form onSubmit={handleLogin} className="space-y-8">
                <div>
                  <label className="text-xs font-black uppercase block mb-2">Nombre en Nómina</label>
                  <input type="text" required placeholder="F. de Tal" className="w-full border-4 border-black p-5 font-black uppercase outline-none focus:bg-yellow-50" value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-black uppercase block mb-2">Nombre de Guerra (Alias)</label>
                  <input type="text" required placeholder="El Chivato" className="w-full border-4 border-black p-5 font-black uppercase outline-none focus:bg-yellow-50" value={loginForm.alias} onChange={e => setLoginForm({...loginForm, alias: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-black text-white p-6 font-black uppercase tracking-widest text-lg neo-border-sm hover:bg-red-600 transition-all hover:-translate-y-1">FICHAR ENTRADA</button>
              </form>
            </div>
          </div>
        );
      case 'profile':
        if (!user) return null;
        return (
          <div className="max-w-5xl mx-auto py-24 px-4">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              <div className="relative group">
                <div className="w-64 h-64 neo-border bg-yellow-400 overflow-hidden">
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
                </div>
                <button onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-6 -right-6 bg-black text-white p-5 rounded-full neo-border-sm hover:bg-red-600 transition-colors">
                  <Camera size={28} />
                </button>
                <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'avatar')} />
              </div>
              <div className="flex-1 space-y-6 text-center md:text-left">
                <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">{user.name}</h1>
                <p className="text-4xl italic font-black text-red-600">"{user.alias}"</p>
                <div className="bg-white p-10 neo-border-sm text-2xl font-serif italic leading-relaxed">
                  "{user.bio}"
                </div>
                <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-6">
                  <div className="bg-black text-white px-8 py-3 font-black uppercase text-sm">Escándalos publicados: {user.articlesWritten}</div>
                  <button onClick={handleLogout} className="text-red-600 font-black uppercase text-sm hover:underline decoration-4 transition-all">Solicitar Excedencia</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'bulo':
        return (
          <div className="max-w-4xl mx-auto py-24 px-4 text-center">
            <h1 className="text-7xl font-black uppercase mb-12 border-b-[16px] border-black pb-8 tracking-tighter">Nuestra Historia</h1>
            <div className="font-serif text-3xl italic text-gray-700 leading-relaxed space-y-10">
              <p>AyuntamienFatoNews nació de una conversación junto a la máquina de café (la que funciona mal, no la otra) un martes de lluvia.</p>
              <p>Somos el único diario que garantiza que el 100% de sus noticias son fruto de la imaginación, el aburrimiento y el exceso de cafeína.</p>
            </div>
            <button onClick={() => setView('home')} className="mt-20 bg-black text-white px-12 py-6 font-black uppercase text-xl neo-border-sm hover:bg-red-600 transition-all">VOLVER A LA PORTADA</button>
          </div>
        );
      case 'legal':
        return (
          <div className="max-w-4xl mx-auto py-24 px-4">
            <h1 className="text-6xl font-black uppercase mb-16 border-b-8 border-black pb-4">CÓDIGO ÉTICO (OFICIAL)</h1>
            <div className="space-y-10">
              {["Toda noticia aquí publicada es mentira hasta que se demuestre lo contrario (nunca).", "Los nombres han sido cambiados para proteger al becario.", "Si te ofendes, es que eres el protagonista de la noticia.", "El café de cápsula es un derecho humano."].map((rule, i) => (
                <div key={i} className={`p-8 neo-border bg-white transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                  <p className="text-3xl font-black uppercase tracking-tight">{i + 1}. {rule}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'article':
        if (!selectedArticle) return null;
        return (
          <div className="max-w-5xl mx-auto px-4 py-16">
            <div className="flex justify-between items-center mb-16 border-b-4 border-black pb-6 no-print">
              <button onClick={() => setView('home')} className="font-black flex items-center gap-4 uppercase text-sm hover:text-red-700 transition-all group">
                <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" /> VOLVER A PORTADA
              </button>
              <button onClick={() => window.print()} className="bg-black text-white px-8 py-3 font-black text-xs uppercase neo-border-sm hover:bg-red-600 transition-all">
                IMPRIMIR ACTA
              </button>
            </div>
            <article className="print-content">
              <h1 className="newspaper-font text-7xl md:text-9xl font-black uppercase leading-[0.8] border-b-[20px] border-black pb-12 tracking-tighter mb-12">
                {selectedArticle.title}
              </h1>
              <div className="flex flex-wrap items-center gap-10 mb-12 font-black uppercase text-lg border-y-4 border-black py-6 italic bg-white/40 px-6">
                <span className="bg-black text-white px-4 py-1">{selectedArticle.category}</span>
                <span className="text-red-600">CORRESPONSAL: {selectedArticle.author}</span>
                <span className="ml-auto">{selectedArticle.date}</span>
              </div>
              <div className="relative mb-16">
                 <div className="sello-municipal top-12 right-12 scale-150 z-30 opacity-100 shadow-2xl"></div>
                 <img src={selectedArticle.imageUrl} className="w-full h-auto neo-border grayscale-0" />
                 <div className="absolute -bottom-4 -left-4 bg-black text-white px-6 py-2 text-xs font-black uppercase neo-border-sm">FOTO-DENUNCIA Nº {selectedArticle.id.slice(0,4)}</div>
              </div>
              <p className="text-4xl font-black italic text-gray-500 mb-16 leading-tight border-l-[12px] border-red-600 pl-10">
                "{selectedArticle.subtitle}"
              </p>
              <div className="font-serif text-3xl leading-relaxed space-y-12 first-letter:text-[14rem] first-letter:font-black first-letter:float-left first-letter:mr-10 first-letter:mt-4 first-letter:leading-none selection:bg-red-600 selection:text-white">
                {selectedArticle.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
              
              <section className="mt-32 pt-16 border-t-8 border-black border-double no-print">
                <h3 className="newspaper-font text-5xl font-black uppercase mb-12 flex items-center gap-6">
                  <MessageSquare size={40} className="text-red-600"/> Reacciones del Pasillo
                </h3>
                <div className="grid gap-8">
                  {selectedArticle.comments?.map((comment, i) => (
                    <div key={i} className="bg-white p-8 neo-border flex gap-8 items-start hover:scale-[1.02] transition-transform">
                      <div className="w-16 h-16 rounded-full border-4 border-black overflow-hidden bg-gray-100 flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.avatarSeed}`} />
                      </div>
                      <div className="space-y-2">
                        <p className="font-black uppercase text-red-600 text-lg">{comment.author}</p>
                        <p className="text-2xl font-serif italic">"{comment.text}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </article>
          </div>
        );
      default:
        return (
          <>
            <section className="bg-white neo-border p-12 mb-24 no-print relative group overflow-hidden">
               <div className="logo-badge absolute -top-4 -left-4 z-10 scale-125">NUEVA FILTRACIÓN</div>
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Building2 size={300} /></div>
              <div className="flex flex-col lg:flex-row gap-16 relative z-10">
                <div className="lg:w-1/3">
                  <div className={`relative aspect-square neo-border overflow-hidden bg-gray-50 flex items-center justify-center transition-all ${pendingImage ? 'border-green-600 rotate-2' : 'border-black hover:rotate-3'}`}>
                    {pendingImage ? <img src={pendingImage} className="w-full h-full object-cover" /> : <Camera size={120} className="text-gray-100" />}
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
                      placeholder="Cuéntanos el último lío de la oficina..." 
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
                  <RefreshCcw className="animate-spin mb-10 text-red-600" size={120} />
                  <h3 className="newspaper-font text-8xl font-black italic tracking-tighter">LA ROTATIVA RUGE...</h3>
                  <p className="font-black uppercase text-black tracking-[1em] mt-6 animate-pulse text-2xl">Imprimiendo el escándalo...</p>
                </div>
              )}
            </section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
              {articles.map((art, i) => <ArticleCard key={art.id} article={art} isMain={i === 0} onOpen={openArticle} />)}
            </div>
          </>
        );
    }
  };

  const tickerNews = [
    ...articles.slice(0, 3).map(a => a.title.toUpperCase()), 
    "ALERTA: LA CAFETERA DEL AYUNTAMIENTO HA SIDO SECUESTRADA POR UN CONCEJAL", 
    "URGENTE: SE BUSCA AL BECARIO QUE SABE USAR EL EXCEL PARA QUE NOS ENSEÑE",
    "ÚLTIMA HORA: EL ALCALDE DECLARA 'BIEN DE INTERÉS CULTURAL' EL PINCHO DE TORTILLA"
  ];

  return (
    <div className="min-h-screen pb-20 selection:bg-red-600 selection:text-white">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-black text-white px-8 py-4 flex justify-between items-center no-print border-b-4 border-red-600 shadow-2xl">
        <button onClick={() => setView('home')} className="font-black text-sm tracking-widest hover:text-red-500 transition-colors uppercase flex items-center gap-4">
          <Newspaper size={20}/> AyuntamienFatoNews Portada
        </button>
        <div className="flex items-center gap-10">
          <button onClick={() => setView('archive')} className="hidden md:block text-xs font-black uppercase hover:text-red-600 transition-colors flex items-center gap-2">
            <Archive size={14}/> Hemeroteca
          </button>
          {user ? (
            <button onClick={() => setView('profile')} className="flex items-center gap-4 bg-white text-black px-5 py-2 neo-border-sm font-black text-xs hover:bg-yellow-400 transition-all">
              <img src={user.avatarUrl} className="w-8 h-8 rounded-full border-2 border-black"/>
              <span>{user.alias}</span>
            </button>
          ) : (
            <button onClick={() => setView('login')} className="bg-yellow-400 text-black px-8 py-2 neo-border-sm font-black text-xs uppercase hover:bg-white transition-all tracking-widest">ACCESO REDACCIÓN</button>
          )}
        </div>
      </nav>

      <div className="ticker-container text-white py-5 overflow-hidden mt-16 no-print relative z-[90]">
        <div className="animate-ticker">
          {[...tickerNews, ...tickerNews].map((text, i) => (
            <span key={i} className="mx-20 font-black text-sm uppercase italic flex items-center gap-6 whitespace-nowrap">
              <Zap size={24} className="text-yellow-400 drop-shadow-[2px_2px_0px_black]" /> {text}
            </span>
          ))}
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 pt-24 pb-24 text-center no-print relative">
        <div className="cursor-pointer transition-all py-24 border-y-[16px] border-black border-double group relative bg-white/30" onClick={() => setView('home')}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#fdfcf8] px-16 text-xs font-black uppercase tracking-[1.5em] text-gray-400">BOLETÍN OFICIAL DE PASILLO</div>
          <div className="flex flex-col items-center justify-center leading-none">
            <span className="bg-black text-white px-10 py-3 text-3xl font-black uppercase mb-3 tracking-[1em] neo-border-sm group-hover:bg-red-600 transition-all">AYUNTAMIEN</span>
            <h1 className="newspaper-font text-[16vw] font-black tracking-tighter text-black uppercase -mt-12 logo-glow">FATONEWS</h1>
            <div className="logo-badge -mt-16 ml-80 animate-bounce text-xl">DIARIO OFICIAL</div>
          </div>
          <p className="newspaper-font text-4xl md:text-8xl font-black italic text-gray-800 mt-20 tracking-tighter group-hover:text-red-600 transition-colors">
            "La verdad es aburrida, nuestra ficción no."
          </p>
        </div>
        <div className="flex flex-col md:flex-row justify-between border-b-[12px] border-black py-8 text-sm font-black uppercase mt-12 tracking-widest bg-black text-white px-12">
           <span className="flex items-center gap-4"><Building2 size={20}/> PLANTA 3 - FILTRACIONES DIRECTAS</span>
           <span className="flex items-center gap-4 justify-center md:justify-end">
             <Radio size={20} className="animate-pulse text-red-500" /> ROTATIVA CALIENTE: {new Date().toLocaleTimeString('es-ES')}
           </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-20 min-h-[80vh]">
        {renderView()}
      </main>

      <footer className="mt-96 bg-black text-white pt-40 pb-20 no-print relative overflow-hidden">
        {/* Decoración Neo-Brutalista de fondo */}
        <div className="absolute -top-20 -right-20 opacity-10 rotate-12 scale-150 pointer-events-none">
          <Building2 size={500} />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 mb-32">
            
            {/* Columna 1: Branding & Satire */}
            <div className="lg:col-span-1 space-y-10">
              <h2 className="newspaper-font text-5xl font-black uppercase tracking-tighter text-red-600 drop-shadow-[2px_2px_0px_white]">
                Ayuntamien<br/>FatoNews
              </h2>
              <p className="text-xl font-serif italic text-gray-400">
                "Desde que privatizamos el sentido común, las noticias nunca han sido mejores."
              </p>
              <div className="flex gap-6">
                <a href="#" className="p-3 bg-white text-black neo-border-sm hover:bg-red-600 hover:text-white transition-all"><Twitter size={20}/></a>
                <a href="#" className="p-3 bg-white text-black neo-border-sm hover:bg-red-600 hover:text-white transition-all"><Instagram size={20}/></a>
                <a href="#" className="p-3 bg-white text-black neo-border-sm hover:bg-red-600 hover:text-white transition-all"><Linkedin size={20}/></a>
              </div>
            </div>

            {/* Columna 2: Secciones & Departamentos */}
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 border-b border-red-900 pb-2">Departamentos</h3>
              <ul className="space-y-4 font-black uppercase text-sm tracking-widest text-gray-300">
                <li><button onClick={() => setView('home')} className="hover:text-red-500 flex items-center gap-3"><Home size={14}/> Portada Principal</button></li>
                <li><button onClick={() => setView('archive')} className="hover:text-red-500 flex items-center gap-3"><Archive size={14}/> Archivos X (Planta 2)</button></li>
                <li><button onClick={() => setView('bulo')} className="hover:text-red-500 flex items-center gap-3"><History size={14}/> Nuestra Epopeya</button></li>
                <li><button onClick={() => setView('legal')} className="hover:text-red-500 flex items-center gap-3"><Scale size={14}/> Burocracia Legal</button></li>
                <li><a href="#" className="hover:text-red-500 flex items-center gap-3"><Coffee size={14}/> Sindicato del Pincho</a></li>
                <li><a href="#" className="hover:text-red-500 flex items-center gap-3"><Gavel size={14}/> Tribunal de Rumores</a></li>
              </ul>
            </div>

            {/* Columna 3: Estado de la Oficina (Widget dinámico/estático) */}
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 border-b border-red-900 pb-2">Estado del Edificio</h3>
              <div className="space-y-6">
                <div className="bg-zinc-900 p-5 neo-border-sm border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-500">Máquina de Vending</span>
                    <span className="text-[10px] font-black text-red-500 animate-pulse">CRÍTICO</span>
                  </div>
                  <p className="text-xs font-bold text-gray-300">Solo quedan caramelos de café de 1994 y una bolsa de aire.</p>
                </div>
                <div className="bg-zinc-900 p-5 neo-border-sm border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-500">Ascensor Central</span>
                    <span className="text-[10px] font-black text-green-500">ESTABLE</span>
                  </div>
                  <p className="text-xs font-bold text-gray-300">Funciona, pero huele a brócoli hervido de forma inexplicable.</p>
                </div>
                <div className="bg-zinc-900 p-5 neo-border-sm border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black uppercase text-gray-500">Nivel de Burocracia</span>
                    <span className="text-[10px] font-black text-yellow-500 uppercase">En aumento</span>
                  </div>
                  <p className="text-xs font-bold text-gray-300">Se requiere el formulario A32 firmado por un fantasma.</p>
                </div>
              </div>
            </div>

            {/* Columna 4: Suscripción a la Circular */}
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-red-500 border-b border-red-900 pb-2">Circular de las 11:00 AM</h3>
              <p className="text-sm font-bold text-gray-400">Recibe los chismes antes que el Alcalde. No spam, solo filtraciones de calidad.</p>
              {!isSubscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input 
                      type="email" 
                      required
                      placeholder="Tu correo corporativo..." 
                      className="w-full bg-zinc-900 border-2 border-zinc-700 p-4 pl-12 font-black text-xs uppercase focus:border-red-600 outline-none transition-all"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full bg-red-600 text-white p-4 font-black uppercase text-xs neo-border-sm hover:bg-white hover:text-black transition-all">
                    SUSCRIBIRME (BAJO MI RIESGO)
                  </button>
                </form>
              ) : (
                <div className="bg-green-900/20 border-2 border-green-600 p-6 text-center animate-bounce">
                   <p className="font-black text-green-500 text-xs uppercase tracking-widest">¡FICHADO! Recibirás los chismes pronto.</p>
                </div>
              )}
            </div>

          </div>

          <div className="flex flex-col lg:flex-row justify-between items-center pt-20 border-t border-zinc-800 gap-10">
            <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 flex-wrap justify-center">
              <span>© {new Date().getFullYear()} FATONEWS MEDIA GROUP</span>
              <button onClick={() => setView('legal')} className="hover:text-white">Aviso Legal</button>
              <button onClick={() => setView('bulo')} className="hover:text-white">Cookies (De las de comer)</button>
              <button className="hover:text-white flex items-center gap-2"><Phone size={10}/> Extensiones de Interés</button>
            </div>
            
            <div className="flex items-center gap-6 opacity-20 grayscale hover:opacity-100 transition-all">
              <Building2 size={32}/>
              <Scale size={32}/>
              <Archive size={32}/>
              <Phone size={32}/>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-[2em] text-gray-800">
              VALORADO COMO EL MEJOR DIARIO POR LA ASOCIACIÓN DE BECARIOS INDIGNADOS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;